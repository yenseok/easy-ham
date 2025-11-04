import { useMemo } from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import {
  filterNoticesByChannels,
  filterNoticesByCategories,
  filterNoticesBySearch,
  filterNoticesByPeriod,
  sortNotices,
} from '@/utils/filterUtils';
import type { Notice } from '@/types/notice';

interface UseNoticeFilterResult {
  filteredNotices: Notice[];
  totalCount: number;
  hasFilters: boolean;
}

/**
 * 공지사항을 필터링하는 훅
 *
 * Zustand FilterStore의 상태를 기반으로 공지를 필터링, 정렬합니다.
 * useMemo를 사용하여 의존성이 변경될 때만 재계산됩니다.
 *
 * @param notices - 필터링할 공지 목록
 * @returns 필터링된 공지 목록, 총 개수, 필터 적용 여부
 *
 * @example
 * const notices = getMockNotices();
 * const { filteredNotices, totalCount } = useNoticeFilter(notices);
 *
 * return <NoticeList notices={filteredNotices} count={totalCount} />;
 */
export const useNoticeFilter = (notices: Notice[]): UseNoticeFilterResult => {
  const {
    selectedChannels,
    selectedAcademicCategories,
    selectedCareerCategories,
    searchQuery,
    periodFilter,
    sortBy,
  } = useFilterStore();

  const filteredNotices = useMemo(() => {
    let result = notices;

    // 1. 채널 필터
    result = filterNoticesByChannels(result, selectedChannels);

    // 2. 카테고리 필터 (학사 + 취업 카테고리 합병)
    const allCategories = [
      ...selectedAcademicCategories,
      ...selectedCareerCategories,
    ];
    result = filterNoticesByCategories(result, allCategories);

    // 3. 검색 필터
    result = filterNoticesBySearch(result, searchQuery);

    // 4. 기간 필터
    result = filterNoticesByPeriod(result, periodFilter);

    // 5. 정렬
    result = sortNotices(result, sortBy);

    return result;
  }, [
    notices,
    selectedChannels,
    selectedAcademicCategories,
    selectedCareerCategories,
    searchQuery,
    periodFilter,
    sortBy,
  ]);

  // 필터가 적용되었는지 확인
  const hasFilters =
    selectedChannels.length > 0 ||
    selectedAcademicCategories.length > 0 ||
    selectedCareerCategories.length > 0 ||
    searchQuery.trim() !== '' ||
    periodFilter !== '전체' ||
    sortBy !== 'latest';

  return {
    filteredNotices,
    totalCount: filteredNotices.length,
    hasFilters,
  };
};
