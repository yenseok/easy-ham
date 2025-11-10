import { User, CalendarIcon, Edit3 } from 'lucide-react';
import { formatExactDateTime } from '@/utils/dateFormatter';

interface MessageMetaProps {
  channel: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export const MessageMeta = ({
  channel,
  author,
  createdAt,
  updatedAt,
}: MessageMetaProps) => {
  return (
    <div className="py-4 space-y-3">
      {/* 채널 정보 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-6 h-6 rounded-full bg-[var(--brand-orange-light)] flex items-center justify-center">
          <span className="text-xs">📢</span>
        </div>
        <span className="font-medium">{channel}</span>
      </div>

      {/* 작성자 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4 text-gray-500" />
        <span className="font-medium">작성자:</span>
        <span>{author}</span>
      </div>

      {/* 날짜 정보 */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium">작성일:</span>
          <span>{formatExactDateTime(createdAt)}</span>
        </div>

        {createdAt !== updatedAt && (
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gray-500" />
            <span className="font-medium">수정일:</span>
            <span>{formatExactDateTime(updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
