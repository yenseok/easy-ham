/**
 * 인증 상태 관리 스토어
 * Zustand + localStorage 기반 토큰 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface SsoData {
  token: {
    access_token: string;
    refresh_token: string;
  };
  name: string;
  email: string;
  entRegn: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  ssoData: SsoData | null;

  // 액션
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setSsoData: (data: SsoData) => void;
  clearSsoData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      ssoData: null,

      login: (user, accessToken, refreshToken) => {
        // localStorage에도 저장 (API 클라이언트에서 사용)
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // localStorage에서 제거
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          ssoData: null,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        set({ accessToken, refreshToken });
      },

      setSsoData: (data: SsoData) => {
        set({ ssoData: data });
      },

      clearSsoData: () => {
        set({ ssoData: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
