import { request } from './client';
import type { AdSummary, PagedResult } from '@/types/api';

export const favoritesApi = {
  ids: () => request<string[]>('/favorites/ids'),
  list: (page = 1, pageSize = 12) => request<PagedResult<AdSummary>>('/favorites', { query: { page, pageSize } }),
  add: (adId: string) => request<void>(`/favorites/${adId}`, { method: 'PUT' }),
  remove: (adId: string) => request<void>(`/favorites/${adId}`, { method: 'DELETE' }),
};
