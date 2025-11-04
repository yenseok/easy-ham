import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
  category: string;
  subcategory: string;
}

interface WeekViewProps {
  weekDays: Date[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  formatDate: (date: Date) => string;
  isToday: (date: Date) => boolean;
  isSameDay: (date1: Date, date2: Date) => boolean;
}

export function WeekView({
  weekDays,
  getEventsForDate,
  onEventClick,
  formatDate,
  isToday,
  isSameDay,
}: WeekViewProps) {
  const getCategoryColor = (category: string, subcategory: string) => {
    // 학사/취업 구분 없이 서브카테고리로만 구분 (대시보드와 동일)
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
    <div className="h-full flex flex-col">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-white border-b sticky top-0 z-10">
        {weekDays.map((day, idx) => {
          const today = isToday(day);
          return (
            <div
              key={idx}
              className={`text-center py-3 border-r last:border-r-0 ${
                today ? "bg-blue-50" : ""
              }`}
            >
              <div
                className="text-sm mb-1"
                style={{
                  fontWeight: 500,
                  color:
                    idx === 0 ? "#ef4444" : idx === 6 ? "#3b82f6" : undefined,
                }}
              >
                {["일", "월", "화", "수", "목", "금", "토"][day.getDay()]}
              </div>
              <div
                className={`text-base ${
                  today ? "text-[var(--brand-orange)]" : ""
                }`}
                style={{ fontWeight: 700 }}
              >
                {formatDate(day)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 날짜 컬럼 */}
      <div className="grid grid-cols-7 flex-1 bg-white">
        {weekDays.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={`border-r last:border-r-0 p-3 overflow-y-auto ${
                today ? "bg-blue-50 bg-opacity-30" : ""
              }`}
            >
              {dayEvents.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-gray-400">
                  일정 없음
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="p-2.5 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onEventClick(event)}
                    >
                      {/* 카테고리 라벨 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border ${getCategoryColor(
                              event.category,
                              event.subcategory
                            )}`}
                          >
                            {event.category}/{event.subcategory}
                          </Badge>
                          {!isSameDay(event.startDate, event.endDate) && (
                            <span
                              className="text-[10px] text-gray-400"
                              style={{
                                fontWeight: 500,
                              }}
                            >
                              {formatDate(event.startDate)}~
                            </span>
                          )}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </div>

                      {/* 시간 */}
                      {event.startTime && event.endTime && (
                        <div
                          className="text-sm"
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          {event.startTime}~{event.endTime}
                        </div>
                      )}

                      {/* 제목 */}
                      <div
                        className="text-sm truncate"
                        style={{ fontWeight: 500 }}
                      >
                        {event.title}
                      </div>

                      {/* 설명 */}
                      {event.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {event.description}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
