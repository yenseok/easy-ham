import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  viewMode: "week" | "month";
  headerText: string;
  weekRange?: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleView: (mode: "week" | "month") => void;
}

export function CalendarHeader({
  viewMode,
  headerText,
  weekRange,
  onPrevious,
  onNext,
  onToday,
  onToggleView,
}: CalendarHeaderProps) {
  return (
    <div className="bg-white border-b px-6 py-5">
      <div className="flex items-center justify-between">
        {/* 좌측 타이틀 */}
        <div>
          <h1
            className="text-xl mb-1"
            style={{ fontWeight: 700 }}
          >
            {viewMode === "week"
              ? `이번 주 일정 (${weekRange})`
              : headerText}
          </h1>
          <p className="text-xs text-gray-500">
            날짜별 일정을 한눈에 확인하세요
          </p>
        </div>

        {/* 우측 컨트롤 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            className="h-9"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {viewMode === "week" ? "이전 주" : "이전 달"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-9"
          >
            오늘
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            className="h-9"
          >
            {viewMode === "week" ? "다음 주" : "다음 달"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <div className="ml-2 flex rounded-lg border overflow-hidden">
            <button
              onClick={() => onToggleView("week")}
              className={`px-4 py-2 text-sm transition-colors ${
                viewMode === "week"
                  ? "bg-(--brand-orange) text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              style={{ fontWeight: 500 }}
            >
              주간
            </button>
            <button
              onClick={() => onToggleView("month")}
              className={`px-4 py-2 text-sm transition-colors border-l ${
                viewMode === "month"
                  ? "bg-(--brand-orange) text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              style={{ fontWeight: 500 }}
            >
              월간
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
