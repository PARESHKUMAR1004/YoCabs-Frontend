import { useEffect, useState } from 'react';
import { getCurrentPlace } from './currentLocation';
import { useSearchStore } from './searchStore';

/**
 * Fills the pickup with where the person is standing, once, when the home screen opens. Returns
 * true while it is looking. If location is off or refused the pickup stays empty and the home
 * screen lets them set it by hand: nothing here is an error worth interrupting them for.
 */
export function useCurrentPickup(): boolean {
  const hasPickup = useSearchStore((state) => state.pickup !== null);
  const setPlace = useSearchStore((state) => state.setPlace);
  const [locating, setLocating] = useState(!hasPickup);

  useEffect(() => {
    if (hasPickup) {
      setLocating(false);
      return;
    }

    let cancelled = false;
    getCurrentPlace()
      .then((place) => {
        if (!cancelled) setPlace('pickup', place);
      })
      .catch(() => {
        // Declined or unavailable: the person can still choose a pickup themselves.
      })
      .finally(() => {
        if (!cancelled) setLocating(false);
      });

    return () => {
      cancelled = true;
    };
    // Looked up once per visit to the screen: choosing a pickup afterwards must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return locating;
}
