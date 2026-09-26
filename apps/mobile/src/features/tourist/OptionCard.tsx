import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import type { SearchOption } from '@yocabs/api-client';
import { colors, radius, spacing } from '@/config/brand';
import { api } from '@/shared/api/client';
import { AppText, Badge, Card, RatingBadge, Row } from '@/shared/ui';
import { formatMoney } from '@/shared/utils/format';
import { categoryLabel, tripTypeLabel } from '@/shared/utils/labels';

/** One comparable result: the car first, then who runs it and what it costs. */
export function OptionCard({ option, onPress }: { option: SearchOption; onPress: () => void }) {
  const photo = option.photos[0];

  return (
    <Card onPress={onPress}>
      {photo ? (
        <Image source={{ uri: api.assetUrl(photo) }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Ionicons name="car-sport" size={34} color={colors.primary} />
        </View>
      )}
      <AppText variant="small" color="primaryDark" style={styles.eyebrow}>
        {categoryLabel(option.category)} · {option.passengerCapacity} seats
      </AppText>
      <AppText variant="heading">
        {option.make} {option.model}
      </AppText>

      <Row style={styles.partner}>
        <AppText color="textMuted" style={styles.flex} numberOfLines={1}>
          {option.travelPartnerName}
        </AppText>
        <RatingBadge rating={option.rating} count={option.reviewCount} />
      </Row>

      <View style={styles.rule} />

      <Row style={styles.between}>
        <Row style={styles.facilities}>
          {option.facilities.slice(0, 2).map((facility) => (
            <Badge key={facility.code} label={facility.name} />
          ))}
          {option.facilities.length > 2 ? (
            <Badge label={`+${option.facilities.length - 2}`} />
          ) : null}
        </Row>
        <View style={styles.price}>
          <AppText variant="figure" style={styles.amount}>
            {formatMoney(option.price.totalAmount, option.price.currency)}
          </AppText>
          <AppText variant="small" color="textMuted">
            {tripTypeLabel(option.tripType)} · total fare
          </AppText>
        </View>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  photo: {
    height: 150,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  partner: { marginTop: spacing.xs, gap: spacing.md },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  between: { justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.md },
  facilities: { flex: 1, flexWrap: 'wrap', gap: spacing.xs },
  price: { alignItems: 'flex-end' },
  amount: { fontSize: 24, lineHeight: 30 },
});
