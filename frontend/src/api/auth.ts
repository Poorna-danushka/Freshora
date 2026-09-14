import type { AuthTokens, User } from '@/types';
import apiClient from './client';

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { name: string; email: string; phone: string; password: string; }
interface AuthResponse { user: User; tokens: AuthTokens; }

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', payload);
    const { tokens } = res.data.data;
    localStorage.setItem('freshora_access_token', tokens.accessToken);
    localStorage.setItem('freshora_refresh_token', tokens.refreshToken);
    return res.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', payload);
    const { tokens } = res.data.data;
    localStorage.setItem('freshora_access_token', tokens.accessToken);
    localStorage.setItem('freshora_refresh_token', tokens.refreshToken);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('freshora_access_token');
    localStorage.removeItem('freshora_refresh_token');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<{ data: User }>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },
};
