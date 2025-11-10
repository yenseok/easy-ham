import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layouts/PageLayout';
import { NoticeListContainer } from './components/NoticeListContainer';
import { SearchFilterBar } from './components/SearchFilterBar';
import { MiniCalendar } from './components/MiniCalendar';
import { JobPostingsWidget } from './components/JobPostingsWidget';
import { MessageDetailModal, type MessageDetail } from '@/components/modals/MessageDetailModal';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFilterStore } from '@/stores/useFilterStore';
import { getMockJobPostings } from '@/services/mock';
import { bookmarksApi } from '@/services/api/bookmarks';
import { searchApi } from '@/services/api/search';
import { getNoticeCategories, mapCategoriesToIds, type NoticeCategory } from '@/services/api/codes';
import { getPeriodRange } from '@/utils/dateUtils';
import type { Notice } from '@/types';
import type { SearchParams } from '@/types/api';

export default function SearchPage() {
  const navigate = useNavigate();

  // Zustand 필터 스토어
  const filterStore = useFilterStore();
  const {
    selectedChannels,
    selectedAcademicCategories,
    selectedCareerCategories,
    searchQuery,
    periodFilter,
    sortBy,
    showBookmarkedOnly,
    toggleChannel,
    toggleAcademicCategory,
    toggleCareerCategory,
    setSearchQuery,
    setPeriodFilter,
    setSortBy,
    toggleBookmarkFilter,
    resetFilters,
  } = filterStore;

  // 검색 결과 상태
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 상태 추적
  // true: 사용자가 검색 버튼을 클릭해서 필터 적용
  // false: 초기 로드 상태 (전체 검색)
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);

  // 모달 상태
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 카테고리 데이터 (API에서 받아온 카테고리 목록)
  const [categories, setCategories] = useState<NoticeCategory[]>([]);

  /**
   * 카테고리 데이터 로드
   * 컴포넌트 마운트 시 1회 실행
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getNoticeCategories();
        setCategories(response.data);
        // console.log('[카테고리 API] 로드 성공:', response.data);
      } catch (error) {
        // console.error('[카테고리 API] 로드 실패:', error);
        toast.error('카테고리 정보를 불러오지 못했습니다.');
      }
    };

    fetchCategories();
  }, []);

  /**
   * 필터 → 검색 파라미터 변환
   * Zustand 필터 상태를 API 파라미터로 변환합니다.
   *
   * "모든 것 선택 = 필터 없음" 원칙:
   * - 채널 4개 모두 선택 → channelIds 제외
   * - 카테고리 8개 모두 선택 → categoryIds 제외
   * - 기간 "전체" → startDate/endDate 제외
   *
   * @param page - 페이지 번호
   * @param size - 페이지 크기
   * @param applyFilters - true면 필터 적용, false면 전체 검색
   */
  const buildSearchParams = (page: number, size: number, applyFilters: boolean): SearchParams => {
    // 전체 검색 (초기 로드): page, size만 전송
    if (!applyFilters) {
      return {
        page,
        size,
      };
    }

    // 필터 적용된 검색
    const params: SearchParams = {
      page,
      size,
    };

    // 1. 키워드 필터
    if (searchQuery && searchQuery.trim().length > 0) {
      params.keyword = searchQuery.trim();
    }

    // 2. 채널 필터
    // ⚠️ TODO: [백엔드 채널 API 연동 후 수정 필요]
    // 현재: 하드코딩된 4개 채널 (CHANNEL_OPTIONS에서 "전체" 제외)
    // 나중에: 백엔드에서 받은 사용자별 availableChannels.length와 비교
    const TOTAL_CHANNELS = 4;
    const isAllChannelsSelected = selectedChannels.length === TOTAL_CHANNELS;
    if (!isAllChannelsSelected && selectedChannels.length > 0) {
      params.channelIds = selectedChannels;
    }

    // 3. 카테고리 필터
    // 학사 4개 + 취업 4개 = 총 8개
    const TOTAL_CATEGORIES = 8;
    const totalSelectedCategories = selectedAcademicCategories.length + selectedCareerCategories.length;
    const isAllCategoriesSelected = totalSelectedCategories === TOTAL_CATEGORIES;

    // 카테고리 데이터가 로드되었고, 모든 카테고리가 선택되지 않은 경우에만 파라미터 추가
    if (!isAllCategoriesSelected && totalSelectedCategories > 0 && categories.length > 0) {
      const categoryIds = mapCategoriesToIds(selectedAcademicCategories, selectedCareerCategories, categories);
      if (categoryIds.length > 0) {
        params.categoryIds = categoryIds;
      }
    }

    // 4. 기간 필터
    if (periodFilter !== '전체') {
      const range = getPeriodRange(periodFilter);
      if (range) {
        params.startDate = range.startDate;
        params.endDate = range.endDate;
      }
    }

    return params;
  };

  /**
   * 검색 실행 함수
   * @param isNewSearch true면 새 검색 (기존 결과 초기화), false면 추가 로드 (무한스크롤)
   * @param applyFilters true면 필터 적용, false면 전체 검색 (기본값: isFilteredSearch 상태 사용)
   */
  const handleSearch = async (isNewSearch = true, applyFilters = isFilteredSearch) => {
    if (isLoading) return;

    setIsLoading(true);
    const page = isNewSearch ? 0 : currentPage;

    try {
      // applyFilters가 true면 현재 필터 상태를 API에 전송
      // false면 page, size만 전송 (전체 검색)
      const params = buildSearchParams(page, 15, applyFilters);
      const { notices: newNotices, metadata } = await searchApi.searchPosts(params);

      // console.log('[검색 실행]', {
      //   필터적용: applyFilters,
      //   파라미터: params,
      //   결과개수: newNotices.length,
      // });

      if (isNewSearch) {
        // 새 검색: 기존 결과를 새 결과로 교체
        setNotices(newNotices);
        setCurrentPage(0);
      } else {
        // 무한스크롤: 기존 결과에 추가
        setNotices((prev) => [...prev, ...newNotices]);
      }

      setCurrentPage(page + 1);
      setHasMore(page + 1 < metadata.totalPages);

      if (isNewSearch) {
        toast.success(`${metadata.totalHits}개의 공지사항을 찾았습니다.`);
      }
    } catch (error) {
      console.error('[검색 실패]', error);
      toast.error('검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 최초 로드: 페이지 진입 시 전체 검색 (필터 미적용)
   * applyFilters=false로 호출하여 page, size만 전송
   */
  useEffect(() => {
    handleSearch(true, false); // 새 검색, 필터 미적용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회만 실행

  /**
   * 무한스크롤 구현
   * Intersection Observer로 마지막 공지사항이 화면에 보이면 다음 페이지 로드
   */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastNoticeElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // console.log('[무한스크롤] 다음 페이지 로드');
          handleSearch(false);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * 북마크 필터는 클라이언트 사이드에서 처리
   * (백엔드 검색 API에 isLiked 파라미터가 아직 연동 안됨)
   */
  const displayedNotices = useMemo(() => {
    if (showBookmarkedOnly) {
      return notices.filter((n) => n.bookmarked);
    }
    return notices;
  }, [notices, showBookmarkedOnly]);

  /**
   * 북마크 토글 (낙관적 업데이트)
   */
  const toggleBookmark = async (id: number) => {
    const notice = notices.find((n) => n.id === id);
    if (!notice) return;

    const wasBookmarked = notice.bookmarked;

    // 1. 즉시 UI 업데이트 (낙관적 업데이트)
    setNotices((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, bookmarked: !n.bookmarked } : n
      )
    );

    // console.log(`[북마크 토글] ID: ${id}, ${wasBookmarked ? '해제' : '추가'}`);

    try {
      // 2. API 호출
      await bookmarksApi.toggle(id, wasBookmarked);
      // console.log(`[북마크 API] ${wasBookmarked ? '해제' : '추가'} 성공`);

      toast.success(
        wasBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.'
      );
    } catch (error) {
      // 3. 실패 시 롤백
      console.error('[북마크 API] 호출 실패:', error);
      setNotices((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, bookmarked: !n.bookmarked } : n
        )
      );
      toast.error('북마크 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const toggleComplete = (id: number) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id ? { ...notice, completed: !notice.completed } : notice
      )
    );
  };

  /**
   * 공지사항 클릭 핸들러 (모달 열기)
   * 검색 API에서 받은 첨부파일 정보를 그대로 사용
   */
  const handleNoticeClick = (notice: Notice) => {
    const mattermostUrl = notice.mattermostUrl || `https://mattermost.ssafy.com/ssafy/pl/message${notice.id}`;

    const messageDetail: MessageDetail = {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      author: notice.author,
      category: notice.category,
      subcategory: notice.subcategory,
      created_at: notice.createdAt,
      updated_at: notice.updatedAt,
      channel: notice.channel,
      dday: notice.dday,
      mattermostUrl,
      attachments: notice.attachments, // 검색 API에서 받은 첨부파일 그대로 사용
    };

    setSelectedMessage(messageDetail);
    setIsModalOpen(true);
  };

  const jobPostings = getMockJobPostings();

  return (
    <PageLayout>
      <div className="flex-1 flex gap-6 px-8 py-6">
        {/* 메인 콘텐츠 */}
        <div className="flex-1 space-y-6">
          {/* 검색 및 필터 섹션 */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedChannels={selectedChannels}
            onChannelToggle={toggleChannel}
            selectedAcademicCategories={selectedAcademicCategories}
            onAcademicCategoryToggle={toggleAcademicCategory}
            selectedCareerCategories={selectedCareerCategories}
            onCareerCategoryToggle={toggleCareerCategory}
            periodFilter={periodFilter}
            onPeriodChange={setPeriodFilter}
            showBookmarkedOnly={showBookmarkedOnly}
            onBookmarkFilterToggle={toggleBookmarkFilter}
            onReset={resetFilters}
            onSearch={() => {
              setIsFilteredSearch(true); // 필터 적용 상태로 변경
              handleSearch(true, true); // 새 검색, 필터 적용
            }}
          />

          {/* 공지사항 리스트 */}
          <Card className="shadow-md">
            {/* 리스트 헤더 */}
            <div className="h-16 px-6 flex items-center justify-between border-b">
              <h2 className="text-lg" style={{ fontWeight: 700 }}>
                공지사항
              </h2>
              <Select value={sortBy} onValueChange={setSortBy as any}>
                <SelectTrigger className="w-[160px] h-10 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">정렬: 최신순</SelectItem>
                  <SelectItem value="deadline">정렬: 마감일순</SelectItem>
                  <SelectItem value="title">정렬: 제목순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 리스트 */}
            <NoticeListContainer
              notices={displayedNotices}
              onBookmarkToggle={toggleBookmark}
              onCompleteToggle={toggleComplete}
              onNoticeClick={handleNoticeClick}
              lastNoticeRef={lastNoticeElementRef}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </Card>
        </div>

        {/* 우측 사이드바 */}
        <div className="w-80 space-y-6 sticky top-6 self-start">
          {/* 미니 캘린더 */}
          <MiniCalendar onNavigateToCalendar={() => navigate('/calendar')} />

          {/* 채용 정보 위젯 */}
          <JobPostingsWidget
            postings={jobPostings}
            onViewAll={() => navigate('/jobs')}
          />
        </div>
      </div>

      {/* 메시지 상세 모달 */}
      {selectedMessage && (
        <MessageDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={selectedMessage}
        />
      )}
    </PageLayout>
  );
}
