import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Notice } from "@/types/notice";

interface BookmarkedNoticesWidgetProps {
  notices: Notice[];
}

export default function BookmarkedNoticesWidget({
  notices,
}: BookmarkedNoticesWidgetProps) {
  const navigate = useNavigate();

  const getCategoryColor = (subcategory: string) => {
    switch (subcategory) {
      case "할일":
        return "bg-red-100 text-red-700 border-red-300";
      case "특강":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "정보":
        return "bg-green-100 text-green-700 border-green-300";
      case "행사":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDdayColor = (dday: number) => {
    if (dday <= 3) return "bg-red-500";
    if (dday <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="shadow-md">
      <div className="h-12 px-6 flex items-center justify-between border-b">
        <h2 className="text-base" style={{ fontWeight: 700 }}>
          🔖 북마크 공지
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          더보기
        </Button>
      </div>
      <div className="p-4">
        {notices.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">
            북마크한 공지가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border ${getCategoryColor(
                      notice.subcategory
                    )}`}
                  >
                    {notice.subcategory}
                  </Badge>
                  {notice.dday !== null && (
                    <span
                      className={`text-white text-[10px] px-1.5 py-0.5 rounded ${getDdayColor(
                        notice.dday
                      )}`}
                      style={{ fontWeight: 600 }}
                    >
                      D-{notice.dday}
                    </span>
                  )}
                </div>
                <div
                  className="text-sm line-clamp-1"
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
  );
}
