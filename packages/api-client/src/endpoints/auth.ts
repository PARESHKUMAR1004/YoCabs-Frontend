import type { HttpClient } from '../core/http';
import type {
  AuthTokenResponse,
  PartnerRegistrationRequest,
  PartnerRegistrationResponse,
  Profile,
  SessionUser,
  UpdateProfileRequest,
} from '../types/auth';

const BASE = '/api/v1/auth';

export function createAuthApi(http: HttpClient) {
  async function storeSession(response: AuthTokenResponse): Promise<SessionUser> {
    await http.tokenStore.set({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt,
    });
    return { userId: response.userId, role: response.role, partnerId: response.partnerId };
  }

  return {
    /** Sends a one-time code (in development it is printed in the API log). */
    requestOtp: (mobile: string) =>
      http.request<{ message: string }>({
        method: 'POST',
        path: `${BASE}/otp/request`,
        body: { mobile },
        auth: false,
      }),

    /** Signs in (or up, for a new tourist) and stores the tokens. */
    async verifyOtp(mobile: string, code: string): Promise<SessionUser> {
      const response = await http.request<AuthTokenResponse>({
        method: 'POST',
        path: `${BASE}/otp/verify`,
        body: { mobile, code },
        auth: false,
      });
      return storeSession(response);
    },

    async adminLogin(email: string, password: string): Promise<SessionUser> {
      const response = await http.request<AuthTokenResponse>({
        method: 'POST',
        path: `${BASE}/admin/login`,
        body: { email, password },
        auth: false,
      });
      return storeSession(response);
    },

    registerPartner: (input: PartnerRegistrationRequest) =>
      http.request<PartnerRegistrationResponse>({
        method: 'POST',
        path: `${BASE}/partner/register`,
        body: input,
        auth: false,
      }),

    /** Revokes the refresh token server-side, then forgets the session locally. */
    async logout(): Promise<void> {
      const tokens = await http.tokenStore.get();
      try {
        if (tokens) {
          await http.request<void>({
            method: 'POST',
            path: `${BASE}/logout`,
            body: { refreshToken: tokens.refreshToken },
            auth: false,
          });
        }
      } finally {
        await http.tokenStore.set(null);
      }
    },

    me: () => http.request<SessionUser>({ path: `${BASE}/me` }),

    getProfile: () => http.request<Profile>({ path: '/api/v1/profile' }),

    updateProfile: (input: UpdateProfileRequest) =>
      http.request<Profile>({ method: 'PUT', path: '/api/v1/profile', body: input }),
  };
}
