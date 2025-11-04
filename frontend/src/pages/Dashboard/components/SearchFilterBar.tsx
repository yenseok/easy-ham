import {
  Search,
  RotateCcw,
  CalendarIcon,
  Hash,
  Tag,
  GraduationCap,
  Briefcase,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHANNEL_OPTIONS, PERIOD_OPTIONS } from "@/constants";
import type { Subcategory, PeriodFilter } from "@/types";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedChannels: string[];
  onChannelToggle: (channel: string) => void;
  selectedAcademicCategories: Subcategory[];
  onAcademicCategoryToggle: (category: Subcategory) => void;
  selectedCareerCategories: Subcategory[];
  onCareerCategoryToggle: (category: Subcategory) => void;
  periodFilter: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  onReset: () => void;
}

const SUBCATEGORIES: Subcategory[] = ["할일", "특강", "정보", "행사"];

// 카테고리별 색상 (기존 디자인 유지)
const getCategoryColor = (subcategory: string): string => {
  const colors: Record<string, string> = {
    할일: "bg-red-100 text-red-700 border-red-300",
    특강: "bg-blue-100 text-blue-700 border-blue-300",
    정보: "bg-green-100 text-green-700 border-green-300",
    행사: "bg-purple-100 text-purple-700 border-purple-300",
  };
  return colors[subcategory] || "bg-gray-100 text-gray-700 border-gray-300";
};

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedChannels,
  onChannelToggle,
  selectedAcademicCategories,
  onAcademicCategoryToggle,
  selectedCareerCategories,
  onCareerCategoryToggle,
  periodFilter,
  onPeriodChange,
  onReset,
}: SearchFilterBarProps) {
  return (
    <Card className="p-5 shadow-md">
      {/* 검색바 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="공지사항, 채널, 키워드 검색..."
            className="pl-10 h-12 border-0 bg-gray-50 rounded-lg"
          />
        </div>
        <Button className="h-12 px-6 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">
          <Search className="w-4 h-4 mr-2" />
          검색
        </Button>
      </div>

      {/* 기간 필터 */}
      <div className="flex items-center gap-4 mb-2 min-h-[40px]">
        <span
          className="text-xs whitespace-nowrap flex items-center gap-1.5"
          style={{ fontWeight: 700 }}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          기간
        </span>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((period) => (
            <Button
              key={period}
              variant={periodFilter === period ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(period as PeriodFilter)}
              className={`h-8 px-4 rounded-md ${
                periodFilter === period
                  ? "bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)]"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={{ fontWeight: 500 }}
            >
              {period}
            </Button>
          ))}
          <Select value={periodFilter} onValueChange={onPeriodChange as any}>
            <SelectTrigger className="h-8 w-[120px] text-sm">
              <SelectValue placeholder="기간 설정" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">기간 설정</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 채널 필터 */}
      <div className="flex items-center gap-4 mb-2 min-h-[40px]">
        <span
          className="text-xs whitespace-nowrap flex items-center gap-1.5"
          style={{ fontWeight: 700 }}
        >
          <Hash className="w-3.5 h-3.5" />
          채널
        </span>
        <div className="flex gap-2 flex-wrap">
          {CHANNEL_OPTIONS.map((channel) => {
            const isSelected =
              channel === "전체"
                ? selectedChannels.length === CHANNEL_OPTIONS.length - 1
                : selectedChannels.includes(channel);
            return (
              <Button
                key={channel}
                variant="outline"
                size="sm"
                onClick={() => onChannelToggle(channel)}
                className={`h-8 px-4 rounded-md ${
                  isSelected
                    ? "bg-[var(--brand-orange)] text-white border-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)]"
                    : "bg-white hover:bg-gray-50"
                }`}
                style={{ fontWeight: 500 }}
              >
                {isSelected && <Check className="w-3 h-3 mr-1" />}
                {channel}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-4 min-h-[40px]">
        <span
          className="text-xs whitespace-nowrap flex items-center gap-1.5"
          style={{ fontWeight: 700 }}
        >
          <Tag className="w-3.5 h-3.5" />
          카테고리
        </span>
        <div className="flex items-center gap-2 flex-1">
          {/* 학사 */}
          <span
            className="text-xs text-gray-600 flex items-center gap-1"
            style={{ fontWeight: 500 }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            학사:
          </span>
          <div className="flex gap-2">
            {SUBCATEGORIES.map((cat) => {
              const isSelected = selectedAcademicCategories.includes(cat);
              return (
                <Button
                  key={`academic-${cat}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onAcademicCategoryToggle(cat)}
                  className={`h-8 px-3 rounded-md border ${
                    isSelected
                      ? getCategoryColor(cat)
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1" />}
                  {cat}
                </Button>
              );
            })}
          </div>

          {/* 구분선 */}
          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* 취업 */}
          <span
            className="text-xs text-gray-600 flex items-center gap-1"
            style={{ fontWeight: 500 }}
          >
            <Briefcase className="w-3.5 h-3.5" />
            취업:
          </span>
          <div className="flex gap-2">
            {SUBCATEGORIES.map((cat) => {
              const isSelected = selectedCareerCategories.includes(cat);
              return (
                <Button
                  key={`career-${cat}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onCareerCategoryToggle(cat)}
                  className={`h-8 px-3 rounded-md border ${
                    isSelected
                      ? getCategoryColor(cat)
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {isSelected && <Check className="w-3 h-3 mr-1" />}
                  {cat}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 필터 초기화 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 px-4 rounded-md ml-auto whitespace-nowrap"
          style={{ fontWeight: 500 }}
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          필터 초기화
        </Button>
      </div>
    </Card>
  );
}
