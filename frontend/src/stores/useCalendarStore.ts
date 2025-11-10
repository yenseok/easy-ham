/**
 * 캘린더 페이지 전용 상태 관리 스토어
 *
 * - 1년치 이벤트 데이터 캐싱 (메모리)
 * - 필터 상태 관리
 * - Search API 통합
 * - SSE 실시간 업데이트 대응
 */

import { create } from 'zustand';
import { searchApi } from '@/services/api/search';
import { getNoticeCategories, mapCategoriesToIds, type NoticeCategory } from '@/services/api/codes';
import type { Notice, Subcategory } from '@/types/notice';
import type { SearchParams } from '@/types/api';

interface DateRange {
  start: string; // ISO 8601 timestamp
  end: string;   // ISO 8601 timestamp
}

interface CalendarState {
  // 데이터
  events: Notice[];           // 전체 이벤트 (1년치)
  loadedRange: DateRange | null; // 현재 로드된 기간
  isLoading: boolean;
  categories: NoticeCategory[]; // 카테고리 코드 데이터

  // 필터 상태
  selectedChannels: string[];
  selectedAcademicCategories: Subcategory[];
  selectedCareerCategories: Subcategory[];

  // 액션
  loadEvents: (centerDate: Date) => Promise<void>;
  addEvent: (event: Notice) => void; // SSE용 단일 이벤트 추가
  toggleChannel: (channel: string) => void;
  toggleAcademicCategory: (category: Subcategory) => void;
  toggleCareerCategory: (category: Subcategory) => void;
  resetFilters: () => void;
  loadCategories: () => Promise<void>;
}

/**
 * 날짜에서 ±6개월 범위 계산 (총 1년)
 */
const getOneYearRange = (centerDate: Date): DateRange => {
  const start = new Date(centerDate);
  start.setMonth(start.getMonth() - 6);
  start.setDate(1); // 6개월 전 1일
  start.setHours(0, 0, 0, 0);

  const end = new Date(centerDate);
  end.setMonth(end.getMonth() + 6); // 6개월 후
  end.setDate(0); // 전 달 마지막 날 = 6개월 후 말일
  end.setHours(23, 59, 59, 999);

  return {
    start: start.getTime().toString(),
    end: end.getTime().toString(),
  };
};

/**
 * 날짜가 범위 내에 있는지 확인
 */
const isDateInRange = (date: Date, range: DateRange | null): boolean => {
  if (!range) return false;
  const timestamp = date.getTime();
  return timestamp >= parseInt(range.start) && timestamp <= parseInt(range.end);
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // 초기 상태
  events: [],
  loadedRange: null,
  isLoading: false,
  categories: [],

  // 초기 필터: 전체 선택
  selectedChannels: [
    '13기-공지사항',
    '13기-취업공고',
    '13기-취업정보',
    '서울1반-공지사항',
  ],
  selectedAcademicCategories: ['할일', '특강', '정보', '행사'],
  selectedCareerCategories: ['할일', '특강', '정보', '행사'],

  /**
   * 카테고리 코드 로드
   */
  loadCategories: async () => {
    try {
      const response = await getNoticeCategories();
      set({ categories: response.data });
    } catch (error) {
      console.error('[캘린더] 카테고리 로드 실패:', error);
    }
  },

  /**
   * 1년치 이벤트 로드
   * @param centerDate 중심 날짜 (보통 현재 월)
   */
  loadEvents: async (centerDate: Date) => {
    const { isLoading, loadedRange } = get();

    // 이미 로딩 중이면 중단
    if (isLoading) return;

    // 이미 로드된 범위 내에 있으면 중단
    if (isDateInRange(centerDate, loadedRange)) {
      return;
    }

    set({ isLoading: true });

    try {
      const range = getOneYearRange(centerDate);

      // Search API 파라미터 구성
      // 캘린더는 "전체 데이터"가 필요하므로 필터는 적용 안 함
      const params: SearchParams = {
        startDate: range.start,
        endDate: range.end,
        page: 0,
        size: 2000, // 1년치 전체 가져오기 (충분한 크기)
      };

      const { notices } = await searchApi.searchPosts(params);

      // deadline이 있는 이벤트만 캘린더에 표시 (필수 조건)
      const calendarEvents = notices.filter(
        (notice) => notice.deadline !== null && notice.deadline !== undefined
      );

      set({
        events: calendarEvents,
        loadedRange: range,
        isLoading: false,
      });

      console.log(`[캘린더] ${calendarEvents.length}개 이벤트 로드 완료 (${new Date(parseInt(range.start)).toLocaleDateString()} ~ ${new Date(parseInt(range.end)).toLocaleDateString()})`);
      console.log('[캘린더] 로드된 이벤트 샘플:', calendarEvents.slice(0, 3).map(e => ({
        title: e.title,
        deadline: e.deadline,
        deadlineType: typeof e.deadline
      })));
    } catch (error) {
      console.error('[캘린더] 이벤트 로드 실패:', error);
      set({ isLoading: false });
    }
  },

  /**
   * SSE로 받은 새 이벤트 추가
   * @param event 새로 추가된 이벤트
   */
  addEvent: (event: Notice) => {
    set((state) => {
      // 중복 체크
      const exists = state.events.some((e) => e.id === event.id);
      if (exists) return state;

      // deadline 또는 startDate가 있는 경우만 추가
      if (!event.deadline && !event.startDate) return state;

      return { events: [...state.events, event] };
    });
  },

  /**
   * 채널 필터 토글
   */
  toggleChannel: (channel: string) =>
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(channel)
        ? state.selectedChannels.filter((c) => c !== channel)
        : [...state.selectedChannels, channel],
    })),

  /**
   * 학사 카테고리 필터 토글
   */
  toggleAcademicCategory: (category: Subcategory) =>
    set((state) => ({
      selectedAcademicCategories: state.selectedAcademicCategories.includes(category)
        ? state.selectedAcademicCategories.filter((c) => c !== category)
        : [...state.selectedAcademicCategories, category],
    })),

  /**
   * 취업 카테고리 필터 토글
   */
  toggleCareerCategory: (category: Subcategory) =>
    set((state) => ({
      selectedCareerCategories: state.selectedCareerCategories.includes(category)
        ? state.selectedCareerCategories.filter((c) => c !== category)
        : [...state.selectedCareerCategories, category],
    })),

  /**
   * 필터 초기화
   */
  resetFilters: () =>
    set({
      selectedChannels: [
        '13기-공지사항',
        '13기-취업공고',
        '13기-취업정보',
        '서울1반-공지사항',
      ],
      selectedAcademicCategories: ['할일', '특강', '정보', '행사'],
      selectedCareerCategories: ['할일', '특강', '정보', '행사'],
    }),
}));
