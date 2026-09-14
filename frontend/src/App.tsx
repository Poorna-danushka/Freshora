import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
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
        <Routes>
          {/* Main layout routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/store/:storeId" element={<StorePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Auth routes — no navbar/footer */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
