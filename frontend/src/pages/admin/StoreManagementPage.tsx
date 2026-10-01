import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Eye } from 'lucide-react';
import { applicationsApi } from '@/api/applications';
import { ApplicationStatusBadge } from '@/components/onboarding/ApplicationStatusBadge';
import { AdminStaffHint } from '@/components/admin/AdminLayout';
import { ApplicationDetailDrawer, DetailSection } from '@/components/admin/ApplicationDetailDrawer';
import { ApplicationDocumentViewer } from '@/components/admin/ApplicationDocumentViewer';
import { ReviewActionDialogs } from '@/components/admin/ReviewActionDialogs';
import { formatDateTime, storeTypeLabel } from '@/lib/onboarding';
import { normalizeApplicationStatus, type ApplicationStatus, type ReviewAction, type StorePartnerApplication } from '@/types/applications';

const FILTERS: Array<{ id: 'ALL' | ApplicationStatus; label: string; icon: any }> = [
  { id: 'ALL', label: 'All Applications', icon: Filter },
  { id: 'PENDING_REVIEW', label: 'Pending Review', icon: Clock },
  { id: 'APPROVED', label: 'Approved Stores', icon: CheckCircle2 },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'MORE_INFORMATION_REQUIRED', label: 'More Info Needed', icon: AlertCircle },
];

export function StoreManagementPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [selected, setSelected] = useState<StorePartnerApplication | null>(null);
  const [dialog, setDialog] = useState<ReviewAction | null>(null);
  const [actionError, setActionError] = useState('');

  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['admin-store-applications'],
    queryFn: applicationsApi.listStoreApplications,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: ReviewAction; note: string }) =>
      applicationsApi.reviewStoreApplication(id, action, note),
    onSuccess: () => {
      setDialog(null);
      setActionError('');
      void queryClient.invalidateQueries({ queryKey: ['admin-store-applications'] });
      // Refresh current selected item details
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
      const haystack = `${item.storeName} ${item.applicantName} ${item.city} ${item.id} ${item.email}`.toLowerCase();
      return matchesStatus && haystack.includes(query.toLowerCase().trim());
    });
    return filtered.sort((a, b) => {
      const delta = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return sort === 'newest' ? -delta : delta;
    });
  }, [items, filter, query, sort]);

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Store Partner Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review partner store applications, inspect submitted documentation, and approve store accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition w-fit"
        >
          <RefreshCw size={14} className={listQuery.isFetching ? 'animate-spin' : ''} />
          {listQuery.isFetching ? 'Refreshing…' : 'Refresh Applications'}
        </button>
      </div>

      <AdminStaffHint />

      {/* Filter Tabs & Search Controls */}
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
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
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
              placeholder="Search by store name, applicant, email, city, or ID..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition"
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
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition"
          >
            <option value="newest">Submitted: Newest First</option>
            <option value="oldest">Submitted: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Loading & Empty States */}
      {listQuery.isLoading && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/60 text-center text-slate-400 text-sm">
          Loading store partner applications…
        </div>
      )}

      {listQuery.isError && (
        <div className="p-6 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
          <p>Unable to load store partner applications.</p>
          <button type="button" onClick={() => void listQuery.refetch()} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {!listQuery.isLoading && rows.length === 0 && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
          <p className="text-slate-300 font-bold">No applications found</p>
          <p className="text-xs text-slate-500">Try changing your search query or filter selection.</p>
        </div>
      )}

      {/* Desktop Applications Table */}
      {!listQuery.isLoading && rows.length > 0 && (
        <>
          <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Store Details</th>
                  <th className="px-4 py-3.5">Applicant</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-bold text-white text-sm">{row.storeName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{storeTypeLabel(row.storeType)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-200 font-semibold">{row.applicantName}</p>
                      <p className="text-[11px] text-slate-400">{row.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{row.storeContactNumber}</td>
                    <td className="px-4 py-3.5 text-slate-300">{row.city}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatDateTime(row.submittedAt)}</td>
                    <td className="px-4 py-3.5">
                      <ApplicationStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/20 transition"
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
                    <p className="font-bold text-white text-base">{row.storeName}</p>
                    <p className="text-xs text-slate-400">{row.applicantName}</p>
                  </div>
                  <ApplicationStatusBadge status={row.status} />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>📍 {row.city} · 📞 {row.storeContactNumber}</p>
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
        title={selected?.storeName ?? 'Store Partner Application'}
        onClose={() => setSelected(null)}
        actions={
          selected && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-2.5 font-bold text-slate-950 text-xs transition"
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
              title="Applicant information"
              rows={[
                { label: 'Full name', value: selected.applicantName },
                { label: 'Email address', value: selected.email },
                { label: 'Personal contact', value: selected.contactNumber },
                { label: 'Alternate contact', value: selected.alternateContactNumber },
                { label: 'Preferred contact method', value: selected.preferredContactMethod },
                { label: 'Application ID', value: selected.id },
              ]}
            />

            <DetailSection
              title="Store details"
              rows={[
                { label: 'Store name', value: selected.storeName },
                { label: 'Store type', value: storeTypeLabel(selected.storeType) },
                { label: 'Store contact', value: selected.storeContactNumber },
                { label: 'Store email', value: selected.storeEmail },
                { label: 'Address', value: selected.storeAddress },
                { label: 'City / town', value: selected.city },
                { label: 'Province', value: selected.province },
                { label: 'Postal code', value: selected.postalCode },
                { label: 'Registration number', value: selected.registrationNumber },
                { label: 'Store description', value: selected.storeDescription },
              ]}
            />

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400 mb-3">
                Uploaded Store Documents & Logo
              </h3>
              <ApplicationDocumentViewer documents={selected.documents} source={listQuery.data?.source} />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400">Review History</h3>
              {selected.history && selected.history.length > 0 ? (
                <div className="space-y-2">
                  {selected.history.map((event, idx) => (
                    <div key={`${event.at}-${idx}`} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{event.status.replaceAll('_', ' ')}</span>
                        <span className="text-slate-500 font-normal">{formatDateTime(event.at)}</span>
                      </div>
                      {event.actor && <p className="text-slate-400 mt-1">Reviewer: {event.actor}</p>}
                      {event.note && <p className="text-emerald-300 mt-1">Note: "{event.note}"</p>}
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
