import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, radius, spacing } from '@/config/brand';
import { AppText } from '@/shared/ui';
import { PREMIUM_MAP_STYLE } from './mapStyle';
import type { Coordinate, MapCircle, MapMarker, MarkerKind } from './types';

/** Bhubaneswar: where the map opens when nothing has been chosen yet. */
export const DEFAULT_CENTRE: Coordinate = { latitude: 20.2961, longitude: 85.8245 };

const PIN_COLORS: Record<MarkerKind, string> = {
  pickup: colors.ink,
  destination: colors.primary,
  stop: colors.info,
  centre: colors.primaryDark,
  vehicle: colors.ink,
};

/** Degrees of latitude per kilometre; good enough to frame a service-area circle. */
const KM_IN_DEGREES = 1 / 111;

/** A zoom level as the slice of the world MapView shows. */
const deltaForZoom = (zoom: number) => 360 / 2 ** zoom;

/** The corners of a circle's bounding box, so fitting to it keeps the whole area on screen. */
function circleCorners(circle: MapCircle): Coordinate[] {
  const latitudeSpan = circle.radiusKm * KM_IN_DEGREES;
  const longitudeSpan = latitudeSpan / Math.max(Math.cos((circle.latitude * Math.PI) / 180), 0.01);

  return [
    { latitude: circle.latitude + latitudeSpan, longitude: circle.longitude + longitudeSpan },
    { latitude: circle.latitude - latitudeSpan, longitude: circle.longitude - longitudeSpan },
  ];
}

interface Props {
  markers?: MapMarker[];
  circles?: MapCircle[];
  /** Join the markers with a line (pickup → stops → destination). */
  connect?: boolean;
  /** Keep everything in view when the markers or circles change. Default true. */
  fit?: boolean;
  /** False renders a still preview that ignores gestures. */
  interactive?: boolean;
  initialCentre?: Coordinate;
  initialZoom?: number;
  height?: number;
  /** Fired when the person stops moving the map: the coordinate at the centre. */
  onCentreChange?: (centre: Coordinate) => void;
  onPressCoordinate?: (coordinate: Coordinate) => void;
  /** Tapping recentres the map, so a centre pin follows the tap. Used by the pickers. */
  panOnPress?: boolean;
  /** Recentres the map when this changes (choosing a search result, for example). */
  focus?: Coordinate | null;
  /** Offers the satellite view. Defaults on for maps the person can move. */
  layerToggle?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A Google map. Screens describe what they want shown (markers, service-area circles) and never
 * touch the map SDK, so the renderer stays swappable.
 */
export function MapCanvas({
  markers = [],
  circles = [],
  connect = false,
  fit = true,
  interactive = true,
  initialCentre,
  initialZoom = 12,
  height = 240,
  onCentreChange,
  onPressCoordinate,
  panOnPress = false,
  focus,
  layerToggle,
  style,
  testID,
}: Props) {
  const map = useRef<MapView>(null);
  const [satellite, setSatellite] = useState(false);
  // Android's Google map draws on its own surface and can come up blank unless it is given
  // explicit pixel dimensions, so the size is measured before the map is mounted.
  const [box, setBox] = useState<LayoutRectangle | null>(null);

  const centre = initialCentre ?? markers[0] ?? circles[0] ?? DEFAULT_CENTRE;
  // The opening region must not change afterwards, or the map would jump under the person.
  const initialRegion = useRef({
    latitude: centre.latitude,
    longitude: centre.longitude,
    latitudeDelta: deltaForZoom(initialZoom),
    longitudeDelta: deltaForZoom(initialZoom),
  });

  // The car moves every few seconds; only its appearing (not each step) should reframe the map.
  const framed = JSON.stringify({
    markers: markers.map((marker) => (marker.kind === 'vehicle' ? { id: marker.id } : marker)),
    circles,
  });
  const route = markers.filter((marker) => marker.kind !== 'vehicle');

  useEffect(() => {
    if (!fit) return;

    const points = [...markers, ...circles.flatMap(circleCorners)];
    if (!points.length) return;

    if (points.length === 1) {
      map.current?.animateCamera({ center: points[0], zoom: 14 }, { duration: 400 });
      return;
    }

    map.current?.fitToCoordinates(points, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
    // `framed` changes only when the points themselves change, so this never fights a drag.
  }, [fit, framed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focus) map.current?.animateCamera({ center: focus, zoom: 15 }, { duration: 400 });
  }, [focus]);

  const showToggle = layerToggle ?? interactive;

  return (
    <View
      style={[styles.frame, { height }, style]}
      onLayout={(event) => setBox(event.nativeEvent.layout)}
      testID={testID}
    >
      {box ? (
        <MapView
          ref={map}
          provider={PROVIDER_GOOGLE}
          style={{ width: box.width, height: box.height }}
          initialRegion={initialRegion.current}
          mapType={satellite ? 'hybrid' : 'standard'}
          customMapStyle={PREMIUM_MAP_STYLE}
          // The app is light-only; without this the Google SDK follows the phone's dark mode.
          userInterfaceStyle="light"
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsPointsOfInterests
          showsBuildings
          showsCompass={false}
          onRegionChangeComplete={(region) =>
            onCentreChange?.({ latitude: region.latitude, longitude: region.longitude })
          }
          onPress={(event) => {
            const coordinate = event.nativeEvent.coordinate;
            if (panOnPress) map.current?.animateCamera({ center: coordinate }, { duration: 250 });
            onPressCoordinate?.(coordinate);
          }}
        >
          {circles.map((circle, index) => (
            <Circle
              key={`circle-${index}`}
              center={circle}
              radius={Math.max(circle.radiusKm, 0.1) * 1000}
              strokeColor={colors.primaryDark}
              strokeWidth={2}
              fillColor="rgba(176,141,87,0.16)"
            />
          ))}

          {connect && route.length > 1 ? (
            <Polyline coordinates={route} strokeColor={colors.ink} strokeWidth={4} />
          ) : null}

          {markers.map((marker) =>
            marker.kind === 'vehicle' ? (
              <Marker
                key={marker.id}
                coordinate={marker}
                title={marker.label}
                anchor={{ x: 0.5, y: 0.5 }}
                // A custom view is drawn once and cached unless told otherwise.
                tracksViewChanges
              >
                <View style={styles.vehicle}>
                  <Ionicons name="car-sport" size={18} color={colors.textOnPrimary} />
                </View>
              </Marker>
            ) : (
              <Marker
                key={marker.id}
                coordinate={marker}
                title={marker.label}
                pinColor={PIN_COLORS[marker.kind]}
                tracksViewChanges={false}
              />
            ),
          )}
        </MapView>
      ) : null}

      {showToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={satellite ? 'Switch to map view' : 'Switch to satellite view'}
          onPress={() => setSatellite((on) => !on)}
          style={styles.layerButton}
        >
          <AppText variant="small">{satellite ? 'Map' : 'Satellite'}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  vehicle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
