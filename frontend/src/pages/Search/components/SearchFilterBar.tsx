import {
  Search,
  RotateCcw,
  CalendarIcon,
  Hash,
  Tag,
  GraduationCap,
  Briefcase,
  Check,
  Star,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
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
  showBookmarkedOnly: boolean;
  onBookmarkFilterToggle: () => void;
  onReset: () => void;
  onSearch: () => void; // 검색 버튼 클릭 핸들러
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
  showBookmarkedOnly,
  onBookmarkFilterToggle,
  onReset,
  onSearch, // 추가된 prop
}: SearchFilterBarProps) {
  const [filterExpanded, setFilterExpanded] = useState(true);

  return (
    <Card className="p-5 shadow-md">
      {/* 검색바 */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
            placeholder="공지사항, 채널, 키워드 검색..."
            className="pl-10 h-12 border-0 bg-gray-50 rounded-lg"
          />
        </div>
        <Button
          onClick={onSearch}
          className="h-12 px-6 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          검색
        </Button>
      </div>

      {/* 필터 영역 토글 버튼 */}
      <button
        onClick={() => setFilterExpanded(!filterExpanded)}
        className="flex items-center gap-2 my-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            filterExpanded ? "rotate-180" : ""
          }`}
        />
        필터 옵션
      </button>

      {/* 필터 영역 */}
      {filterExpanded && (
        <div className="space-y-3">
          {/* 기간 필터 & 북마크 필터 */}
          <div className="flex items-center gap-4 min-h-[40px]">
            <span
              className="text-sm whitespace-nowrap flex items-center gap-1.5"
              style={{ fontWeight: 700 }}
            >
              <CalendarIcon className="w-4 h-4" />
              기간
            </span>
            <div className="flex gap-2 items-center">
              {PERIOD_OPTIONS.map((period) => (
                <Button
                  key={period}
                  variant={periodFilter === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(period as PeriodFilter)}
                  className={`h-8 px-4 rounded-md text-sm ${
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

              {/* 구분선 */}
              <div className="h-6 w-px bg-gray-300 mx-2" />

              {/* 북마크 필터 토글 */}
              <Button
                variant="outline"
                size="sm"
                onClick={onBookmarkFilterToggle}
                className={`h-8 px-3 rounded-md text-sm ${
                  showBookmarkedOnly
                    ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                style={{ fontWeight: 500 }}
              >
                <Star className={`w-4 h-4 mr-1.5 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
                북마크만
              </Button>
            </div>
          </div>

          {/* 채널 필터 */}
          <div className="flex items-center gap-4 min-h-[40px]">
            <span
              className="text-sm whitespace-nowrap flex items-center gap-1.5"
              style={{ fontWeight: 700 }}
            >
              <Hash className="w-4 h-4" />
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
                    className={`h-8 px-4 rounded-md text-sm ${
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
              className="text-sm whitespace-nowrap flex items-center gap-1.5"
              style={{ fontWeight: 700 }}
            >
              <Tag className="w-4 h-4" />
              카테고리
            </span>
            <div className="flex items-center gap-2 flex-1">
              {/* 학사 */}
              <span
                className="text-sm text-gray-600 flex items-center gap-1 whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                <GraduationCap className="w-4 h-4" />
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
                      className={`h-8 px-3 rounded-md border text-sm ${
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
                className="text-sm text-gray-600 flex items-center gap-1 whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                <Briefcase className="w-4 h-4" />
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
                      className={`h-8 px-3 rounded-md border text-sm ${
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
              className="h-8 px-4 rounded-md ml-auto whitespace-nowrap text-sm"
              style={{ fontWeight: 500 }}
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              필터 초기화
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}