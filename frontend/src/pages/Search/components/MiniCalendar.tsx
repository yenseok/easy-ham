import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightedDates?: number[];
  onNavigateToCalendar?: () => void;
  hasEventsOnDate?: (date: Date) => boolean;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export function MiniCalendar({
  selectedDate = new Date(),
  onDateSelect,
  highlightedDates = [],
  onNavigateToCalendar,
  hasEventsOnDate,
}: MiniCalendarProps) {
  const currentDate = selectedDate;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  // 캘린더 날짜 배열 생성
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handleDateClick = (day: number | null) => {
    if (day && onDateSelect) {
      onDateSelect(new Date(year, month, day));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">
          {year}년 {month + 1}월
        </h3>
        {onNavigateToCalendar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToCalendar}
            className="h-7 w-7 p-0 hover:bg-gray-100"
            title="캘린더 페이지로 이동"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-semibold text-gray-500 py-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dateForDay = day ? new Date(year, month, day) : null;
          const hasEvents = dateForDay && hasEventsOnDate ? hasEventsOnDate(dateForDay) : false;
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                h-7 text-[11px] rounded relative flex flex-col items-center justify-center
                ${
                  day === null
                    ? 'invisible'
                    : 'hover:bg-gray-100 transition-colors'
                }
                ${
                  isToday
                    ? 'bg-(--brand-orange) text-white font-semibold'
                    : ''
                }
                ${
                  highlightedDates.includes(day || 0)
                    ? 'border border-(--brand-orange)'
                    : 'text-gray-700'
                }
              `}
            >
              {day}
              {hasEvents && !isToday && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-(--brand-orange) rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
