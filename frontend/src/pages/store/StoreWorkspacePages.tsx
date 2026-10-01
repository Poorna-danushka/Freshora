import { Link } from 'react-router-dom';

export function StoreWorkspacePage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Store workspace</p>
        <h1 className="mt-2 text-4xl font-black">Store operations</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          This workspace is reserved for approved store managers and assigned store staff. Product, inventory, and order tools will be added in a later phase.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/store/staff" className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/40">
            <h2 className="font-bold text-white">Staff</h2>
            <p className="text-sm text-slate-400 mt-2">Manage staff for this store after approval.</p>
          </Link>
          <Link to="/store-manager-dashboard" className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-500/40">
            <h2 className="font-bold text-white">Manager dashboard</h2>
            <p className="text-sm text-slate-400 mt-2">Return to the current store manager overview.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StoreStaffPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Store staff workflow</p>
        <h1 className="mt-2 text-4xl font-black">{title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{description}</p>
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Store staff invitations are not available from the backend yet. This route is reserved so a store manager can add staff only after the store is approved. Staff accounts cannot create stores or approve applications.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/store/staff" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold">Staff</Link>
          <Link to="/store/staff/invitations" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold">Invitations</Link>
          <Link to="/store/staff/add" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold">Add staff</Link>
        </div>
      </div>
    </div>
  );
}
