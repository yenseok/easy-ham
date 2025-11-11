/**
 * 할일 완료 API
 */

import { apiClient } from './client';

/**
 * 완료 토글 응답 데이터
 */
export interface CompletionToggleResponse {
  userId: number;
  userName: string;
  postId: number;
  postTitle: string;
  isCompleted: boolean;
}

export const completionsApi = {
  /**
   * 할일 완료/해제 토글
   * @param postId - 공지사항 ID
   * @returns 완료 상태 정보
   */
  toggle: async (postId: number): Promise<CompletionToggleResponse> => {
    const endpoint = `/post-completions/toggle?postId=${postId}`;

    const response = await apiClient.post<CompletionToggleResponse>(endpoint, {});

    return response.data;
  },
};
