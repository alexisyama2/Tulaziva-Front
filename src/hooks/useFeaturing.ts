import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adsApi } from '@/api';
import { adKeys } from './useAds';

/** The durations that can be chosen and whether owners can feature their own ads. Public and almost never changes. */
export function useFeaturingOptions() {
  return useQuery({
    queryKey: ['featuring', 'options'],
    queryFn: adsApi.featuringOptions,
    staleTime: 30 * 60 * 1000,
  });
}

/** Features an ad for some days, or stops featuring it (days = 0). The lists change order, so every ad query is refreshed. */
export function useFeatureAd() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, days }: { adId: string; days: number }) =>
      days > 0 ? adsApi.feature(adId, days) : adsApi.unfeature(adId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}
