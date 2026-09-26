import { useQuery } from '@tanstack/react-query';
import type { Place } from '@/shared/places';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';

/** Two decimals is about a kilometre: enough to tell areas apart, and it stops small GPS drift refetching. */
const nearby = (value: number) => Math.round(value * 100) / 100;

/** Travel partners with vehicles working around a place (the tourist's pickup). */
export function useExplorePartners(place: Place | null) {
  const latitude = place ? nearby(place.latitude) : 0;
  const longitude = place ? nearby(place.longitude) : 0;

  return useQuery({
    queryKey: keys.explore.partners(latitude, longitude),
    queryFn: () => api.tourist.explore.partners(latitude, longitude),
    enabled: place !== null,
    staleTime: 2 * 60_000,
  });
}

/** One partner and their vehicles around the place. */
export function useExplorePartner(id: string, place: Place | null) {
  const latitude = place ? nearby(place.latitude) : 0;
  const longitude = place ? nearby(place.longitude) : 0;

  return useQuery({
    queryKey: keys.explore.partner(id, latitude, longitude),
    queryFn: () => api.tourist.explore.partner(id, latitude, longitude),
    enabled: place !== null,
  });
}
