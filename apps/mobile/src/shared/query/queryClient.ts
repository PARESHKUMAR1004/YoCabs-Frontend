import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@yocabs/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      // Retry flaky networks, but never retry a definitive answer (4xx).
      retry: (failureCount, error) =>
        failureCount < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
    },
  },
});
