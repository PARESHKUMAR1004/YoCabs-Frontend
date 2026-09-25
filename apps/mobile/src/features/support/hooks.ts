import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OpenTicketInput } from '@yocabs/api-client';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';

export function useMyTickets() {
  return useQuery({ queryKey: keys.support.mine(), queryFn: () => api.support.mine() });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: keys.support.detail(id),
    queryFn: () => api.support.get(id),
    refetchInterval: 20_000,
  });
}

export function useOpenTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OpenTicketInput) => api.support.open(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.support.all }),
  });
}

export function useReplyToTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => api.support.reply(id, body),
    onSuccess: (ticket) => queryClient.setQueryData(keys.support.detail(id), ticket),
  });
}
