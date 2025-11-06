/**
 * 코드 조회 API (캠퍼스, 기술, 포지션)
 * 백엔드 AUTH_API_SPEC_SIMPLE.md 기준
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse } from '@/types/common';

// ===== 타입 정의 =====

export interface Campus {
  id: number;
  name: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

interface CampusesResponse {
  campuses: Campus[];
}

interface SkillsResponse {
  skills: Skill[];
}

interface PositionsResponse {
  positions: Position[];
}

// ===== API 함수 =====

/**
 * 캠퍼스 목록 조회
 * @returns 캠퍼스 리스트 (5개)
 */
export const getCampuses = async (): Promise<ApiResponse<CampusesResponse>> => {
  return apiClient.get<CampusesResponse>(API_ENDPOINTS.codes.campuses);
};

/**
 * 기술 스택 목록 조회
 * @returns 기술 스택 리스트 (101개)
 */
export const getSkills = async (): Promise<ApiResponse<SkillsResponse>> => {
  return apiClient.get<SkillsResponse>(API_ENDPOINTS.codes.skills);
};

/**
 * 포지션 목록 조회
 * @returns 포지션 리스트 (11개)
 */
export const getPositions = async (): Promise<ApiResponse<PositionsResponse>> => {
  return apiClient.get<PositionsResponse>(API_ENDPOINTS.codes.positions);
};
