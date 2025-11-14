import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/user';

interface UseAuthResult {
  /**
   * 현재 로그인한 사용자
   */
  user: User | null;

  /**
   * 로그인 여부
   */
  isAuthenticated: boolean;

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 사용자 로그인 처리
   */
  login: (user: User) => void;

  /**
   * 사용자 로그아웃 처리 및 리다이렉트
   */
  logout: () => void;

  /**
   * 사용자 정보 업데이트
   */
  updateUser: (userData: Partial<User>) => void;

  /**
   * 사용자 정보 초기화
   */
  resetUser: () => void;
}

/**
 * 사용자 인증을 관리하는 훅
 *
 * Zustand AuthStore의 상태와 메서드를 래핑하고,
 * 로그인/로그아웃 후 네비게이션을 처리합니다.
 *
 * @returns 인증 관련 상태와 함수
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * const handleLogin = async (credentials) => {
 *   const user = await authenticateUser(credentials);
 *   login(user);
 *   // 자동으로 /dashboard로 이동
 * };
 *
 * const handleLogout = () => {
 *   logout(); // 자동으로 /로 이동
 * };
 *
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 *
 * return <Dashboard user={user} />;
 */
export const useAuth = (): UseAuthResult => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    updateUser: storeUpdateUser,
  } = useAuthStore();

  /**
   * 로그인 처리 (스토어 업데이트 + 네비게이션)
   */
  const login = useCallback(
    (userData: User) => {
      storeLogin(userData);
      // 로그인 후 대시보드로 이동
      navigate('/dashboard');
    },
    [storeLogin, navigate]
  );

  /**
   * 로그아웃 처리 (스토어 초기화 + 네비게이션)
   */
  const logout = useCallback(() => {
    storeLogout();
    // 로그아웃 후 홈으로 이동
    navigate('/');
  }, [storeLogout, navigate]);

  /**
   * 사용자 정보 업데이트
   */
  const updateUser = useCallback(
    (userData: Partial<User>) => {
      storeUpdateUser(userData);
    },
    [storeUpdateUser]
  );

  /**
   * 사용자 정보 초기화 (로그아웃과 달리 페이지 이동 없음)
   */
  const resetUser = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    resetUser,
  };
};
