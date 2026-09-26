import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { brand, colors, fonts, radius, spacing } from '@/config/brand';
import { AppText, BuildStamp, Button, Spacer } from '@/shared/ui';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.crest}>
          <AppText style={styles.crestLetter}>Y</AppText>
        </View>
        <AppText style={styles.logo}>{brand.name}</AppText>
        <View style={styles.rule} />
        <AppText style={styles.tagline}>{brand.tagline}</AppText>
        <Spacer size="xl" />
        <AppText align="center" style={styles.blurb}>
          Chauffeured journeys across Odisha, with trusted travel partners and every fare agreed
          before you go.
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          title="Get started"
          variant="gold"
          onPress={() => router.push('/(auth)/login')}
          testID="get-started"
        />
        <Spacer size="sm" />
        <Button
          title="Register your travel business"
          variant="outlineLight"
          onPress={() => router.push('/(auth)/register-partner')}
        />
        <Spacer />
        <AppText variant="small" align="center" style={styles.footnote}>
          Drivers and partner staff sign in with the mobile number their employer registered.
        </AppText>
        <BuildStamp onDark />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, padding: spacing.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  crest: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  crestLetter: { fontFamily: fonts.display, fontSize: 40, lineHeight: 48, color: colors.primary },
  logo: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 54,
    letterSpacing: 2,
    color: colors.textOnPrimary,
  },
  rule: { width: 48, height: 2, backgroundColor: colors.primary, marginVertical: spacing.lg },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  blurb: { color: '#C9C3B6', fontSize: 15, lineHeight: 23, paddingHorizontal: spacing.lg },
  actions: { paddingBottom: spacing.lg },
  footnote: { color: '#9A9486' },
});
