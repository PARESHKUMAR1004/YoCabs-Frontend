import { HttpClient, type HttpConfig } from './core/http';
import { createAdminApi } from './endpoints/admin';
import { createAuthApi } from './endpoints/auth';
import { createDriverApi, createPartnerApi } from './endpoints/partner';
import { createDocumentsApi, createNotificationsApi, createSupportApi } from './endpoints/shared';
import { createTouristApi } from './endpoints/tourist';

/** One object per app: `const api = createYoCabsClient({...})`, then `api.tourist.search(...)`. */
export function createYoCabsClient(config: HttpConfig) {
  const http = new HttpClient(config);

  return {
    auth: createAuthApi(http),
    tourist: createTouristApi(http),
    partner: createPartnerApi(http),
    driver: createDriverApi(http),
    admin: createAdminApi(http),
    documents: createDocumentsApi(http),
    notifications: createNotificationsApi(http),
    support: createSupportApi(http),
    /** Turns a relative asset path from the API (vehicle photos) into a full URL. */
    assetUrl: (path: string) => http.url(path),
    tokenStore: http.tokenStore,
  };
}

export type YoCabsClient = ReturnType<typeof createYoCabsClient>;
