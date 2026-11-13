import { request } from './client';
import type {
  Ad,
  AdImage,
  AdInput,
  AdSearchParams,
  AdSummary,
  Category,
  FeaturingOptions,
  PagedResult,
  ReportReason,
} from '@/types/api';

export const adsApi = {
  categories: () => request<Category[]>('/categories'),
  search: (params: AdSearchParams) =>
    request<PagedResult<AdSummary>>('/ads', { query: params as Record<string, string | number> }),
  get: (id: string) => request<Ad>(`/ads/${id}`),
  mine: (page = 1, pageSize = 12) => request<PagedResult<AdSummary>>('/ads/mine', { query: { page, pageSize } }),
  create: (input: AdInput) => request<Ad>('/ads', { method: 'POST', json: input }),
  update: (id: string, input: AdInput) => request<Ad>(`/ads/${id}`, { method: 'PUT', json: input }),
  remove: (id: string) => request<void>(`/ads/${id}`, { method: 'DELETE' }),
  report: (id: string, reason: ReportReason, details?: string) =>
    request<void>(`/ads/${id}/report`, { method: 'POST', json: { reason, details: details || null } }),
  featuringOptions: () => request<FeaturingOptions>('/featuring'),
  /** Shows the ad first in the searches for some days (added to what is left). */
  feature: (id: string, days: number) => request<Ad>(`/ads/${id}/feature`, { method: 'POST', json: { days } }),
  unfeature: (id: string) => request<Ad>(`/ads/${id}/feature`, { method: 'DELETE' }),
  renew: (id: string) => request<Ad>(`/ads/${id}/renew`, { method: 'POST' }),
  addImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<AdImage>(`/ads/${id}/images`, { method: 'POST', form });
  },
  removeImage: (id: string, imageId: string) => request<void>(`/ads/${id}/images/${imageId}`, { method: 'DELETE' }),
};
