import type { User } from '@/types';
import apiClient from './client';

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { firstName: string; lastName: string; email: string; password: string; }
interface StaffAccountPayload extends RegisterPayload {
  role: Exclude<NonNullable<User['role']>, 'CUSTOMER'>;
}
export interface BackendUser {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  accountStatus?: 'PENDING' | 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  role: 'CUSTOMER' | 'STORE_MANAGER' | 'STORE_STAFF' | 'DRIVER' | 'ADMIN';
}
interface AuthResponse { message: string; user: BackendUser; }

export const getDashboardPath = (role: User['role']) => {
  switch (role) {
    case 'STORE_MANAGER':
      return '/store-manager-dashboard';
    case 'STORE_STAFF':
      return '/store-staff-dashboard';
    case 'DRIVER':
      return '/driver-dashboard';
    case 'ADMIN':
      return '/admin-dashboard';
    case 'CUSTOMER':
    default:
      return '/user-dashboard';
  }
};

export const getPostAuthPath = (
  role: User['role'],
  from?: { pathname: string; search?: string; hash?: string } | null,
) => {
  const isCustomer = !role || role === 'CUSTOMER';
  if (from && isCustomer) {
    return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
  }
  return getDashboardPath(role);
};

const normalizeUser = (user: BackendUser): User => ({
  id: String(user.id),
  name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  avatar: user.profileImageUrl,
  accountStatus: user.accountStatus,
  role: user.role,
});

const ensureCsrf = async () => {
  try {
    await apiClient.get('/auth/csrf');
  } catch {
    // Ignore CSRF bootstrap failures. The cookie may already exist.
  }
};

export const authApi = {
  login: async (payload: LoginPayload): Promise<{ message: string; user: User }> => {
    await ensureCsrf();
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return { message: res.data.message, user: normalizeUser(res.data.user) };
  },

  register: async (payload: RegisterPayload): Promise<{ message: string; user: User }> => {
    await ensureCsrf();
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return { message: res.data.message, user: normalizeUser(res.data.user) };
  },

  createStaffAccount: async (payload: StaffAccountPayload): Promise<User> => {
    await ensureCsrf();
    const res = await apiClient.post<BackendUser>('/admin/users', payload);
    return normalizeUser(res.data);
  },

  listUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<BackendUser[]>('/admin/users');
    return res.data.map(normalizeUser);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<BackendUser>('/users/me');
    return normalizeUser(res.data);
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', payload);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },
};
