/**
 * 인증 관련 API
 * 백엔드 AUTH_API_SPEC_SIMPLE.md 기준
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse } from '@/types/common';

// ===== 타입 정의 =====

export interface LoginResponse {
  token: {
    access_token: string;
    refresh_token: string;
  };
  name: string;
  email: string;
  userId: number;
}

export interface SignupRequest {
  name: string;
  generation: number;
  classroom: number;
  email: string;
  campusId: number;
  positionIds?: number[];
  skillIds?: number[];
}

// ===== API 함수 =====

/**
 * SSO 로그인 URL 조회
 * @returns SSAFY SSO 로그인 페이지 URL
 */
export const getSsoLoginUrl = async (): Promise<ApiResponse<string>> => {
  return apiClient.get<string>(API_ENDPOINTS.auth.getSsoLoginUrl);
};

/**
 * 회원가입
 * @param data 회원가입 정보
 * @returns 성공 메시지
 */
export const signup = async (data: SignupRequest): Promise<ApiResponse<void>> => {
  return apiClient.post<void>(API_ENDPOINTS.users.signup, data);
};

/**
 * [Optional] 로그아웃
 * @returns 성공 메시지
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  return apiClient.post<void>(API_ENDPOINTS.auth.logout, {});
};
