import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiErrorPayload {
  status?: number;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const parseApiError = (error: unknown): { status?: number; message: string; fieldErrors?: Record<string, string> } => {
  const axiosError = error as {
    response?: { status?: number; data?: ApiErrorPayload };
    code?: string;
  };

  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;

  if (payload?.message) {
    return {
      status,
      message: payload.message,
      fieldErrors: payload.fieldErrors,
    };
  }

  if (payload?.error) {
    return {
      status,
      message: payload.error,
      fieldErrors: payload.fieldErrors,
    };
  }

  if (status === 401) {
    return {
      status: 401,
      message: 'You must be logged in to perform this action. Please log in and try again.',
    };
  }

  if (status === 403) {
    return {
      status: 403,
      message: 'Access denied or request token expired. Please refresh the page and try again.',
    };
  }

  if (axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED') {
    return {
      status,
      message: "We couldn't connect to Freshora. Please check your connection and try again.",
    };
  }

  return {
    status,
    message: 'Something went wrong. Please try again.',
  };
};

const getCsrfToken = () => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// ── CSRF header on every state-changing request ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
      config.headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
// When an access token expires the backend returns 401. Instead of immediately
// redirecting to /login we first attempt POST /api/auth/refresh (the refresh
// token is in an HttpOnly cookie, so the browser sends it automatically).
// If refresh succeeds we retry the original request.
// If refresh fails we clear the auth store and send the user to /login.
//
// A simple flag prevents infinite retry loops and queues concurrent 401s so
// they all wait for a single refresh attempt rather than flooding the endpoint.

let isRefreshing = false;
// Each entry is a { resolve, reject } pair for a queued request.
type SubscriberCallback = (error: unknown) => void;
let failedQueue: Array<{ resolve: () => void; reject: SubscriberCallback }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? '');

    // Don't retry login / register / refresh endpoints — avoid infinite loops
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh — refresh cookie is sent automatically
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Refresh failed — clear persisted auth state and go to login
        useCartStore.getState().clearCart();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
