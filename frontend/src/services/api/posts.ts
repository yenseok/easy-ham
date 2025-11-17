/**
 * 게시물/공지사항 상세조회 API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse } from '@/types/api';

// ===== 타입 정의 =====

/**
 * 게시물 상세조회 응답
 */
export interface PostDetailResponse {
  id: number; // posts 테이블의 id
  postId: string; // Mattermost post ID
  channelId: string; // Mattermost channel ID
  channelName: string; // 채널 이름
  teamName: string; // 팀 이름
  userId: string; // Mattermost user ID
  userName: string; // 작성자명
  title: string; // 게시물 제목
  content: string; // 게시물 본문 (마크다운)
  mainCategory: string; // 대카테고리 ("학사", "취업" 등)
  subCategory: string; // 소카테고리 ("할일", "특강", "정보", "행사" 등)
  deadline: string | null; // 마감기한 (ISO 8601 형식)
  campusList: string | null; // 캠퍼스 목록
  createdAt: string; // 작성일 (ISO 8601 형식)
  updatedAt?: string; // 수정일 (ISO 8601 형식)
  fileIds: string; // 파일 ID 목록 (쉼표 구분)
  webhookTimestamp: number; // 웹훅 타임스탬프
  positionId: string | null; // 직위 ID
  positionName: string | null; // 직위명
  url: string | null; // 외부 URL
  position: string | null; // 위치 정보
}

// ===== API 함수 =====

/**
 * 게시물 상세조회
 * 특정 게시물의 상세 정보를 조회하는 API
 * @param noticeId - 조회할 게시물 ID (posts 테이블의 id)
 * @returns 게시물 상세 정보
 */
export const getPostDetail = async (
  noticeId: number
): Promise<ApiResponse<PostDetailResponse>> => {
  return apiClient.get<PostDetailResponse>(
    API_ENDPOINTS.posts.getDetail(noticeId)
  );
};
