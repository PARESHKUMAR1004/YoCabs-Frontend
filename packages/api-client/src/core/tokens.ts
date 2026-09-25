export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** ISO-8601 instant. */
  accessTokenExpiresAt: string;
}

/** Where tokens live: SecureStore on mobile, memory/localStorage on web. */
export interface TokenStore {
  get(): Promise<Tokens | null>;
  set(tokens: Tokens | null): Promise<void>;
}

export class MemoryTokenStore implements TokenStore {
  private tokens: Tokens | null = null;

  async get(): Promise<Tokens | null> {
    return this.tokens;
  }

  async set(tokens: Tokens | null): Promise<void> {
    this.tokens = tokens;
  }
}
