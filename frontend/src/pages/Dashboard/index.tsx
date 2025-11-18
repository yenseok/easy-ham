import { useEffect, useState, useMemo } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { searchApi } from "@/services/api/search";
import { jobsApi } from "@/services/api/jobs";
import { sseManager } from "@/services/sse/sseManager";
import { useSSEPostStore } from "@/stores/useSSEPostStore";
import { bookmarksApi } from "@/services/api/bookmarks";
import { getUserProfile } from "@/services/api/auth";
import { convertBookmarkItemToNotice } from "@/utils/bookmarkMapper";
import { convertSSEEventToNotice } from "@/utils/sseMapper";
import type { Notice } from "@/types/notice";
import type { JobPostItem } from "@/types/api";
import BookmarkedNoticesWidget from "./components/BookmarkedNoticesWidget";
import UrgentDeadlinesWidget from "./components/UrgentDeadlinesWidget";
import PersonalizedJobsWidget from "./components/PersonalizedJobsWidget";
import WeeklyCalendarWidget from "./components/WeeklyCalendarWidget";
import RecentNoticesWidget from "./components/RecentNoticesWidget";
import { MessageDetailModal, type MessageDetail } from "@/components/modals/MessageDetailModal";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Notice[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCampus, setUserCampus] = useState<string | null>(null);
  const { newPosts } = useSSEPostStore();

  // 모달 상태
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 북마크 데이터 갱신 함수
  // 북마크 전용 API 사용: 북마크된 것만 정확하게 가져옴 (검색 API의 size 제한 문제 해결)
  const refreshBookmarks = async () => {
    try {
      const { notices: bookmarkItems } = await bookmarksApi.getList({
        sort: 'recent', // 최신순 정렬
      });
      const bookmarked = bookmarkItems.map(convertBookmarkItemToNotice);
      // console.log('[Dashboard] 조회된 북마크 개수:', bookmarked.length);
      // console.log('[Dashboard] 북마크 ID 목록:', bookmarked.map(n => n.id));
      setBookmarkedNotices(bookmarked);
    } catch (error) {
      console.error('[Dashboard] 북마크 갱신 실패:', error);
    }
  };

  // 유저 정보 조회 (캠퍼스 정보 필요)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserProfile();
        setUserCampus(response.data.campus);
      } catch (error) {
        console.error('[Dashboard] 유저 정보 조회 실패:', error);
        setUserCampus(null);
      }
    };

    fetchUserInfo();
  }, []);

  // Search API 호출 (전체 공지 + 북마크 공지 + 채용공고)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. 전체 공지사항 조회 (마감 임박, 이번 주 일정용)
        const { notices } = await searchApi.searchPosts({
          page: 0,
          size: 100, // 충분한 개수
        });
        setAllNotices(notices);

        // 2. 북마크된 공지사항 조회
        await refreshBookmarks();

        // 3. 채용공고 조회
        try {
          const jobs = await jobsApi.getPersonalizedJobs();
          setJobPosts(jobs);
        } catch (error) {
          console.error('[Dashboard] 채용공고 로드 실패:', error);
          setJobPosts([]); // 실패 시 빈 배열
        }
      } catch (error) {
        console.error('[Dashboard] 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE 구독: Dashboard에서 posts/stream 시작
  useEffect(() => {
    console.log('[Dashboard] Mounting, starting posts/stream subscription');
    sseManager.connectPostStream();

    return () => {
      console.log('[Dashboard] Unmounting, closing posts/stream subscription');
      sseManager.closePostStream();
    };
  }, []);

  // SSE 데이터 통합: newPosts를 allNotices 및 jobPosts에 실시간 병합
  useEffect(() => {
    if (newPosts.length > 0) {
      console.log(`[Dashboard] Received ${newPosts.length} new posts via SSE, integrating...`);

      // 1. SSE 이벤트를 Notice 타입 또는 JobPostItem 타입으로 분류
      const convertedNotices: Notice[] = [];
      const newJobPosts: JobPostItem[] = [];

      newPosts.forEach(event => {
        try {
          // subCategory가 "채용"이면 채용공고로 분류
          if (event.subCategory === '채용') {
            newJobPosts.push({
              id: event.id,
              postId: event.postId,
              company: event.title,
              position: event.position || '채용 공고',
              url: event.url || '',
              positionId: event.positionId || 0,
              positionName: event.positionName || '기타',
              deadline: event.deadline,
              channelName: event.channelName,
              createdAt: event.createdAt,
            });
          } else {
            // 일반 공지사항
            convertedNotices.push(convertSSEEventToNotice(event));
          }
        } catch (error) {
          console.error('[Dashboard] Failed to convert SSE event:', error, event);
        }
      });

      // 2. 일반 공지사항 업데이트
      if (convertedNotices.length > 0) {
        setAllNotices(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newUniquePosts = convertedNotices.filter(p => !existingIds.has(p.id));

          if (newUniquePosts.length > 0) {
            console.log(`[Dashboard] Adding ${newUniquePosts.length} unique notices to allNotices`);
            return [...newUniquePosts, ...prev];
          }

          return prev;
        });
      }

      // 3. 채용공고 업데이트
      if (newJobPosts.length > 0) {
        setJobPosts(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const newUniqueJobs = newJobPosts.filter(j => !existingIds.has(j.id));

          if (newUniqueJobs.length > 0) {
            console.log(`[Dashboard] Adding ${newUniqueJobs.length} unique job postings to jobPosts`);
            return [...newUniqueJobs, ...prev];
          }

          return prev;
        });
      }

      // 4. 소비한 SSE 데이터 정리
      useSSEPostStore.getState().clearPosts();
    }
  }, [newPosts]);

  // 마감 임박 할일 (D-7 이내, deadline 있는 것만, 마감일 지난 것 제외, 캠퍼스 필터링)
  const urgentDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allNotices
      .filter((n) => {
        // 1. deadline 확인
        if (!n.deadline) return false;

        const deadline = typeof n.deadline === 'string' ? new Date(n.deadline) : n.deadline;
        deadline.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // 2. 마감일이 지난 것(음수)은 제외, 오늘(0)부터 7일 이내만 포함
        if (daysLeft < 0 || daysLeft > 7) return false;

        // 3. 캠퍼스 필터링
        // - campusId가 null이면 전체 공지이므로 통과
        // - campusId가 있고, userCampus가 그 안에 포함되면 통과
        // - campusId가 있고, userCampus가 없으면 제외
        if (n.campusId) {
          if (!userCampus) return false;
          // campusId는 "서울,부울경" 형태의 문자열, 콤마로 분리해서 확인
          const campusList = n.campusId.split(',').map(c => c.trim());
          if (!campusList.includes(userCampus)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aDeadline = a.deadline ? (typeof a.deadline === 'string' ? new Date(a.deadline) : a.deadline) : new Date();
        const bDeadline = b.deadline ? (typeof b.deadline === 'string' ? new Date(b.deadline) : b.deadline) : new Date();
        return aDeadline.getTime() - bDeadline.getTime();
      })
      .slice(0, 3);
  }, [allNotices, userCampus]);

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

  // 채용공고 (실제 API 데이터 사용, 최대 3개)
  const displayedJobs = useMemo(() => {
    return jobPosts?.slice(0, 3) ?? [];
  }, [jobPosts]);

  /**
   * 공지사항 클릭 핸들러 (모달 열기)
   */
  const handleNoticeClick = (notice: Notice) => {
    const mattermostUrl = notice.mattermostUrl || `https://mattermost.ssafy.com/ssafy/pl/message${notice.id}`;

    const messageDetail: MessageDetail = {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      author: notice.author,
      category: notice.category,
      subcategory: notice.subcategory,
      created_at: notice.createdAt,
      updated_at: notice.updatedAt,
      channel: notice.channel,
      teamName: notice.teamName,
      dday: notice.dday,
      mattermostUrl,
      attachments: notice.attachments,
    };

    setSelectedMessage(messageDetail);
    setIsModalOpen(true);
  };

  return (
    <PageLayout>
      <div className="px-8 py-6 bg-gray-50 min-h-screen">
        {/* 페이지 제목 */}
        <h1 className="text-3xl mb-6 flex items-center gap-3" style={{ fontWeight: 700 }}>
          <LayoutDashboard className="w-8 h-8 text-(--brand-orange)" />
          Dashboard
        </h1>

        {/* 상단 4개 위젯 (북마크 / 마감 임박 / 채용공고 / 최근 공지) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <BookmarkedNoticesWidget
            notices={bookmarkedNotices.slice(0, 3)} // 위젯에서는 상위 3개만 표시
            onRefresh={refreshBookmarks}
            onNoticeClick={handleNoticeClick}
          />
          <UrgentDeadlinesWidget
            notices={urgentDeadlines}
            onNoticeClick={handleNoticeClick}
          />
          <PersonalizedJobsWidget jobs={displayedJobs} />
          <RecentNoticesWidget
            notices={allNotices}
            onNoticeClick={handleNoticeClick}
          />
        </div>

        {/* 주간 캘린더 */}
        <div className="mb-6">
          <WeeklyCalendarWidget events={weeklyEvents} />
        </div>
      </div>

      {/* 메시지 상세 모달 */}
      {selectedMessage && (
        <MessageDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={selectedMessage}
        />
      )}
    </PageLayout>
  );
}
