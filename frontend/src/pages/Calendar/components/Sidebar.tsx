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
  getMiniCalendarDays: () => Date[][];
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
  getMiniCalendarDays,
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
  const miniCalendarWeeks = getMiniCalendarDays();

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
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onDateChange(newDate);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm" style={{ fontWeight: 700 }}>
            {formatMonthYear(currentDate)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onDateChange(newDate);
            }}
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
                  const currentMonth = isCurrentMonth(date, currentDate);

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
              className="text-xs text-gray-600 flex-1 text-left"
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
                  className="w-full h-8 px-3 rounded-md text-xs text-left flex items-center gap-2 transition-colors hover:bg-gray-100"
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
            <span className="text-xs text-gray-600" style={{ fontWeight: 700 }}>
              학사
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["할일", "특강", "정보", "행사"].map((category) => (
              <button
                key={category}
                onClick={() => onToggleCategory(category, true)}
                className={`h-8 rounded-md text-xs flex items-center justify-center gap-1 border transition-colors ${getCategoryButtonColor(
                  category,
                  selectedAcademicCategories.includes(category)
                )}`}
                style={{ fontWeight: 500 }}
              >
                {selectedAcademicCategories.includes(category) && (
                  <span className="text-[10px]">✓</span>
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
            <span className="text-xs text-gray-600" style={{ fontWeight: 700 }}>
              취업
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {["할일", "특강", "정보", "행사"].map((category) => (
              <button
                key={category}
                onClick={() => onToggleCategory(category, false)}
                className={`h-8 rounded-md text-xs flex items-center justify-center gap-1 border transition-colors ${getCategoryButtonColor(
                  category,
                  selectedCareerCategories.includes(category)
                )}`}
                style={{ fontWeight: 500 }}
              >
                {selectedCareerCategories.includes(category) && (
                  <span className="text-[10px]">✓</span>
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
