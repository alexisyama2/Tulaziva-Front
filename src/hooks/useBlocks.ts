import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blocksApi } from '@/api';
import { useAuth } from '@/context/AuthContext';

export const blockKeys = {
  all: ['blocks'] as const,
};

/** The users the signed-in user blocked. Only asked for when someone is signed in. */
export function useBlockedUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: blockKeys.all,
    queryFn: blocksApi.list,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/** Blocks or unblocks a user, and refreshes the list. */
export function useSetBlocked() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      blocked ? blocksApi.block(userId) : blocksApi.unblock(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: blockKeys.all }),
  });
}
