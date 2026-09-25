import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { spacing } from '@/config/brand';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { useTripSearch } from '@/features/tourist/hooks';
import { OptionCard } from '@/features/tourist/OptionCard';
import { toSearchRequest, validateDraft } from '@/features/tourist/searchDraft';
import { selectDraft, useSearchStore } from '@/features/tourist/searchStore';
import { sortOptions, type SortMode } from '@/features/tourist/sortOptions';
import { AppText, Button, Card, ChoiceChips, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { formatDateRange, formatDistance, formatDuration } from '@/shared/utils/format';

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'price', label: 'Lowest price' },
  { value: 'rating', label: 'Top rated' },
];

export default function Results() {
  // selectDraft builds a new object each call; useShallow keeps the result stable between renders.
  const draft = useSearchStore(useShallow(selectDraft));
  const select = useBookingFlow((state) => state.select);
  const [sort, setSort] = useState<SortMode>('price');

  const ready = validateDraft(draft) === null;
  const query = useTripSearch(ready ? toSearchRequest(draft) : null);
  const options = useMemo(
    () => (query.data ? sortOptions(query.data.options, sort) : []),
    [query.data, sort],
  );

  if (!ready) {
    return (
      <EmptyState
        title="Complete your trip details"
        message="Choose a pickup, destination and travel date first."
        action={<Button title="Back to search" onPress={() => router.back()} />}
      />
    );
  }

  return (
    <QueryBoundary
      query={query}
      isEmpty={(data) => data.options.length === 0}
      empty={
        <EmptyState
          title="No cabs available"
          message="No partner has a vehicle for this trip. Try another date, vehicle type or trip type."
          action={
            <Button title="Change search" variant="secondary" onPress={() => router.back()} />
          }
        />
      }
    >
      {(data) => (
        <FlatList
          data={options}
          keyExtractor={(option) => `${option.vehicleId}:${option.tripType}`}
          contentContainerStyle={styles.list}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListHeaderComponent={
            <View>
              <Card>
                <AppText variant="subheading">
                  {draft.pickup?.name} to {draft.destination?.name}
                </AppText>
                <Row style={styles.summary}>
                  <AppText color="textMuted">
                    {formatDistance(data.distanceKm)} · about {formatDuration(data.durationMinutes)}
                  </AppText>
                </Row>
                <AppText variant="small" color="textMuted">
                  {formatDateRange(draft.startDate, draft.endDate)}
                </AppText>
              </Card>
              <ChoiceChips
                options={SORTS}
                value={sort}
                onChange={(value) => value && setSort(value)}
              />
              <AppText variant="small" color="textMuted" style={styles.count}>
                {options.length} option{options.length === 1 ? '' : 's'} from verified partners
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <OptionCard
              option={item}
              onPress={() => {
                select(item, draft);
                router.push('/(tourist)/option');
              }}
            />
          )}
        />
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  summary: { marginVertical: spacing.xs },
  count: { marginVertical: spacing.sm },
});
