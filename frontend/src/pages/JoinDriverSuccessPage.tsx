import { Link } from 'react-router-dom';
import { ApplicationStatusBadge } from '@/components/onboarding/ApplicationStatusBadge';
import { IntegrationNotice } from '@/components/onboarding/Callouts';
import { formatDateTime, loadDriverSuccess, vehicleTypeLabel } from '@/lib/onboarding';

export function JoinDriverSuccessPage() {
  const meta = loadDriverSuccess();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-app py-14 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Your driver application has been submitted</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your interest in delivering with Freshora. Our management team will review your application and contact you within the stated review period if additional information is needed.
        </p>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-gray-900">Application status</h2>
            <ApplicationStatusBadge status="PENDING_REVIEW" />
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Application ID</dt>
              <dd className="font-semibold break-all">{meta?.id ?? 'Unavailable'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Submitted date</dt>
              <dd className="font-semibold">{meta ? formatDateTime(meta.submittedAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Applicant name</dt>
              <dd className="font-semibold">{meta?.applicantName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Vehicle type</dt>
              <dd className="font-semibold">{meta ? vehicleTypeLabel(meta.vehicleType) : '—'}</dd>
            </div>
          </dl>
        </div>

        {meta?.source === 'mock' && (
          <div className="mb-6">
            <IntegrationNotice>
              This is a preview receipt. The driver applications API is not connected yet, so Freshora servers did not receive this application and no driver account was activated.
            </IntegrationNotice>
          </div>
        )}

        <ol className="grid sm:grid-cols-5 gap-3 mb-8">
          {['Application received', 'Document review', 'Contact if needed', 'Approval decision', 'Driver account activation'].map((item, i) => (
            <li key={item} className="rounded-2xl bg-white border border-gray-100 p-4">
              <p className="text-xs font-bold text-primary-500">0{i + 1}</p>
              <p className="font-semibold text-sm text-gray-900 mt-1">{item}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-primary justify-center">Return to Home</Link>
          <a href="mailto:partnerships@freshora.lk" className="btn-secondary justify-center">Contact Freshora</a>
        </div>
      </div>
    </div>
  );
}
