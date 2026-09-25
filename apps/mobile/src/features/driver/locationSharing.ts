import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { api } from '@/shared/api/client';

const TASK_NAME = 'yocabs-trip-location';

/**
 * Which trip is being shared. The background task runs in its own JavaScript context with no
 * access to React state, so the booking id has to survive on disk.
 */
const TRACKED_BOOKING_KEY = 'yocabs.tracking.bookingId';

export class LocationPermissionError extends Error {}

const readTrackedBooking = () => SecureStore.getItemAsync(TRACKED_BOOKING_KEY);

interface LocationTaskData {
  locations: Location.LocationObject[];
}

/**
 * Sends the driver's position to the API while a trip is under way. Defined at module scope
 * because Android may start this task without the app's UI, after the process was killed.
 */
TaskManager.defineTask<LocationTaskData>(TASK_NAME, async ({ data, error }) => {
  if (error || !data?.locations?.length) return;

  const bookingId = await readTrackedBooking();
  if (!bookingId) return;

  const latest = data.locations[data.locations.length - 1];
  if (!latest) return;

  try {
    await api.driver.reportLocation(bookingId, {
      latitude: latest.coords.latitude,
      longitude: latest.coords.longitude,
      accuracyMetres: latest.coords.accuracy ?? undefined,
      // The device reports metres per second; the API and the UI talk in km/h.
      speedKph:
        latest.coords.speed === null || latest.coords.speed < 0
          ? undefined
          : latest.coords.speed * 3.6,
    });
  } catch {
    // A dropped position is not worth surfacing: the next one is seconds away, and the trip
    // must never fail because tracking did.
  }
});

/**
 * Asks for location permission, background included.
 *
 * Call this only after the driver has seen why it is needed: Google requires a plain-language
 * disclosure before the background prompt, and will reject a build that asks without one.
 */
export async function requestTrackingPermission(): Promise<void> {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== 'granted') {
    throw new LocationPermissionError(
      'YoCabs needs location access to share your position with your travel partner during a trip.',
    );
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  if (background.status !== 'granted') {
    throw new LocationPermissionError(
      'Choose "Allow all the time" so your position keeps updating when your screen is off.',
    );
  }
}

export async function isSharing(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(TASK_NAME);
}

/** Begins sharing for one trip. Safe to call again; it simply re-points at the same booking. */
export async function startSharing(bookingId: string): Promise<void> {
  await requestTrackingPermission();
  await SecureStore.setItemAsync(TRACKED_BOOKING_KEY, bookingId);

  if (await isSharing()) return;

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 20_000,
    distanceInterval: 50,
    pausesUpdatesAutomatically: false,
    // Android shows this while tracking runs, so the driver always knows it is on.
    foregroundService: {
      notificationTitle: 'YoCabs trip in progress',
      notificationBody: 'Sharing your location with your travel partner until the trip ends.',
      notificationColor: '#F97316',
    },
  });
}

/** Ends sharing. Called when the trip finishes, and safe when nothing is running. */
export async function stopSharing(): Promise<void> {
  await SecureStore.deleteItemAsync(TRACKED_BOOKING_KEY);

  if (await isSharing()) {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  }
}

/** The trip currently being shared, if any. Lets a restarted app show the right state. */
export async function sharedBookingId(): Promise<string | null> {
  return readTrackedBooking();
}
