import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isGuest: false,
  userEmail: null,

  login: (email) => set({ isAuthenticated: true, isGuest: false, userEmail: email }),
  loginAsGuest: () => set({ isAuthenticated: true, isGuest: true, userEmail: 'misafir@lorekeeper' }),
  logout: () => set({ isAuthenticated: false, isGuest: false, userEmail: null }),
}));
