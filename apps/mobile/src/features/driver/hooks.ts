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
    // Starting needs the code the traveller reads out; completing happens on arrival.
    mutationFn: (input: { action: 'start'; code: string } | { action: 'complete' }) =>
      input.action === 'start' ? api.driver.start(id, input.code) : api.driver.complete(id),
    onSuccess: (trip) => {
      queryClient.setQueryData(keys.driver.trip(id), trip);
      void queryClient.invalidateQueries({ queryKey: keys.driver.trips() });
    },
  });
}
