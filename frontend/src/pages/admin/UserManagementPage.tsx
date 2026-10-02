import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Users, Shield, Plus, CheckCircle2, Clock } from 'lucide-react';
import { authApi } from '@/api/auth';
import type { User } from '@/types';

const EMPTY_USERS: User[] = [];

const ROLES = [
  { id: 'ALL', label: 'All Users' },
  { id: 'ADMIN', label: 'Administrators' },
  { id: 'STORE_MANAGER', label: 'Store Managers' },
  { id: 'STORE_STAFF', label: 'Store Staff' },
  { id: 'DRIVER', label: 'Drivers' },
  { id: 'CUSTOMER', label: 'Customers' },
];

export function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STORE_MANAGER' as 'STORE_MANAGER' | 'STORE_STAFF' | 'DRIVER' | 'ADMIN',
  });
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: authApi.listUsers,
  });

  const createAccountMutation = useMutation({
    mutationFn: authApi.createStaffAccount,
    onSuccess: () => {
      setModalSuccess('Staff account created successfully!');
      setModalError('');
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', role: 'STORE_MANAGER' });
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: Error) => {
      setModalError(err.message || 'Failed to create staff account.');
      setModalSuccess('');
    },
  });

  const userList = usersQuery.data ?? EMPTY_USERS;

  const rows = useMemo(() => {
    return userList.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const haystack = `${user.firstName || ''} ${user.lastName || ''} ${user.email} ${user.role} ${user.phone || ''}`.toLowerCase();
      return matchesRole && haystack.includes(query.toLowerCase().trim());
    });
  }, [userList, roleFilter, query]);

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">User & Staff Directory</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview registered platform users, operational staff, and system administrative accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition"
          >
            <RefreshCw size={14} className={usersQuery.isFetching ? 'animate-spin' : ''} />
            {usersQuery.isFetching ? 'Refreshing…' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => {
              setModalSuccess('');
              setModalError('');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus size={16} /> Create Staff
          </button>
        </div>
      </div>

      {/* Role Filters & Search */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROLES.map((r) => {
            const count = r.id === 'ALL' ? userList.length : userList.filter((u) => u.role === r.id).length;
            const active = roleFilter === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleFilter(r.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{r.label}</span>
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search directory by name, email, phone, or role..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading & Empty States */}
      {usersQuery.isLoading && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/60 text-center text-slate-400 text-sm">
          Loading user directory…
        </div>
      )}

      {!usersQuery.isLoading && rows.length === 0 && (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
          <p className="text-slate-300 font-bold">No users match this filter</p>
          <p className="text-xs text-slate-500">Try changing your search query or role selection.</p>
        </div>
      )}

      {/* Desktop User Table */}
      {!usersQuery.isLoading && rows.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Contact Email</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {rows.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {user.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3.5 text-slate-400">{user.phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : user.role === 'STORE_MANAGER'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : user.role === 'DRIVER'
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Shield size={12} /> {(user.role || 'CUSTOMER').replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.accountStatus !== 'DISABLED' && user.accountStatus !== 'SUSPENDED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {user.accountStatus !== 'DISABLED' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {user.accountStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-500 text-[11px]">#{user.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile User Cards */}
      {!usersQuery.isLoading && rows.length > 0 && (
        <div className="grid gap-3 md:hidden">
          {rows.map((user) => (
            <div key={user.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white text-base">
                    {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Account Provisioning Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" size={20} /> Provision Staff Account
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                createAccountMutation.mutate(createForm);
              }}
            >
              <input
                required
                type="text"
                placeholder="First name"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
              />
              <input
                required
                type="text"
                placeholder="Last name"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
              />
              <input
                required
                type="password"
                placeholder="Password (min 8 characters)"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
              />
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as typeof createForm.role })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="STORE_MANAGER">Store Manager</option>
                <option value="STORE_STAFF">Store Staff</option>
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">System Administrator</option>
              </select>

              {modalSuccess && <p className="text-xs text-emerald-400 font-bold">{modalSuccess}</p>}
              {modalError && <p className="text-xs text-red-400 font-bold">{modalError}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAccountMutation.isPending}
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 disabled:opacity-60"
                >
                  {createAccountMutation.isPending ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
