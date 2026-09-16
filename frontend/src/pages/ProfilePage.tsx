import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Package, MapPin, CreditCard, Bell, Settings, 
  HelpCircle, FileText, LogOut, ChevronRight, 
  Edit2, Lock 
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-8">Please sign in to view your profile, track orders, and manage settings.</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/30"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const accountMenu = [
    { label: 'My Orders', icon: Package, color: 'bg-blue-50 text-blue-600', link: '/orders' },
    { label: 'Saved Addresses', icon: MapPin, color: 'bg-green-50 text-green-600', link: '#soon' },
    { label: 'Payment Methods', icon: CreditCard, color: 'bg-purple-50 text-purple-600', link: '#soon' },
    { label: 'Notifications', icon: Bell, color: 'bg-amber-50 text-amber-600', link: '#soon' },
  ];

  const supportMenu = [
    { label: 'Preferences', icon: Settings, color: 'bg-gray-50 text-gray-600', link: '#soon' },
    { label: 'Help & Support', icon: HelpCircle, color: 'bg-cyan-50 text-cyan-600', link: '#soon' },
    { label: 'Terms & Privacy', icon: FileText, color: 'bg-indigo-50 text-indigo-600', link: '#soon' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mt-4 sm:mt-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border-4 border-white shadow-md relative overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
            <p className="text-gray-500 mb-1">{user.email}</p>
            <p className="text-gray-400 text-sm">{user.phone || 'No phone added'}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-100 fill-mode-both">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Orders</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Saved</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">2024</div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Member since</div>
          </div>
        </div>

        {/* Menu Group 1: My Account */}
        <div className="mt-8 mb-6 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-200 fill-mode-both">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">My Account</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {accountMenu.map((item, idx) => {
              const isLast = idx === accountMenu.length - 1;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.label}
                  to={item.link === '#soon' ? '#' : item.link}
                  onClick={(e) => {
                    if (item.link === '#soon') {
                      e.preventDefault();
                      alert('Coming soon!');
                    }
                  }}
                  className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Menu Group 2: Support & Settings */}
        <div className="mb-8 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-300 fill-mode-both">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">Support & Settings</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {supportMenu.map((item, idx) => {
              const isLast = idx === supportMenu.length - 1;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.label}
                  to={item.link === '#soon' ? '#' : item.link}
                  onClick={(e) => {
                    if (item.link === '#soon') {
                      e.preventDefault();
                      alert('Coming soon!');
                    }
                  }}
                  className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 delay-500 fill-mode-both">
          {showLogoutConfirm ? (
            <div className="bg-red-50 rounded-2xl p-4 flex items-center justify-between border border-red-100">
              <span className="text-red-700 font-medium">Are you sure you want to sign out?</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium shadow-sm shadow-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center p-4 bg-white hover:bg-red-50 text-red-600 rounded-2xl border border-red-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 bg-red-100 text-red-600">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="flex-1 font-medium text-left">Sign Out</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
