import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';

export function useDriverTrips() {
  return useQuery({
    queryKey: keys.driver.trips(),
    queryFn: () => api.driver.trips(),
    refetchInterval: 60_000,
  });
}

export function useDriverTrip(id: string) {
  return useQuery({ queryKey: keys.driver.trip(id), queryFn: () => api.driver.get(id) });
}

export function useTripAction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, code }: { action: 'start' | 'complete'; code: string }) =>
      api.driver[action](id, code),
    onSuccess: (trip) => {
      queryClient.setQueryData(keys.driver.trip(id), trip);
      void queryClient.invalidateQueries({ queryKey: keys.driver.trips() });
    },
  });
}
