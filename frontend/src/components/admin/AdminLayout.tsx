import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Bike,
  LayoutDashboard,
  Store,
  Users,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ArrowUpRight,
  Leaf,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const LINKS = [
  { to: '/admin-dashboard', label: 'Overview & Analytics', icon: LayoutDashboard, end: true },
  { to: '/admin/store-management', label: 'Store Management', icon: Store },
  { to: '/admin/driver-management', label: 'Driver Management', icon: Bike },
  { to: '/admin/user-management', label: 'User & Staff Directory', icon: Users },
];

export function AdminLayout() {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 30%, #0d3b21 60%, #071c11 100%)' }}
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle grid texture overlay (Home Page Style) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top Header Navigation Bar (Home Page Style) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a2e1a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin-dashboard" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1a7a4a 0%, #52bc81 100%)',
                  boxShadow: '0 4px 14px rgba(82,188,129,0.35)',
                }}
              >
                <Leaf size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Fresh<span style={{ color: '#74c898' }}>ora</span>
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Admin Workspace
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live API Connected</span>
            </div>

            <button
              type="button"
              className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 backdrop-blur-md"
            >
              Public App <ArrowUpRight size={13} />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-white">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User'}</p>
                <p className="text-[10px] text-emerald-400 font-mono">System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-6 grid lg:grid-cols-[250px_1fr] gap-6">
        {/* Desktop Navigation Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-400 px-3 mb-3">
              Navigation
            </p>
            <nav className="space-y-1.5">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <link.icon size={17} className="shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-xs text-white/70 space-y-2 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck size={16} />
              <span>Permission Scope</span>
            </div>
            <p className="leading-relaxed text-[11px] text-white/60">
              Admin users review partner applications, manage platform access roles, and provision operational staff.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 max-w-full bg-[#0a2e1a] border-r border-white/15 p-5 space-y-6 z-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950">F</div>
                    <span className="font-extrabold text-white text-base">Freshora Admin</span>
                  </div>
                  <button type="button" className="p-2 rounded-xl text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-white/70 hover:bg-white/10'
                        }`
                      }
                    >
                      <link.icon size={18} />
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/15 text-xs text-white/70">
                <p className="font-semibold text-white mb-1">Logged in as {user?.email}</p>
                <p className="text-[11px]">Freshora Platform Control Center</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminStaffHint() {
  return (
    <div className="flex items-center gap-2 text-xs text-white/70 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md">
      <Users size={15} className="text-emerald-400 shrink-0" />
      <span>Store staff invitations belong to an approved store workspace, not this administrative review queue.</span>
    </div>
  );
}
