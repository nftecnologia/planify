import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user: User, tokens: AuthTokens) => {
        set({ 
          user, 
          tokens, 
          isAuthenticated: true, 
          isLoading: false 
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          tokens: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        // Limpar localStorage
        localStorage.removeItem('auth-storage');
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      
      updateTokens: (tokens: AuthTokens) => {
        set({ tokens });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      clearAuth: () => {
        set({ 
          user: null, 
          tokens: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);