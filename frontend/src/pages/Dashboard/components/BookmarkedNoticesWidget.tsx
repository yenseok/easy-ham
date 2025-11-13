import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { BookmarksModal } from "@/components/modals/BookmarksModal";
import type { Notice } from "@/types/notice";

interface BookmarkedNoticesWidgetProps {
  notices: Notice[];
  onRefresh?: () => Promise<void>;
  onNoticeClick?: (notice: Notice) => void;
}

export default function BookmarkedNoticesWidget({
  notices,
  onRefresh,
  onNoticeClick,
}: BookmarkedNoticesWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 열기
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  // 모달이 닫힐 때 북마크 데이터 갱신
  const handleModalClose = async (open: boolean) => {
    setIsModalOpen(open);
    if (!open && onRefresh) {
      await onRefresh();
    }
  };

  const getCategoryColor = (subcategory: string) => {
    switch (subcategory) {
      case "할일":
        return "bg-red-50 text-red-700 border-red-200";
      case "특강":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "정보":
        return "bg-green-50 text-green-700 border-green-200";
      case "행사":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getDdayColor = (dday: number) => {
    if (dday <= 3) return "bg-red-500";
    if (dday <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <Card className="shadow-md">
        <div className="h-16 px-6 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-(--brand-orange)" />
            <h2 className="text-lg" style={{ fontWeight: 700 }}>
              북마크 공지
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModalOpen}
            className="text-sm"
          >
            더보기
          </Button>
        </div>
      <div className="px-4 py-4">
        {notices.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            북마크한 공지가 없습니다
          </div>
        ) : (
          <div className="space-y-2.5">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                onClick={() => onNoticeClick?.(notice)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`text-xs px-2 py-0.5 border ${getCategoryColor(
                      notice.subcategory
                    )}`}
                  >
                    {notice.subcategory}
                  </Badge>
                  {notice.dday !== null && (
                    <span
                      className={`text-white text-xs px-2 py-0.5 rounded ${getDdayColor(
                        notice.dday
                      )}`}
                      style={{ fontWeight: 600 }}
                    >
                      D-{notice.dday}
                    </span>
                  )}
                </div>
                <div
                  className="text-sm line-clamp-2 text-gray-800"
                  style={{ fontWeight: 500 }}
                >
                  {notice.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>

    <BookmarksModal
      open={isModalOpen}
      onOpenChange={handleModalClose}
    />
    </>
  );
}
