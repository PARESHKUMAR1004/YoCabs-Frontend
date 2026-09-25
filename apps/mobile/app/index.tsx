import { Redirect } from 'expo-router';
import { homeRouteFor, useSessionStore } from '@/shared/auth/session.store';
import { LoadingView } from '@/shared/ui';

/** Entry point: route to the right place for the current session. */
export default function Index() {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);

  if (status === 'loading') return <LoadingView />;
  if (status === 'signedOut') return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={homeRouteFor(user) as never} />;
}
