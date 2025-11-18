import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/utils/dateFormatter";
import { Bell, ChevronDown } from "lucide-react";
import type { Notice } from "@/types/notice";

interface RecentNoticesWidgetProps {
  notices: Notice[]; // 🔄 Dashboard의 allNotices를 props로 받음
  onNoticeClick?: (notice: Notice) => void;
  isMobile?: boolean;
}

export default function RecentNoticesWidget({
  notices: allNotices,
  onNoticeClick,
  isMobile = false,
}: RecentNoticesWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  // 🔄 allNotices에서 최신순으로 3개만 추출
  const notices = useMemo(() => {
    return allNotices.slice(0, 3);
  }, [allNotices]);

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
    <Card className="shadow-md">
      <div className="h-16 px-6 flex items-center border-b gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-(--brand-orange)" />
          <h2 className="text-lg" style={{ fontWeight: 700 }}>
            최근 공지
          </h2>
        </div>
        {isMobile && (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "위젯 펼치기" : "위젯 접기"}
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="ml-auto md:hidden text-gray-500 hover:text-gray-900 transition-colors p-1"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-180" : "rotate-0"}`}
            />
          </button>
        )}
      </div>
      {(!isMobile || !isCollapsed) && (
        <div className="px-4 py-4">
          {notices.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">
              최근 공지가 없습니다
            </div>
          ) : (
            <div className="space-y-2.5">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-(--brand-orange)"
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
                        className={`text-white text-xs ${notice.dday === 0 ? 'px-1.5' : 'px-2'} py-0.5 rounded ${getDdayColor(
                          notice.dday
                        )}`}
                        style={{ fontWeight: 600 }}
                      >
                        {notice.dday === 0 ? 'D-Day' : `D-${notice.dday}`}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {notice.title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {notice.channel} • {formatRelativeTime(notice.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
