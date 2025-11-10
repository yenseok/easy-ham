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
}

/**
 * NoticeList를 감싸는 컨테이너 컴포넌트
 * Card의 gap-6을 상쇄하고 헤더/하단과 바로 붙도록 처리
 * 첫 번째 항목의 위쪽 padding과 마지막 항목의 아래쪽 padding을 제거
 * 로딩 인디케이터와 완료 메시지도 포함하여 여백 제거
 */
export function NoticeListContainer({
  notices,
  onBookmarkToggle,
  onCompleteToggle,
  onNoticeClick,
  lastNoticeRef,
  isLoading,
  hasMore = true,
}: NoticeListContainerProps) {
  return (
    <div className="-mt-6 -mb-6">
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-orange)]"></div>
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

