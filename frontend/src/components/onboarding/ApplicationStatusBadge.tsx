import { normalizeApplicationStatus, type ApplicationStatus, type CanonicalApplicationStatus } from '@/types/applications';

const STYLES: Record<CanonicalApplicationStatus, string> = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  MORE_INFORMATION_REQUIRED: 'bg-blue-50 text-blue-800 border-blue-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
};

const LABELS: Record<CanonicalApplicationStatus, string> = {
  PENDING_REVIEW: 'Pending Review',
  MORE_INFORMATION_REQUIRED: 'More information required',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus | string }) {
  const normalized = normalizeApplicationStatus(status) as CanonicalApplicationStatus;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[normalized]}`}>
      {LABELS[normalized]}
    </span>
  );
}
