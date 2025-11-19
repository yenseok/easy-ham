import { Bookmark, Check } from 'lucide-react';
import { DdayBadge } from '@/components/common/Badge/DdayBadge';
import { CategoryBadge } from '@/components/common/Badge/CategoryBadge';
import type { Notice } from '@/types/notice';

interface NoticeCardProps {
  notice: Notice;
  onBookmarkToggle: (id: number) => void;
  onCompleteToggle: (id: number) => void;
  onClick: (notice: Notice) => void;
}

export function NoticeCard({
  notice,
  onBookmarkToggle,
  onCompleteToggle,
  onClick,
}: NoticeCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
        notice.completed ? 'opacity-60' : ''
      }`}
      onClick={() => onClick(notice)}
    >
      {/* 헤더: D-day, 카테고리 배지 */}
      <div className="flex items-center gap-2 mb-3">
        <DdayBadge dday={notice.dday} />
        <CategoryBadge subcategory={notice.subcategory} variant="solid" />
      </div>

      {/* 제목 */}
      <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
        {notice.title}
      </h3>

      {/* 메타정보 */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
        <span>{notice.channel}</span>
        <span>{notice.createdAt}</span>
      </div>

      {/* 하단: 액션 버튼들 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{notice.author}</span>

        <div className="flex items-center gap-2">
          {/* 완료 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompleteToggle(notice.id);
            }}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
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
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
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
}
