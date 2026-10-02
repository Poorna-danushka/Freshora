import { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ProtectedRoute, GuestOnlyRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
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
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { AccountSetupPage } from '@/pages/AccountSetupPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { RoleDashboardPage } from '@/pages/RoleDashboardPage';
import { JoinFreshoraPage } from '@/pages/JoinFreshoraPage';
import { JoinStorePage } from '@/pages/JoinStorePage';
import { JoinStoreSuccessPage } from '@/pages/JoinStoreSuccessPage';
import { JoinDriverPage } from '@/pages/JoinDriverPage';
import { JoinDriverSuccessPage } from '@/pages/JoinDriverSuccessPage';
import { StoreManagementPage } from '@/pages/admin/StoreManagementPage';
import { DriverManagementPage } from '@/pages/admin/DriverManagementPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { StoreStaffPlaceholderPage, StoreWorkspacePage } from '@/pages/store/StoreWorkspacePages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

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

function AuthLayout() {
  return <Outlet />;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthInitializer>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/join" element={<JoinFreshoraPage />} />
              <Route path="/join/store" element={<JoinStorePage />} />
              <Route path="/join/store/success" element={<JoinStoreSuccessPage />} />
              <Route path="/join/driver" element={<JoinDriverPage />} />
              <Route path="/join/driver/success" element={<JoinDriverSuccessPage />} />
              <Route path="/store/:storeId" element={<StorePage />} />
              <Route path="/cart" element={<CartPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-applications" element={<MyApplicationsPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/user-dashboard" element={<UserDashboardPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/store-management" element={<StoreManagementPage />} />
                <Route path="/admin/driver-management" element={<DriverManagementPage />} />
                <Route path="/admin/user-management" element={<UserManagementPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STORE_MANAGER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/store-manager-dashboard" element={<RoleDashboardPage />} />
                <Route path="/store/staff" element={<StoreStaffPlaceholderPage title="Store staff" description="Approved store managers will invite staff who belong to this store only." />} />
                <Route path="/store/staff/invitations" element={<StoreStaffPlaceholderPage title="Staff invitations" description="Invitation tracking will use a dedicated store-staff API. It is not implemented yet." />} />
                <Route path="/store/staff/add" element={<StoreStaffPlaceholderPage title="Add store staff" description="Store managers can add staff only after the store is approved. This page does not create accounts yet." />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STORE_MANAGER', 'STORE_STAFF']} />}>
              <Route element={<MainLayout />}>
                <Route path="/store" element={<StoreWorkspacePage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STORE_STAFF']} />}>
              <Route element={<MainLayout />}>
                <Route path="/store-staff-dashboard" element={<RoleDashboardPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
              <Route element={<MainLayout />}>
                <Route path="/driver-dashboard" element={<RoleDashboardPage />} />
              </Route>
            </Route>

            <Route element={<GuestOnlyRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/setup-account" element={<AccountSetupPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
