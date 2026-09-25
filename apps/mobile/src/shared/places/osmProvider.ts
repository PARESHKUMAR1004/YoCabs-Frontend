import type { Place, PlaceProvider } from './types';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

/**
 * OpenStreetMap Nominatim search, biased to Odisha. Fine for development and light use; the public
 * server has a strict usage policy, so use a paid/self-hosted geocoder before a large launch.
 */
export function createOsmPlaceProvider(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): PlaceProvider {
  return {
    async search(query, signal) {
      const term = query.trim();
      if (term.length < 2) return [];

      const url =
        `${ENDPOINT}?format=jsonv2&limit=8&countrycodes=in&q=${encodeURIComponent(term)}` +
        '&viewbox=81.3,22.6,87.5,17.7';

      const response = await fetchImpl(url, {
        signal,
        // Nominatim's policy requires an identifying agent; anonymous calls get rejected.
        headers: { 'Accept-Language': 'en', 'User-Agent': 'YoCabs/1.0 (support@yocabs.example)' },
      });
      if (!response.ok) return [];

      const results = (await response.json()) as NominatimResult[];

      return results.map((result): Place => {
        const [first, ...rest] = result.display_name.split(', ');
        return {
          id: `osm:${result.place_id}`,
          name: result.name || first || result.display_name,
          subtitle: rest.slice(0, 3).join(', '),
          latitude: Number(result.lat),
          longitude: Number(result.lon),
        };
      });
    },

    popular: () => [],
  };
}
