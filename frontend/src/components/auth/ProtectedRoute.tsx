import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { getDashboardPath } from '@/api/auth';
import type { User } from '@/types';

interface ProtectedRouteProps {
  /**
   * If provided, only users with one of these roles may access this route.
   * All other authenticated users are redirected to their own dashboard.
   */
  allowedRoles?: Array<NonNullable<User['role']>>;
}

/**
 * Route wrapper that enforces authentication and optional role checks.
 *
 * - Unauthenticated → redirect to /login (preserves intended location)
 * - Authenticated but wrong role → redirect to the user's own dashboard
 * - Authenticated and role matches → render the child route
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Preserve the URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role — send to the correct dashboard
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}

/**
 * Wrapper for auth pages (/login, /signup).
 * Redirects already-authenticated users to their dashboard.
 */
export function GuestOnlyRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
