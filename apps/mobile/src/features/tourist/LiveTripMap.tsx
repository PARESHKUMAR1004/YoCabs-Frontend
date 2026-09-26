import type { Booking, RoutePlace, TripLocation } from '@yocabs/api-client';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '@/config/brand';
import { MapCanvas, type MapMarker } from '@/shared/maps';
import { AppText, CallButton, Row } from '@/shared/ui';
import { formatDuration } from '@/shared/utils/format';
import { useTripLocation, useTripRoute } from './hooks';
import { formatArrival, formatRemaining, tripProgress } from './tripProgress';

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

/** The Uber-style panel under the map: time left, distance left, progress and the driver. */
function TripStatus({
  location,
  destination,
  booking,
}: {
  location: TripLocation | null | undefined;
  destination: string | undefined;
  booking?: Booking;
}) {
  const minutes = location?.remainingMinutes ?? null;
  const km = location?.remainingDistanceKm ?? null;
  const progress = tripProgress(km, location?.tripDistanceKm);
  const arriving = km !== null && km < 0.3;

  return (
    <View style={styles.status}>
      <Row style={styles.headline}>
        <View style={styles.flex}>
          {location === null || location === undefined ? (
            <>
              <AppText variant="heading">Getting your trip going</AppText>
              <AppText variant="small" color="textMuted">
                Your driver&apos;s live location appears here as soon as they share it.
              </AppText>
            </>
          ) : minutes === null || km === null ? (
            <>
              <AppText variant="heading">On the way</AppText>
              {destination ? (
                <AppText variant="small" color="textMuted">
                  Heading to {destination}
                </AppText>
              ) : null}
            </>
          ) : (
            <>
              <AppText variant="title" style={styles.figure}>
                {arriving ? 'Arriving now' : formatDuration(minutes)}
              </AppText>
              <AppText variant="small" color="textMuted">
                {formatRemaining(km)} to {destination ?? 'your destination'}
                {arriving ? '' : ` · arrive by ${formatArrival(new Date(), minutes)}`}
              </AppText>
            </>
          )}
        </View>
        <View style={styles.badge}>
          <Ionicons name="car-sport" size={22} color={colors.primary} />
        </View>
      </Row>

      {progress !== null ? (
        <View
          style={styles.track}
          accessibilityLabel={`${Math.round(progress * 100)} percent of the trip`}
        >
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          <View style={[styles.dot, { left: `${Math.round(progress * 100)}%` }]}>
            <Ionicons name="car-sport" size={12} color={colors.textOnPrimary} />
          </View>
        </View>
      ) : null}

      {booking?.driver ? (
        <Row style={styles.driver}>
          <View style={styles.flex}>
            <AppText variant="subheading">{booking.driver.name ?? 'Your driver'}</AppText>
            {booking.vehicle ? (
              <AppText variant="small" color="textMuted">
                {booking.vehicle.make} {booking.vehicle.model} ·{' '}
                {booking.vehicle.registrationNumber}
              </AppText>
            ) : null}
          </View>
          <CallButton title="Call" mobile={booking.driver.mobile} />
        </Row>
      ) : null}
    </View>
  );
}

/**
 * The trip as it happens: the journey from pickup to destination, the car moving along it, and
 * how far and how long it still has to go. Shows the route alone until the first position arrives.
 */
export function LiveTripMap({
  bookingId,
  booking,
  height = 300,
}: {
  bookingId: string;
  /** When given, the driver and vehicle are shown under the map. */
  booking?: Booking;
  height?: number;
}) {
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
      <TripStatus
        location={car.data}
        destination={route.data?.destination.description}
        booking={booking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  status: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: -spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadow.raised,
  },
  headline: { gap: spacing.md, alignItems: 'flex-start' },
  figure: { fontFamily: fonts.figure },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  fill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.primary },
  dot: {
    position: 'absolute',
    top: -9,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driver: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
});
