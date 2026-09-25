import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { spacing } from '@/config/brand';
import { usePartnerLiveTrips, useVehicles } from '@/features/partner/hooks';
import { MapCanvas, type MapCircle, type MapMarker } from '@/shared/maps';
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  QueryBoundary,
  Row,
  Screen,
  SectionHeader,
  Spacer,
} from '@/shared/ui';
import { formatDateTime } from '@/shared/utils/format';

/**
 * The whole fleet on one map: every vehicle's service area as a circle, and any car currently
 * on a trip shown where it actually is.
 */
export default function FleetMap() {
  const vehicles = useVehicles();
  const liveTrips = usePartnerLiveTrips();

  return (
    <QueryBoundary query={vehicles}>
      {(fleet) => {
        const circles: MapCircle[] = fleet.flatMap((vehicle) =>
          vehicle.serviceAreas.map((area) => ({
            latitude: area.latitude,
            longitude: area.longitude,
            radiusKm: area.radiusKm,
          })),
        );

        // A pin at the centre of each area, labelled with the car that covers it.
        const areaPins: MapMarker[] = fleet.flatMap((vehicle) =>
          vehicle.serviceAreas.map((area) => ({
            id: `${vehicle.id}-${area.id}`,
            kind: 'centre' as const,
            label: `${vehicle.make} ${vehicle.model} · ${area.name}`,
            latitude: area.latitude,
            longitude: area.longitude,
          })),
        );

        const onRoad = (liveTrips.data ?? []).filter((trip) => trip.location !== null);

        const livePins: MapMarker[] = onRoad.map((trip) => ({
          id: `live-${trip.bookingId}`,
          kind: 'pickup' as const,
          label: `On trip: ${trip.pickup} → ${trip.destination}`,
          latitude: trip.location!.latitude,
          longitude: trip.location!.longitude,
        }));

        const withoutArea = fleet.filter((vehicle) => vehicle.serviceAreas.length === 0);

        return (
          <Screen
            refreshing={vehicles.isRefetching}
            onRefresh={() => {
              void vehicles.refetch();
              void liveTrips.refetch();
            }}
          >
            {circles.length || livePins.length ? (
              <MapCanvas
                circles={circles}
                markers={[...areaPins, ...livePins]}
                height={300}
                testID="fleet-map"
              />
            ) : (
              <EmptyState
                title="Nothing to show yet"
                message="Set a service area on a vehicle and it will appear here."
              />
            )}

            <SectionHeader title={`On the road (${onRoad.length})`} />
            {onRoad.length === 0 ? (
              <AppText color="textMuted">No trips are running right now.</AppText>
            ) : (
              onRoad.map((trip) => (
                <Card
                  key={trip.bookingId}
                  onPress={() =>
                    router.push({
                      pathname: '/(partner)/booking/[id]',
                      params: { id: trip.bookingId },
                    })
                  }
                >
                  <AppText variant="subheading">
                    {trip.pickup} → {trip.destination}
                  </AppText>
                  <AppText variant="small" color="textMuted">
                    Position updated {formatDateTime(trip.location!.recordedAt)}
                  </AppText>
                </Card>
              ))
            )}

            <SectionHeader title="Vehicles" />
            {fleet.map((vehicle) => (
              <Card
                key={vehicle.id}
                onPress={() =>
                  router.push({
                    pathname: '/(partner)/vehicle/[id]/service-areas',
                    params: { id: vehicle.id },
                  })
                }
              >
                <Row style={styles.row}>
                  <AppText variant="subheading" style={styles.flex}>
                    {vehicle.make} {vehicle.model}
                  </AppText>
                  <Badge
                    label={
                      vehicle.serviceAreas.length
                        ? `${vehicle.serviceAreas.length} area${vehicle.serviceAreas.length === 1 ? '' : 's'}`
                        : 'No area'
                    }
                    tone={vehicle.serviceAreas.length ? 'success' : 'warning'}
                  />
                </Row>
                <AppText color="textMuted">
                  {vehicle.serviceAreas.map((area) => area.name).join(', ') ||
                    'Tap to set where this vehicle works'}
                </AppText>
              </Card>
            ))}

            {withoutArea.length ? (
              <>
                <Spacer size="sm" />
                <AppText variant="small" color="warning">
                  {withoutArea.length} vehicle{withoutArea.length === 1 ? '' : 's'} without a
                  service area will never appear in a traveller&apos;s search.
                </AppText>
              </>
            ) : null}

            <Spacer />
            <Button
              title="Manage fleet"
              variant="secondary"
              onPress={() => router.push('/(partner)/(tabs)/fleet')}
            />
          </Screen>
        );
      }}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { justifyContent: 'space-between', gap: spacing.sm },
});
