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

export interface NoticeSubcode {
  subCodeId: number;
  subcode: string;
  subcodeName: string;
  subcodeDescription: string;
}

export interface NoticeCategory {
  mainCode: string;
  mainCodeName: string;
  mainCodeDescription: string;
  subcodes: NoticeSubcode[];
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

/**
 * 공지사항 분류 코드 목록 조회
 * @returns 공지사항 카테고리 (메인 2개: 학사, 취업 / 서브 각 4개씩)
 */
export const getNoticeCategories = async (): Promise<ApiResponse<NoticeCategory[]>> => {
  return apiClient.get<NoticeCategory[]>(API_ENDPOINTS.codes.categories);
};

// ===== 카테고리 매핑 헬퍼 함수 =====

/**
 * 한글 카테고리명 → subCodeId[] 변환
 *
 * @param academicCategories 학사 카테고리 배열 (예: ["할일", "특강"])
 * @param careerCategories 취업 카테고리 배열 (예: ["정보", "이벤트"])
 * @param categories API로 받은 카테고리 데이터
 * @returns subCodeId 배열 (예: [1, 2, 7, 8])
 */
export const mapCategoriesToIds = (
  academicCategories: string[],
  careerCategories: string[],
  categories: NoticeCategory[]
): number[] => {
  const ids: number[] = [];

  // 학사 카테고리 매핑
  const eduCategory = categories.find(c => c.mainCode === 'EDU');
  if (eduCategory) {
    academicCategories.forEach(name => {
      const subcode = eduCategory.subcodes.find(s => s.subcodeName === name);
      if (subcode) {
        ids.push(subcode.subCodeId);
      }
    });
  }

  // 취업 카테고리 매핑
  const jobCategory = categories.find(c => c.mainCode === 'JOB');
  if (jobCategory) {
    careerCategories.forEach(name => {
      const subcode = jobCategory.subcodes.find(s => s.subcodeName === name);
      if (subcode) {
        ids.push(subcode.subCodeId);
      }
    });
  }

  return ids;
};
