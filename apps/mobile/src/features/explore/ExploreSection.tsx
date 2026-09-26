import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import type { Place } from '@/shared/places';
import { AppText, LoadingView } from '@/shared/ui';
import { useExplorePartners } from './hooks';
import { PartnerCard, PARTNER_CARD_WIDTH } from './PartnerCard';

/**
 * The front page's Explore section: every travel partner with cabs working around where the
 * tourist is. Opening one lists their cabs, and any of them can be booked from there.
 */
export function ExploreSection({ pickup }: { pickup: Place | null }) {
  const query = useExplorePartners(pickup);

  if (!pickup) return null;

  return (
    <View style={styles.section}>
      <AppText variant="heading">Explore</AppText>
      <AppText variant="small" color="textMuted" style={styles.subtitle} numberOfLines={1}>
        Travel partners around {pickup.name}
      </AppText>

      {query.isPending ? (
        <View style={styles.status}>
          <LoadingView />
        </View>
      ) : query.isError ? (
        <AppText color="textMuted">Could not load travel partners. Pull down to try again.</AppText>
      ) : query.data.length === 0 ? (
        <AppText color="textMuted">
          No travel partner is operating around here yet. You can still search for a cab above.
        </AppText>
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(partner) => partner.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={PARTNER_CARD_WIDTH + spacing.md}
          decelerationRate="fast"
          contentContainerStyle={styles.row}
          renderItem={({ item }) => (
            <PartnerCard
              partner={item}
              onPress={() =>
                router.push({ pathname: '/(tourist)/partner/[id]', params: { id: item.id } })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.sm, marginBottom: spacing.lg },
  subtitle: { marginBottom: spacing.md },
  row: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  status: { height: 120 },
});
