import { request } from './client';
import type { UpdateProfileInput, User } from '@/types/api';

export const usersApi = {
  me: () => request<User>('/users/me'),
  update: (input: UpdateProfileInput) => request<User>('/users/me', { method: 'PUT', json: input }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/users/me/password', { method: 'POST', json: { currentPassword, newPassword } }),
  /** Sends a link to the new address; the account keeps the current one until it is opened. */
  requestEmailChange: (newEmail: string, currentPassword: string) =>
    request<void>('/users/me/email', { method: 'POST', json: { newEmail, currentPassword } }),
  deleteAccount: (password: string) => request<void>('/users/me', { method: 'DELETE', json: { password } }),
  resendVerification: () => request<void>('/users/me/resend-verification', { method: 'POST' }),
  setPhoto: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<User>('/users/me/photo', { method: 'PUT', form });
  },
  removePhoto: () => request<User>('/users/me/photo', { method: 'DELETE' }),
};
