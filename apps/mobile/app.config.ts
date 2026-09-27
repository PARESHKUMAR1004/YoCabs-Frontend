import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Build-time configuration. `APP_ENV` is set by the EAS build profile:
 *   development / preview -> allows plain-HTTP to a local API
 *   production            -> HTTPS only (required for the Play Store build)
 */
const isProduction = process.env.APP_ENV === 'production';

/** Expo Go supplies its own key, so this is only set for development and store builds. */
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// `eas init` cannot write into a dynamic config, so the project id lives here.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? 'e30babe5-e8ea-4078-9824-e4bc8df9027e';

/**
 * Which build this is, so anyone can confirm they are running the latest. The number is the count
 * of commits in this repository, so it only ever goes up; the hash says exactly which code it is.
 * A trailing "+" means it was published from a working tree with uncommitted changes.
 */
function buildStamp(): { build: string; commit: string; builtAt: string } {
  const git = (command: string) => execSync(`git ${command}`, { encoding: 'utf8' }).trim();
  try {
    const dirty = git('status --porcelain') === '' ? '' : '+';
    return {
      build: git('rev-list --count HEAD') + dirty,
      commit: git('rev-parse --short HEAD'),
      builtAt: new Date().toISOString(),
    };
  } catch {
    // Not a git checkout (a source archive, say): still say when it was made.
    return { build: 'dev', commit: 'unknown', builtAt: new Date().toISOString() };
  }
}

const stamp = buildStamp();

/** Firebase's config for Android push: an EAS file variable in the cloud, a local file otherwise. */
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ??
  (existsSync('./google-services.json') ? './google-services.json' : undefined);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'YoCabs',
  slug: 'yocabs',
  scheme: 'yocabs',
  version: '1.0.2',
  /**
   * Over-the-air updates only reach installs whose native code matches, and the app version is
   * that match: an update published for 1.0.0 is delivered to 1.0.0 builds and to nothing else.
   * So the rule is simple. Changed JavaScript, screens or assets: publish an update. Changed a
   * native module, a permission or the Expo SDK: bump `version` and build a new APK, otherwise
   * the old installs would download JavaScript that expects native code they do not have.
   */
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    // Open straight away with the bundle already on the phone, fetch any newer one in the
    // background and use it from the next launch. The app never waits on the network to start.
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  android: {
    package: 'com.yocabs.app',
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined,
    versionCode: 3,
    // Push notifications on Android go through Firebase. The file comes from the Firebase project
    // (see the README); without it the app still runs, it just cannot receive push messages.
    googleServicesFile: googleServicesFile,
    adaptiveIcon: {
      backgroundColor: '#0B1220',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      // Drivers share their position while a trip runs, with the screen off. Google reviews this
      // permission: the Play Console declaration and the in-app disclosure both have to match
      // what useTripSharing shows before the prompt.
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_LOCATION',
    ],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0B1220',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'YoCabs uses your location to fill in your pickup point when you ask it to.',
        locationAlwaysAndWhenInUsePermission:
          'YoCabs shares a driver’s location with their travel partner while a trip is running.',
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#B08D57',
        defaultChannel: 'updates',
        // One sound per kind of news; see features/notifications/push/channelMap.ts.
        sounds: [
          './assets/sounds/bookings.wav',
          './assets/sounds/offers.wav',
          './assets/sounds/trips.wav',
          './assets/sounds/payments.wav',
          './assets/sounds/alerts.wav',
          './assets/sounds/support.wav',
          './assets/sounds/updates.wav',
        ],
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission:
          'YoCabs uses the camera so a travel partner can photograph their vehicle for travellers.',
        // Photos are picked with the system photo picker, which needs no storage permission.
        photosPermission: false,
        microphonePermission: false,
      },
    ],
    ['expo-build-properties', { android: { usesCleartextTraffic: !isProduction } }],
  ],
  extra: {
    eas: { projectId: EAS_PROJECT_ID },
    ...stamp,
  },
});
