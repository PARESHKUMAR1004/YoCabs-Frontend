import { useEffect, useState } from 'react';
import { placeAtCoordinate } from './reverseGeocode';
import type { Place } from './types';

interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Names the coordinate under the map pin while the person drags. Latest-wins: an in-flight lookup
 * for an old position can never overwrite a newer one.
 */
export function usePlaceAtCoordinate(coordinate: Coordinate | null, fallbackName?: string) {
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setLoading] = useState(false);
  const latitude = coordinate?.latitude;
  const longitude = coordinate?.longitude;

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;

    let cancelled = false;
    setLoading(true);

    // Settle first: dragging fires many positions and only the last one is worth naming.
    const timer = setTimeout(() => {
      placeAtCoordinate(latitude, longitude, { fallbackName })
        .then((result) => {
          if (!cancelled) setPlace(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [latitude, longitude, fallbackName]);

  return { place, isLoading };
}
