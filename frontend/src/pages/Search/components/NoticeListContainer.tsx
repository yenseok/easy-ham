import { useRef } from 'react';
import { NoticeList } from './NoticeList';
import type { Notice } from '@/types/notice';

interface NoticeListContainerProps {
  notices: Notice[];
  onBookmarkToggle: (id: number) => void;
  onCompleteToggle: (id: number) => void;
  onNoticeClick: (notice: Notice) => void;
  lastNoticeRef?: (node: HTMLDivElement | null) => void;
  isLoading?: boolean;
  hasMore?: boolean; // 더 불러올 데이터가 있는지
  onScroll?: (scrollTop: number) => void; // 스크롤 이벤트 핸들러
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>; // 스크롤 컨테이너 ref
}

/**
 * NoticeList를 감싸는 컨테이너 컴포넌트
 * 스크롤 영역을 제공하며, 헤더는 고정되고 리스트만 스크롤됨
 */
export function NoticeListContainer({
  notices,
  onBookmarkToggle,
  onCompleteToggle,
  onNoticeClick,
  lastNoticeRef,
  isLoading,
  hasMore = true,
  onScroll,
  scrollContainerRef,
}: NoticeListContainerProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = scrollContainerRef || internalScrollRef;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      onScroll(e.currentTarget.scrollTop);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-1 max-h-[calc(100%-0.5rem)]"
      onScroll={handleScroll}
    >
      <NoticeList
        notices={notices}
        onBookmarkToggle={onBookmarkToggle}
        onCompleteToggle={onCompleteToggle}
        onNoticeClick={onNoticeClick}
        lastNoticeRef={lastNoticeRef}
        isLoading={isLoading}
      />

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="py-4 text-center text-gray-500 text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-(--brand-orange)"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      )}

      {/* 모든 결과 로드 완료 */}
      {!isLoading && !hasMore && notices.length > 0 && (
        <div className="py-2 text-center text-gray-400 text-xs">
          모든 공지사항을 불러왔습니다.
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isLoading && notices.length === 0 && (
        <div className="py-8 text-center text-gray-500 text-sm">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}

