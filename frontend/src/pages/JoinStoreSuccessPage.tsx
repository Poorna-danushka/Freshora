import { Link } from 'react-router-dom';
import { ApplicationStatusBadge } from '@/components/onboarding/ApplicationStatusBadge';
import { IntegrationNotice } from '@/components/onboarding/Callouts';
import { formatDateTime, loadStoreSuccess } from '@/lib/onboarding';

const STEPS = [
  { title: 'Application received', text: 'Your details and documents have been securely submitted.' },
  { title: 'Application review', text: 'The Freshora management team reviews your information.' },
  { title: 'Contact and clarification', text: 'We may contact you if additional details or documents are required.' },
  { title: 'Approval decision', text: 'You will be notified when a decision is made.' },
  { title: 'Account activation', text: 'Approved store partners can access the store management system.' },
];

export function JoinStoreSuccessPage() {
  const meta = loadStoreSuccess();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-app py-14 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Your store partner application has been submitted</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your interest in joining Freshora. Our management team will review your application and contact you within the stated review period if additional information is needed.
        </p>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-gray-900">Application status</h2>
            <ApplicationStatusBadge status="PENDING_REVIEW" />
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Application ID</dt>
              <dd className="font-semibold text-gray-900 break-all">{meta?.id ?? 'Unavailable'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Submitted date</dt>
              <dd className="font-semibold text-gray-900">{meta ? formatDateTime(meta.submittedAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Applicant name</dt>
              <dd className="font-semibold text-gray-900">{meta?.applicantName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Store name</dt>
              <dd className="font-semibold text-gray-900">{meta?.storeName ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {meta?.source === 'mock' && (
          <div className="mb-6">
            <IntegrationNotice>
              This is a preview receipt. The store applications API is not connected yet, so Freshora servers did not receive this application and no store account was activated.
            </IntegrationNotice>
          </div>
        )}

        <ol className="space-y-4 mb-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl bg-white border border-gray-100 p-4">
              <p className="font-bold text-gray-900">{i + 1}. {step.title}</p>
              <p className="text-sm text-gray-600 mt-1">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/my-applications" className="btn-secondary justify-center">View my applications</Link>
          <Link to="/" className="btn-primary justify-center">Return to Home</Link>
          <a href="mailto:partnerships@freshora.lk" className="btn-secondary justify-center">Contact Freshora</a>
        </div>
      </div>
    </div>
  );
}
