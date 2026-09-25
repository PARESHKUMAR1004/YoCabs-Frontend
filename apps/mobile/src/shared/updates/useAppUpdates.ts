import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Keeps a phone current without the person doing anything.
 *
 * expo-updates already looks for a newer bundle every time the app is launched from scratch. On
 * its own that leaves a gap: people leave apps sitting in the background for days, and a cold
 * start is the only moment they would ever get the fix. So this also checks whenever the app
 * comes back to the foreground.
 *
 * A downloaded update is applied on the next launch and is never forced mid-session: reloading
 * under someone who is halfway through a booking or a trip would lose what they were doing.
 *
 * Does nothing in development (Metro serves the code) or in a build without updates enabled.
 */
export function useAppUpdates(): void {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let checking = false;

    async function fetchIfNewer() {
      // A check that outlives its trigger must not be started twice by rapid app switching.
      if (checking) return;
      checking = true;

      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) await Updates.fetchUpdateAsync();
      } catch {
        // Offline, or the update server is unreachable. The next foreground tries again, and
        // the app keeps running the version it already has.
      } finally {
        checking = false;
      }
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void fetchIfNewer();
    });

    return () => subscription.remove();
  }, []);
}
