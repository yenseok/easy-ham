import type { Notice } from "@/types/notice";

interface MonthViewProps {
  monthWeeks: Date[][];
  currentDate: Date;
  getEventsForDate: (date: Date) => Notice[];
  onDateClick: (date: Date, week: Date[]) => void;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date, currentDate: Date) => boolean;
}

export function MonthView({
  monthWeeks,
  currentDate,
  getEventsForDate,
  onDateClick,
  isToday,
  isCurrentMonth,
}: MonthViewProps) {
  return (
    <div className="h-full p-4">
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
            <div
              key={day}
              className="text-center py-3 text-sm border-r last:border-r-0"
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

        {/* 날짜 셀 */}
        <div className="flex-1 flex flex-col">
          {monthWeeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="grid grid-cols-7 flex-1 border-b last:border-b-0"
            >
              {week.map((date, dayIdx) => {
                const dayEvents = getEventsForDate(date);
                const today = isToday(date);
                const currentMonth = isCurrentMonth(date, currentDate);

                return (
                  <div
                    key={dayIdx}
                    className={`border-r last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !currentMonth ? "bg-gray-50" : ""
                    }`}
                    onClick={() => onDateClick(date, week)}
                  >
                    {/* 날짜 */}
                    <div className="flex items-start justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full ${
                          today
                            ? "bg-(--brand-orange) text-white"
                            : currentMonth
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                        style={{
                          fontWeight: today ? 700 : 500,
                        }}
                      >
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 3 && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 7px',
                            backgroundColor: '#374151',
                            color: 'white',
                            borderRadius: '4px',
                            display: 'inline-block',
                            lineHeight: '1.2',
                          }}
                        >
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>

                    {/* 이벤트 제목 표시 */}
                    {dayEvents.length > 0 && (
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => {
                          // 서브카테고리별 세로선 색상
                          const getBorderColor = () => {
                            switch (event.subcategory) {
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

                          return (
                            <div
                              key={event.id}
                              className={`text-sm truncate pl-2 border-l-[3px] ${getBorderColor()}`}
                              style={{
                                fontWeight: 500,
                              }}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
