import { Link, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingCart, Package, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export function MobileBottomNav() {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());

  const navItems = [
    { to: '/',        icon: Home,         label: 'Home'   },
    { to: '/#stores', icon: Store,        label: 'Stores' },
    { to: '/cart',    icon: ShoppingCart, label: 'Cart',  badge: totalItems > 0 ? totalItems : undefined },
    { to: '/orders',  icon: Package,      label: 'Orders' },
    { to: '/profile', icon: User,         label: 'Me'     },
  ];

  const isActive = (to: string) =>
    to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(to.split('#')[0]) && to !== '/';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-[62px] px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 active:scale-90"
            >
              {/* Active pill background */}
              {active && (
                <span
                  className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: '42px',
                    height: '32px',
                    background: 'linear-gradient(135deg, rgba(26,122,74,0.12) 0%, rgba(82,188,129,0.08) 100%)',
                  }}
                />
              )}

              {/* Icon + badge */}
              <div className="relative z-10">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{
                    color: active ? '#1a7a4a' : '#9ca3af',
                    filter: active ? 'drop-shadow(0 2px 6px rgba(26,122,74,0.35))' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
                {badge !== undefined && badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2.5 text-white text-[9px] font-black px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #1a7a4a, #f97316)',
                      boxShadow: '0 2px 6px rgba(26,122,74,0.4)',
                    }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-semibold leading-none transition-all duration-200 z-10"
                style={{ color: active ? '#1a7a4a' : '#9ca3af' }}
              >
                {label}
              </span>

              {/* Bottom dot accent */}
              {active && (
                <span
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 4, height: 4, background: '#1a7a4a', opacity: 0.7 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
