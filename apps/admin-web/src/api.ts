import { createYoCabsClient, type TokenStore, type Tokens } from '@yocabs/api-client';

const STORAGE_KEY = 'yocabs.admin.tokens';

/**
 * Tokens live in sessionStorage: they survive a page refresh but not closing the tab, which is
 * the right trade-off for an operations console (no long-lived credentials left on shared machines).
 */
const sessionTokenStore: TokenStore = {
  async get() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  },
  async set(tokens) {
    try {
      if (tokens) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private mode): the session simply will not survive a refresh.
    }
  },
};

let onSessionExpired: () => void = () => undefined;

/** The auth provider registers itself here so the client can sign the person out on a dead session. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

export const api = createYoCabsClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  tokenStore: sessionTokenStore,
  onSessionExpired: () => onSessionExpired(),
});
