import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import {
  BOOKING_GROUP_OPTIONS,
  bookingsInGroup,
  type BookingGroup,
} from '@/shared/utils/bookingGroups';
import { useMyBookings } from '@/features/tourist/hooks';
import { BookingCard, Button, ChoiceChips, EmptyState, QueryBoundary } from '@/shared/ui';

export default function Bookings() {
  const query = useMyBookings();
  const [group, setGroup] = useState<BookingGroup>('UPCOMING');
  const visible = useMemo(() => bookingsInGroup(query.data ?? [], group), [query.data, group]);

  return (
    <View style={styles.flex}>
      <View style={styles.filters}>
        <ChoiceChips
          options={BOOKING_GROUP_OPTIONS}
          value={group}
          onChange={(value) => value && setGroup(value)}
        />
      </View>
      <QueryBoundary query={query}>
        {() => (
          <FlatList
            data={visible}
            keyExtractor={(booking) => booking.id}
            contentContainerStyle={styles.list}
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                counterparty={item.partnerName}
                onPress={() =>
                  router.push({ pathname: '/(tourist)/booking/[id]', params: { id: item.id } })
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="No trips here"
                message="Trips you book will show up in this list."
                action={
                  <Button title="Find a cab" onPress={() => router.push('/(tourist)/(tabs)')} />
                }
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
