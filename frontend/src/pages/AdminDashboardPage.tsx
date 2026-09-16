import { BarChart3, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';

export function AdminDashboardPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STORE_MANAGER' as 'STORE_MANAGER' | 'STORE_STAFF' | 'DELIVERY_RIDER' | 'ADMIN',
  });
  const [message, setMessage] = useState('');
  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: authApi.createStaffAccount,
    onSuccess: () => {
      setMessage('Account created successfully.');
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'STORE_MANAGER' });
    },
    onError: () => setMessage('Unable to create account. Check the details and try again.'),
  });

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Admin dashboard</p>
          <h1 className="mt-2 text-4xl font-black">Freshora admin overview</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <Users className="mb-4 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Users</h2>
            <p className="mt-2 text-sm text-slate-300">Review active customer accounts and account roles.</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <BarChart3 className="mb-4 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Operations</h2>
            <p className="mt-2 text-sm text-slate-300">Monitor store activity, orders, and platform performance.</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <Shield className="mb-4 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Access control</h2>
            <p className="mt-2 text-sm text-slate-300">Use role-based permissions to keep admin and customer views separated.</p>
          </div>

          <form
            className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage('');
              createAccount(form);
            }}
          >
            <h2 className="text-xl font-bold text-white">Create staff account</h2>
            <p className="mt-2 text-sm text-slate-300">Only administrators can create operational accounts.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(['firstName', 'lastName', 'email', 'password'] as const).map((field) => (
                <input
                  key={field}
                  required
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  placeholder={field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field[0].toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              ))}
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as typeof form.role })}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="STORE_MANAGER">Store Manager</option>
                <option value="STORE_STAFF">Store Staff</option>
                <option value="DELIVERY_RIDER">Delivery Rider</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create account'}
              </button>
            </div>
            {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
