import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/config/brand';
import { AppText, Card } from '@/shared/ui';

/** The start code the driver needs from the tourist to begin the trip. */
export function TripCodeCard({ code }: { code: string }) {
  return (
    <Card>
      <AppText variant="subheading">Your trip start code</AppText>
      <View style={styles.code}>
        <AppText style={styles.digits} accessibilityLabel={`Code ${code.split('').join(' ')}`}>
          {code}
        </AppText>
      </View>
      <AppText variant="small" color="textMuted">
        Give this code to the driver once you are in the cab, so they can start the trip. Do not
        share it earlier.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  code: {
    alignSelf: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  digits: {
    fontFamily: fonts.figure,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: 10,
    color: colors.primary,
  },
});
