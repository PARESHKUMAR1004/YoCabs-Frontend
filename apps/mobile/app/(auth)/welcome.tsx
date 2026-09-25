import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand, colors, spacing } from '@/config/brand';
import { AppText, Button, Spacer } from '@/shared/ui';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <AppText variant="title" color="primary" style={styles.logo}>
          {brand.name}
        </AppText>
        <AppText color="textMuted" align="center">
          {brand.tagline}
        </AppText>
        <Spacer size="xl" />
        <AppText align="center" color="textMuted">
          Discover, compare and book trusted travel partners across Odisha.
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          title="Get started"
          onPress={() => router.push('/(auth)/login')}
          testID="get-started"
        />
        <Spacer />
        <Button
          title="Register your travel business"
          variant="secondary"
          onPress={() => router.push('/(auth)/register-partner')}
        />
        <Spacer />
        <AppText variant="small" color="textMuted" align="center">
          Drivers and partner staff sign in with the mobile number their employer registered.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 44, marginBottom: spacing.sm },
  actions: { paddingBottom: spacing.lg },
});
