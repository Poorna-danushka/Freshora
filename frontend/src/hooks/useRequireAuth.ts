import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const LOGIN_MESSAGE = 'Please log in or register before adding products to your cart.';

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated && state.user !== null);

  const requireAuth = () => {
    if (isAuthenticated) return true;

    navigate('/login', {
      state: {
        from: location,
        message: LOGIN_MESSAGE,
      },
    });
    return false;
  };

  return { isAuthenticated, requireAuth };
}
