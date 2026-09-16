import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const dashboardNames = {
  STORE_MANAGER: 'Store Manager Dashboard',
  STORE_STAFF: 'Store Staff Dashboard',
  DELIVERY_RIDER: 'Delivery Rider Dashboard',
} as const;

export function RoleDashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.role || user.role === 'CUSTOMER' || user.role === 'ADMIN') {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Freshora operations
        </p>
        <h1 className="mt-2 text-4xl font-black">{dashboardNames[user.role]}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Your role-based workspace is ready. Operational features will be added after the remaining business rules are finalized.
        </p>
      </div>
    </div>
  );
}
