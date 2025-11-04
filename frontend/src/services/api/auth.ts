/**
 * 인증 API 서비스
 * 현재는 Mock 데이터 반환, 추후 실제 API로 대체
 */

import type { User } from '@/types/user';
import { getMockUser } from '@/services/mock/mockUser';

export const authApi = {
  /**
   * 로그인
   */
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.post<User>('/auth/login', credentials).then(res => res.data);
    return Promise.resolve(getMockUser());
  },

  /**
   * SSAFY SSO 로그인
   */
  loginWithSSAFY: async (): Promise<User> => {
    // TODO: 실제 SSO 로그인 로직
    // window.location.href = '/api/auth/ssafy';
    return Promise.resolve(getMockUser());
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.post<void>('/auth/logout', {}).then(res => res.data);
    return Promise.resolve();
  },

  /**
   * 현재 사용자 정보 가져오기
   */
  getCurrentUser: async (): Promise<User> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<User>('/auth/me').then(res => res.data);
    return Promise.resolve(getMockUser());
  },

  /**
   * 사용자 정보 업데이트
   */
  updateUser: async (userData: Partial<User>): Promise<User> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.put<User>('/auth/me', userData).then(res => res.data);
    const currentUser = getMockUser();
    return Promise.resolve({ ...currentUser, ...userData });
  },
};
