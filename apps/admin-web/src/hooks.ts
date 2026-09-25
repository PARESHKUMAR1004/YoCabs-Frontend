import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

/** A console action: runs, then refreshes the lists named in `invalidate`. Errors are exposed for display. */
export function useAction<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
  invalidate: QueryKey[],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: run,
    onSuccess: () =>
      Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
