import { router, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { signOut } from '@/shared/auth/session';
import { AppText, Button, Card, KeyValue, QueryBoundary, Screen, Spacer } from '@/shared/ui';
import { confirmAction } from '@/shared/utils/feedback';
import { formatMobile, humanize } from '@/shared/utils/format';
import { useProfile } from './hooks';

interface Props {
  /** Role-specific routes for the shared actions, so the same screen serves every role. */
  editRoute: Href;
  supportRoute: Href;
  /** Extra role-specific links (documents, wallet, ...) rendered above the sign-out button. */
  extra?: React.ReactNode;
}

export function ProfileScreen({ editRoute, supportRoute, extra }: Props) {
  const query = useProfile();

  const onSignOut = async () => {
    if (
      await confirmAction(
        'Sign out?',
        'You will need your mobile number to sign in again.',
        'Sign out',
        true,
      )
    ) {
      await signOut();
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <QueryBoundary query={query}>
      {(profile) => (
        <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
          <AppText variant="title">{profile.displayName ?? 'Your profile'}</AppText>
          <AppText color="textMuted">{humanize(profile.role)}</AppText>
          <Spacer />
          <Card>
            <KeyValue label="Mobile" value={formatMobile(profile.mobile)} />
            <KeyValue label="Email" value={profile.email ?? 'Not added'} />
          </Card>

          <Button title="Edit profile" variant="secondary" onPress={() => router.push(editRoute)} />
          <Spacer size="sm" />
          <Button
            title="Help & support"
            variant="secondary"
            onPress={() => router.push(supportRoute)}
          />
          <Spacer size="sm" />
          {extra}
          <Button
            title="Sign out"
            variant="ghost"
            onPress={() => void onSignOut()}
            style={styles.signOut}
          />
        </Screen>
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  signOut: { marginTop: spacing.lg },
});
