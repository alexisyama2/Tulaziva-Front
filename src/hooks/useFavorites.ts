import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/api';
import { useAuth } from '@/context/AuthContext';

export const favoriteKeys = {
  all: ['favorites'] as const,
  ids: ['favorites', 'ids'] as const,
  list: (page: number) => ['favorites', 'list', page] as const,
};

// Outside the hook so react-query keeps the same function and does not rebuild the Set on every render.
const toSet = (ids: string[]) => new Set(ids);

/** The ids of the saved ads, to paint the hearts. Only asked for when someone is signed in. */
export function useFavoriteIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: favoriteKeys.ids,
    queryFn: favoritesApi.ids,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    select: toSet,
  });
}

export function useFavorites(page: number) {
  return useQuery({
    queryKey: favoriteKeys.list(page),
    queryFn: () => favoritesApi.list(page),
    placeholderData: keepPreviousData,
  });
}

/** Saves or removes an ad. The heart changes at once (optimistic) and goes back if the server refuses. */
export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, favorite }: { adId: string; favorite: boolean }) =>
      favorite ? favoritesApi.add(adId) : favoritesApi.remove(adId),
    onMutate: async ({ adId, favorite }) => {
      await qc.cancelQueries({ queryKey: favoriteKeys.ids });
      const previous = qc.getQueryData<string[]>(favoriteKeys.ids);
      qc.setQueryData<string[]>(favoriteKeys.ids, (ids = []) =>
        favorite ? (ids.includes(adId) ? ids : [adId, ...ids]) : ids.filter((id) => id !== adId),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) qc.setQueryData(favoriteKeys.ids, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: favoriteKeys.all }),
  });
}
