import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getDdayBadgeColor, getCategoryColor } from '@/utils/colorUtils';
import type { Subcategory } from '@/types/notice';

interface MessageHeaderProps {
  title: string;
  category: string;
  subcategory: Subcategory;
  dday?: number | null;
}

export const MessageHeader = ({
  title,
  category,
  subcategory,
  dday,
}: MessageHeaderProps) => {
  const categoryColor = getCategoryColor(subcategory);
  const ddayColor = dday !== null && dday !== undefined ? getDdayBadgeColor(dday) : null;

  return (
    <DialogHeader className="pb-4 border-b">
      <div className="flex items-start gap-3 mb-3">
        {/* D-day 배지 */}
        {ddayColor && (
          <span
            className="px-2.5 py-1 shrink-0 text-white text-xs font-semibold rounded"
            style={{ backgroundColor: ddayColor.hex }}
          >
            {dday === 0 ? 'D-Day' : `D-${dday}`}
          </span>
        )}

        {/* 카테고리 라벨 */}
        <span
          className="px-2.5 py-1 shrink-0 border text-xs font-semibold rounded inline-block"
          style={{
            backgroundColor: categoryColor.bg,
            color: categoryColor.text,
            borderColor: categoryColor.border,
          }}
        >
          {category}-{subcategory}
        </span>
      </div>

      <DialogTitle className="text-2xl pr-8 font-bold leading-relaxed">
        {title}
      </DialogTitle>

      <DialogDescription className="sr-only">
        {category} {subcategory} 메시지 상세 정보
      </DialogDescription>
    </DialogHeader>
  );
};
