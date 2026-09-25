import type { RoutePlace } from '@yocabs/api-client';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/config/brand';
import { MapCanvas, type MapMarker } from '@/shared/maps';
import { AppText } from '@/shared/ui';
import { formatDateTime } from '@/shared/utils/format';
import { useTripLocation, useTripRoute } from './hooks';

const hasCoordinates = (place: RoutePlace) => place.latitude !== null && place.longitude !== null;

function routeMarker(id: string, kind: MapMarker['kind'], place: RoutePlace): MapMarker | null {
  if (place.latitude === null || place.longitude === null) return null;
  return {
    id,
    kind,
    label: place.description,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

/**
 * The trip as it happens: the journey from pickup to destination, and the car moving along it.
 * Shows the route alone until the driver's first position arrives.
 */
export function LiveTripMap({ bookingId, height = 280 }: { bookingId: string; height?: number }) {
  const route = useTripRoute(bookingId, true);
  const car = useTripLocation(bookingId, true);

  const markers: MapMarker[] = [];
  if (route.data) {
    const { pickup, stops, destination } = route.data;
    const ends = [
      routeMarker('pickup', 'pickup', pickup),
      ...stops.map((stop, index) => routeMarker(`stop-${index}`, 'stop', stop)),
      routeMarker('destination', 'destination', destination),
    ];
    markers.push(...ends.filter((marker): marker is MapMarker => marker !== null));
  }
  const drawable = route.data ? hasCoordinates(route.data.pickup) : false;

  if (car.data) {
    markers.push({
      id: 'vehicle',
      kind: 'vehicle',
      label: 'Your cab',
      latitude: car.data.latitude,
      longitude: car.data.longitude,
    });
  }

  return (
    <View>
      {markers.length ? (
        <MapCanvas markers={markers} connect={drawable} height={height} testID="live-trip-map" />
      ) : null}
      <AppText variant="small" color="textMuted" style={styles.caption}>
        {car.data
          ? `Live location, updated ${formatDateTime(car.data.recordedAt)}`
          : 'Waiting for your driver to share their location. It appears here as soon as they do.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { marginTop: spacing.sm, marginBottom: spacing.md },
});
