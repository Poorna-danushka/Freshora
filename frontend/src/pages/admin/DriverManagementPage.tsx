import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Eye, Bike } from 'lucide-react';
import { applicationsApi } from '@/api/applications';
import { ApplicationStatusBadge } from '@/components/onboarding/ApplicationStatusBadge';
import { ApplicationDetailDrawer, DetailSection } from '@/components/admin/ApplicationDetailDrawer';
import { ApplicationDocumentViewer } from '@/components/admin/ApplicationDocumentViewer';
import { ReviewActionDialogs } from '@/components/admin/ReviewActionDialogs';
import { formatDateTime, ownershipLabel, vehicleTypeLabel } from '@/lib/onboarding';
import { normalizeApplicationStatus, type ApplicationStatus, type DriverApplication, type ReviewAction } from '@/types/applications';

const FILTERS: Array<{ id: 'ALL' | ApplicationStatus; label: string; icon: any }> = [
  { id: 'ALL', label: 'All Drivers', icon: Filter },
  { id: 'PENDING_REVIEW', label: 'Pending Review', icon: Clock },
  { id: 'APPROVED', label: 'Approved Riders', icon: CheckCircle2 },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'MORE_INFORMATION_REQUIRED', label: 'More Info Needed', icon: AlertCircle },
];

export function DriverManagementPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [selected, setSelected] = useState<DriverApplication | null>(null);
  const [dialog, setDialog] = useState<ReviewAction | null>(null);
  const [actionError, setActionError] = useState('');

  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['admin-driver-applications'],
    queryFn: applicationsApi.listDriverApplications,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: ReviewAction; note: string }) =>
      applicationsApi.reviewDriverApplication(id, action, note),
    onSuccess: () => {
      setDialog(null);
      setActionError('');
      void queryClient.invalidateQueries({ queryKey: ['admin-driver-applications'] });
      if (selected) {
        setSelected(null);
      }
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : 'Review action was not applied.');
    },
  });

  const items = listQuery.data?.items ?? [];

  const counts = useMemo<Record<string, number>>(() => {
    return {
      ALL: items.length,
      PENDING_REVIEW: items.filter((i) => normalizeApplicationStatus(i.status) === 'PENDING_REVIEW').length,
      APPROVED: items.filter((i) => normalizeApplicationStatus(i.status) === 'APPROVED').length,
      REJECTED: items.filter((i) => normalizeApplicationStatus(i.status) === 'REJECTED').length,
      MORE_INFORMATION_REQUIRED: items.filter((i) => normalizeApplicationStatus(i.status) === 'MORE_INFORMATION_REQUIRED').length,
      MORE_INFO_REQUIRED: items.filter((i) => normalizeApplicationStatus(i.status) === 'MORE_INFORMATION_REQUIRED').length,
    };
  }, [items]);

  const rows = useMemo(() => {
    const filtered = items.filter((item) => {
      const normalizedStatus = normalizeApplicationStatus(item.status);
      const matchesStatus = filter === 'ALL' || normalizedStatus === filter;
      const matchesVehicle = vehicleFilter === 'ALL' || item.vehicleType === vehicleFilter;
      const haystack = `${item.fullName} ${item.vehicleRegistrationNumber} ${item.preferredArea} ${item.city} ${item.id} ${item.email}`.toLowerCase();
      return matchesStatus && matchesVehicle && haystack.includes(query.toLowerCase().trim());
    });
    return filtered.sort((a, b) => {
      const delta = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return sort === 'newest' ? -delta : delta;
    });
  }, [items, filter, vehicleFilter, query, sort]);

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Delivery Drivers Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review driver applications, verify license and vehicle documents, and manage delivery rider accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition w-fit"
        >
          <RefreshCw size={14} className={listQuery.isFetching ? 'animate-spin' : ''} />
          {listQuery.isFetching ? 'Refreshing…' : 'Refresh Drivers'}
        </button>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((item) => {
            const Icon = item.icon;
            const count = counts[item.id] ?? 0;
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by driver name, registration #, area, email, or ID..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-teal-500 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500 transition"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="MOTORBIKE">Motorbike</option>
            <option value="THREE_WHEELER">Three-Wheeler</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500 transition"
          >
            <option value="newest">Submitted: Newest First</option>
            <option value="oldest">Submitted: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Loading & Empty States */}
      {listQuery.isLoading && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/60 text-center text-slate-400 text-sm">
          Loading driver applications…
        </div>
      )}

      {listQuery.isError && (
        <div className="p-6 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
          <p>Unable to load driver applications.</p>
          <button type="button" onClick={() => void listQuery.refetch()} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {!listQuery.isLoading && rows.length === 0 && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
          <p className="text-slate-300 font-bold">No driver applications found</p>
          <p className="text-xs text-slate-500">Try changing your search query or vehicle selection.</p>
        </div>
      )}

      {/* Desktop Applications Table */}
      {!listQuery.isLoading && rows.length > 0 && (
        <>
          <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Driver Name</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Vehicle Type</th>
                  <th className="px-4 py-3.5">Registration #</th>
                  <th className="px-4 py-3.5">Service Area</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white text-sm">{row.fullName}</p>
                      <p className="text-[11px] text-slate-400">{row.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{row.contactNumber}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-700">
                        <Bike size={12} className="text-teal-400" /> {vehicleTypeLabel(row.vehicleType)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">{row.vehicleRegistrationNumber}</td>
                    <td className="px-4 py-3.5 text-slate-300">{row.preferredArea}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatDateTime(row.submittedAt)}</td>
                    <td className="px-4 py-3.5">
                      <ApplicationStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold text-xs border border-teal-500/20 transition"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Applications Cards */}
          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row)}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-base">{row.fullName}</p>
                    <p className="text-xs text-slate-400">{vehicleTypeLabel(row.vehicleType)} · {row.vehicleRegistrationNumber}</p>
                  </div>
                  <ApplicationStatusBadge status={row.status} />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>📍 {row.preferredArea} · 📞 {row.contactNumber}</p>
                  <p className="text-slate-500 font-mono text-[11px]">ID: {row.id}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Application Detail Slide-out Drawer */}
      <ApplicationDetailDrawer
        open={Boolean(selected)}
        title={selected?.fullName ?? 'Driver Application'}
        onClose={() => setSelected(null)}
        actions={
          selected && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl bg-teal-500 hover:bg-teal-400 px-3 py-2.5 font-bold text-slate-950 text-xs transition"
                onClick={() => {
                  setActionError('');
                  setDialog('APPROVE');
                }}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 font-semibold text-slate-200 text-xs transition"
                onClick={() => {
                  setActionError('');
                  setDialog('REQUEST_MORE_INFO');
                }}
              >
                Request Info
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2.5 font-semibold text-xs transition border border-red-500/30"
                onClick={() => {
                  setActionError('');
                  setDialog('REJECT');
                }}
              >
                Reject
              </button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            <DetailSection
              title="Personal information"
              rows={[
                { label: 'Full name', value: selected.fullName },
                { label: 'Email address', value: selected.email },
                { label: 'Contact number', value: selected.contactNumber },
                { label: 'Date of birth', value: selected.dateOfBirth },
                { label: 'Address', value: `${selected.address}, ${selected.city}` },
                { label: 'Emergency contact', value: [selected.emergencyContactName, selected.emergencyContactNumber].filter(Boolean).join(' · ') },
                { label: 'Application ID', value: selected.id },
              ]}
            />

            <DetailSection
              title="Vehicle information"
              rows={[
                { label: 'Vehicle type', value: vehicleTypeLabel(selected.vehicleType) },
                { label: 'Registration number', value: selected.vehicleRegistrationNumber },
                { label: 'Make / model', value: [selected.vehicleMake, selected.vehicleModel].filter(Boolean).join(' ') },
                { label: 'Year / color', value: [selected.vehicleYear, selected.vehicleColor].filter(Boolean).join(' · ') },
                { label: 'Ownership type', value: ownershipLabel(selected.ownershipType) },
              ]}
            />

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wide text-teal-400 mb-3">
                Driver Documents & Photos
              </h3>
              <ApplicationDocumentViewer documents={selected.documents} source={listQuery.data?.source} />
            </section>

            <DetailSection
              title="Availability & Equipment"
              rows={[
                { label: 'Preferred service area', value: selected.preferredArea },
                { label: 'Working days', value: selected.preferredWorkingDays?.join(', ') },
                { label: 'Working hours', value: selected.preferredWorkingHours },
                { label: 'Smartphone available', value: selected.hasSmartphone ? 'Yes' : 'No' },
                { label: 'Delivery bag available', value: selected.hasDeliveryBag === undefined ? 'Not specified' : selected.hasDeliveryBag ? 'Yes' : 'No' },
                { label: 'Experience', value: selected.deliveryExperience },
                { label: 'Additional notes', value: selected.additionalNotes },
              ]}
            />

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-teal-400">Review History</h3>
              {selected.history && selected.history.length > 0 ? (
                <div className="space-y-2">
                  {selected.history.map((event, idx) => (
                    <div key={`${event.at}-${idx}`} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{event.status.replaceAll('_', ' ')}</span>
                        <span className="text-slate-500 font-normal">{formatDateTime(event.at)}</span>
                      </div>
                      {event.actor && <p className="text-slate-400 mt-1">Reviewer: {event.actor}</p>}
                      {event.note && <p className="text-teal-300 mt-1">Note: "{event.note}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No review history recorded yet.</p>
              )}
            </section>
          </div>
        )}
      </ApplicationDetailDrawer>

      {/* Review Action Confirmation Dialogs */}
      <ReviewActionDialogs
        open={dialog}
        error={actionError}
        pending={reviewMutation.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(action, note) => {
          if (!selected) return;
          reviewMutation.mutate({ id: selected.id, action, note });
        }}
      />
    </div>
  );
}
