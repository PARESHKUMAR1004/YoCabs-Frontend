import { StyleSheet, View } from 'react-native';
import type { SearchOption } from '@yocabs/api-client';
import { spacing } from '@/config/brand';
import { AppText, Badge, Card, RatingBadge, Row } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';
import { categoryLabel, tripTypeLabel } from '@/shared/utils/labels';

/** One comparable result: partner, vehicle and price at a glance. */
export function OptionCard({ option, onPress }: { option: SearchOption; onPress: () => void }) {
  return (
    <Card onPress={onPress}>
      <Row style={styles.between}>
        <View style={styles.flex}>
          <AppText variant="subheading">{option.travelPartnerName}</AppText>
          <RatingBadge rating={option.rating} count={option.reviewCount} />
        </View>
        <View style={styles.price}>
          <AppText variant="heading" color="primaryDark">
            {formatMoney(option.price.totalAmount, option.price.currency)}
          </AppText>
          <AppText variant="small" color="textMuted">
            {tripTypeLabel(option.tripType)}
          </AppText>
        </View>
      </Row>

      <AppText style={styles.vehicle}>
        {option.make} {option.model} · {categoryLabel(option.category)} · {option.passengerCapacity}{' '}
        seats
      </AppText>

      <Row style={styles.facilities}>
        {option.facilities.slice(0, 3).map((facility) => (
          <Badge key={facility.code} label={facility.name} />
        ))}
        {option.facilities.length > 3 ? <Badge label={`+${option.facilities.length - 3}`} /> : null}
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { justifyContent: 'space-between', alignItems: 'flex-start' },
  price: { alignItems: 'flex-end' },
  vehicle: { marginTop: spacing.sm },
  facilities: { marginTop: spacing.sm, flexWrap: 'wrap', gap: spacing.xs },
});
