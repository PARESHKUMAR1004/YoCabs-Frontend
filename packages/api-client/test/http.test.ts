import { describe, expect, it, vi } from 'vitest';
import { ApiError, HttpClient, MemoryTokenStore, userMessage } from '../src';

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function signedIn(store = new MemoryTokenStore()) {
  await store.set({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    accessTokenExpiresAt: '2030-01-01T00:00:00Z',
  });
  return store;
}

describe('HttpClient', () => {
  it('sends the bearer token, a correlation id and JSON bodies', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({ ok: true }));
    const client = new HttpClient({
      baseUrl: 'http://api.test/',
      tokenStore: await signedIn(),
      fetchImpl,
    });

    await client.request({ method: 'POST', path: '/api/v1/things', body: { a: 1 } });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/v1/things');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer access-1');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Correlation-Id']).toMatch(/[0-9a-f-]{36}/);
    expect(init.body).toBe('{"a":1}');
  });

  it('omits the token for public calls and skips empty query values', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({}));
    const client = new HttpClient({
      baseUrl: 'http://api.test',
      tokenStore: await signedIn(),
      fetchImpl,
    });

    await client.request({
      path: '/api/v1/search',
      auth: false,
      query: { status: 'OPEN', empty: '', missing: undefined, limit: 5 },
    });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/v1/search?status=OPEN&limit=5');
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('maps API errors to ApiError with the server code, message and correlation id', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        json({ code: 'CONFLICT', message: 'Vehicle is taken', correlationId: 'abc-123' }, 409),
      );
    const client = new HttpClient({
      baseUrl: 'http://api.test',
      tokenStore: new MemoryTokenStore(),
      fetchImpl,
    });

    const error = await client.request({ path: '/x' }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(409);
    expect(apiError.code).toBe('CONFLICT');
    expect(apiError.isConflict).toBe(true);
    expect(apiError.message).toBe('Vehicle is taken');
    expect(apiError.correlationId).toBe('abc-123');
  });

  it('turns network failures and non-JSON error pages into ApiErrors', async () => {
    const offline = new HttpClient({
      baseUrl: 'http://api.test',
      tokenStore: new MemoryTokenStore(),
      fetchImpl: vi.fn().mockRejectedValue(new TypeError('Network request failed')),
    });
    const networkError = (await offline
      .request({ path: '/x' })
      .catch((e: unknown) => e)) as ApiError;
    expect(networkError.code).toBe('NETWORK_ERROR');
    expect(networkError.isNetwork).toBe(true);

    const gateway = new HttpClient({
      baseUrl: 'http://api.test',
      tokenStore: new MemoryTokenStore(),
      fetchImpl: vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 502 })),
    });
    const gatewayError = (await gateway
      .request({ path: '/x' })
      .catch((e: unknown) => e)) as ApiError;
    expect(gatewayError.status).toBe(502);
    expect(gatewayError.code).toBe('UNKNOWN');
  });

  it('returns undefined for 204 responses', async () => {
    const client = new HttpClient({
      baseUrl: 'http://api.test',
      tokenStore: new MemoryTokenStore(),
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    });

    await expect(client.request({ method: 'POST', path: '/x' })).resolves.toBeUndefined();
  });

  describe('token refresh', () => {
    it('refreshes once on 401, stores the rotated tokens and retries the call', async () => {
      const store = await signedIn();
      const fetchImpl = vi
        .fn()
        .mockResolvedValueOnce(json({ code: 'UNAUTHORIZED', message: 'x' }, 401))
        .mockResolvedValueOnce(
          json({
            accessToken: 'access-2',
            refreshToken: 'refresh-2',
            accessTokenExpiresAt: '2031-01-01T00:00:00Z',
          }),
        )
        .mockResolvedValueOnce(json({ value: 42 }));
      const client = new HttpClient({ baseUrl: 'http://api.test', tokenStore: store, fetchImpl });

      await expect(client.request({ path: '/api/v1/bookings' })).resolves.toEqual({ value: 42 });

      expect(fetchImpl).toHaveBeenCalledTimes(3);
      const refreshCall = fetchImpl.mock.calls[1] as [string, RequestInit];
      expect(refreshCall[0]).toBe('http://api.test/api/v1/auth/refresh');
      expect(refreshCall[1].body).toBe('{"refreshToken":"refresh-1"}');
      const retry = fetchImpl.mock.calls[2] as [string, RequestInit];
      expect((retry[1].headers as Record<string, string>).Authorization).toBe('Bearer access-2');
      expect((await store.get())?.refreshToken).toBe('refresh-2');
    });

    it('shares one refresh between concurrent 401s', async () => {
      const store = await signedIn();
      let refreshes = 0;

      const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/api/v1/auth/refresh')) {
          refreshes += 1;
          return json({
            accessToken: 'access-2',
            refreshToken: 'refresh-2',
            accessTokenExpiresAt: '2031-01-01T00:00:00Z',
          });
        }
        const bearer = (init?.headers as Record<string, string>).Authorization;
        return bearer === 'Bearer access-2'
          ? json({ ok: true })
          : json({ code: 'UNAUTHORIZED' }, 401);
      });
      const client = new HttpClient({ baseUrl: 'http://api.test', tokenStore: store, fetchImpl });

      await Promise.all([
        client.request({ path: '/a' }),
        client.request({ path: '/b' }),
        client.request({ path: '/c' }),
      ]);

      expect(refreshes).toBe(1);
    });

    it('clears the session and notifies the app when the refresh is rejected', async () => {
      const store = await signedIn();
      const onSessionExpired = vi.fn();
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(json({ code: 'UNAUTHORIZED', message: 'x' }, 401));
      const client = new HttpClient({
        baseUrl: 'http://api.test',
        tokenStore: store,
        fetchImpl,
        onSessionExpired,
      });

      const error = (await client
        .request({ path: '/api/v1/bookings' })
        .catch((e: unknown) => e)) as ApiError;

      expect(error.status).toBe(401);
      expect(await store.get()).toBeNull();
      expect(onSessionExpired).toHaveBeenCalledTimes(1);
    });

    it('does not try to refresh public calls', async () => {
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(json({ code: 'INVALID_CREDENTIALS', message: 'no' }, 401));
      const client = new HttpClient({
        baseUrl: 'http://api.test',
        tokenStore: await signedIn(),
        fetchImpl,
      });

      const error = (await client
        .request({ method: 'POST', path: '/api/v1/auth/otp/verify', auth: false, body: {} })
        .catch((e: unknown) => e)) as ApiError;

      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });
  });
});

describe('userMessage', () => {
  it('shows server messages for business errors and safe text for technical ones', () => {
    expect(userMessage(new ApiError(409, 'CONFLICT', 'The vehicle is no longer available'))).toBe(
      'The vehicle is no longer available',
    );
    expect(userMessage(new ApiError(0, 'NETWORK_ERROR', 'Network request failed'))).toMatch(
      /internet/,
    );
    expect(userMessage(new ApiError(500, 'INTERNAL_ERROR', 'NullPointerException at ...'))).toBe(
      'Something went wrong. Please try again.',
    );
    expect(userMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });
});
