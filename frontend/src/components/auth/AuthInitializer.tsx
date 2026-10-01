import { useEffect, useRef } from 'react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

/**
 * Mounts once at the app root and validates the persisted session against the
 * server. On success the store is updated with fresh user data. On 401 the
 * store is cleared so the UI reflects the real session state.
 *
 * This prevents stale localStorage data from being treated as a valid session
 * after the JWT cookies have already expired.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const checked = useRef(false);

  useEffect(() => {
    // Only run once per app lifecycle
    if (checked.current) return;
    checked.current = true;

    // Only bother if we think we're logged in — avoids an unnecessary request
    // for completely fresh visitors.
    if (!isAuthenticated) {
      // Ensure any persisted cart for an unauthenticated visitor is cleared
      useCartStore.getState().clearCart();
      return;
    }

    authApi.getMe()
      .then((user) => setUser(user))
      .catch(() => {
        // Clear any stale cart and logout the store so the UI reflects the real session
        useCartStore.getState().clearCart();
        logout();
      }); // 401 or network error → clear stale state
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
