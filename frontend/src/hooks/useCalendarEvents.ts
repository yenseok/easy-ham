import { useMemo } from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import { isSameDay, isCurrentMonth } from '@/utils/dateUtils';
import type { CalendarEvent } from '@/types/event';

interface UseCalendarEventsResult {
  /**
   * 현재 달의 모든 이벤트
   */
  eventsInMonth: CalendarEvent[];

  /**
   * 특정 날짜의 이벤트
   */
  getEventsForDate: (date: Date) => CalendarEvent[];

  /**
   * 특정 기간의 이벤트
   */
  getEventsInRange: (startDate: Date, endDate: Date) => CalendarEvent[];

  /**
   * 오늘의 이벤트
   */
  getTodayEvents: () => CalendarEvent[];

  /**
   * 다가오는 이벤트 (n일)
   */
  getUpcomingEvents: (days: number) => CalendarEvent[];
}

/**
 * 캘린더 이벤트를 관리하는 훅
 *
 * 필터 상태를 기반으로 이벤트를 필터링하고,
 * 날짜별로 이벤트를 조회할 수 있는 유틸리티 함수를 제공합니다.
 *
 * @param events - 모든 이벤트 목록
 * @param currentDate - 기준 날짜 (기본값: 오늘)
 * @returns 이벤트 조회 함수들
 *
 * @example
 * const { eventsInMonth, getEventsForDate } = useCalendarEvents(events);
 *
 * // 현재 달의 모든 이벤트
 * const monthEvents = eventsInMonth;
 *
 * // 특정 날짜의 이벤트
 * const dayEvents = getEventsForDate(new Date(2025, 10, 30));
 */
export const useCalendarEvents = (
  events: CalendarEvent[],
  currentDate: Date = new Date()
): UseCalendarEventsResult => {
  const {
    selectedChannels,
    selectedAcademicCategories,
    selectedCareerCategories,
  } = useFilterStore();

  /**
   * 필터 조건을 기반으로 이벤트를 필터링
   */
  const filterEvents = (eventsToFilter: CalendarEvent[]): CalendarEvent[] => {
    return eventsToFilter.filter((event) => {
      // 채널 필터
      if (
        selectedChannels.length > 0 &&
        !selectedChannels.includes(event.channel)
      ) {
        return false;
      }

      // 카테고리 필터 (학사 또는 취업)
      const allCategories = [
        ...selectedAcademicCategories,
        ...selectedCareerCategories,
      ];
      if (allCategories.length > 0 && !allCategories.includes(event.subcategory)) {
        return false;
      }

      return true;
    });
  };

  /**
   * 현재 달의 모든 이벤트 (필터 적용)
   */
  const eventsInMonth = useMemo(() => {
    const monthEvents = events.filter((event) =>
      isCurrentMonth(event.startDate, currentDate)
    );
    return filterEvents(monthEvents);
  }, [events, currentDate, selectedChannels, selectedAcademicCategories, selectedCareerCategories]);

  /**
   * 특정 날짜의 이벤트 반환
   */
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return filterEvents(
      events.filter((event) => isSameDay(event.startDate, date))
    );
  };

  /**
   * 특정 기간의 이벤트 반환 (startDate <= event.startDate <= endDate)
   */
  const getEventsInRange = (startDate: Date, endDate: Date): CalendarEvent[] => {
    return filterEvents(
      events.filter((event) => {
        const eventDate = event.startDate;
        return eventDate >= startDate && eventDate <= endDate;
      })
    );
  };

  /**
   * 오늘의 이벤트 반환
   */
  const getTodayEvents = (): CalendarEvent[] => {
    const today = new Date();
    return getEventsForDate(today);
  };

  /**
   * n일 이내의 이벤트 반환 (오늘 포함)
   */
  const getUpcomingEvents = (days: number): CalendarEvent[] => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    return getEventsInRange(today, futureDate);
  };

  return {
    eventsInMonth,
    getEventsForDate,
    getEventsInRange,
    getTodayEvents,
    getUpcomingEvents,
  };
};
