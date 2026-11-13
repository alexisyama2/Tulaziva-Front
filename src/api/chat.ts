import { request } from './client';
import type { Conversation, Message, PagedResult } from '@/types/api';

export const chatApi = {
  start: (adId: string) => request<Conversation>('/conversations', { method: 'POST', json: { adId } }),
  list: (page = 1, pageSize = 30) =>
    request<PagedResult<Conversation>>('/conversations', { query: { page, pageSize } }),
  get: (id: string) => request<Conversation>(`/conversations/${id}`),
  unreadCount: () => request<{ count: number }>('/conversations/unread-count'),
  /** Newest first. */
  messages: (id: string, page = 1, pageSize = 50) =>
    request<PagedResult<Message>>(`/conversations/${id}/messages`, { query: { page, pageSize } }),
  send: (id: string, body: string) =>
    request<Message>(`/conversations/${id}/messages`, { method: 'POST', json: { body } }),
  sendFiles: (id: string, files: File[], body?: string) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    if (body) form.append('body', body);
    return request<Message>(`/conversations/${id}/messages/files`, { method: 'POST', form });
  },
  markRead: (id: string) => request<void>(`/conversations/${id}/read`, { method: 'POST' }),
};
