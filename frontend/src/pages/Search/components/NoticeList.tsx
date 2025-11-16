import { Bookmark, Check } from 'lucide-react';
import { DdayBadge } from '@/components/common/Badge/DdayBadge';
import { formatRelativeTime } from '@/utils/dateFormatter';
import type { Notice } from '@/types/notice';

interface NoticeListProps {
  notices: Notice[];
  onBookmarkToggle: (id: number) => void;
  onCompleteToggle: (id: number) => void;
  onNoticeClick: (notice: Notice) => void;
  lastNoticeRef?: (node: HTMLDivElement | null) => void; // 무한스크롤용
  isLoading?: boolean;
}

export function NoticeList({
  notices,
  onBookmarkToggle,
  onCompleteToggle,
  onNoticeClick,
  lastNoticeRef,
  isLoading,
}: NoticeListProps) {
  // 로딩 중이 아닌데 결과가 없으면 빈 상태 표시
  if (!isLoading && notices.length === 0) {
    return null; // Dashboard에서 별도 메시지 표시
  }

  return (
    <div>
      {notices.map((notice, index) => {
        const isLast = index === notices.length - 1;

        return (
          <div
            key={notice.id}
            ref={isLast ? lastNoticeRef : null}
            className={`px-4 md:px-6 py-3 md:py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
              notice.completed ? 'opacity-60' : ''
            }`}
          >
            {/* 모바일: 완전히 다른 레이아웃 / 데스크톱: 가로 레이아웃 */}
            <div className="md:hidden">
              {/* 모바일 전용 레이아웃 */}
              <div className="flex items-start justify-between gap-2">
                {/* 좌측: 콘텐츠 영역 */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onNoticeClick(notice)}
                >
                  {/* 배지들 (작은 크기) */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="scale-75 origin-left">
                      <DdayBadge dday={notice.dday} />
                    </div>
                    <div className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {notice.category}·{notice.subcategory}
                    </div>
                  </div>

                  {/* 제목 */}
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1.5">
                    {notice.title}
                  </h3>

                  {/* 메타정보 */}
                  <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                    <span className="truncate">{notice.channel}</span>
                    <span className="text-[10px] text-gray-400">{formatRelativeTime(notice.createdAt)}</span>
                  </div>
                </div>

                {/* 우측 상단: 액션 버튼 */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteToggle(notice.id);
                    }}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                      notice.completed ? 'text-green-500' : 'text-gray-400'
                    }`}
                    title="완료"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmarkToggle(notice.id);
                    }}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                      notice.bookmarked
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-400'
                    }`}
                    title="북마크"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 데스크톱 레이아웃 (기존 유지) */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => onNoticeClick(notice)}
              >
                {/* D-day 배지 */}
                <div className="shrink-0 w-12">
                  <DdayBadge dday={notice.dday} />
                </div>

                {/* 카테고리 */}
                <div className="shrink-0 text-sm font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded whitespace-nowrap">
                  {notice.category}·{notice.subcategory}
                </div>

                {/* 제목 및 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                    {notice.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{notice.channel}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(notice.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteToggle(notice.id);
                  }}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    notice.completed ? 'text-green-500' : 'text-gray-400'
                  }`}
                  title="완료"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmarkToggle(notice.id);
                  }}
                  className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                    notice.bookmarked
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-400'
                  }`}
                  title="북마크"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}