import { request } from './client';
import type { BlockedUser } from '@/types/api';

export const blocksApi = {
  list: () => request<BlockedUser[]>('/blocks'),
  block: (userId: string) => request<void>(`/blocks/${userId}`, { method: 'PUT' }),
  unblock: (userId: string) => request<void>(`/blocks/${userId}`, { method: 'DELETE' }),
};
