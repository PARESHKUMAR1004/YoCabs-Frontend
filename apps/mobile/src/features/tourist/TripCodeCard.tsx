import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText, Card } from '@/shared/ui';

/**
 * The code the driver needs from the tourist. Which one it is depends on the trip: the API sends
 * the start code before the trip and the completion code while it runs.
 */
export function TripCodeCard({ code, started }: { code: string; started: boolean }) {
  return (
    <Card>
      <AppText variant="subheading">{started ? 'Trip completion code' : 'Trip start code'}</AppText>
      <View style={styles.code}>
        <AppText style={styles.digits} accessibilityLabel={`Code ${code.split('').join(' ')}`}>
          {code}
        </AppText>
      </View>
      <AppText variant="small" color="textMuted">
        {started
          ? 'Give this code to the driver when you reach your destination, so they can complete the trip.'
          : 'Give this code to the driver when you are in the cab, so they can start the trip. Do not share it earlier.'}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  code: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  digits: { fontSize: 34, fontWeight: '800', letterSpacing: 8, color: colors.primaryDark },
});
