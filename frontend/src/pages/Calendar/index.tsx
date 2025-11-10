import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layouts/Header";
import { CalendarHeader } from "./components/CalendarHeader";
import { Sidebar } from "./components/Sidebar";
import { WeekView } from "./components/WeekView";
import { MonthView } from "./components/MonthView";
import {
  MessageDetailModal,
  MessageDetail,
} from "@/components/MessageDetailModal";
import { useCalendarStore } from "@/stores/useCalendarStore";
import type { Notice } from "@/types/notice";

export default function CalendarPage() {
  // Zustand 스토어에서 상태 가져오기
  const {
    events,
    isLoading,
    selectedChannels,
    selectedAcademicCategories,
    selectedCareerCategories,
    loadEvents,
    loadCategories,
    toggleChannel,
    toggleAcademicCategory,
    toggleCareerCategory,
    resetFilters,
  } = useCalendarStore();

  // 채널 필터 접기/펴기 상태
  const [channelExpanded, setChannelExpanded] = useState(true);

  // 모달 상태
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 뷰 상태
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // 날짜 상태
  const [currentDate, setCurrentDate] = useState(new Date());

  // 초기 데이터 로딩
  useEffect(() => {
    loadEvents(new Date());
    loadCategories();
  }, []);

  // currentDate 변경 시 범위 체크 및 자동 로딩
  useEffect(() => {
    loadEvents(currentDate);
  }, [currentDate, loadEvents]);

  // 채널 옵션
  const channelOptions = [
    "13기-공지사항",
    "13기-취업공고",
    "13기-취업정보",
    "서울1반-공지사항",
  ];

  // 날짜 관련 유틸 함수들
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day; // 일요일이 0이므로
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getWeekDays = (date: Date): Date[] => {
    const weekStart = getWeekStart(date);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getMonthDays = (date: Date): Date[][] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = getWeekStart(firstDay);

    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const weeks: Date[][] = [];
    let currentDateCursor = new Date(startDate);

    while (currentDateCursor <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDateCursor));
        currentDateCursor.setDate(currentDateCursor.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
    return (
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth()
    );
  };

  // 필터링된 이벤트 (useMemo로 최적화)
  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      // 채널 필터 - 모든 채널이 선택된 경우 필터링 안 함
      const allChannelsSelected = channelOptions.every(ch => selectedChannels.includes(ch));
      if (!allChannelsSelected && !selectedChannels.includes(event.channel)) {
        return false;
      }

      // 카테고리 필터 - 모든 카테고리가 선택된 경우 필터링 안 함
      if (event.category === "학사") {
        const allAcademicSelected = selectedAcademicCategories.length === 4;
        if (!allAcademicSelected && !selectedAcademicCategories.includes(event.subcategory)) {
          return false;
        }
      } else if (event.category === "취업") {
        const allCareerSelected = selectedCareerCategories.length === 4;
        if (!allCareerSelected && !selectedCareerCategories.includes(event.subcategory)) {
          return false;
        }
      }

      return true;
    });

    console.log('[캘린더 필터링]', {
      전체이벤트: events.length,
      필터링후: filtered.length,
      선택된채널: selectedChannels,
      학사카테고리: selectedAcademicCategories,
      취업카테고리: selectedCareerCategories,
      샘플이벤트: events.slice(0, 1).map(e => ({ 제목: e.title, 채널: e.channel, 카테고리: e.category, 서브카테고리: e.subcategory }))
    });

    return filtered;
  }, [events, selectedChannels, selectedAcademicCategories, selectedCareerCategories, channelOptions]);

  // 날짜별 이벤트 가져오기
  const getEventsForDate = (date: Date): Notice[] => {
    const result = filteredEvents.filter((event) => {
      // deadline 날짜와 비교
      if (!event.deadline) return false;

      const deadlineDate = typeof event.deadline === 'string'
        ? new Date(event.deadline)
        : event.deadline;

      const isSame = isSameDay(deadlineDate, date);

      // 디버깅용 로그 (첫 번째 이벤트만)
      if (filteredEvents.indexOf(event) === 0 && date.getDate() === new Date().getDate()) {
        console.log('[날짜별 이벤트]', {
          날짜: date.toLocaleDateString(),
          이벤트제목: event.title,
          deadline: event.deadline,
          deadlineDate: deadlineDate.toLocaleDateString(),
          isSame
        });
      }

      return isSame;
    });

    return result;
  };

  // 카테고리 토글 (Zustand 액션 사용)
  const handleToggleCategory = (category: string, isAcademic: boolean) => {
    if (isAcademic) {
      toggleAcademicCategory(category as any);
    } else {
      toggleCareerCategory(category as any);
    }
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "week") {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "week") {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const [selectedWeek, setSelectedWeek] = useState<Date[]>(
    getWeekDays(new Date())
  );

  const handleMiniCalendarWeekClick = (week: Date[]) => {
    setSelectedWeek(week);
    setCurrentDate(week[0]);
  };

  const handleMiniCalendarDateClick = (date: Date) => {
    setViewMode("week");
    setCurrentDate(date);
    setSelectedWeek(getWeekDays(date));
  };

  const handleEventClick = (event: Notice) => {
    setSelectedMessage({
      id: event.id,
      title: event.title,
      content: event.content,
      author: event.author,
      category: event.category,
      subcategory: event.subcategory,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      channel: event.channel,
      dday: event.dday,
      mattermostUrl: event.mattermostUrl,
      attachments: event.attachments?.map((att) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        mimeType: att.mimeType,
      })),
    });
    setIsModalOpen(true);
  };

  const weekDays = viewMode === "week" ? getWeekDays(currentDate) : [];
  const monthWeeks = viewMode === "month" ? getMonthDays(currentDate) : [];

  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatMonthYear = (date: Date): string => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const formatWeekRange = (days: Date[]): string => {
    if (days.length === 0) return "";
    const start = days[0];
    const end = days[6];
    return `${formatDate(start)} ${
      ["일", "월", "화", "수", "목", "금", "토"][start.getDay()]
    } ~ ${formatDate(end)} ${
      ["일", "월", "화", "수", "목", "금", "토"][end.getDay()]
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 컨테이너 */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* 좌측 사이드바 (25%) */}
        <Sidebar
          currentDate={currentDate}
          viewMode={viewMode}
          selectedChannels={selectedChannels}
          selectedAcademicCategories={selectedAcademicCategories}
          selectedCareerCategories={selectedCareerCategories}
          channelExpanded={channelExpanded}
          selectedWeek={selectedWeek}
          channelOptions={channelOptions}
          getEventsForDate={getEventsForDate}
          formatMonthYear={formatMonthYear}
          isSameDay={isSameDay}
          isToday={isToday}
          isCurrentMonth={isCurrentMonth}
          onChannelExpandToggle={() => setChannelExpanded(!channelExpanded)}
          onToggleChannel={toggleChannel}
          onToggleCategory={handleToggleCategory}
          onResetFilters={resetFilters}
          onMiniCalendarWeekClick={handleMiniCalendarWeekClick}
          onMiniCalendarDateClick={handleMiniCalendarDateClick}
          onDateChange={setCurrentDate}
        />

        {/* 메인 캘린더 영역 (75%) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CalendarHeader
            viewMode={viewMode}
            headerText={formatMonthYear(currentDate)}
            weekRange={formatWeekRange(weekDays)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onToday={goToToday}
            onToggleView={setViewMode}
          />

          {/* 캘린더 그리드 */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {viewMode === "week" ? (
              <WeekView
                weekDays={weekDays}
                getEventsForDate={getEventsForDate}
                onEventClick={handleEventClick}
                formatDate={formatDate}
                isToday={isToday}
                isSameDay={isSameDay}
              />
            ) : (
              <MonthView
                monthWeeks={monthWeeks}
                currentDate={currentDate}
                getEventsForDate={getEventsForDate}
                onDateClick={(date, week) => {
                  setViewMode("week");
                  setCurrentDate(date);
                  setSelectedWeek(week);
                }}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
              />
            )}
          </div>
        </div>
      </div>

      {/* 메시지 상세 모달 */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }}
      />
    </div>
  );
}
