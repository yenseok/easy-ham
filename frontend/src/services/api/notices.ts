/**
 * 공지사항 API 서비스
 * 현재는 Mock 데이터 반환, 추후 실제 API로 대체
 */

import type { Notice } from '@/types/notice';
import { getMockNotices } from '@/services/mock/mockNotices';

export const noticesApi = {
  /**
   * 모든 공지사항 가져오기
   */
  getAll: async (): Promise<Notice[]> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<Notice[]>('/notices').then(res => res.data);
    return Promise.resolve(getMockNotices());
  },

  /**
   * 특정 공지사항 가져오기
   */
  getById: async (id: number): Promise<Notice | null> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<Notice>(`/notices/${id}`).then(res => res.data);
    const notices = getMockNotices();
    return Promise.resolve(notices.find((n) => n.id === id) || null);
  },

  /**
   * 북마크 토글
   */
  toggleBookmark: async (id: number): Promise<Notice> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.put<Notice>(`/notices/${id}/bookmark`, {}).then(res => res.data);
    const notices = getMockNotices();
    const notice = notices.find((n) => n.id === id);
    if (!notice) throw new Error('Notice not found');
    return Promise.resolve({ ...notice, bookmarked: !notice.bookmarked });
  },

  /**
   * 완료 상태 토글
   */
  toggleComplete: async (id: number): Promise<Notice> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.put<Notice>(`/notices/${id}/complete`, {}).then(res => res.data);
    const notices = getMockNotices();
    const notice = notices.find((n) => n.id === id);
    if (!notice) throw new Error('Notice not found');
    return Promise.resolve({ ...notice, completed: !notice.completed });
  },
};
