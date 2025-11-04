import { Bookmark, Check } from 'lucide-react';
import { DdayBadge } from '@/components/common/Badge/DdayBadge';
import type { Notice } from '@/types/notice';

interface NoticeListProps {
  notices: Notice[];
  onBookmarkToggle: (id: number) => void;
  onCompleteToggle: (id: number) => void;
  onNoticeClick: (notice: Notice) => void;
}

export function NoticeList({
  notices,
  onBookmarkToggle,
  onCompleteToggle,
  onNoticeClick,
}: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 text-base mb-2">공지사항이 없습니다</p>
        <p className="text-gray-400 text-sm">필터를 조정하거나 나중에 다시 확인해주세요</p>
      </div>
    );
  }

  return (
    <div>
      {notices.map((notice) => (
        <div
          key={notice.id}
          className={`px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
            notice.completed ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => onNoticeClick(notice)}
            >
              {/* D-day 배지 (고정 너비로 정렬 통일) */}
              <div className="flex-shrink-0 w-12">
                <DdayBadge dday={notice.dday} />
              </div>

              {/* 카테고리 텍스트 (회색 계열, 상위·하위 형태) */}
              <div className="flex-shrink-0 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {notice.category}·{notice.subcategory}
              </div>

              {/* 제목 및 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                  {notice.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{notice.channel}</span>
                  <span>•</span>
                  <span>{notice.createdAt}</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {/* 완료 버튼 */}
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

              {/* 북마크 버튼 */}
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
      ))}
    </div>
  );
}
