import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ProtectedRoute, GuestOnlyRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { StorePage } from '@/pages/StorePage';
import CartPage from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { OrderHistoryPage } from '@/pages/OrderHistoryPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { RoleDashboardPage } from '@/pages/RoleDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Layout with Navbar + Footer
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

// Auth layout — no navbar/footer
function AuthLayout() {
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/*
          AuthInitializer validates the persisted Zustand session against the
          server on every page load. Expired tokens clear the store so the UI
          doesn't falsely show the user as logged in.
        */}
        <AuthInitializer>
          <Routes>
            {/* ── Main layout (public pages) ── */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/store/:storeId" element={<StorePage />} />
              <Route path="/cart" element={<CartPage />} />
            </Route>

            {/* ── Authenticated-only pages (any role) ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* ── Customer dashboard ── */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/user-dashboard" element={<UserDashboardPage />} />
              </Route>
            </Route>

            {/* ── Admin dashboard ── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Route>

            {/* ── Store Manager dashboard ── */}
            <Route element={<ProtectedRoute allowedRoles={['STORE_MANAGER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/store-manager-dashboard" element={<RoleDashboardPage />} />
              </Route>
            </Route>

            {/* ── Store Staff dashboard ── */}
            <Route element={<ProtectedRoute allowedRoles={['STORE_STAFF']} />}>
              <Route element={<MainLayout />}>
                <Route path="/store-staff-dashboard" element={<RoleDashboardPage />} />
              </Route>
            </Route>

            {/* ── Delivery Rider dashboard ── */}
            <Route element={<ProtectedRoute allowedRoles={['DELIVERY_RIDER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/delivery-rider-dashboard" element={<RoleDashboardPage />} />
              </Route>
            </Route>

            {/* ── Auth routes — redirect away if already logged in ── */}
            <Route element={<GuestOnlyRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
