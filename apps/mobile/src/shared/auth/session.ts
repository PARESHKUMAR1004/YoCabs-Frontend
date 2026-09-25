import { api } from '@/shared/api/client';
import { queryClient } from '@/shared/query/queryClient';
import { useSessionStore } from './session.store';

/** Restores the previous session (if any) when the app starts. */
export async function bootstrapSession(): Promise<void> {
  const { signIn, signedOut } = useSessionStore.getState();

  try {
    const tokens = await api.tokenStore.get();
    if (!tokens) {
      signedOut();
      return;
    }
    // `me` refreshes an expired access token transparently; a dead session lands in `catch`.
    signIn(await api.auth.me());
  } catch {
    await api.tokenStore.set(null);
    signedOut();
  }
}

export async function signOut(): Promise<void> {
  try {
    await api.auth.logout();
  } catch {
    // The server-side revoke is best effort; the local session is cleared regardless.
  }
  queryClient.clear();
  useSessionStore.getState().signedOut();
}
