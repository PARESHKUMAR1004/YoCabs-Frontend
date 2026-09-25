import { createYoCabsClient } from '@yocabs/api-client';
import { env } from '@/config/env';
import { useSessionStore } from '@/shared/auth/session.store';
import { secureTokenStore } from './secureTokenStore';

/** The one API client for the whole app. */
export const api = createYoCabsClient({
  baseUrl: env.apiBaseUrl,
  tokenStore: secureTokenStore,
  onSessionExpired: () => useSessionStore.getState().signedOut(),
});
