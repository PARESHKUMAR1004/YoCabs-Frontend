import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import type { Place } from '@/shared/places';
import { AppText, ChoiceChips, LoadingView } from '@/shared/ui';
import { ExploreCars } from './ExploreCars';
import { useExplorePartners } from './hooks';
import { PartnerCard, PARTNER_CARD_WIDTH } from './PartnerCard';

type Mode = 'cars' | 'partners';

const MODES: { value: Mode; label: string }[] = [
  { value: 'cars', label: 'Cars' },
  { value: 'partners', label: 'Travel partners' },
];

function PartnersRow({ pickup }: { pickup: Place }) {
  const query = useExplorePartners(pickup);

  if (query.isPending) {
    return (
      <View style={styles.status}>
        <LoadingView />
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppText color="textMuted">Could not load travel partners. Pull down to try again.</AppText>
    );
  }

  if (query.data.length === 0) {
    return (
      <AppText color="textMuted">
        No travel partner is operating around here yet. You can still search for a cab above.
      </AppText>
    );
  }

  return (
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
  );
}

/**
 * The front page's Explore section: browse what is available around the tourist by the car they
 * want, or by the travel partner that runs it, and book from either.
 */
export function ExploreSection({ pickup }: { pickup: Place | null }) {
  const [mode, setMode] = useState<Mode>('cars');

  if (!pickup) return null;

  return (
    <View style={styles.section}>
      <AppText variant="heading">Explore</AppText>
      <AppText variant="small" color="textMuted" style={styles.subtitle} numberOfLines={1}>
        Around {pickup.name}
      </AppText>

      <ChoiceChips options={MODES} value={mode} onChange={(value) => value && setMode(value)} />
      <View style={styles.content}>
        {mode === 'cars' ? <ExploreCars pickup={pickup} /> : <PartnersRow pickup={pickup} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.sm, marginBottom: spacing.lg },
  subtitle: { marginBottom: spacing.md },
  content: { marginTop: spacing.sm },
  row: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  status: { height: 120 },
});
