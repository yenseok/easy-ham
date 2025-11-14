import { useState, useCallback } from 'react';
import { formatMonthYear, formatWeekRange, getWeekStart, getWeekDays } from '@/utils/dateUtils';

export type ViewMode = 'week' | 'month';

interface UseDateNavigationResult {
  /**
   * 현재 표시 중인 날짜
   */
  currentDate: Date;

  /**
   * 뷰 모드 (주간/월간)
   */
  viewMode: ViewMode;

  /**
   * 포맷된 헤더 텍스트
   */
  headerText: string;

  /**
   * 이전 기간으로 이동
   */
  goToPrevious: () => void;

  /**
   * 다음 기간으로 이동
   */
  goToNext: () => void;

  /**
   * 오늘로 이동
   */
  goToToday: () => void;

  /**
   * 뷰 모드 전환 (주간 <-> 월간)
   */
  toggleViewMode: () => void;

  /**
   * 특정 날짜로 이동
   */
  setCurrentDate: (date: Date) => void;

  /**
   * 현재 주의 7일 배열 반환
   */
  getWeekDaysArray: () => Date[];

  /**
   * 다음 기간 미리보기 (텍스트)
   */
  getNextPeriodText: () => string;

  /**
   * 이전 기간 미리보기 (텍스트)
   */
  getPreviousPeriodText: () => string;
}

/**
 * 캘린더 날짜 네비게이션을 관리하는 훅
 *
 * 주간/월간 뷰 전환, 날짜 이동, 포맷팅을 담당합니다.
 *
 * @param initialDate - 초기 날짜 (기본값: 오늘)
 * @returns 날짜 네비게이션 관련 상태와 함수
 *
 * @example
 * const {
 *   currentDate,
 *   viewMode,
 *   headerText,
 *   goToPrevious,
 *   goToNext,
 *   toggleViewMode,
 * } = useDateNavigation();
 *
 * return (
 *   <div>
 *     <h2>{headerText}</h2>
 *     <button onClick={goToPrevious}>이전</button>
 *     <button onClick={goToNext}>다음</button>
 *     <button onClick={toggleViewMode}>
 *       {viewMode === 'week' ? '월간' : '주간'}보기
 *     </button>
 *   </div>
 * );
 */
export const useDateNavigation = (
  initialDate: Date = new Date()
): UseDateNavigationResult => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  /**
   * 이전 기간으로 이동
   */
  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'week') {
        // 7일 전으로 이동
        newDate.setDate(prev.getDate() - 7);
      } else {
        // 한 달 전으로 이동
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  }, [viewMode]);

  /**
   * 다음 기간으로 이동
   */
  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'week') {
        // 7일 후로 이동
        newDate.setDate(prev.getDate() + 7);
      } else {
        // 한 달 후로 이동
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  }, [viewMode]);

  /**
   * 오늘로 이동
   */
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /**
   * 뷰 모드 전환 (주간 <-> 월간)
   */
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'week' ? 'month' : 'week'));
  }, []);

  /**
   * 포맷된 헤더 텍스트 반환
   */
  const headerText = (() => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return formatWeekRange(weekStart, weekEnd);
    } else {
      return formatMonthYear(currentDate);
    }
  })();

  /**
   * 현재 주의 7일 배열 반환
   */
  const getWeekDaysArray = useCallback(() => {
    const weekStart = getWeekStart(currentDate);
    return getWeekDays(weekStart);
  }, [currentDate]);

  /**
   * 다음 기간의 텍스트 미리보기
   */
  const getNextPeriodText = useCallback(() => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'week') {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() + 1);
    }

    if (viewMode === 'week') {
      const weekStart = getWeekStart(nextDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return formatWeekRange(weekStart, weekEnd);
    } else {
      return formatMonthYear(nextDate);
    }
  }, [currentDate, viewMode]);

  /**
   * 이전 기간의 텍스트 미리보기
   */
  const getPreviousPeriodText = useCallback(() => {
    const prevDate = new Date(currentDate);
    if (viewMode === 'week') {
      prevDate.setDate(currentDate.getDate() - 7);
    } else {
      prevDate.setMonth(currentDate.getMonth() - 1);
    }

    if (viewMode === 'week') {
      const weekStart = getWeekStart(prevDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return formatWeekRange(weekStart, weekEnd);
    } else {
      return formatMonthYear(prevDate);
    }
  }, [currentDate, viewMode]);

  return {
    currentDate,
    viewMode,
    headerText,
    goToPrevious,
    goToNext,
    goToToday,
    toggleViewMode,
    setCurrentDate,
    getWeekDaysArray,
    getNextPeriodText,
    getPreviousPeriodText,
  };
};
