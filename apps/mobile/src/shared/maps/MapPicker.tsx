import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { AppText } from '@/shared/ui';
import { DEFAULT_CENTRE, MapCanvas } from './MapCanvas';
import type { Coordinate } from './types';

interface Props {
  /** The point currently chosen; the map opens here. */
  value: Coordinate | null;
  onChange: (coordinate: Coordinate) => void;
  /** Draws the covered area around the centre (service areas). */
  radiusKm?: number;
  /** Recentres the map, e.g. after choosing a search result. */
  focus?: Coordinate | null;
  height?: number;
  hint?: string;
}

/**
 * Drag-the-map picker: the pin stays in the middle and the map moves under it, which is far
 * easier on a phone than hitting an exact point with a fingertip.
 */
export function MapPicker({
  value,
  onChange,
  radiusKm,
  focus,
  height = 260,
  hint = 'Drag or tap the map to move the pin',
}: Props) {
  return (
    <View>
      <View>
        <MapCanvas
          height={height}
          initialCentre={value ?? DEFAULT_CENTRE}
          initialZoom={value ? 15 : 11}
          circles={radiusKm && value ? [{ ...value, radiusKm }] : []}
          fit={false}
          focus={focus}
          onCentreChange={onChange}
          panOnPress
          testID="map-picker"
        />
        {/* The pin is drawn over the map, not on it, so it always marks the exact centre. */}
        <View pointerEvents="none" style={styles.pinLayer}>
          <View style={styles.pin} />
          <View style={styles.pinStem} />
        </View>
      </View>
      <AppText variant="small" color="textMuted" style={styles.hint}>
        {hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pinLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.textOnPrimary,
  },
  pinStem: {
    width: 2,
    height: 10,
    backgroundColor: colors.primary,
    marginTop: -1,
  },
  hint: { marginTop: spacing.xs, textAlign: 'center' },
});
