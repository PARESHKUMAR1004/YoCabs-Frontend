import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileRequest } from '@yocabs/api-client';
import { api } from '@/shared/api/client';
import { useSessionStore } from '@/shared/auth/session.store';
import { keys } from '@/shared/query/keys';

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => api.auth.getProfile() });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const signIn = useSessionStore((state) => state.signIn);

  return useMutation({
    mutationFn: (input: UpdateProfileRequest) => api.auth.updateProfile(input),
    onSuccess: async (profile) => {
      queryClient.setQueryData(keys.profile, profile);
      // The session copy feeds greetings across the app, so keep it in step.
      signIn(await api.auth.me());
    },
  });
}
