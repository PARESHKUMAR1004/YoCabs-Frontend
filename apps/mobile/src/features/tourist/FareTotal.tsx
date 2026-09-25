import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '@/config/brand';
import { AppText } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';

/** What the tourist pays for the trip: one all-inclusive figure, never the parts it is made of. */
export function FareTotal({
  total,
  currency,
  label = 'Total fare',
}: {
  total: number;
  currency: string;
  label?: string;
}) {
  return (
    <View style={styles.panel}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <AppText style={styles.amount}>{formatMoney(total, currency)}</AppText>
      <AppText variant="small" style={styles.note}>
        All-inclusive. No hidden charges.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  label: { color: colors.primary, textTransform: 'uppercase', letterSpacing: 2 },
  amount: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 46,
    color: colors.textOnPrimary,
    marginVertical: spacing.xs,
  },
  note: { color: '#B9B3A5' },
});
