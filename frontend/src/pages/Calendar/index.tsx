import { useState } from "react";
import { Header } from "@/components/layouts/Header";
import { CalendarHeader } from "./components/CalendarHeader";
import { Sidebar } from "./components/Sidebar";
import { WeekView } from "./components/WeekView";
import { MonthView } from "./components/MonthView";
import {
  MessageDetailModal,
  MessageDetail,
} from "@/components/MessageDetailModal";

// 타입 정의
interface CalendarEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  channel: string;
  category: string; // '학사' or '취업'
  subcategory: string; // '할일', '특강', '정보', '행사'
}

export default function CalendarPage() {
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

  // 필터 상태
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "전체",
    "13기-공지사항",
    "13기-취업공지",
    "13기-취업정보",
    "서울1반-공지사항",
  ]);
  const [selectedAcademicCategories, setSelectedAcademicCategories] = useState<
    string[]
  >(["할일", "특강", "정보", "행사"]);
  const [selectedCareerCategories, setSelectedCareerCategories] = useState<
    string[]
  >(["할일", "특강", "정보", "행사"]);

  // 예제 이벤트 데이터
  const events: CalendarEvent[] = [
    // 10월 21일 이벤트 (4개)
    {
      id: 1,
      title: "알고리즘 스터디",
      startDate: new Date(2025, 9, 21),
      endDate: new Date(2025, 9, 21),
      startTime: "19:00",
      endTime: "21:00",
      description: "백준 문제 풀이",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
    },
    {
      id: 2,
      title: "프로젝트 기획 발표",
      startDate: new Date(2025, 9, 21),
      endDate: new Date(2025, 9, 21),
      startTime: "14:00",
      endTime: "16:00",
      description: "팀별 아이디어 발표",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
    },
    {
      id: 3,
      title: "삼성 채용설명회",
      startDate: new Date(2025, 9, 21),
      endDate: new Date(2025, 9, 21),
      startTime: "13:00",
      endTime: "15:00",
      description: "DS부문 신입 채용",
      channel: "13기-취업정보",
      category: "취업",
      subcategory: "행사",
    },
    {
      id: 11,
      title: "코딩테스트 대비 특강",
      startDate: new Date(2025, 9, 21),
      endDate: new Date(2025, 9, 21),
      startTime: "16:00",
      endTime: "18:00",
      description: "자료구조 심화",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
    },
    // 10월 27일 이벤트 (2개)
    {
      id: 4,
      title: "Vue.js 심화 특강",
      startDate: new Date(2025, 9, 27),
      endDate: new Date(2025, 9, 27),
      startTime: "10:00",
      endTime: "12:00",
      description: "Composition API 실습",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
    },
    {
      id: 5,
      title: "네트워킹 데이",
      startDate: new Date(2025, 9, 27),
      endDate: new Date(2025, 9, 27),
      startTime: "18:00",
      endTime: "20:00",
      description: "선배 개발자와의 만남",
      channel: "서울1반-공지사항",
      category: "학사",
      subcategory: "행사",
    },
    // 10월 28일 이벤트 (3개)
    {
      id: 6,
      title: "AI 실습특강 III",
      startDate: new Date(2025, 9, 28),
      endDate: new Date(2025, 9, 28),
      startTime: "13:00",
      endTime: "17:00",
      description: "서전 환경 셋팅 필요",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
    },
    {
      id: 7,
      title: "코드 리뷰 세션",
      startDate: new Date(2025, 9, 28),
      endDate: new Date(2025, 9, 28),
      startTime: "15:00",
      endTime: "17:00",
      description: "프로젝트 코드 리뷰",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
    },
    {
      id: 8,
      title: "이력서 작성법 특강",
      startDate: new Date(2025, 9, 28),
      endDate: new Date(2025, 9, 28),
      startTime: "14:00",
      endTime: "16:00",
      description: "IT 이력서 작성 팁",
      channel: "13기-취업공지",
      category: "취업",
      subcategory: "특강",
    },
    // 10월 30일 이벤트 (2개)
    {
      id: 9,
      title: "프로젝트 중간 발표",
      startDate: new Date(2025, 9, 30),
      endDate: new Date(2025, 9, 30),
      startTime: "14:00",
      endTime: "18:00",
      description: "팀별 진행상황 발표",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
    },
    {
      id: 10,
      title: "포트폴리오 제출",
      startDate: new Date(2025, 9, 30),
      endDate: new Date(2025, 9, 30),
      description: "온라인 제출 마감",
      channel: "13기-취업공지",
      category: "취업",
      subcategory: "할일",
    },
  ];

  const channelOptions = [
    "전체",
    "13기-공지사항",
    "13기-취업공지",
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

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      // 날짜 필터
      if (!isSameDay(event.startDate, date)) return false;

      // 채널 필터
      if (
        !selectedChannels.includes("전체") &&
        !selectedChannels.includes(event.channel)
      ) {
        return false;
      }

      // 카테고리 필터 (학사 또는 취업)
      const allCategories = [
        ...selectedAcademicCategories,
        ...selectedCareerCategories,
      ];
      if (
        allCategories.length > 0 &&
        !allCategories.includes(event.subcategory)
      ) {
        return false;
      }

      return true;
    });
  };

  const toggleChannel = (channel: string) => {
    if (channel === "전체") {
      if (selectedChannels.includes("전체")) {
        setSelectedChannels([]);
      } else {
        setSelectedChannels([
          "전체",
          ...channelOptions.filter((c) => c !== "전체"),
        ]);
      }
    } else {
      let newChannels: string[];
      if (selectedChannels.includes(channel)) {
        newChannels = selectedChannels.filter(
          (c) => c !== channel && c !== "전체"
        );
      } else {
        newChannels = [...selectedChannels, channel];
        const allOtherChannels = channelOptions.filter((c) => c !== "전체");
        if (allOtherChannels.every((c) => newChannels.includes(c))) {
          newChannels = ["전체", ...newChannels];
        }
      }
      setSelectedChannels(newChannels);
    }
  };

  const toggleCategory = (category: string, isAcademic: boolean) => {
    if (isAcademic) {
      if (selectedAcademicCategories.includes(category)) {
        setSelectedAcademicCategories(
          selectedAcademicCategories.filter((c) => c !== category)
        );
      } else {
        setSelectedAcademicCategories([
          ...selectedAcademicCategories,
          category,
        ]);
      }
    } else {
      if (selectedCareerCategories.includes(category)) {
        setSelectedCareerCategories(
          selectedCareerCategories.filter((c) => c !== category)
        );
      } else {
        setSelectedCareerCategories([...selectedCareerCategories, category]);
      }
    }
  };

  const resetFilters = () => {
    setSelectedChannels([
      "전체",
      "13기-공지사항",
      "13기-취업공지",
      "13기-취업정보",
      "서울1반-공지사항",
    ]);
    setSelectedAcademicCategories(["할일", "특강", "정보", "행사"]);
    setSelectedCareerCategories(["할일", "특강", "정보", "행사"]);
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

  const getMiniCalendarDays = (): Date[][] => {
    return getMonthDays(currentDate);
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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedMessage({
      id: event.id,
      author: "시스템",
      timestamp: event.startDate.toISOString(),
      title: event.title,
      content: event.description || "",
      category: event.category,
      subcategory: event.subcategory,
      channel: event.channel,
      importance: "normal",
      attachments: [],
      deadline: event.startDate.toISOString(),
      location: event.location,
      time:
        event.startTime && event.endTime
          ? `${event.startTime}~${event.endTime}`
          : undefined,
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
          getMiniCalendarDays={getMiniCalendarDays}
          formatMonthYear={formatMonthYear}
          isSameDay={isSameDay}
          isToday={isToday}
          isCurrentMonth={isCurrentMonth}
          onChannelExpandToggle={() => setChannelExpanded(!channelExpanded)}
          onToggleChannel={toggleChannel}
          onToggleCategory={toggleCategory}
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
