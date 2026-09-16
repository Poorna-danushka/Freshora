import {
  ShoppingCart, Search, MapPin, ChevronDown,
  Menu, X, User, Package, UserCircle, Leaf, LogOut,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LocationModal } from '@/components/location/LocationModal';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useLocationStore } from '@/store/useLocationStore';
import { authApi } from '@/api/auth';

export function Navbar() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedLocation } = useLocationStore();
  const { activeStore } = useActiveStoreStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && activeStore)
      navigate(`/store/${activeStore.id}?search=${encodeURIComponent(searchQuery)}`);
  };

  // On landing page + not scrolled → dark forest green bar (matches hero)
  // Otherwise                        → crisp frosted-glass white bar
  const darkMode = isLanding && !scrolled;

  return (
    <>
      <nav
        className="sticky top-0 z-40 transition-all duration-500"
        style={
          darkMode
            ? {
                background: 'rgba(10, 46, 26, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(82,188,129,0.15)',
                boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
              }
            : {
                background: 'rgba(255,255,255,0.94)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
              }
        }
      >
        <div className="container-app">
          <div className="flex items-center h-16 gap-3">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #1a7a4a 0%, #52bc81 100%)',
                  boxShadow: darkMode
                    ? '0 4px 14px rgba(82,188,129,0.35)'
                    : '0 4px 14px rgba(26,122,74,0.3)',
                }}
              >
                <Leaf size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <span
                className="font-extrabold text-xl tracking-tight hidden sm:block transition-colors duration-300"
                style={{ color: darkMode ? '#ffffff' : '#111827' }}
              >
                Fresh
                <span style={{ color: darkMode ? '#74c898' : '#1a7a4a' }}>ora</span>
              </span>
            </Link>

            {/* ── Location pill ─────────────────────────────────────── */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-left min-w-0 max-w-[180px] group"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : '#fff',
                border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.14)' : '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : '#fff')}
            >
              <MapPin size={13} style={{ color: darkMode ? '#74c898' : '#1a7a4a', flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-[9px] font-medium leading-none" style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>
                  Deliver to
                </p>
                <p className="text-xs font-bold truncate mt-0.5" style={{ color: darkMode ? '#fff' : '#111827' }}>
                  {selectedLocation ? selectedLocation.name : 'Select area'}
                </p>
              </div>
              <ChevronDown
                size={11}
                style={{ color: darkMode ? 'rgba(255,255,255,0.35)' : '#9ca3af', flexShrink: 0 }}
                className="group-hover:translate-y-0.5 transition-transform duration-200"
              />
            </button>

            {/* ── Search ────────────────────────────────────────────── */}
            <form onSubmit={handleSearch} className={`flex-1 hidden md:block transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                  style={{ color: searchFocused ? '#1a7a4a' : darkMode ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={activeStore ? `Search in ${activeStore.name}…` : 'Search fresh produce, snacks…'}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                  style={
                    searchFocused
                      ? {
                          background: '#fff',
                          border: '1.5px solid #1a7a4a',
                          boxShadow: '0 0 0 3px rgba(26,122,74,0.1)',
                          color: '#111827',
                        }
                      : darkMode
                      ? {
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                        }
                      : {
                          background: '#f3f4f6',
                          border: '1px solid transparent',
                          color: '#111827',
                        }
                  }
                />
                {/* Placeholder color override */}
                <style>{`
                  nav input::placeholder {
                    color: ${searchFocused ? '#9ca3af' : darkMode ? 'rgba(255,255,255,0.35)' : '#9ca3af'};
                  }
                `}</style>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700 transition-colors"
                    style={{ color: '#9ca3af' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </form>

            {/* ── Active store chip ──────────────────────────────────── */}
            {activeStore && (
              <Link
                to={`/store/${activeStore.id}`}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#f0faf5',
                  border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #c5e7d3',
                }}
              >
                <div className="w-5 h-5 rounded-md overflow-hidden">
                  <img src={activeStore.logo} alt={activeStore.name} className="w-full h-full object-cover" />
                </div>
                <span
                  className="text-xs font-bold max-w-[90px] truncate"
                  style={{ color: darkMode ? '#74c898' : '#157040' }}
                >
                  {activeStore.name}
                </span>
              </Link>
            )}

            {/* ── Right actions ─────────────────────────────────────── */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl transition-all duration-200 group"
                style={{ color: darkMode ? 'rgba(255,255,255,0.75)' : '#4b5563' }}
                onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ShoppingCart size={20} className="group-hover:text-primary-500 transition-colors" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{
                      minWidth: 18,
                      minHeight: 18,
                      padding: '0 4px',
                      background: 'linear-gradient(135deg, #1a7a4a, #f97316)',
                      boxShadow: '0 2px 8px rgba(26,122,74,0.5)',
                    }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Account — authenticated */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl transition-all duration-200"
                    onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')}
                    onMouseLeave={e => !dropdownOpen && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #52bc81 100%)', boxShadow: '0 3px 10px rgba(26,122,74,0.35)' }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      size={13}
                      className={`transition-all duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}
                    />
                  </button>

                  {/* Dropdown panel */}
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden transition-all duration-200 origin-top-right ${
                      dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none'
                    }`}
                    style={{
                      background: 'rgba(255,255,255,0.97)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f0faf5, #fff)' }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #1a7a4a, #52bc81)' }}
                        >
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                          <UserCircle size={14} className="text-primary-600" />
                        </div>
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                          <Package size={14} className="text-amber-600" />
                        </div>
                        My Orders
                      </Link>
                      <div className="mx-2 my-1.5 h-px bg-gray-100" />
                      <button
                        onClick={async () => {
                          await authApi.logout();
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-500 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut size={14} className="text-red-500" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                    style={{ color: darkMode ? 'rgba(255,255,255,0.75)' : '#4b5563' }}
                    onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      background: 'linear-gradient(135deg, #1a7a4a 0%, #157040 100%)',
                      boxShadow: '0 4px 14px rgba(26,122,74,0.4)',
                    }}
                  >
                    <User size={14} />
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl transition-all duration-200"
                style={{ color: darkMode ? 'rgba(255,255,255,0.75)' : '#4b5563' }}
                onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* ── Mobile search ────────────────────────────────────────── */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fresh produce, snacks…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:bg-white transition-all duration-200"
                />
              </div>
            </form>
          </div>
        </div>

        {/* ── Mobile menu drawer ───────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="container-app py-4 space-y-1">
            {isAuthenticated ? (
              <>
                <div
                  className="flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #f0faf5, #e8f5ee)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1a7a4a, #52bc81)' }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                  <UserCircle size={17} className="text-primary-500" /> My Profile
                </Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                  <Package size={17} className="text-amber-500" /> My Orders
                </Link>
                <div className="mx-3 my-1 h-px bg-gray-100" />
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-medium transition-colors"
                >
                  <LogOut size={17} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1 pb-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #1a7a4a, #157040)', boxShadow: '0 4px 14px rgba(26,122,74,0.35)' }}
                >
                  <User size={16} /> Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </>
  );
}
