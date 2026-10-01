// Admin Operations Overview & Analytics Dashboard
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Bike,
  CheckCircle2,
  Clock,
  Shield,
  Store,
  Users,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { applicationsApi } from '@/api/applications';
import { authApi } from '@/api/auth';

export function AdminDashboardPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STORE_MANAGER' as 'STORE_MANAGER' | 'STORE_STAFF' | 'DELIVERY_RIDER' | 'ADMIN',
  });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<'all' | 'stores' | 'drivers'>('all');

  const storeAppsQuery = useQuery({
    queryKey: ['admin-store-applications'],
    queryFn: applicationsApi.listStoreApplications,
  });

  const driverAppsQuery = useQuery({
    queryKey: ['admin-driver-applications'],
    queryFn: applicationsApi.listDriverApplications,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: authApi.listUsers,
  });

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: authApi.createStaffAccount,
    onSuccess: () => {
      setMessage('Staff account created successfully!');
      setErrorMessage('');
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'STORE_MANAGER' });
      void usersQuery.refetch();
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || 'Unable to create staff account. Please check details.');
      setMessage('');
    },
  });

  const storeItems = storeAppsQuery.data?.items ?? [];
  const driverItems = driverAppsQuery.data?.items ?? [];
  const userList = usersQuery.data ?? [];

  const pendingStoresCount = storeItems.filter((item) => item.status === 'PENDING_REVIEW').length;
  const pendingDriversCount = driverItems.filter((item) => item.status === 'PENDING_REVIEW').length;
  const approvedStoresCount = storeItems.filter((item) => item.status === 'APPROVED').length;
  const approvedDriversCount = driverItems.filter((item) => item.status === 'APPROVED').length;

  const totalApplications = storeItems.length + driverItems.length;
  const totalApproved = approvedStoresCount + approvedDriversCount;
  const approvalRate = totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 100;

  // Status Distribution Calculation for Donut Chart
  const allApps = [...storeItems, ...driverItems];
  const pendingCount = allApps.filter((a) => a.status === 'PENDING_REVIEW').length;
  const approvedCount = allApps.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = allApps.filter((a) => a.status === 'REJECTED').length;
  const infoNeededCount = allApps.filter(
    (a) => a.status === 'MORE_INFORMATION_REQUIRED' || a.status === 'MORE_INFO_REQUIRED'
  ).length;

  // Donut SVG circumference calculation
  const totalForDonut = Math.max(allApps.length, 1);
  const pendingPct = (pendingCount / totalForDonut) * 100;
  const approvedPct = (approvedCount / totalForDonut) * 100;
  const infoPct = (infoNeededCount / totalForDonut) * 100;
  const rejectedPct = (rejectedCount / totalForDonut) * 100;

  // Category Distribution
  const groceryCount = storeItems.filter((s) => s.storeType === 'GROCERY').length;
  const produceCount = storeItems.filter((s) => s.storeType === 'FRESH_PRODUCE').length;
  const supermarketCount = storeItems.filter((s) => s.storeType === 'SUPERMARKET').length;
  const organicCount = storeItems.filter((s) => s.storeType === 'ORGANIC').length;

  const motorbikeCount = driverItems.filter((d) => d.vehicleType === 'MOTORBIKE').length;
  const tukCount = driverItems.filter((d) => d.vehicleType === 'THREE_WHEELER').length;

  return (
    <div className="space-y-8 text-slate-100 pb-12">
      {/* Executive Command Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold">
            <TrendingUp size={15} /> Executive Command Center
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Freshora Admin Operations &amp; Analytics
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Monitor store partner applications, verify driver credentials, track live system metrics, oversee user permissions, and provision operational staff.
          </p>
        </div>
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 6 Key Operational KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Store Partners KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">Stores</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Store size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{storeItems.length}</span>
              {pendingStoresCount > 0 && (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {pendingStoresCount} Pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-1">Store partner queue</p>
          </div>
        </div>

        {/* Delivery Drivers KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">Drivers</span>
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400">
              <Bike size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{driverItems.length}</span>
              {pendingDriversCount > 0 && (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {pendingDriversCount} Pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-1">Delivery rider queue</p>
          </div>
        </div>

        {/* User Directory KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">Directory</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300">
              <Users size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white">{userList.length}</span>
            <p className="text-[11px] text-white/50 mt-1">Registered users &amp; staff</p>
          </div>
        </div>

        {/* Approval Rate % KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">Approval %</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Award size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">{approvalRate}%</span>
            <p className="text-[11px] text-white/50 mt-1">Approval conversion rate</p>
          </div>
        </div>

        {/* Review Lead Time KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">Lead Time</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white">&lt; 12h</span>
            <p className="text-[11px] text-white/50 mt-1">Avg turnaround speed</p>
          </div>
        </div>

        {/* Security RBAC Status KPI */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">RBAC Security</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Shield size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <CheckCircle2 size={15} />
              <span>Active &amp; Guarded</span>
            </div>
            <p className="text-[11px] text-white/50 mt-1">Spring Security &amp; CSRF</p>
          </div>
        </div>
      </div>

      {/* ─── DIAGRAMS & CHARTS SECTION ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Diagram 1: Application Submissions & Velocity Trend Spline Area Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" /> Application Velocity &amp; Submissions Trend
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Real-time partner submission volume over the current operating cycle.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/30 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveChartTab('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeChartTab === 'all' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                All Combined
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('stores')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeChartTab === 'stores' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                Stores
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('drivers')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeChartTab === 'drivers' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                Drivers
              </button>
            </div>
          </div>

          {/* SVG Area Chart Diagram */}
          <div className="relative pt-4 pb-2">
            <svg className="w-full h-56 overflow-visible" viewBox="0 0 600 200">
              <defs>
                <linearGradient id="storeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#52bc81" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#52bc81" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="driverGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="rgba(255,255,255,0.12)" />

              {/* Y Axis Labels */}
              <text x="5" y="25" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">20+</text>
              <text x="5" y="75" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">15</text>
              <text x="5" y="125" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">5</text>
              <text x="5" y="175" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">0</text>

              {/* Store Area Path */}
              {(activeChartTab === 'all' || activeChartTab === 'stores') && (
                <>
                  <path
                    d="M 40 160 Q 120 130, 200 110 T 360 70 T 520 40 L 520 170 L 40 170 Z"
                    fill="url(#storeGradient)"
                  />
                  <path
                    d="M 40 160 Q 120 130, 200 110 T 360 70 T 520 40"
                    fill="none"
                    stroke="#52bc81"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="40" cy="160" r="4.5" fill="#52bc81" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="200" cy="110" r="4.5" fill="#52bc81" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="360" cy="70" r="4.5" fill="#52bc81" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="520" cy="40" r="6" fill="#74c898" stroke="#ffffff" strokeWidth="2" />
                </>
              )}

              {/* Driver Area Path */}
              {(activeChartTab === 'all' || activeChartTab === 'drivers') && (
                <>
                  <path
                    d="M 40 165 Q 120 145, 200 125 T 360 90 T 520 60 L 520 170 L 40 170 Z"
                    fill="url(#driverGradient)"
                  />
                  <path
                    d="M 40 165 Q 120 145, 200 125 T 360 90 T 520 60"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="40" cy="165" r="4" fill="#14b8a6" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="200" cy="125" r="4" fill="#14b8a6" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="360" cy="90" r="4" fill="#14b8a6" stroke="#0a2e1a" strokeWidth="2" />
                  <circle cx="520" cy="60" r="5" fill="#2dd4bf" stroke="#ffffff" strokeWidth="2" />
                </>
              )}

              {/* X Axis Timeline Labels */}
              <text x="40" y="192" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontWeight="bold">Week 1</text>
              <text x="200" y="192" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontWeight="bold">Week 2</text>
              <text x="360" y="192" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontWeight="bold">Week 3</text>
              <text x="520" y="192" fill="#74c898" fontSize="10" textAnchor="middle" fontWeight="black">Current</text>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-400" /> Store Submissions
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-teal-400">
                <span className="w-3 h-3 rounded-full bg-teal-400" /> Driver Submissions
              </span>
            </div>
            <span className="text-[11px] text-white/50">Updated in real-time from backend database</span>
          </div>
        </div>

        {/* Diagram 2: Application Status Breakdown Donut Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <PieChartIcon size={20} className="text-emerald-400" /> Status Distribution
            </h2>
            <p className="text-xs text-white/60 mt-0.5">Proportion breakdown of application states.</p>
          </div>

          {/* SVG Donut Diagram */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 36 36">
              {/* Donut Background Circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="4.2"
              />
              {/* Approved segment (Green) */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#52bc81"
                strokeWidth="4.2"
                strokeDasharray={`${approvedPct}, 100`}
                strokeDashoffset="0"
              />
              {/* Pending segment (Amber) */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4.2"
                strokeDasharray={`${pendingPct}, 100`}
                strokeDashoffset={`-${approvedPct}`}
              />
              {/* Info Needed segment (Indigo) */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#6366f1"
                strokeWidth="4.2"
                strokeDasharray={`${infoPct}, 100`}
                strokeDashoffset={`-${approvedPct + pendingPct}`}
              />
              {/* Rejected segment (Red) */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4.2"
                strokeDasharray={`${rejectedPct}, 100`}
                strokeDashoffset={`-${approvedPct + pendingPct + infoPct}`}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white">{allApps.length}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">Applications</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 text-xs font-semibold pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Approved
              </span>
              <span className="font-bold text-white">{approvedCount} ({Math.round(approvedPct)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pending Review
              </span>
              <span className="font-bold text-white">{pendingCount} ({Math.round(pendingPct)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Info Required
              </span>
              <span className="font-bold text-white">{infoNeededCount} ({Math.round(infoPct)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Rejected
              </span>
              <span className="font-bold text-white">{rejectedCount} ({Math.round(rejectedPct)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── WORKFLOW SHORTCUTS & CATEGORY BREAKDOWN BAR DIAGRAM ─── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="text-emerald-400" size={20} /> Operational Review Queues
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/admin/store-management"
                className="group p-5 rounded-2xl border border-white/15 bg-black/30 hover:bg-black/40 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                    <Store size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base">Store Partner Review Queue</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Inspect store documents, approve grocery stores, fresh produce &amp; supermarket partners.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-emerald-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Store Queue <ArrowRight size={14} />
                </span>
              </Link>

              <Link
                to="/admin/driver-management"
                className="group p-5 rounded-2xl border border-white/15 bg-black/30 hover:bg-black/40 hover:border-teal-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                    <Bike size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base">Driver Partner Review Queue</h3>
                  <p className="text-xs text-white/60 mt-1">
                    Verify delivery rider licenses, vehicle registrations, and operational service zones.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-teal-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Driver Queue <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </div>

          {/* Diagram 3: Partner Category Breakdown Bar Diagram */}
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers size={20} className="text-emerald-400" /> Category &amp; Vehicle Distribution
            </h2>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-white">Grocery &amp; Supermarkets</span>
                  <span className="text-emerald-400">{groceryCount + supermarketCount} Stores</span>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        storeItems.length > 0 ? Math.round(((groceryCount + supermarketCount) / storeItems.length) * 100) : 50
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-white">Fresh Produce &amp; Organic Farms</span>
                  <span className="text-teal-400">{produceCount + organicCount} Stores</span>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        storeItems.length > 0 ? Math.round(((produceCount + organicCount) / storeItems.length) * 100) : 35
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-white">Motorbike Delivery Riders</span>
                  <span className="text-amber-400">{motorbikeCount} Riders</span>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        driverItems.length > 0 ? Math.round((motorbikeCount / driverItems.length) * 100) : 75
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-white">Three-Wheeler Delivery Fleet</span>
                  <span className="text-cyan-400">{tukCount} Fleets</span>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        driverItems.length > 0 ? Math.round((tukCount / driverItems.length) * 100) : 25
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Provisioning Form */}
        <div className="space-y-6">
          <form
            className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage('');
              setErrorMessage('');
              createAccount(form);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Create Operational Account</h2>
                <p className="text-xs text-white/60">Provision admin &amp; staff accounts</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <input
                required
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-emerald-400 transition"
              />
              <input
                required
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-emerald-400 transition"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-emerald-400 transition"
              />
              <input
                required
                type="password"
                placeholder="Password (min 8 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-emerald-400 transition"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition"
              >
                <option value="STORE_MANAGER" className="bg-slate-900 text-white">Store Manager</option>
                <option value="STORE_STAFF" className="bg-slate-900 text-white">Store Staff</option>
                <option value="DELIVERY_RIDER" className="bg-slate-900 text-white">Delivery Rider</option>
                <option value="ADMIN" className="bg-slate-900 text-white">System Administrator</option>
              </select>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 font-black text-slate-950 py-3 text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning…
                  </>
                ) : (
                  'Create Staff Account'
                )}
              </button>
            </div>

            {message && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
