import type { ExplorePartner } from '@yocabs/api-client';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '@/config/brand';
import { api } from '@/shared/api/client';
import { AppText, RatingBadge } from '@/shared/ui';
import { categoryLabel } from '@/shared/utils/labels';

export const PARTNER_CARD_WIDTH = 230;

/** One travel partner in the Explore row: a photo of one of their cars, then who they are. */
export function PartnerCard({
  partner,
  onPress,
}: {
  partner: ExplorePartner;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${partner.name}, ${partner.vehicleCount} vehicles`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {partner.coverPhoto ? (
        <Image
          source={{ uri: api.assetUrl(partner.coverPhoto) }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Ionicons name="car-sport" size={34} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <AppText variant="subheading" numberOfLines={1}>
          {partner.name}
        </AppText>
        <RatingBadge rating={partner.rating} count={partner.reviewCount} />
        <AppText variant="small" color="textMuted" numberOfLines={1} style={styles.meta}>
          {partner.vehicleCount} {partner.vehicleCount === 1 ? 'cab' : 'cabs'} ·{' '}
          {partner.categories.map(categoryLabel).join(', ')}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: PARTNER_CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  photo: { width: '100%', height: 120, backgroundColor: colors.surface },
  noPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  body: { padding: spacing.md, gap: spacing.xs },
  meta: { marginTop: spacing.xs },
});
