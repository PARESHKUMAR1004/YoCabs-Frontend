/** Runtime configuration. EXPO_PUBLIC_* variables are inlined by Expo at build time. */

export type PlacesProviderKind = 'static' | 'osm' | 'hybrid';

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and set it.`);
  return value;
}

export const env = {
  apiBaseUrl: required(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8080',
    'EXPO_PUBLIC_API_BASE_URL',
  ),
  /** Development only: complete payments through the API's sandbox gateway. */
  sandboxPayments: process.env.EXPO_PUBLIC_SANDBOX_PAYMENTS === 'true',
  placesProvider: (process.env.EXPO_PUBLIC_PLACES_PROVIDER ?? 'hybrid') as PlacesProviderKind,
} as const;
