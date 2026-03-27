import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  register: (data: { name: string; email: string; password?: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const res = await authApi.loginUser(credentials);
          set({
            user: { _id: res.data._id, name: res.data.name, email: res.data.email },
            token: res.data.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Login failed', isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const res = await authApi.registerUser(data);
          set({
            user: { _id: res.data._id, name: res.data.name, email: res.data.email },
            token: res.data.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          set({ isLoading: true, error: null });
          const res = await authApi.getMe();
          set({
            user: { _id: res.data._id, name: res.data.name, email: res.data.email },
            isLoading: false,
          });
        } catch (error: any) {
          // Token might be invalid or expired
          set({ user: null, token: null, error: 'Session expired', isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // Used by apiClient interceptor
      partialize: (state) => ({ token: state.token, user: state.user }), // Persist only token and user
    }
  )
);
