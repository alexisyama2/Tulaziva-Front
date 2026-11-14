import { request } from './client';
import type { AuthResponse, Language } from '@/types/api';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  language?: Language;
  latitude?: number | null;
  longitude?: number | null;
  /** The person accepted the terms of use and the privacy notice (the API refuses to sign up without it). */
  acceptedTerms: boolean;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', json: { email, password } }),
  register: (input: RegisterInput) => request<AuthResponse>('/auth/register', { method: 'POST', json: input }),
  /** Ends the session on the server (the refresh token stops working). */
  logout: (refreshToken: string) => request<void>('/auth/logout', { method: 'POST', json: { refreshToken } }),
  forgotPassword: (email: string) => request<void>('/auth/forgot-password', { method: 'POST', json: { email } }),
  resetPassword: (token: string, newPassword: string) =>
    request<void>('/auth/reset-password', { method: 'POST', json: { token, newPassword } }),
  verifyEmail: (token: string) => request<void>('/auth/verify-email', { method: 'POST', json: { token } }),
  confirmEmailChange: (token: string) => request<void>('/auth/confirm-email-change', { method: 'POST', json: { token } }),
};
