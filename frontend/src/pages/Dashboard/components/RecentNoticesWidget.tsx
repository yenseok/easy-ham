import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import { searchApi } from "@/services/api/search";
import type { Notice } from "@/types/notice";

export default function RecentNoticesWidget() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 반응형: 모바일 감지
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchRecentNotices = async () => {
      try {
        setLoading(true);
        const { notices: fetchedNotices } = await searchApi.searchPosts({
          page: 0,
          size: isMobile ? 3 : 5, // 모바일 3개, 데스크탑 5개
        });
        setNotices(fetchedNotices);
        setError(false);
      } catch (err) {
        console.error("최근 공지 로드 실패:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNotices();
  }, [isMobile]);

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
      <div className="h-16 px-6 flex items-center gap-2 border-b">
        <Bell className="w-5 h-5 text-(--brand-orange)" />
        <h2 className="text-lg" style={{ fontWeight: 700 }}>
          최근 공지
        </h2>
      </div>
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 text-center py-8">
            공지를 불러올 수 없습니다
          </div>
        ) : notices.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">
            최근 공지가 없습니다
          </div>
        ) : (
          <div className="space-y-2.5">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
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
  );
}
