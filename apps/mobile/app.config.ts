import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Build-time configuration. `APP_ENV` is set by the EAS build profile:
 *   development / preview -> allows plain-HTTP to a local API
 *   production            -> HTTPS only (required for the Play Store build)
 */
const isProduction = process.env.APP_ENV === 'production';

/** Expo Go supplies its own key, so this is only set for development and store builds. */
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'YoCabs',
  slug: 'yocabs',
  scheme: 'yocabs',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  android: {
    package: 'com.yocabs.app',
    config: googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : undefined,
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#FFF7ED',
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
        backgroundColor: '#FFFFFF',
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
    ['expo-build-properties', { android: { usesCleartextTraffic: !isProduction } }],
  ],
  extra: {
    // `eas init` cannot write into a dynamic config, so the project id lives here.
    eas: { projectId: process.env.EAS_PROJECT_ID ?? 'e30babe5-e8ea-4078-9824-e4bc8df9027e' },
  },
});
