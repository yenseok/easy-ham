import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

interface WeeklyCalendarWidgetProps {
  events: CalendarEvent[];
}

export default function WeeklyCalendarWidget({
  events,
}: WeeklyCalendarWidgetProps) {
  const navigate = useNavigate();

  // 현재 주의 일~토 7일 계산
  const getWeekDays = (): Date[] => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (일) ~ 6 (토)
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date): boolean => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.startDate, date));
  };

  const getBorderColor = (subcategory: string) => {
    switch (subcategory) {
      case "할일":
        return "border-red-500";
      case "특강":
        return "border-blue-500";
      case "정보":
        return "border-green-500";
      case "행사":
        return "border-purple-500";
      default:
        return "border-gray-400";
    }
  };

  const handleDateClick = () => {
    // 캘린더 페이지로 이동
    navigate("/calendar");
  };

  return (
    <Card className="shadow-md">
      <div className="h-12 px-6 flex items-center border-b">
        <h2 className="text-base" style={{ fontWeight: 700 }}>
          📅 이번 주 일정
        </h2>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg border overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div
                key={day}
                className="text-center py-2 text-sm border-r last:border-r-0"
                style={{
                  fontWeight: 600,
                  color:
                    idx === 0 ? "#ef4444" : idx === 6 ? "#3b82f6" : "#374151",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 셀 (한 주) */}
          <div className="grid grid-cols-7 h-32">
            {weekDays.map((date, dayIdx) => {
              const dayEvents = getEventsForDate(date);
              const today = isToday(date);

              return (
                <div
                  key={dayIdx}
                  className="border-r last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={handleDateClick}
                >
                  {/* 날짜 */}
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full ${
                        today
                          ? "bg-[var(--brand-orange)] text-white"
                          : "text-gray-700"
                      }`}
                      style={{
                        fontWeight: today ? 700 : 500,
                      }}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 2 && (
                      <span
                        className="text-[10px] text-gray-500"
                        style={{ fontWeight: 500 }}
                      >
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>

                  {/* 이벤트 제목 표시 (최대 2개) */}
                  {dayEvents.length > 0 && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[10px] truncate pl-1.5 border-l-[3px] ${getBorderColor(
                            event.subcategory
                          )}`}
                          style={{
                            fontWeight: 500,
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
