import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Hash,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface SidebarProps {
  currentDate: Date;
  viewMode: "week" | "month";
  selectedChannels: string[];
  selectedAcademicCategories: string[];
  selectedCareerCategories: string[];
  channelExpanded: boolean;
  selectedWeek: Date[];
  channelOptions: string[];
  getEventsForDate: (date: Date) => any[];
  formatMonthYear: (date: Date) => string;
  isSameDay: (date1: Date, date2: Date) => boolean;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date, currentDate: Date) => boolean;
  onChannelExpandToggle: () => void;
  onToggleChannel: (channel: string) => void;
  onToggleCategory: (category: string, isAcademic: boolean) => void;
  onResetFilters: () => void;
  onMiniCalendarWeekClick: (week: Date[]) => void;
  onMiniCalendarDateClick: (date: Date) => void;
  onDateChange: (date: Date) => void;
}

// 요일 상수 정의 (한글 깨짐 방지)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function Sidebar({
  currentDate,
  viewMode,
  selectedChannels,
  selectedAcademicCategories,
  selectedCareerCategories,
  channelExpanded,
  selectedWeek,
  channelOptions,
  getEventsForDate,
  formatMonthYear,
  isSameDay,
  isToday,
  isCurrentMonth,
  onChannelExpandToggle,
  onToggleChannel,
  onToggleCategory,
  onResetFilters,
  onMiniCalendarWeekClick,
  onMiniCalendarDateClick,
  onDateChange,
}: SidebarProps) {
  // 미니 캘린더 독립적인 날짜 상태
  const [miniCalendarDate, setMiniCalendarDate] = useState(currentDate);

  // 메인 캘린더 날짜가 변경되면 미니 캘린더도 따라감
  useEffect(() => {
    setMiniCalendarDate(currentDate);
  }, [currentDate]);

  // 미니 캘린더의 월 데이터 생성
  const getMiniCalendarDays = (): Date[][] => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 월 시작일의 주 시작(일요일)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // 월 마지막일의 주 종료(토요일)
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

  const miniCalendarWeeks = getMiniCalendarDays();

  // 미니 캘린더 월 이동 (메인 캘린더는 그대로 유지)
  const handleMiniCalendarMonthChange = (offset: number) => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setMiniCalendarDate(newDate);
  };

  const getCategoryButtonColor = (subcategory: string, isSelected: boolean) => {
    if (!isSelected) return "bg-white text-gray-600 border-gray-200";

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

  return (
    // 너비 조절 가능
    <div
      className="bg-white border-r p-5 overflow-y-auto"
      style={{ width: "16%", minWidth: "280px", maxWidth: "320px" }}
    >
      {/* 미니 달력 */}
      <Card className="p-4 mb-6 shadow-sm">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => handleMiniCalendarMonthChange(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-base" style={{ fontWeight: 700 }}>
            {formatMonthYear(miniCalendarDate)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => handleMiniCalendarMonthChange(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="border-b mb-2" />

        {/* 달력 그리드 */}
        <div
          className={viewMode === "month" ? "rounded-md" : ""}
          style={
            viewMode === "month"
              ? {
                  backgroundColor: "rgba(255, 138, 61, 0.08)",
                }
              : {}
          }
        >
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div
                key={day}
                className="text-center text-[10px] text-gray-500 h-6 flex items-center justify-center"
                style={{
                  color:
                    idx === 0 ? "#ef4444" : idx === 6 ? "#3b82f6" : undefined,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 */}
          {miniCalendarWeeks.map((week, weekIdx) => {
            const isSelectedWeek =
              viewMode === "week" &&
              week.some((d) => selectedWeek.some((sd) => isSameDay(d, sd)));

            return (
              <div
                key={weekIdx}
                className={`grid grid-cols-7 gap-1 mb-1 rounded-md ${
                  isSelectedWeek ? "p-0.5" : ""
                }`}
                style={
                  isSelectedWeek
                    ? {
                        backgroundColor: "rgba(255, 138, 61, 0.08)",
                      }
                    : {}
                }
              >
                {week.map((date, dayIdx) => {
                  const hasEvents = getEventsForDate(date).length > 0;
                  const today = isToday(date);
                  const currentMonth = isCurrentMonth(date, miniCalendarDate);

                  return (
                    <div
                      key={dayIdx}
                      className={`h-8 flex flex-col items-center justify-center text-[11px] relative cursor-pointer rounded ${
                        today
                          ? "bg-[var(--brand-orange)] text-white"
                          : currentMonth
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300"
                      }`}
                      style={{
                        color:
                          !today && currentMonth && dayIdx === 0
                            ? "#ef4444"
                            : !today && currentMonth && dayIdx === 6
                            ? "#3b82f6"
                            : undefined,
                      }}
                      onClick={() => {
                        if (viewMode === "week") {
                          onMiniCalendarWeekClick(week);
                        } else {
                          onMiniCalendarDateClick(date);
                        }
                      }}
                    >
                      {date.getDate()}
                      {hasEvents && !today && (
                        <div className="absolute bottom-0.5 w-1 h-1 bg-[var(--brand-orange)] rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 필터 섹션 */}
      <div className="space-y-4">
        {/* 채널 필터 */}
        <div>
          <button
            onClick={onChannelExpandToggle}
            className="flex items-center gap-1.5 mb-2 w-full hover:opacity-70 transition-opacity"
          >
            <Hash className="w-3.5 h-3.5 text-gray-500" />
            <h3
              className="text-sm text-gray-600 flex-1 text-left"
              style={{ fontWeight: 700 }}
            >
              채널
            </h3>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                channelExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {channelExpanded && (
            <div className="space-y-1.5">
              {channelOptions.map((channel) => (
                <button
                  key={channel}
                  onClick={() => onToggleChannel(channel)}
                  className="w-full h-8 px-3 rounded-md text-sm text-left flex items-center gap-2 transition-colors hover:bg-gray-100"
                  style={{
                    fontWeight: selectedChannels.includes(channel) ? 700 : 500,
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      selectedChannels.includes(channel)
                        ? "border-[var(--brand-orange)]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedChannels.includes(channel) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)]" />
                    )}
                  </div>
                  <span
                    className={
                      selectedChannels.includes(channel)
                        ? "text-gray-800"
                        : "text-gray-600"
                    }
                  >
                    {channel}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t" />

        {/* 학사 카테고리 */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm text-gray-600" style={{ fontWeight: 700 }}>
              학사
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["할일", "특강", "정보", "행사"].map((category) => (
              <button
                key={category}
                onClick={() => onToggleCategory(category, true)}
                className={`h-8 rounded-md text-sm flex items-center justify-center gap-1 border transition-colors ${getCategoryButtonColor(
                  category,
                  selectedAcademicCategories.includes(category)
                )}`}
                style={{ fontWeight: 500 }}
              >
                {selectedAcademicCategories.includes(category) && (
                  <span className="text-xs">✓</span>
                )}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 취업 카테고리 */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm text-gray-600" style={{ fontWeight: 700 }}>
              취업
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["할일", "특강", "정보", "행사"].map((category) => (
              <button
                key={category}
                onClick={() => onToggleCategory(category, false)}
                className={`h-8 rounded-md text-sm flex items-center justify-center gap-1 border transition-colors ${getCategoryButtonColor(
                  category,
                  selectedCareerCategories.includes(category)
                )}`}
                style={{ fontWeight: 500 }}
              >
                {selectedCareerCategories.includes(category) && (
                  <span className="text-xs">✓</span>
                )}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 필터 초기화 */}
        <div className="pt-2">
          <button
            onClick={onResetFilters}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-2"
            style={{ fontWeight: 500 }}
          >
            필터 초기화
          </button>
        </div>
      </div>
    </div>
  );
}
