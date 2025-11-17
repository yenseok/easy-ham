/**
 * 게시물/공지사항 상세조회 API
 * 검색 API를 통해 상세 정보를 조회합니다 (SearchResultItem 응답)
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, SearchResultItem } from '@/types/api';

// ===== API 함수 =====

/**
 * 게시물 상세조회
 * 검색 API (/search/posts/{id})를 통해 특정 게시물의 상세 정보를 조회합니다.
 * 응답은 SearchResultItem 타입으로 필드 매핑이 필요합니다.
 *
 * @param noticeId - 조회할 게시물 ID
 * @returns 게시물 상세 정보 (SearchResultItem)
 */
export const getPostDetail = async (
  noticeId: number
): Promise<ApiResponse<SearchResultItem>> => {
  return apiClient.get<SearchResultItem>(
    API_ENDPOINTS.posts.getDetail(noticeId)
  );
};