import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  highlightedDates?: number[];
  onNavigateToCalendar?: () => void;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export function MiniCalendar({
  selectedDate = new Date(),
  onDateSelect,
  highlightedDates = [],
  onNavigateToCalendar,
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {year}년 {month + 1}월
        </h3>
        {onNavigateToCalendar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToCalendar}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="캘린더 페이지로 이동"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              h-8 text-xs rounded
              ${
                day === null
                  ? 'invisible'
                  : 'hover:bg-gray-100 transition-colors'
              }
              ${
                isCurrentMonth && day === today.getDate()
                  ? 'bg-[var(--brand-orange)] text-white font-semibold'
                  : ''
              }
              ${
                highlightedDates.includes(day || 0)
                  ? 'border border-[var(--brand-orange)]'
                  : 'text-gray-700'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
