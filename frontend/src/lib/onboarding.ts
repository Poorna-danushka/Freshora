import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];

export const phoneSchema = z
  .string()
  .trim()
  .min(9, 'Enter a valid contact number')
  .regex(/^[+\d][\d\s()-]{8,18}$/, 'Enter a valid contact number');

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || phoneSchema.safeParse(value).success, 'Enter a valid contact number');

export function validateUpload(file: File | undefined, options: { required?: boolean; accept: string[]; maxBytes?: number; label: string }) {
  if (!file) {
    return options.required ? `${options.label} is required` : undefined;
  }
  if (!options.accept.includes(file.type)) {
    return `${options.label}: accepted formats are ${options.accept.includes('application/pdf') ? 'JPG, PNG, WEBP, or PDF' : 'JPG, PNG, or WEBP'}`;
  }
  if (file.size > (options.maxBytes ?? MAX_UPLOAD_BYTES)) {
    return `${options.label}: maximum file size is 5 MB`;
  }
  return undefined;
}

export function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-LK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function storeTypeLabel(value: string) {
  const labels: Record<string, string> = {
    GROCERY: 'Grocery store',
    FRESH_PRODUCE: 'Fresh produce store',
    SUPERMARKET: 'Supermarket',
    ORGANIC: 'Organic store',
    OTHER: 'Other',
  };
  return labels[value] ?? value;
}

export function vehicleTypeLabel(value: string) {
  const labels: Record<string, string> = {
    MOTORBIKE: 'Motorbike',
    THREE_WHEELER: 'Three-wheeler',
    OTHER: 'Other',
  };
  return labels[value] ?? value;
}

export function ownershipLabel(value: string) {
  const labels: Record<string, string> = {
    OWN: 'Own vehicle',
    FAMILY: 'Family vehicle',
    RENTED: 'Rented/leased vehicle',
    OTHER: 'Other',
  };
  return labels[value] ?? value;
}

const SUCCESS_STORE_KEY = 'freshora.preview.storeApplication';
const SUCCESS_DRIVER_KEY = 'freshora.preview.driverApplication';

export interface StoreSuccessMeta {
  id: string;
  submittedAt: string;
  applicantName: string;
  storeName: string;
  source: 'api' | 'mock';
}

export interface DriverSuccessMeta {
  id: string;
  submittedAt: string;
  applicantName: string;
  vehicleType: string;
  source: 'api' | 'mock';
}

export function saveStoreSuccess(meta: StoreSuccessMeta) {
  sessionStorage.setItem(SUCCESS_STORE_KEY, JSON.stringify(meta));
}

export function loadStoreSuccess(): StoreSuccessMeta | null {
  const raw = sessionStorage.getItem(SUCCESS_STORE_KEY);
  return raw ? (JSON.parse(raw) as StoreSuccessMeta) : null;
}

export function saveDriverSuccess(meta: DriverSuccessMeta) {
  sessionStorage.setItem(SUCCESS_DRIVER_KEY, JSON.stringify(meta));
}

export function loadDriverSuccess(): DriverSuccessMeta | null {
  const raw = sessionStorage.getItem(SUCCESS_DRIVER_KEY);
  return raw ? (JSON.parse(raw) as DriverSuccessMeta) : null;
}
