/**
 * 필터 상태 관리 스토어
 * Dashboard와 Calendar 페이지에서 공유
 */

import { create } from "zustand";
import type { Subcategory } from "@/types/notice";
import type { PeriodFilter, SortOption } from "@/types/filter";
import type { UserChannel } from "@/types/api";

interface FilterState {
  // 상태
  availableChannels: UserChannel[];
  selectedChannels: string[];  // channelId 배열
  selectedAcademicCategories: Subcategory[];
  selectedCareerCategories: Subcategory[];
  searchQuery: string;
  periodFilter: PeriodFilter;
  customStartDate: Date | null;
  customEndDate: Date | null;
  sortBy: SortOption;
  showBookmarkedOnly: boolean;
  showCompletedOnly: boolean;

  // 액션
  setAvailableChannels: (channels: UserChannel[]) => void;
  toggleChannel: (channelId: string) => void;
  toggleAcademicCategory: (category: Subcategory) => void;
  toggleCareerCategory: (category: Subcategory) => void;
  setSearchQuery: (query: string) => void;
  setPeriodFilter: (period: PeriodFilter) => void;
  setCustomDateRange: (startDate: Date | null, endDate: Date | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  toggleBookmarkFilter: () => void;
  toggleCompletedFilter: () => void;
  resetFilters: () => void;
}

const initialState = {
  availableChannels: [] as UserChannel[],
  selectedChannels: [] as string[],  // 초기에는 빈 배열 (API 로드 후 설정)
  selectedAcademicCategories: ["할일", "특강", "정보", "행사"] as Subcategory[],
  selectedCareerCategories: ["할일", "특강", "정보", "행사"] as Subcategory[],
  searchQuery: "",
  periodFilter: "전체" as PeriodFilter,
  customStartDate: null as Date | null,
  customEndDate: null as Date | null,
  sortBy: "latest" as SortOption,
  showBookmarkedOnly: false,
  showCompletedOnly: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  setAvailableChannels: (channels) =>
    set((state) => ({
      availableChannels: channels,
      // 채널 목록이 로드되면 모든 채널을 기본 선택
      selectedChannels: state.selectedChannels.length === 0
        ? channels.map(c => c.channelId)
        : state.selectedChannels,
    })),

  toggleChannel: (channelId) =>
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(channelId)
        ? state.selectedChannels.filter((c) => c !== channelId)
        : [...state.selectedChannels, channelId],
    })),

  toggleAcademicCategory: (category) =>
    set((state) => ({
      selectedAcademicCategories: state.selectedAcademicCategories.includes(
        category
      )
        ? state.selectedAcademicCategories.filter((c) => c !== category)
        : [...state.selectedAcademicCategories, category],
    })),

  toggleCareerCategory: (category) =>
    set((state) => ({
      selectedCareerCategories: state.selectedCareerCategories.includes(
        category
      )
        ? state.selectedCareerCategories.filter((c) => c !== category)
        : [...state.selectedCareerCategories, category],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setPeriodFilter: (period) => set({ periodFilter: period }),

  setCustomDateRange: (startDate, endDate) =>
    set((state) => ({
      customStartDate: startDate,
      customEndDate: endDate,
      // 날짜가 설정되면 custom으로, null이면 현재 periodFilter 유지
      periodFilter: startDate && endDate ? 'custom' : state.periodFilter,
    })),

  setSortBy: (sortBy) => set({ sortBy }),

  toggleBookmarkFilter: () =>
    set((state) => ({ showBookmarkedOnly: !state.showBookmarkedOnly })),

  toggleCompletedFilter: () =>
    set((state) => ({ showCompletedOnly: !state.showCompletedOnly })),

  resetFilters: () =>
    set((state) => ({
      ...initialState,
      // availableChannels는 API에서 받아온 데이터이므로 유지
      availableChannels: state.availableChannels,
      // 모든 채널을 다시 선택 상태로
      selectedChannels: state.availableChannels.map(c => c.channelId),
    })),
}));
