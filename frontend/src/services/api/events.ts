/**
 * 캘린더 이벤트 API 서비스
 * 현재는 Mock 데이터 반환, 추후 실제 API로 대체
 * Note: 이벤트는 mockNotices의 일부 (시간/날짜 정보 있음)
 */

import type { Notice } from '@/types/notice';
import { getMockNotices } from '@/services/mock/mockNotices';

// Notice 타입을 CalendarEvent로 변환하는 헬퍼
const noticeToCalendarEvent = (notice: Notice) => notice;

export const eventsApi = {
  /**
   * 모든 이벤트 가져오기 (시간/날짜 정보가 있는 공지만)
   */
  getAll: async (): Promise<Notice[]> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<Notice[]>('/events').then(res => res.data);
    const notices = getMockNotices();
    return Promise.resolve(notices.filter((n) => n.startDate));
  },

  /**
   * 특정 날짜 범위의 이벤트 가져오기
   */
  getByDateRange: async (
    startDate: Date,
    endDate: Date
  ): Promise<Notice[]> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<Notice[]>(`/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`).then(res => res.data);
    const notices = getMockNotices().filter((n) => n.startDate);
    return Promise.resolve(
      notices.filter((notice) => {
        const eventStart = new Date(notice.startDate || '');
        const eventEnd = new Date(notice.endDate || notice.startDate || '');
        return eventStart <= endDate && eventEnd >= startDate;
      })
    );
  },

  /**
   * 특정 이벤트 가져오기
   */
  getById: async (id: number): Promise<Notice | null> => {
    // TODO: 실제 API 호출로 대체
    // return apiClient.get<Notice>(`/events/${id}`).then(res => res.data);
    const notices = getMockNotices();
    const notice = notices.find((n) => n.id === id && n.startDate);
    return Promise.resolve(notice || null);
  },
};
