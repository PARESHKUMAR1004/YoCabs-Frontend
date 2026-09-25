import { readFileSync } from 'node:fs';
import { createYoCabsClient, MemoryTokenStore, type YoCabsClient } from '../../src';

export const BASE_URL = process.env.YOCABS_E2E_BASE_URL;
export const ADMIN_EMAIL = process.env.YOCABS_E2E_ADMIN_EMAIL ?? 'admin@yocabs.local';
export const ADMIN_PASSWORD = process.env.YOCABS_E2E_ADMIN_PASSWORD ?? 'local-dev-admin-password';
const API_LOG = process.env.YOCABS_E2E_API_LOG;

export function newClient(): YoCabsClient {
  if (!BASE_URL) throw new Error('YOCABS_E2E_BASE_URL is not set');
  return createYoCabsClient({ baseUrl: BASE_URL, tokenStore: new MemoryTokenStore() });
}

/** Today's date in India, matching how the backend judges "trip starts today". */
export function todayInIndia(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function randomMobile(): string {
  return `9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The development API prints one-time codes to its log ("[DEV OTP] code 123456 for ******3210").
 * Point YOCABS_E2E_API_LOG at that log file so the test can complete real OTP logins.
 */
export async function readOtp(mobile: string, since: number): Promise<string> {
  if (!API_LOG) throw new Error('Set YOCABS_E2E_API_LOG to the API log file to read OTP codes');

  const lastFour = mobile.slice(-4);
  const pattern = new RegExp(`\\[DEV OTP\\] code (\\d{6}) for \\*+${lastFour}\\b`, 'g');

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const text = readFileSync(API_LOG, 'utf8').slice(since);
    const matches = [...text.matchAll(pattern)];
    const last = matches.at(-1);
    if (last?.[1]) return last[1];
    await sleep(250);
  }
  throw new Error(`No OTP found in the API log for ...${lastFour}`);
}

export function logSize(): number {
  return API_LOG ? readFileSync(API_LOG, 'utf8').length : 0;
}

/** Signs a mobile user in through the real OTP flow. */
export async function otpLogin(client: YoCabsClient, mobile: string) {
  const since = logSize();
  await client.auth.requestOtp(mobile);
  const code = await readOtp(mobile, since);
  return client.auth.verifyOtp(mobile, code);
}
