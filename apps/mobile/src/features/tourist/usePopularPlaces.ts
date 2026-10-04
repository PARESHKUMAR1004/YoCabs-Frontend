import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { staticPlaceProvider, type Place } from '@/shared/places';
import { keys } from '@/shared/query/keys';

/**
 * The admin-curated quick picks for the home screen. Falls back to the built-in Odisha list if
 * the API is unreachable or no admin has curated any yet, so the home screen is never empty.
 */
export function usePopularPlaces(): Place[] {
  const query = useQuery({
    queryKey: keys.popularPlaces(),
    queryFn: () => api.popularPlaces.list(),
    staleTime: 5 * 60_000,
  });

  if (!query.data || query.data.length === 0) {
    return staticPlaceProvider.popular();
  }

  // The API already returns these in the admin's chosen display order.
  return query.data.map((place) => ({
    id: `admin:${place.id}`,
    name: place.name,
    subtitle: place.subtitle ?? undefined,
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}
