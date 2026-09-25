import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import { useDriverTrips } from '@/features/driver/hooks';
import { BookingCard, ChoiceChips, EmptyState, QueryBoundary } from '@/shared/ui';
import {
  BOOKING_GROUP_OPTIONS,
  bookingsInGroup,
  type BookingGroup,
} from '@/shared/utils/bookingGroups';

export default function DriverTrips() {
  const query = useDriverTrips();
  const [group, setGroup] = useState<BookingGroup>('UPCOMING');
  const visible = useMemo(() => bookingsInGroup(query.data ?? [], group), [query.data, group]);

  return (
    <View style={styles.flex}>
      <View style={styles.filters}>
        <ChoiceChips
          options={BOOKING_GROUP_OPTIONS.slice(0, 3)}
          value={group}
          onChange={(value) => value && setGroup(value)}
        />
      </View>
      <QueryBoundary query={query}>
        {() => (
          <FlatList
            data={visible}
            keyExtractor={(trip) => trip.id}
            contentContainerStyle={styles.list}
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                counterparty={item.tourist?.name}
                onPress={() =>
                  router.push({ pathname: '/(driver)/trip/[id]', params: { id: item.id } })
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="No trips here"
                message="Trips your travel partner assigns to you appear here."
              />
            }
          />
        )}
      </QueryBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  list: { padding: spacing.lg, flexGrow: 1 },
});
