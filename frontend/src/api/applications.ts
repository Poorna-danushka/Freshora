import type {
  ApplicationListResult,
  ApplicationDataSource,
  DriverApplication,
  ReviewAction,
  StorePartnerApplication,
} from '@/types/applications';
import apiClient from './client';

export const APPLICATIONS_BACKEND_READY = true;

const STORE_ENDPOINTS = {
  submit: '/applications/stores',
  list: '/admin/store-applications',
  detail: (id: string) => `/admin/store-applications/${id}`,
  approve: (id: string) => `/admin/store-applications/${id}/approve`,
  reject: (id: string) => `/admin/store-applications/${id}/reject`,
  requestMoreInfo: (id: string) => `/admin/store-applications/${id}/request-information`,
};

const DRIVER_ENDPOINTS = {
  submit: '/applications/drivers',
  list: '/admin/driver-applications',
  detail: (id: string) => `/admin/driver-applications/${id}`,
  approve: (id: string) => `/admin/driver-applications/${id}/approve`,
  reject: (id: string) => `/admin/driver-applications/${id}/reject`,
  requestMoreInfo: (id: string) => `/admin/driver-applications/${id}/request-information`,
};



function newestFirst<T extends { submittedAt?: string | null }>(items: T[]) {
  return [...items].sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeB - timeA;
  });
}

export interface StoreApplicationSubmitPayload {
  applicationId?: string;
  applicantName: string;
  email: string;
  contactNumber: string;
  alternateContactNumber?: string;
  preferredContactMethod: StorePartnerApplication['preferredContactMethod'];
  applicantNotes?: string;
  storeName: string;
  storeContactNumber: string;
  storeEmail?: string;
  storeAddress: string;
  city: string;
  province?: string;
  postalCode?: string;
  storeType: StorePartnerApplication['storeType'];
  registrationNumber?: string;
  storeDescription?: string;
  files: Record<string, File>;
}

export interface DriverApplicationSubmitPayload {
  applicationId?: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  vehicleType: DriverApplication['vehicleType'];
  vehicleRegistrationNumber: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  ownershipType: DriverApplication['ownershipType'];
  preferredArea: string;
  preferredWorkingDays: string[];
  preferredWorkingHours?: string;
  deliveryExperience?: string;
  hasSmartphone: boolean;
  hasDeliveryBag?: boolean;
  additionalNotes?: string;
  files: Record<string, File>;
}

export interface ApplicationSubmitResult {
  id: string;
  submittedAt: string;
  status: 'PENDING_REVIEW';
  source: ApplicationDataSource;
}

export interface MyApplications {
  stores: StorePartnerApplication[];
  drivers: DriverApplication[];
}

function toFormData(fields: Record<string, string | undefined>, files: Record<string, File>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== '') data.append(key, value);
  });
  Object.entries(files).forEach(([key, file]) => {
    data.append(key, file);
  });
  return data;
}

export const applicationsApi = {
  submitStoreApplication: async (payload: StoreApplicationSubmitPayload): Promise<ApplicationSubmitResult> => {
    const { files, applicationId, ...fields } = payload;
    const formData = toFormData(
      {
        ...fields,
        preferredContactMethod: fields.preferredContactMethod,
        storeType: fields.storeType,
      },
      files,
    );
    const res = applicationId
      ? await apiClient.put<{ id: string; submittedAt: string }>(`/applications/stores/${applicationId}`, formData)
      : await apiClient.post<{ id: string; submittedAt: string }>(STORE_ENDPOINTS.submit, formData);
    return { id: res.data.id, submittedAt: res.data.submittedAt, status: 'PENDING_REVIEW', source: 'api' };
  },

  submitDriverApplication: async (payload: DriverApplicationSubmitPayload): Promise<ApplicationSubmitResult> => {
    const { files, applicationId, preferredWorkingDays, hasSmartphone, hasDeliveryBag, ...fields } = payload;
    const formData = toFormData(
      {
        ...fields,
        preferredWorkingDays: preferredWorkingDays.join(','),
        hasSmartphone: String(hasSmartphone),
        hasDeliveryBag: hasDeliveryBag === undefined ? undefined : String(hasDeliveryBag),
      },
      files,
    );
    const res = applicationId
      ? await apiClient.put<{ id: string; submittedAt: string }>(`/applications/drivers/${applicationId}`, formData)
      : await apiClient.post<{ id: string; submittedAt: string }>(DRIVER_ENDPOINTS.submit, formData);
    return { id: res.data.id, submittedAt: res.data.submittedAt, status: 'PENDING_REVIEW', source: 'api' };
  },

  getMyApplications: async (): Promise<MyApplications> => {
    const res = await apiClient.get<MyApplications>('/applications/me');
    return res.data;
  },

  getStoreApplication: async (id: string): Promise<StorePartnerApplication> => {
    const res = await apiClient.get<StorePartnerApplication>(`/applications/stores/${id}`);
    return res.data;
  },

  getDriverApplication: async (id: string): Promise<DriverApplication> => {
    const res = await apiClient.get<DriverApplication>(`/applications/drivers/${id}`);
    return res.data;
  },

  listStoreApplications: async (): Promise<ApplicationListResult<StorePartnerApplication>> => {
    const res = await apiClient.get<StorePartnerApplication[]>(STORE_ENDPOINTS.list, {
      params: { sort: 'newest' },
    });
    return { items: newestFirst(res.data), source: 'api' };
  },

  listDriverApplications: async (): Promise<ApplicationListResult<DriverApplication>> => {
    const res = await apiClient.get<DriverApplication[]>(DRIVER_ENDPOINTS.list, {
      params: { sort: 'newest' },
    });
    return { items: newestFirst(res.data), source: 'api' };
  },

  reviewStoreApplication: async (id: string, action: ReviewAction, note?: string) => {
    const endpoint = action === 'APPROVE'
      ? STORE_ENDPOINTS.approve(id)
      : action === 'REJECT'
        ? STORE_ENDPOINTS.reject(id)
        : STORE_ENDPOINTS.requestMoreInfo(id);

    await apiClient.post(endpoint, { action, note });
  },

  reviewDriverApplication: async (id: string, action: ReviewAction, note?: string) => {
    const endpoint = action === 'APPROVE'
      ? DRIVER_ENDPOINTS.approve(id)
      : action === 'REJECT'
        ? DRIVER_ENDPOINTS.reject(id)
        : DRIVER_ENDPOINTS.requestMoreInfo(id);

    await apiClient.post(endpoint, { action, note });
  },
};

export const getDocumentUrl = (id: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  return `${baseUrl}/admin/application-documents/${id}`;
};
