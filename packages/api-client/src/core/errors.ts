/** Error codes the API returns, plus the ones the client itself raises. */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN';

/** Every failed call surfaces as an ApiError so UI code handles one shape. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isNetwork(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** A message safe to show a person, never a stack trace or raw server text. */
export function userMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!isApiError(error)) return fallback;

  switch (error.code) {
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return 'Cannot reach YoCabs. Check your internet connection and try again.';
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    case 'TOO_MANY_REQUESTS':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'INTERNAL_ERROR':
      return fallback;
    default:
      return error.message || fallback;
  }
}
