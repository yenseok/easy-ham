/**
 * 북마크 API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  ApiResponse,
  BookmarksListParams,
  BookmarksListData,
  BookmarkToggleData,
} from '@/types/api';

export const bookmarksApi = {
  /**
   * 북마크 목록 조회
   */
  getList: async (params?: BookmarksListParams): Promise<BookmarksListData> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.bookmarks.list}?${queryString}`
      : API_ENDPOINTS.bookmarks.list;

    console.log('[북마크 API] 목록 조회:', endpoint);

    const response = await apiClient.get<BookmarksListData>(endpoint);
    console.log('[북마크 API] 응답:', response);

    return response.data;
  },

  /**
   * 북마크 추가
   */
  add: async (userNoticeId: number): Promise<BookmarkToggleData> => {
    const endpoint = API_ENDPOINTS.bookmarks.add(userNoticeId);
    console.log('[북마크 API] 추가 요청:', endpoint);

    const response = await apiClient.post<BookmarkToggleData>(endpoint, {});
    console.log('[북마크 API] 추가 응답:', response);

    return response.data;
  },

  /**
   * 북마크 삭제
   */
  remove: async (userNoticeId: number): Promise<BookmarkToggleData> => {
    const endpoint = API_ENDPOINTS.bookmarks.remove(userNoticeId);
    console.log('[북마크 API] 삭제 요청:', endpoint);

    const response = await apiClient.delete<BookmarkToggleData>(endpoint);
    console.log('[북마크 API] 삭제 응답:', response);

    return response.data;
  },

  /**
   * 북마크 토글 (추가/삭제)
   * @param userNoticeId - 공지사항 ID
   * @param isCurrentlyBookmarked - 현재 북마크 상태
   */
  toggle: async (
    userNoticeId: number,
    isCurrentlyBookmarked: boolean
  ): Promise<BookmarkToggleData> => {
    if (isCurrentlyBookmarked) {
      return await bookmarksApi.remove(userNoticeId);
    } else {
      return await bookmarksApi.add(userNoticeId);
    }
  },
};
