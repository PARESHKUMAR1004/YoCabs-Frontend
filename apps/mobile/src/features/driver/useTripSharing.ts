import { useCallback, useEffect, useState } from 'react';
import { confirmAction, showError, showInfo } from '@/shared/utils/feedback';
import {
  LocationPermissionError,
  isSharing,
  sharedBookingId,
  startSharing,
  stopSharing,
} from './locationSharing';

/**
 * Google requires a plain-language disclosure before the background-location prompt, saying what
 * is collected and why. This is that disclosure.
 */
const DISCLOSURE_TITLE = 'Share your location during this trip?';

const DISCLOSURE_BODY =
  'YoCabs collects your location in the background, even when the app is closed or not in use, ' +
  'so your travel partner and YoCabs support can see where the vehicle is while the trip runs. ' +
  'Sharing starts when you start the trip and stops the moment you complete it. ' +
  'Your location is not collected at any other time.';

/** Keeps the driver's location flowing for one trip, and tells the screen whether it is on. */
export function useTripSharing(bookingId: string) {
  const [sharing, setSharing] = useState(false);

  const refresh = useCallback(async () => {
    // Only report this trip as shared; another booking's task must not light up this screen.
    const [running, tracked] = await Promise.all([isSharing(), sharedBookingId()]);
    setSharing(running && tracked === bookingId);
  }, [bookingId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Returns true when the trip may start: sharing began, or the driver declined knowingly. */
  const begin = useCallback(async (): Promise<boolean> => {
    const agreed = await confirmAction(DISCLOSURE_TITLE, DISCLOSURE_BODY, 'Share location');

    if (!agreed) {
      return confirmAction(
        'Start without sharing?',
        'Your travel partner will not be able to see where you are during this trip.',
        'Start anyway',
      );
    }

    try {
      await startSharing(bookingId);
      await refresh();
      return true;
    } catch (error) {
      if (error instanceof LocationPermissionError) {
        showInfo('Location not shared', error.message);
        return true;
      }
      showError(error, 'Could not start sharing your location');
      return false;
    }
  }, [bookingId, refresh]);

  const end = useCallback(async () => {
    await stopSharing();
    await refresh();
  }, [refresh]);

  return { sharing, begin, end };
}
