import { useEffect } from 'react';
import { AppState } from 'react-native';
import { toIsoDate } from '@/shared/utils/format';
import { acknowledge } from '@/shared/utils/feedback';
import { useDriverTrips } from './hooks';
import { pickDutyTrip } from './dutyTrip';
import { useDutyStatus } from './dutyStatus';
import {
  LocationPermissionError,
  hasTrackingPermission,
  isSharing,
  startSharing,
  stopSharing,
} from './locationSharing';

/**
 * Google requires a plain-language disclosure before the background-location prompt, saying what
 * is collected and why. It is shown once, before the phone's own prompt, and never skipped.
 */
const DISCLOSURE_TITLE = 'Your location is shared on trips';

const DISCLOSURE_BODY =
  'YoCabs collects your location in the background, even when the app is closed or not in use, ' +
  'from the day of a trip you have been assigned until you complete it. ' +
  'The traveller on that trip, your travel partner and YoCabs support can see it, so they know you are on your way. ' +
  'It cannot be switched off while a trip is running. ' +
  'Your location is not collected at any other time.';

const WATCH_EVERY_MS = 60_000;

/**
 * Keeps the driver's location flowing, by itself. From the day of an assigned trip until it is
 * completed the driver's phone reports where it is: the traveller watches the car come, and a trip
 * cannot start without it. There is no switch for the driver to turn it off. If the phone stops
 * (the app is closed, or location is refused) this restarts it, and says so on screen until it works.
 */
export function DutyTracker() {
  const trips = useDriverTrips();
  const attempt = useDutyStatus((state) => state.attempt);
  const set = useDutyStatus((state) => state.set);

  const dutyTripId = pickDutyTrip(trips.data ?? [], toIsoDate(new Date()))?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function ensureSharing() {
      if (!dutyTripId) {
        await stopSharing();
        if (!cancelled) set('off');
        return;
      }

      try {
        if (!(await isSharing())) {
          if (!cancelled) set('starting');
          if (!(await hasTrackingPermission())) {
            await acknowledge(DISCLOSURE_TITLE, DISCLOSURE_BODY);
          }
        }
        // Also re-points an already running task at this trip.
        await startSharing(dutyTripId);
        if (!cancelled) set('on');
      } catch (error) {
        if (cancelled) return;
        set(
          'blocked',
          error instanceof LocationPermissionError
            ? error.message
            : 'Location could not be turned on. Check that location is switched on for this phone.',
        );
      }
    }

    void ensureSharing();

    // If the phone has stopped sharing (the task was killed), start it again.
    const watchdog = setInterval(() => {
      if (dutyTripId)
        void isSharing().then((running) => {
          if (!running) void ensureSharing();
        });
    }, WATCH_EVERY_MS);

    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') void ensureSharing();
    });

    return () => {
      cancelled = true;
      clearInterval(watchdog);
      appState.remove();
    };
  }, [dutyTripId, attempt, set]);

  return null;
}
