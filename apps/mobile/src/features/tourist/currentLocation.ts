import * as Location from 'expo-location';
import { placeAtCoordinate } from '@/shared/places/reverseGeocode';
import type { Place } from '@/shared/places';

export class LocationUnavailableError extends Error {}

/** The device's position as a Place (permission is requested only when the person asks for it). */
export async function getCurrentPlace(): Promise<Place> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new LocationUnavailableError(
      'Location permission was not granted. You can search for a place instead.',
    );
  }

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = position.coords;

  return placeAtCoordinate(latitude, longitude, {
    fallbackName: 'Current location',
    idPrefix: 'gps',
  });
}
