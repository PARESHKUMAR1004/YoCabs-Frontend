import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placeProvider, type Place } from '@/shared/places';

/** Debounces typing so the place provider is not called on every keystroke. */
export function usePlaceSearch(query: string, delayMs = 300) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), delayMs);
    return () => clearTimeout(timer);
  }, [query, delayMs]);

  const term = debounced.trim();

  const results = useQuery<Place[]>({
    queryKey: ['places', term],
    queryFn: ({ signal }) => placeProvider.search(term, signal),
    enabled: term.length > 0,
    staleTime: 10 * 60_000,
  });

  return {
    term,
    results: results.data ?? [],
    isSearching: results.isFetching,
    popular: placeProvider.popular(),
  };
}
