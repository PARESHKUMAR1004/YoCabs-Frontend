import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/config/brand';
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
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <AppText style={styles.initial}>
                {(profile.displayName ?? profile.mobile ?? '?').charAt(0).toUpperCase()}
              </AppText>
            </View>
            <AppText variant="heading" color="textOnPrimary">
              {profile.displayName ?? 'Your profile'}
            </AppText>
            <AppText variant="caption" color="primary" style={styles.role}>
              {humanize(profile.role)}
            </AppText>
          </View>
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
  identity: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  initial: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.primary },
  role: { textTransform: 'uppercase', letterSpacing: 2, marginTop: spacing.xs },
});
