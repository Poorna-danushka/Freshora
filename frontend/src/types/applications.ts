export type CanonicalApplicationStatus =
  | 'PENDING_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type ApplicationStatus = CanonicalApplicationStatus | 'MORE_INFO_REQUIRED';

export function normalizeApplicationStatus(status?: string | null): CanonicalApplicationStatus {
  if (status === 'MORE_INFO_REQUIRED' || status === 'MORE_INFORMATION_REQUIRED') {
    return 'MORE_INFORMATION_REQUIRED';
  }
  if (status === 'PENDING_REVIEW' || status === 'APPROVED' || status === 'REJECTED') {
    return status;
  }
  return 'PENDING_REVIEW';
}

export type PreferredContactMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP';

export type StoreType =
  | 'GROCERY'
  | 'FRESH_PRODUCE'
  | 'SUPERMARKET'
  | 'ORGANIC'
  | 'OTHER';

export type VehicleType = 'MOTORBIKE' | 'THREE_WHEELER' | 'OTHER';

export type VehicleOwnership =
  | 'OWN'
  | 'FAMILY'
  | 'RENTED'
  | 'OTHER';

export interface ApplicationDocument {
  id: string;
  kind: string;
  label: string;
  required: boolean;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

export interface ApplicationReviewEvent {
  at: string;
  status: ApplicationStatus;
  actor?: string;
  note?: string;
}

export interface StorePartnerApplication {
  id: string;
  applicantName: string;
  email: string;
  contactNumber: string;
  alternateContactNumber?: string;
  preferredContactMethod: PreferredContactMethod;
  applicantNotes?: string;
  storeContactNumber: string;
  storeEmail?: string;
  storeName: string;
  storeAddress: string;
  city: string;
  province?: string;
  postalCode?: string;
  storeType: StoreType;
  registrationNumber?: string;
  storeDescription?: string;
  logoFileName?: string;
  documents: ApplicationDocument[];
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  history: ApplicationReviewEvent[];
}

export interface DriverApplication {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  vehicleType: VehicleType;
  vehicleRegistrationNumber: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  ownershipType: VehicleOwnership;
  preferredArea: string;
  preferredWorkingDays: string[];
  preferredWorkingHours?: string;
  deliveryExperience?: string;
  hasSmartphone: boolean;
  hasDeliveryBag?: boolean;
  additionalNotes?: string;
  documents: ApplicationDocument[];
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  history: ApplicationReviewEvent[];
}

export type ApplicationDataSource = 'api' | 'mock';

export interface ApplicationListResult<T> {
  items: T[];
  source: ApplicationDataSource;
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
