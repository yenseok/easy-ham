import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="h-12 px-6 flex items-center border-b">
        <h2 className="text-base" style={{ fontWeight: 700 }}>
          🔔 최근 공지
        </h2>
      </div>
      <div className="p-4">
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
