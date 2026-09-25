import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';

/** Unread badge. Polled lightly: there is no push provider yet. */
export function useUnreadCount() {
  return useQuery({
    queryKey: keys.notifications.unread(),
    queryFn: async () => (await api.notifications.unreadCount()).unread,
    refetchInterval: 60_000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: keys.notifications.list(),
    queryFn: () => api.notifications.list({ limit: 50 }),
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
  });
}
