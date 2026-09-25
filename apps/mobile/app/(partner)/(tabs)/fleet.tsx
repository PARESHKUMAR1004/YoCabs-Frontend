import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { useVehicles } from '@/features/partner/hooks';
import { AppText, Badge, Button, Card, EmptyState, QueryBoundary, Row } from '@/shared/ui';
import { categoryLabel, vehicleStatusTone } from '@/shared/utils/labels';
import { humanize } from '@/shared/utils/format';

export default function Fleet() {
  const query = useVehicles();
  const add = () => router.push('/(partner)/vehicle/new');

  return (
    <QueryBoundary
      query={query}
      isEmpty={(vehicles) => vehicles.length === 0}
      empty={
        <EmptyState
          title="No vehicles yet"
          message="Add your first vehicle, then set its prices, to start receiving bookings."
          action={<Button title="Add vehicle" onPress={add} />}
        />
      }
    >
      {(vehicles) => (
        <FlatList
          data={vehicles}
          keyExtractor={(vehicle) => vehicle.id}
          contentContainerStyle={styles.list}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          ListHeaderComponent={
            <Button title="Add vehicle" variant="secondary" onPress={add} style={styles.header} />
          }
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                router.push({ pathname: '/(partner)/vehicle/[id]', params: { id: item.id } })
              }
            >
              <Row style={styles.row}>
                <AppText variant="subheading" style={styles.flex}>
                  {item.make} {item.model}
                </AppText>
                <Badge label={humanize(item.status)} tone={vehicleStatusTone(item.status)} />
              </Row>
              <AppText color="textMuted">
                {item.registrationNumber} · {categoryLabel(item.category)} ·{' '}
                {item.passengerCapacity} seats
              </AppText>
            </Card>
          )}
        />
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  header: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', gap: spacing.sm },
  flex: { flex: 1 },
});
