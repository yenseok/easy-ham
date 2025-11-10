import { useEffect, useState, useMemo } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { getMockDashboardData } from "@/services/mock/dashboardData";
import { searchApi } from "@/services/api/search";
import type { Notice } from "@/types/notice";
import BookmarkedNoticesWidget from "./components/BookmarkedNoticesWidget";
import UrgentDeadlinesWidget from "./components/UrgentDeadlinesWidget";
import PersonalizedJobsWidget from "./components/PersonalizedJobsWidget";
import WeeklyCalendarWidget from "./components/WeeklyCalendarWidget";
import RecentNoticesWidget from "./components/RecentNoticesWidget";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search API 한 번만 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { notices } = await searchApi.searchPosts({
          page: 0,
          size: 100, // 충분한 개수
        });
        setAllNotices(notices);
      } catch (error) {
        console.error('[Dashboard] 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock 데이터 (북마크용)
  const { notices: mockNotices } = getMockDashboardData();

  // 북마크된 공지 최대 5개 (Mock 데이터 사용)
  const bookmarkedNotices = mockNotices.filter((n) => n.bookmarked).slice(0, 5);

  // 마감 임박 할일 (D-7 이내, deadline 있는 것만, 마감일 지난 것 제외)
  const urgentDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allNotices
      .filter((n) => {
        if (!n.deadline) return false;
        const deadline = typeof n.deadline === 'string' ? new Date(n.deadline) : n.deadline;
        deadline.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        // 마감일이 지난 것(음수)은 제외, 오늘(0)부터 7일 이내만 포함
        return daysLeft >= 0 && daysLeft <= 7;
      })
      .sort((a, b) => {
        const aDeadline = a.deadline ? (typeof a.deadline === 'string' ? new Date(a.deadline) : a.deadline) : new Date();
        const bDeadline = b.deadline ? (typeof b.deadline === 'string' ? new Date(b.deadline) : b.deadline) : new Date();
        return aDeadline.getTime() - bDeadline.getTime();
      })
      .slice(0, 5);
  }, [allNotices]);

  // 이번 주 일정 (deadline이 이번 주에 있는 것)
  const weeklyEvents = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일
    endOfWeek.setHours(23, 59, 59, 999);

    return allNotices.filter((n) => {
      if (!n.deadline) return false;
      const deadline = typeof n.deadline === 'string' ? new Date(n.deadline) : n.deadline;
      return deadline >= startOfWeek && deadline <= endOfWeek;
    });
  }, [allNotices]);

  // 채용공고 (Mock 데이터 사용 - 기능 미구현)
  const jobs = mockNotices.filter((n) => n.category === "취업").slice(0, 4);

  return (
    <PageLayout>
      <div className="px-8 py-6 bg-gray-50 min-h-screen">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-6 flex items-center gap-3" style={{ fontWeight: 700 }}>
          <LayoutDashboard className="w-8 h-8 text-[var(--brand-orange)]" />
          Dashboard
        </h1>

        {/* 상단 3개 위젯 (북마크 / 마감 임박 / 채용공고) */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <BookmarkedNoticesWidget notices={bookmarkedNotices} />
          <UrgentDeadlinesWidget notices={urgentDeadlines} />
          <PersonalizedJobsWidget jobs={jobs} />
        </div>

        {/* 주간 캘린더 */}
        <div className="mb-6">
          <WeeklyCalendarWidget events={weeklyEvents} />
        </div>

        {/* 최근 공지 (실제 API 연결) */}
        <div>
          <RecentNoticesWidget />
        </div>
      </div>
    </PageLayout>
  );
}
