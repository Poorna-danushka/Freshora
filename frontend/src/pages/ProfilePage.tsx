import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { authApi } from '@/api/auth';
import { usersApi, type AddressRecord } from '@/api/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Lock, Save, Plus, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' });
  const [addressForm, setAddressForm] = useState({ label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', postalCode: '', isDefault: true });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
    enabled: !!user,
    staleTime: 60_000,
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['profile-addresses'],
    queryFn: usersApi.getAddresses,
    enabled: !!user,
    staleTime: 60_000,
  });

  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null, [addresses]);

  const profileMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setProfileMessage('Profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => setProfileMessage('Unable to update your profile right now.'),
  });

  const addressMutation = useMutation({
    mutationFn: usersApi.createAddress,
    onSuccess: () => {
      setAddressMessage('Address saved successfully.');
      setAddressForm({ label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', postalCode: '', isDefault: true });
      queryClient.invalidateQueries({ queryKey: ['profile-addresses'] });
    },
    onError: () => setAddressMessage('Unable to save this address.'),
  });

  const passwordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setPasswordMessage('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => setPasswordMessage('Current password or validation failed.'),
  });

  const handleProfileSave = () => {
    profileMutation.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
    });
  };

  const handlePasswordSave = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New password and confirmation do not match.');
      return;
    }
    passwordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  const handleDeleteAddress = async (id: number) => {
    await usersApi.deleteAddress(id);
    queryClient.invalidateQueries({ queryKey: ['profile-addresses'] });
  };

  const handleSetDefaultAddress = async (id: number) => {
    await usersApi.setDefaultAddress(id);
    queryClient.invalidateQueries({ queryKey: ['profile-addresses'] });
  };

  const handleLogout = () => {
    useCartStore.getState().clearCart();
    logout();
    navigate('/login');
  };

  const profileName = profile?.name ?? user?.name ?? 'Freshora customer';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-8">Please sign in to view your profile and secure account settings.</p>
          <button onClick={() => navigate('/login')} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/30">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Profile</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{profileName}</h1>
              <p className="mt-2 text-gray-500">{profile?.email ?? user.email}</p>
            </div>
            <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{profile?.accountStatus ?? user.accountStatus ?? 'ACTIVE'}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Personal information</h2>
              </div>

              {profileLoading ? <p className="text-sm text-gray-500">Loading profile…</p> : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={profileForm.firstName} onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={profileForm.lastName} onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </div>
              )}

              {profileMessage && <p className="mt-4 text-sm text-emerald-700">{profileMessage}</p>}
              <button onClick={handleProfileSave} disabled={profileMutation.isPending} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                <Save className="h-4 w-4" /> {profileMutation.isPending ? 'Saving…' : 'Save profile'}
              </button>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Delivery addresses</h2>
                <div className="inline-flex items-center gap-2 text-sm text-emerald-700"><MapPin className="h-4 w-4" /> {addresses.length} saved</div>
              </div>

              {addressesLoading ? <p className="text-sm text-gray-500">Loading addresses…</p> : (
                <div className="space-y-3">
                  {addresses.length ? addresses.map((address: AddressRecord) => (
                    <div key={address.id} className={`rounded-2xl border p-4 ${address.isDefault ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{address.label}</p>
                            {address.isDefault && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Default</span>}
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{address.recipientName} • {address.phone}</p>
                          <p className="text-sm text-gray-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.district}{address.postalCode ? `, ${address.postalCode}` : ''}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!address.isDefault && <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs font-semibold text-emerald-700">Set default</button>}
                          <button onClick={() => handleDeleteAddress(address.id)} className="text-xs font-semibold text-red-600">Delete</button>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-500">No delivery addresses saved yet.</p>}
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-4">
                <h3 className="mb-3 font-semibold text-slate-900">Add address</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} placeholder="Home / Office" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.recipientName} onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))} placeholder="Recipient name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} placeholder="District" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.postalCode} onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value }))} placeholder="Postal code" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.addressLine1} onChange={(event) => setAddressForm((current) => ({ ...current, addressLine1: event.target.value }))} placeholder="Address line 1" className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                  <input value={addressForm.addressLine2} onChange={(event) => setAddressForm((current) => ({ ...current, addressLine2: event.target.value }))} placeholder="Address line 2 (optional)" className="sm:col-span-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </div>
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} /> Set as default address</label>
                {addressMessage && <p className="mt-3 text-sm text-emerald-700">{addressMessage}</p>}
                <button onClick={() => addressMutation.mutate(addressForm)} disabled={addressMutation.isPending} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> {addressMutation.isPending ? 'Saving…' : 'Add address'}</button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-slate-900">Account</h2>
              <dl className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between"><dt>Role</dt><dd className="font-semibold text-slate-900">{profile?.role ?? user.role ?? 'CUSTOMER'}</dd></div>
                <div className="flex items-center justify-between"><dt>Status</dt><dd className="font-semibold text-slate-900">{profile?.accountStatus ?? user.accountStatus ?? 'ACTIVE'}</dd></div>
                <div className="flex items-center justify-between"><dt>Email</dt><dd className="font-semibold text-slate-900">{profile?.email ?? user.email}</dd></div>
              </dl>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-slate-900">Security</h2>
              <div className="mt-4 space-y-3">
                <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="New password" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Confirm new password" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </div>
              {passwordMessage && <p className="mt-3 text-sm text-emerald-700">{passwordMessage}</p>}
              <button onClick={handlePasswordSave} disabled={passwordMutation.isPending} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> {passwordMutation.isPending ? 'Updating…' : 'Update password'}</button>
            </section>

            {defaultAddress && (
              <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-slate-900">Default address</h2>
                <p className="mt-3 text-sm text-gray-700">{defaultAddress.recipientName}</p>
                <p className="text-sm text-gray-600">{defaultAddress.addressLine1}, {defaultAddress.city}</p>
              </section>
            )}
          </aside>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center p-4 z-50">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">Log out?</h3>
            <p className="mt-2 text-sm text-gray-600">You will need to sign in again to access your Freshora account.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700">Cancel</button>
              <button onClick={handleLogout} className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white">Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
