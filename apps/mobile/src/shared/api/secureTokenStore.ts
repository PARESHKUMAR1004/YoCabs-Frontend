import * as SecureStore from 'expo-secure-store';
import type { TokenStore, Tokens } from '@yocabs/api-client';

const KEY = 'yocabs.tokens';

/** Tokens are kept in the OS keystore (Android Keystore), never in plain storage. */
export const secureTokenStore: TokenStore = {
  async get(): Promise<Tokens | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Tokens;
    } catch {
      await SecureStore.deleteItemAsync(KEY);
      return null;
    }
  },

  async set(tokens: Tokens | null): Promise<void> {
    if (tokens) {
      await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  },
};
