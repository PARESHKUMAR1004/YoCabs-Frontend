import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { colors, radius, spacing } from '@/config/brand';
import { useBookingFlow } from '@/features/tourist/bookingFlow';
import { FilterSheet } from '@/features/tourist/FilterSheet';
import { useTripSearch } from '@/features/tourist/hooks';
import { OptionCard } from '@/features/tourist/OptionCard';
import {
  activeFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  type ResultFilters,
} from '@/features/tourist/resultFilters';
import { toSearchRequest, validateDraft } from '@/features/tourist/searchDraft';
import { selectDraft, useSearchStore } from '@/features/tourist/searchStore';
import { AppText, Button, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { formatDateRange, formatDistance, formatDuration } from '@/shared/utils/format';

export default function Results() {
  // selectDraft builds a new object each call; useShallow keeps the result stable between renders.
  const draft = useSearchStore(useShallow(selectDraft));
  const only = useSearchStore((state) => state.only);
  const setOnly = useSearchStore((state) => state.setOnly);
  const select = useBookingFlow((state) => state.select);
  const [filters, setFilters] = useState<ResultFilters>(DEFAULT_FILTERS);
  const [filtering, setFiltering] = useState(false);

  const ready = validateDraft(draft) === null;
  const query = useTripSearch(ready ? toSearchRequest(draft) : null);

  // A partner or cab picked in Explore narrows the search before the tourist's own filters apply.
  const scoped = useMemo(() => {
    const found = query.data?.options ?? [];
    if (!only) return found;
    return found.filter((option) =>
      only.vehicleId
        ? option.vehicleId === only.vehicleId
        : option.travelPartnerId === only.partnerId,
    );
  }, [query.data, only]);

  const options = useMemo(() => applyFilters(scoped, filters), [scoped, filters]);
  const filterCount = activeFilterCount(filters);

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
        <>
          <FlatList
            data={options}
            keyExtractor={(option) => `${option.vehicleId}:${option.tripType}`}
            contentContainerStyle={styles.list}
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            ListHeaderComponent={
              <View>
                <View style={styles.trip}>
                  <AppText variant="heading" color="textOnPrimary">
                    {draft.pickup?.name} → {draft.destination?.name}
                  </AppText>
                  <Row style={styles.summary}>
                    <AppText variant="caption" color="primary">
                      {formatDistance(data.distanceKm)} · about{' '}
                      {formatDuration(data.durationMinutes)}
                    </AppText>
                  </Row>
                  <AppText variant="small" style={styles.tripDate}>
                    {formatDateRange(draft.startDate, draft.endDate)}
                  </AppText>
                </View>

                {only ? (
                  <Row style={styles.only}>
                    <AppText style={styles.flex} numberOfLines={2}>
                      Showing{' '}
                      <AppText variant="subheading">
                        {only.vehicleLabel ? `${only.vehicleLabel} · ` : ''}
                        {only.partnerName}
                      </AppText>{' '}
                      only
                    </AppText>
                    <Button
                      title="Show all"
                      variant="ghost"
                      onPress={() => setOnly(null)}
                      style={styles.showAll}
                    />
                  </Row>
                ) : null}

                <Row style={styles.toolbar}>
                  <AppText variant="small" color="textMuted" style={styles.flex}>
                    {options.length} option{options.length === 1 ? '' : 's'} from verified partners
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      filterCount > 0 ? `Filters, ${filterCount} applied` : 'Filters'
                    }
                    onPress={() => setFiltering(true)}
                    style={[styles.filterButton, filterCount > 0 && styles.filterActive]}
                    testID="open-filters"
                  >
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color={filterCount > 0 ? colors.textOnPrimary : colors.text}
                    />
                    <AppText variant="caption" color={filterCount > 0 ? 'textOnPrimary' : 'text'}>
                      {filterCount > 0 ? `Filters · ${filterCount}` : 'Filters'}
                    </AppText>
                  </Pressable>
                </Row>
              </View>
            }
            ListEmptyComponent={
              only && scoped.length === 0 ? (
                <EmptyState
                  title="Not available for this trip"
                  message={`${only.vehicleLabel ?? only.partnerName} cannot take this trip on these dates. You can compare every cab instead.`}
                  action={<Button title="Show all cabs" onPress={() => setOnly(null)} />}
                />
              ) : (
                <EmptyState
                  title="No cabs match your filters"
                  message="Loosen a filter to see more."
                  action={
                    <Button
                      title="Reset filters"
                      variant="secondary"
                      onPress={() => setFilters(DEFAULT_FILTERS)}
                    />
                  }
                />
              )
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

          <FilterSheet
            visible={filtering}
            options={scoped}
            filters={filters}
            onApply={(next) => {
              setFilters(next);
              setFiltering(false);
            }}
            onClose={() => setFiltering(false)}
          />
        </>
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, flexGrow: 1 },
  trip: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  tripDate: { color: '#B9B3A5' },
  summary: { marginVertical: spacing.xs },
  only: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  showAll: { minHeight: 40, marginBottom: 0, paddingHorizontal: spacing.md },
  toolbar: { justifyContent: 'space-between', marginBottom: spacing.md, gap: spacing.md },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
});
