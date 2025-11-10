/**
 * 공지사항 API 서비스
 * 현재는 Mock 데이터 반환, 추후 실제 API로 대체
 */

import type { Notice } from '@/types/notice';
import type { NoticeListParams } from '@/types/api';
import { getMockNotices } from '@/services/mock/mockNotices';
// import { apiClient } from './client';
// import { API_ENDPOINTS } from '@/constants/api';

export const noticesApi = {
  /**
   * 공지사항 목록 가져오기 (필터 적용 가능)
   */
  getAll: async (params?: NoticeListParams): Promise<Notice[]> => {
    // TODO: 실제 API 호출로 대체
    // const queryParams = new URLSearchParams();
    // if (params?.bookmarked !== undefined) queryParams.append('bookmarked', String(params.bookmarked));
    // if (params?.category) queryParams.append('category', params.category);
    // ... 기타 params 추가
    // const response = await apiClient.get<Notice[]>(`${API_ENDPOINTS.notices.list}?${queryParams}`);
    // return response.data;

    console.log('[공지사항 API] 목록 조회 (Mock):', params);

    // Mock 데이터 반환 (필터는 클라이언트에서 처리)
    return Promise.resolve(getMockNotices());
  },

  /**
   * 특정 공지사항 상세 조회
   */
  getById: async (id: number): Promise<Notice | null> => {
    // TODO: 실제 API 호출로 대체
    // const response = await apiClient.get<Notice>(API_ENDPOINTS.notices.detail(id));
    // return response.data;

    console.log('[공지사항 API] 상세 조회 (Mock):', id);
    const notices = getMockNotices();
    return Promise.resolve(notices.find((n) => n.id === id) || null);
  },

  /**
   * 완료 상태 토글
   */
  toggleComplete: async (id: number): Promise<Notice> => {
    // TODO: 실제 API 호출로 대체
    // const response = await apiClient.put<Notice>(`/notices/${id}/complete`, {});
    // return response.data;

    console.log('[공지사항 API] 완료 토글 (Mock):', id);
    const notices = getMockNotices();
    const notice = notices.find((n) => n.id === id);
    if (!notice) throw new Error('Notice not found');
    return Promise.resolve({ ...notice, completed: !notice.completed });
  },
};
