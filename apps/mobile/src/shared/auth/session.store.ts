import { create } from 'zustand';
import type { SessionUser } from '@yocabs/api-client';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  signIn: (user: SessionUser) => void;
  signedOut: () => void;
}

/**
 * Who is signed in. Pure state: the actual token handling lives in the API client, so this
 * store has no dependency on it (the client notifies the store, never the other way round).
 */
export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  user: null,
  signIn: (user) => set({ status: 'signedIn', user }),
  signedOut: () => set({ status: 'signedOut', user: null }),
}));

export type AppRole = 'tourist' | 'partner' | 'driver' | 'admin';

export function appRoleOf(user: SessionUser | null): AppRole | null {
  switch (user?.role) {
    case 'TOURIST':
      return 'tourist';
    case 'PARTNER_OWNER':
    case 'PARTNER_STAFF':
      return 'partner';
    case 'DRIVER':
      return 'driver';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return 'admin';
    default:
      return null;
  }
}

/** Where each role lands after signing in. */
export function homeRouteFor(user: SessionUser | null): string {
  switch (appRoleOf(user)) {
    case 'tourist':
      return '/(tourist)/(tabs)';
    case 'partner':
      return '/(partner)/(tabs)';
    case 'driver':
      return '/(driver)/(tabs)';
    default:
      return '/(auth)/welcome';
  }
}
