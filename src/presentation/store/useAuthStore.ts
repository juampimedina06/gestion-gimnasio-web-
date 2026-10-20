import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession } from '../../core/auth/models/auth.types';

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  setUser: (user: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: UserSession) =>
        set({
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'gestion-gimnasio-auth',
    }
  )
);
