import { request } from './client';
import type { AdminAttachment, CreateAdminInput, PagedResult, Report, ReportStatus, User } from '@/types/api';

export const adminApi = {
  users: (page = 1, pageSize = 20) => request<PagedResult<User>>('/admin/users', { query: { page, pageSize } }),
  createAdmin: (input: CreateAdminInput) => request<User>('/admin/users', { method: 'POST', json: input }),
  attachments: (page = 1, pageSize = 20) =>
    request<PagedResult<AdminAttachment>>('/admin/attachments', { query: { page, pageSize } }),
  reports: (status: ReportStatus | undefined, page = 1, pageSize = 20) =>
    request<PagedResult<Report>>('/admin/reports', { query: { status, page, pageSize } }),
  resolveReport: (id: string) => request<Report>(`/admin/reports/${id}/resolve`, { method: 'POST' }),
  dismissReport: (id: string) => request<Report>(`/admin/reports/${id}/dismiss`, { method: 'POST' }),
  removeAd: (id: string) => request<void>(`/admin/ads/${id}/remove`, { method: 'POST' }),
};
