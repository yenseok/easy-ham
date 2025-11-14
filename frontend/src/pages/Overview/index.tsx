import { PageLayout } from "@/components/layouts/PageLayout";
import { getMockDashboardData } from "@/services/mock/dashboardData";
import BookmarkedNoticesWidget from "./components/BookmarkedNoticesWidget";
import UrgentDeadlinesWidget from "./components/UrgentDeadlinesWidget";
import PersonalizedJobsWidget from "./components/PersonalizedJobsWidget";
import WeeklyCalendarWidget from "./components/WeeklyCalendarWidget";
import RecentNoticesWidget from "./components/RecentNoticesWidget";

export default function OverviewPage() {
  const { notices, weeklyEvents } = getMockDashboardData();

  // 북마크된 공지 최대 5개
  const bookmarkedNotices = notices.filter((n) => n.bookmarked).slice(0, 5);

  // 마감 임박 할일 (D-7 이내, 할일 카테고리만)
  const urgentDeadlines = notices
    .filter(
      (n) => n.dday !== null && n.dday <= 7 && n.subcategory === "할일"
    )
    .sort((a, b) => (a.dday || 0) - (b.dday || 0))
    .slice(0, 5);

  // 채용공고 (취업 카테고리) 최대 4개
  const jobs = notices.filter((n) => n.category === "취업").slice(0, 4);

  return (
    <PageLayout>
      <div className="px-8 py-6 bg-gray-50 min-h-screen">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-6" style={{ fontWeight: 700 }}>
          📊 Overview
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
