import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStoreStr = localStorage.getItem('auth-storage');
    if (authStoreStr) {
      try {
        const { state } = JSON.parse(authStoreStr);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token from localStorage', error);
      }
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Global Errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g. clear store, redirect to login)
      if (typeof window !== 'undefined') {
        // We will handle clearing the store via the auth store itself
        // but can optionally force a page reload or dispatch an event here
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
