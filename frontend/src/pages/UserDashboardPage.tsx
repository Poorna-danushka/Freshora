import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">User dashboard</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">Welcome back to Freshora</h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            Browse store <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <ShoppingBag className="mb-4 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Orders</h2>
            <p className="mt-2 text-sm text-slate-600">Track your grocery orders and delivery progress.</p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <Sparkles className="mb-4 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Favorites</h2>
            <p className="mt-2 text-sm text-slate-600">Save your go-to produce, snacks, and essentials.</p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <ShieldCheck className="mb-4 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Account</h2>
            <p className="mt-2 text-sm text-slate-600">Manage your profile and delivery preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
