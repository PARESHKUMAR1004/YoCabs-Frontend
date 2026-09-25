# YoCabs Frontend

Client apps for the YoCabs travel marketplace. The backend lives in a separate repository (`YoCabs`, Spring Boot).

| Package               | What it is                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/mobile`         | Android app (Expo / React Native) with three role areas: **tourist**, **travel partner** (owner / staff) and **driver**. One app, one Play Store listing; the signed-in role decides which area opens. |
| `apps/admin-web`      | Operations console (React + Vite) for **admins** and **super admins**. Not shipped in the mobile app.                                                                                                  |
| `packages/api-client` | Typed REST client shared by both apps: auth, silent token refresh, idempotency keys, error mapping. Includes an end-to-end test that drives the whole marketplace against a running backend.           |

## Requirements

- Node 20 (`.nvmrc`) and npm 10
- The backend running locally (`http://localhost:8080`), see the backend repository's README
- For the mobile app: Android Studio emulator or a phone with Expo Go / a development build

## Getting started

```bash
npm install            # installs every workspace (legacy-peer-deps is set in .npmrc)
npm run verify         # typecheck + lint + unit tests for everything
```

### Admin console

```bash
cp apps/admin-web/.env.example apps/admin-web/.env
npm run dev -w @yocabs/admin-web      # http://localhost:5173, proxies /api to the backend
```

Sign in with the bootstrap admin the backend creates (local default `admin@yocabs.local` / `local-dev-admin-password`).

### Mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env     # set EXPO_PUBLIC_API_BASE_URL
npm run start -w @yocabs/mobile
```

The Android emulator reaches your computer as `10.0.2.2`, so the default API URL is `http://10.0.2.2:8080`. For a physical phone use your machine's LAN address.

Sign-in is by mobile number and one-time code. **Locally the code is printed in the backend log** (`[DEV OTP] code 123456 for ******3210`), because no SMS provider is connected yet.

## Testing the full flow by hand

1. Start the backend, then the admin console and the mobile app.
2. Mobile → **Become a partner** → register with a number (read the OTP from the API log).
3. Admin console → **Travel partners** → approve the new partner (or use _Onboard a travel partner_).
4. Mobile (partner) → **Fleet** → add a vehicle → **Where this vehicle works** → add an area covering your pickup → **Set prices** → mark it available; **More → Drivers** → add a driver. A vehicle with no service area never shows up in a search.
5. Sign out, sign in as a new number → tourist → search, optionally make a price offer, book, pay the token.
   With `EXPO_PUBLIC_SANDBOX_PAYMENTS=true` (the `.env.example` default) the **Pay** button completes the payment through the backend's sandbox gateway. Without it the app says online payment is not enabled, which is what a production build does until a real provider is connected.
6. Partner → **Bookings** → assign the driver → driver signs in (with the driver's mobile). The tourist's app now shows a **6-digit start code** (also on the pop-up that appears when the app is reopened); the driver types it in to start the trip and accepts location sharing. Watch the car on the partner's **Fleet map**, the admin console's **Live trips** and the tourist's own trip screen. On arrival the driver taps **I have reached the destination** (no code), and the tourist is offered the balance to pay in the app (or can pay the driver directly).
7. Tourist → rate the trip. Partner → **Wallet**. Admin → dashboard, payments, payouts.

The same journey is automated in `packages/api-client/test/e2e`:

```bash
YOCABS_E2E_BASE_URL=http://localhost:8080 \
YOCABS_E2E_API_LOG=/path/to/backend/log \
npm run test:e2e -w @yocabs/api-client
```

## Project layout (mobile)

```
app/                 expo-router routes only: thin files that compose features
  (auth)/            welcome, login, OTP, partner registration
  (tourist)/         search → results → offer → checkout → payment → bookings, support, profile
  (partner)/         dashboard, bookings, offers, fleet, pricing, drivers, wallet, reports ...
  (driver)/          my trips, trip actions, support
src/
  features/*         screens, hooks (TanStack Query), zod schemas per feature
  shared/            api client, auth/session, UI kit, forms, places, utils
  config/            environment and brand tokens
```

Conventions: server state in TanStack Query (one key factory in `shared/query/keys.ts`), client-only state in small zustand stores, forms with react-hook-form + zod, no business rules in the app (prices and policies always come from the API).

## Maps

Pickup, destination and partner service areas are picked and shown on Google Maps, through
`react-native-maps` (`src/shared/maps`). Screens describe what to show — markers, a service-area
circle, a line between stops — and never touch the map SDK, so the renderer stays swappable.

**Google Maps does not work in Expo Go**: the map view loads (you get the Google watermark) but no
tiles appear, because Expo Go's own Android Maps key does not authorise. Maps need a development
build carrying your key. Everything else in the app works fine in Expo Go.

### One-time setup for maps

1. In [Google Cloud](https://console.cloud.google.com/), create a project, enable **Maps SDK for
   Android**, and create an API key. Restrict it to Android apps with package `com.yocabs.app` and
   the SHA-1 of your EAS keystore (`eas credentials` prints it). Android map loads are not billed,
   unlike the Maps JavaScript API, but the project still needs billing enabled.
2. Store the key for builds (it is embedded in the APK, so it is not a secret — the package and
   certificate restriction is what protects it):

   ```bash
   npx eas login
   npx eas env:set --name GOOGLE_MAPS_API_KEY --value <your-key>      --environment development --visibility sensitive
   ```

   Repeat for `--environment preview` and `--environment production`. Each build profile in
   `eas.json` names its environment, so the variable reaches `app.config.ts` at build time.

3. Build and install the development client once:

   ```bash
   npx eas build --profile development --platform android
   ```

   Install the resulting APK on the phone, then run `npm run start -w @yocabs/mobile` and open the
   app. It connects to Metro exactly as Expo Go did, and you only rebuild when native dependencies
   change.

### Service areas and live trips

A service area belongs to a **vehicle**, not to the partner, so one fleet can cover different
ground with different cars. A vehicle with no area never appears in a traveller's search. The
partner's **Fleet map** draws every vehicle's area as a circle and puts a pin on any car currently
on a trip.

While a trip runs, the driver's app shares its position in the background, and the traveller on that
trip, the partner and YoCabs admins can see it. This needs care at release time:

- The app asks for `ACCESS_BACKGROUND_LOCATION` and runs a foreground service with a visible
  notification. Before the system prompt, the driver sees a plain-language disclosure
  (`useTripSharing`) that must stay word-for-word consistent with the Play Console declaration.
- Play Console requires a **background location declaration** with a video showing the in-app
  disclosure and the feature in use. Expect review to take longer because of it.
- Only the **latest** position is stored, one row per trip, overwritten as it moves. The API
  accepts and serves it only while the trip is `IN_PROGRESS`, only the traveller on the trip, the
  owning partner and admins may read it, and a scheduled sweep clears anything a finished trip left behind. Say exactly this
  in the privacy policy and the Data safety form.

Coordinates are named with the device's geocoder (`placeAtCoordinate`). Naming is a nicety: the API
prices trips from latitude and longitude, so a dropped pin works even when no address comes back.
Place suggestions come from `shared/places` (a bundled Odisha list plus OpenStreetMap Nominatim);
swapping in Google Places Autocomplete is a contained change, but that API is billed per request.

## Hosting and updates

**Admin console** runs on Railway as the `admin-web` service, built from `apps/admin-web/Dockerfile`
(context = repo root, `RAILWAY_DOCKERFILE_PATH=apps/admin-web/Dockerfile`). nginx serves the built
site and forwards `/api` to the backend, so the browser talks to one origin and no CORS
configuration is needed. `API_UPSTREAM` and `API_HOST` reference the `api` service's public domain.
Deploy with `railway up -s admin-web --ci` from the repo root.

**Getting changes onto phones.** There are two different paths, and which one applies depends on
what changed:

| You changed                                                                     | What happens                                                                                                         | How                                                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Screens, logic, styles, copy, images                                            | Delivered **over the air**: installed apps fetch it in the background and use it from their next launch. No new APK. | Push to `main`. CI runs the checks, then `eas update` publishes to the `preview` channel. |
| A native module, a permission, `app.config.ts` native settings, or the Expo SDK | Needs a **new APK**. An update would be JavaScript that expects native code the old installs do not have.            | Bump `version` in `app.config.ts`, then `eas build --profile preview --platform android`. |

`runtimeVersion` is the app `version`, so an update only ever reaches builds with the same version.
That is what keeps a native change from being pushed to installs that cannot run it.

One-time setup for automatic publishing: create an access token at expo.dev (Account settings >
Access tokens) and add it to this repository as the `EXPO_TOKEN` Actions secret. Until it exists the
publish job skips itself with a notice instead of failing. Updates take their settings
(`EXPO_PUBLIC_API_BASE_URL` and friends) from the EAS **environment**, not from `eas.json`, so a
setting added to a build profile also has to be added with `eas env:set --environment preview`.

Publishing to `production` is deliberately manual, so a release is a decision:
`npx eas update --branch production --environment production`.

## Publishing to the Play Store

Already in place: package name `com.yocabs.app`, EAS build profiles (`apps/mobile/eas.json`), HTTPS-only production builds (`APP_ENV=production` turns cleartext off).

Before the first release:

1. `eas init`, then set `EAS_PROJECT_ID`; `eas credentials` for the upload keystore.
2. Set `EXPO_PUBLIC_API_BASE_URL` to the production **https** API in the `production` profile.
3. Replace the placeholder icon / adaptive icon / splash images in `apps/mobile/assets` with final artwork.
4. Publish a privacy policy URL (the app collects phone number, name, location on request, and uploaded documents) and complete the Play Console _Data safety_ form.
5. Set `GOOGLE_MAPS_API_KEY` for the maps, then connect the real providers on the backend and swap the two remaining seams here: `shared/places` (place search; currently a bundled Odisha list + OpenStreetMap Nominatim, which is not for heavy production use) and `features/payment/launcher.ts` (payment sheet).
6. `eas build -p android --profile production`, then upload the `.aab`.

## Known gaps

- Push notifications: notifications are polled while the app is open; there is no push provider yet.
- Payment sheet and SMS are provider-dependent and intentionally deferred.
- Driver-side document upload and partner-side upload of driver documents are not built yet (partner and vehicle documents are).
