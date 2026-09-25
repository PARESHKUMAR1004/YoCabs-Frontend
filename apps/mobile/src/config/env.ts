/** Runtime configuration. EXPO_PUBLIC_* variables are inlined by Expo at build time. */

export type PlacesProviderKind = 'static' | 'osm' | 'hybrid';

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and set it.`);
  return value;
}

/**
 * The Android emulator's address for the host machine. A sensible default while developing, and a
 * disaster in a release: an over-the-air update built without EXPO_PUBLIC_API_BASE_URL would ship
 * this to every phone, and the app would look fine while reaching nothing. So it is only used in
 * development, and a release build without a real URL fails loudly on start instead.
 */
const DEV_API_BASE_URL = 'http://10.0.2.2:8080';

export const env = {
  apiBaseUrl: required(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? (__DEV__ ? DEV_API_BASE_URL : undefined),
    'EXPO_PUBLIC_API_BASE_URL',
  ),
  /** Development only: complete payments through the API's sandbox gateway. */
  sandboxPayments: process.env.EXPO_PUBLIC_SANDBOX_PAYMENTS === 'true',
  placesProvider: (process.env.EXPO_PUBLIC_PLACES_PROVIDER ?? 'hybrid') as PlacesProviderKind,
} as const;
