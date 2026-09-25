import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SessionUser } from '@yocabs/api-client';
import { api, setSessionExpiredHandler } from '../api';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: Status;
  user: SessionUser | null;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const isAdmin = (user: SessionUser) => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const queryClient = useQueryClient();

  const clear = useCallback(() => {
    queryClient.clear();
    setUser(null);
    setStatus('signedOut');
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(clear);

    (async () => {
      try {
        if (!(await api.tokenStore.get())) return clear();
        const me = await api.auth.me();
        if (!isAdmin(me)) throw new Error('Not an administrator');
        setUser(me);
        setStatus('signedIn');
      } catch {
        await api.tokenStore.set(null);
        clear();
      }
    })();
  }, [clear]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.auth.adminLogin(email, password);
    setUser(session);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Best effort: the local session is cleared either way.
    }
    clear();
  }, [clear]);

  const value = useMemo<AuthValue>(
    () => ({ status, user, isSuperAdmin: user?.role === 'SUPER_ADMIN', signIn, signOut }),
    [status, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
