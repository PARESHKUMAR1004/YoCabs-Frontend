import { env, type PlacesProviderKind } from '@/config/env';
import { createOsmPlaceProvider } from './osmProvider';
import { staticPlaceProvider } from './staticProvider';
import type { Place, PlaceProvider } from './types';

export type { Place, PlaceProvider } from './types';
export { ODISHA_PLACES } from './staticProvider';

/** Built-in places first, then online results; an online failure never breaks the picker. */
export function createHybridPlaceProvider(online: PlaceProvider): PlaceProvider {
  return {
    async search(query, signal) {
      const local = await staticPlaceProvider.search(query, signal);

      let remote: Place[] = [];
      try {
        remote = await online.search(query, signal);
      } catch {
        // Offline or rate limited: the built-in list still works.
      }

      const seen = new Set(local.map((place) => place.name.toLowerCase()));
      return [...local, ...remote.filter((place) => !seen.has(place.name.toLowerCase()))];
    },
    popular: () => staticPlaceProvider.popular(),
  };
}

export function createPlaceProvider(kind: PlacesProviderKind): PlaceProvider {
  switch (kind) {
    case 'static':
      return staticPlaceProvider;
    case 'osm':
      return createOsmPlaceProvider();
    default:
      return createHybridPlaceProvider(createOsmPlaceProvider());
  }
}

export const placeProvider: PlaceProvider = createPlaceProvider(env.placesProvider);
export { placeAtCoordinate } from './reverseGeocode';
export { usePlaceAtCoordinate } from './usePlaceAtCoordinate';
