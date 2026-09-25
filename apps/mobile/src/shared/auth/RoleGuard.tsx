import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { spacing } from '@/config/brand';
import { AppText, Button, EmptyState, LoadingView } from '@/shared/ui';
import { signOut } from './session';
import { appRoleOf, homeRouteFor, useSessionStore, type AppRole } from './session.store';

/**
 * Wraps a whole role area (tourist / partner / driver). Sends signed-out people to the welcome
 * screen and people with another role to their own home, so a screen never renders for the
 * wrong person.
 */
export function RoleGuard({ role, children }: { role: AppRole; children: ReactNode }) {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);

  if (status === 'loading') return <LoadingView />;
  if (status === 'signedOut') return <Redirect href="/(auth)/welcome" />;

  const actual = appRoleOf(user);

  if (actual === 'admin') {
    return (
      <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center' }}>
        <EmptyState
          title="Use the admin console"
          message="Administrator accounts are managed in the YoCabs admin web console, not in the mobile app."
          action={<Button title="Sign out" onPress={() => void signOut()} />}
        />
        <AppText variant="small" color="textMuted" align="center">
          Signed in as an administrator
        </AppText>
      </View>
    );
  }

  if (actual !== role) return <Redirect href={homeRouteFor(user) as never} />;

  return <>{children}</>;
}
