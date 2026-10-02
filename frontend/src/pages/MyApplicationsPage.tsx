import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationsApi } from '@/api/applications';
import { ApplicationStatusBadge } from '@/components/onboarding/ApplicationStatusBadge';
import { formatDateTime, storeTypeLabel, vehicleTypeLabel } from '@/lib/onboarding';
import type { DriverApplication, StorePartnerApplication } from '@/types/applications';

function StoreApplicationCard({ application }: { application: StorePartnerApplication }) {
  return (
    <ApplicationCard
      id={application.id}
      kind="Store partner"
      title={application.storeName}
      detail={`${storeTypeLabel(application.storeType)} · ${application.city}`}
      status={application.status}
      submittedAt={application.submittedAt}
      reviewNotes={application.reviewNotes}
      history={application.history}
      updatePath={`/join/store?applicationId=${encodeURIComponent(application.id)}`}
    />
  );
}

function DriverApplicationCard({ application }: { application: DriverApplication }) {
  return (
    <ApplicationCard
      id={application.id}
      kind="Driver"
      title={application.fullName}
      detail={`${vehicleTypeLabel(application.vehicleType)} · ${application.preferredArea}`}
      status={application.status}
      submittedAt={application.submittedAt}
      reviewNotes={application.reviewNotes}
      history={application.history}
      updatePath={`/join/driver?applicationId=${encodeURIComponent(application.id)}`}
    />
  );
}

function ApplicationCard({
  id, kind, title, detail, status, submittedAt, reviewNotes, history, updatePath,
}: {
  id: string;
  kind: string;
  title: string;
  detail: string;
  status: string;
  submittedAt: string;
  reviewNotes?: string;
  history: Array<{ at: string; status: string; actor?: string; note?: string }>;
  updatePath: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-700">{kind} application</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{detail}</p>
          <p className="mt-2 text-xs text-gray-500">Reference {id} · Submitted {formatDateTime(submittedAt)}</p>
        </div>
        <ApplicationStatusBadge status={status} />
      </div>
      {reviewNotes && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Latest reviewer note</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-blue-800">{reviewNotes}</p>
        </div>
      )}
      {history.length > 0 && (
        <ol className="mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
          {history.map((event, index) => (
            <li key={`${event.at}-${index}`} className="text-sm">
              <p className="font-semibold text-gray-800">{event.status.replaceAll('_', ' ')}</p>
              {event.at && <p className="text-xs text-gray-500">{formatDateTime(event.at)}</p>}
              {event.note && <p className="mt-1 text-gray-600">{event.note}</p>}
            </li>
          ))}
        </ol>
      )}
      {status === 'MORE_INFORMATION_REQUIRED' && (
        <Link to={updatePath} className="btn-primary mt-4 inline-flex justify-center">
          Update and resubmit
        </Link>
      )}
    </article>
  );
}

export function MyApplicationsPage() {
  const applicationsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationsApi.getMyApplications,
  });

  if (applicationsQuery.isPending) {
    return <div className="container-app py-12 text-gray-600">Loading your applications…</div>;
  }
  if (applicationsQuery.isError) {
    return (
      <div className="container-app py-12">
        <p className="text-red-700" role="alert">Could not load your applications. Please try again.</p>
        <button className="btn-secondary mt-4" onClick={() => void applicationsQuery.refetch()}>Retry</button>
      </div>
    );
  }

  const { stores, drivers } = applicationsQuery.data;
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-app max-w-4xl py-10">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-700">Partner onboarding</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">My applications</h1>
        <p className="mt-2 text-gray-600">Review application progress, reviewer notes, and any action needed to continue.</p>
        <div className="mt-8 space-y-5">
          {stores.map((application) => <StoreApplicationCard key={`store-${application.id}`} application={application} />)}
          {drivers.map((application) => <DriverApplicationCard key={`driver-${application.id}`} application={application} />)}
          {stores.length === 0 && drivers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-semibold text-gray-800">No applications yet</p>
              <p className="mt-1 text-sm text-gray-600">Choose a partner program to get started.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link className="btn-primary" to="/join/store">Apply as a store</Link>
                <Link className="btn-secondary" to="/join/driver">Apply as a driver</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
