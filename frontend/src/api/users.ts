import type { User } from '@/types';
import apiClient from './client';

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
}

export interface AddressPayload {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface AddressRecord {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<{ id: number; firstName: string; lastName: string; name: string; email: string; phone?: string; role: User['role']; accountStatus?: User['accountStatus']; profileImageUrl?: string; }>('/users/me');
    return {
      id: String(res.data.id),
      name: res.data.name || `${res.data.firstName ?? ''} ${res.data.lastName ?? ''}`.trim(),
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      email: res.data.email,
      phone: res.data.phone,
      avatar: res.data.profileImageUrl,
      role: res.data.role,
      accountStatus: res.data.accountStatus,
    };
  },

  updateProfile: async (payload: ProfilePayload): Promise<User> => {
    const res = await apiClient.put<{ id: number; firstName: string; lastName: string; name: string; email: string; phone?: string; role: User['role']; accountStatus?: User['accountStatus']; profileImageUrl?: string; }>('/users/me', payload);
    return {
      id: String(res.data.id),
      name: res.data.name || `${res.data.firstName ?? ''} ${res.data.lastName ?? ''}`.trim(),
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      email: res.data.email,
      phone: res.data.phone,
      avatar: res.data.profileImageUrl,
      role: res.data.role,
      accountStatus: res.data.accountStatus,
    };
  },

  getAddresses: async (): Promise<AddressRecord[]> => {
    const res = await apiClient.get<AddressRecord[]>('/users/me/addresses');
    return res.data;
  },

  createAddress: async (payload: AddressPayload): Promise<AddressRecord> => {
    const res = await apiClient.post<AddressRecord>('/users/me/addresses', payload);
    return res.data;
  },

  updateAddress: async (id: number, payload: AddressPayload): Promise<AddressRecord> => {
    const res = await apiClient.put<AddressRecord>(`/users/me/addresses/${id}`, payload);
    return res.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/me/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<AddressRecord> => {
    const res = await apiClient.patch<AddressRecord>(`/users/me/addresses/${id}/default`);
    return res.data;
  },
};
