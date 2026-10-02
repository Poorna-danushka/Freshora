import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';

export function AccountSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This account setup link is missing its token. Request a new link from Freshora support.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.setupAccount(token, password);
      navigate('/login?setup=complete', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Account setup failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Freshora Partner Access</p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900">Set up your account</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a password to activate your approved partner account.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-gray-700">
            New password
            <input
              className="input-field mt-1"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Confirm password
            <input
              className="input-field mt-1"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? 'Activating account…' : 'Activate account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">
          Already active? <Link className="font-semibold text-primary-700" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
