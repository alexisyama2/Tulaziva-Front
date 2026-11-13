import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi, adsApi } from '@/api';
import type { AdInput, AdSearchParams } from '@/types/api';

export const adKeys = {
  all: ['ads'] as const,
  search: (p: AdSearchParams) => ['ads', 'search', p] as const,
  detail: (id: string) => ['ads', 'detail', id] as const,
  mine: (page: number) => ['ads', 'mine', page] as const,
};

/** Categories come with their name already in the language of the request, so they are cached per language. */
export function useCategories() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ['categories', i18n.resolvedLanguage],
    queryFn: adsApi.categories,
    staleTime: 60 * 60 * 1000,
    // "Other" always goes last, even for categories added after it.
    select: (list) => [...list].sort((a, b) => Number(a.key === 'other') - Number(b.key === 'other') || a.id - b.id),
  });
}

export function useAdSearch(params: AdSearchParams) {
  return useQuery({
    queryKey: adKeys.search(params),
    queryFn: () => adsApi.search(params),
    placeholderData: keepPreviousData,
  });
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ads are identified by a GUID. Anything else in the URL is not an ad (and "/ads/mine" would be answered by another API route). */
export const isAdId = (id: string | undefined): id is string => !!id && GUID.test(id);

export function useAd(id: string | undefined) {
  return useQuery({
    queryKey: adKeys.detail(id ?? ''),
    queryFn: () => adsApi.get(id!),
    enabled: isAdId(id),
    retry: false,
  });
}

export function useMyAds(page: number) {
  return useQuery({
    queryKey: adKeys.mine(page),
    queryFn: () => adsApi.mine(page),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}

export function useRenewAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.renew(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}

export function useAdminRemoveAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.removeAd(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}

export interface SaveAdArgs {
  id?: string;
  input: AdInput;
  /** Files to upload after the ad exists. */
  newImages: File[];
  /** Ids of existing images to delete (edit mode). */
  removedImageIds: string[];
}

/** Creates or updates an ad, then syncs its images. Image uploads run one by one so the cover order is kept. */
export function useSaveAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input, newImages, removedImageIds }: SaveAdArgs) => {
      const ad = id ? await adsApi.update(id, input) : await adsApi.create(input);
      for (const imageId of removedImageIds) await adsApi.removeImage(ad.id, imageId);
      for (const file of newImages) await adsApi.addImage(ad.id, file);
      return ad;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}
