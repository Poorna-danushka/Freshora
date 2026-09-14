import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('freshora_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('freshora_access_token');
      localStorage.removeItem('freshora_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
