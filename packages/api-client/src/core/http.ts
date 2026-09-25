import { ApiError, type ApiErrorCode } from './errors';
import type { TokenStore, Tokens } from './tokens';

export interface HttpConfig {
  /** e.g. http://10.0.2.2:8080 (no trailing slash needed). */
  baseUrl: string;
  tokenStore: TokenStore;
  fetchImpl?: typeof fetch;
  /** Called once when a refresh fails and the person must sign in again. */
  onSessionExpired?: () => void;
  timeoutMs?: number;
}

export type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Query;
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
  /** Default true. Set false for public endpoints (login, search). */
  auth?: boolean;
}

interface ErrorBody {
  code?: string;
  message?: string;
  correlationId?: string;
}

const KNOWN_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'INVALID_CREDENTIALS',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'TOO_MANY_REQUESTS',
  'INTERNAL_ERROR',
]);

/** RFC-4122 v4 without depending on crypto.randomUUID (missing in Hermes). */
export function newId(): string {
  const cryptoObject = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export class HttpClient {
  private refreshInFlight: Promise<boolean> | null = null;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly config: HttpConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.fetchImpl = config.fetchImpl ?? ((...args) => fetch(...args));
  }

  get tokenStore(): TokenStore {
    return this.config.tokenStore;
  }

  url(path: string, query?: Query): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, String(value));
      }
    }
    const qs = search.toString();
    return `${this.baseUrl}${path}${qs ? `?${qs}` : ''}`;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const response = await this.execute(options);

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  /** For binary payloads (documents). */
  async requestBlob(options: RequestOptions): Promise<Blob> {
    const response = await this.execute(options);
    return response.blob();
  }

  private async execute(options: RequestOptions): Promise<Response> {
    const useAuth = options.auth !== false;

    let response = await this.send(options, useAuth);

    if (response.status === 401 && useAuth && (await this.refreshTokens())) {
      response = await this.send(options, useAuth);
    }

    if (!response.ok) throw await this.toError(response);

    return response;
  }

  private async send(options: RequestOptions, useAuth: boolean): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Correlation-Id': newId(),
      ...options.headers,
    };

    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData; // the runtime sets the multipart boundary
    } else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    if (useAuth) {
      const tokens = await this.config.tokenStore.get();
      if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 20_000);

    try {
      return await this.fetchImpl(this.url(options.path, options.query), {
        method: options.method ?? 'GET',
        headers,
        body,
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as { name?: string }).name === 'AbortError') {
        throw new ApiError(0, 'TIMEOUT', 'The request took too long');
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
    } finally {
      clearTimeout(timer);
    }
  }

  /** One refresh at a time, however many calls hit 401 together. */
  private refreshTokens(): Promise<boolean> {
    this.refreshInFlight ??= this.doRefresh().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<boolean> {
    const current = await this.config.tokenStore.get();
    if (!current) return false;

    try {
      const response = await this.send(
        {
          method: 'POST',
          path: '/api/v1/auth/refresh',
          body: { refreshToken: current.refreshToken },
        },
        false,
      );

      if (!response.ok) throw new Error('refresh rejected');

      const next = (await response.json()) as Tokens;
      await this.config.tokenStore.set({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        accessTokenExpiresAt: next.accessTokenExpiresAt,
      });
      return true;
    } catch {
      await this.config.tokenStore.set(null);
      this.config.onSessionExpired?.();
      return false;
    }
  }

  private async toError(response: Response): Promise<ApiError> {
    let parsed: ErrorBody = {};
    try {
      parsed = (await response.json()) as ErrorBody;
    } catch {
      // Non-JSON error page (proxy/gateway): fall through to the generic message.
    }

    const code: ApiErrorCode =
      parsed.code && KNOWN_CODES.has(parsed.code) ? (parsed.code as ApiErrorCode) : 'UNKNOWN';

    return new ApiError(
      response.status,
      code,
      parsed.message ?? `Request failed (${response.status})`,
      parsed.correlationId ?? response.headers.get('X-Correlation-Id') ?? undefined,
    );
  }
}
