import * as Location from 'expo-location';
import type { Place } from './types';

interface Options {
  /** Used when the device cannot name the coordinate. */
  fallbackName?: string;
  /** Prefix for the generated id, so a dropped pin and a GPS fix never collide. */
  idPrefix?: string;
}

/**
 * Names a coordinate using the device's geocoder. Reverse geocoding is a nicety: when it fails the
 * coordinate is still a perfectly usable place, because the API prices trips from latitude and
 * longitude, not from the description.
 */
export async function placeAtCoordinate(
  latitude: number,
  longitude: number,
  { fallbackName = 'Dropped pin', idPrefix = 'pin' }: Options = {},
): Promise<Place> {
  let name = fallbackName;
  let subtitle: string | undefined;

  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (address) {
      name = address.name || address.street || address.district || address.city || name;
      subtitle =
        [address.district, address.city, address.region].filter(Boolean).join(', ') || undefined;
    }
  } catch {
    // No geocoder on this device, or it is offline.
  }

  return {
    id: `${idPrefix}:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
    name,
    subtitle: subtitle ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    latitude,
    longitude,
  };
}
