/**
 * 필터 상태 관리 스토어
 * Dashboard와 Calendar 페이지에서 공유
 */

import { create } from "zustand";
import type { Subcategory } from "@/types/notice";
import type { PeriodFilter, SortOption } from "@/types/filter";

interface FilterState {
  // 상태
  selectedChannels: string[];
  selectedAcademicCategories: Subcategory[];
  selectedCareerCategories: Subcategory[];
  searchQuery: string;
  periodFilter: PeriodFilter;
  sortBy: SortOption;
  showBookmarkedOnly: boolean;

  // 액션
  toggleChannel: (channel: string) => void;
  toggleAcademicCategory: (category: Subcategory) => void;
  toggleCareerCategory: (category: Subcategory) => void;
  setSearchQuery: (query: string) => void;
  setPeriodFilter: (period: PeriodFilter) => void;
  setSortBy: (sortBy: SortOption) => void;
  toggleBookmarkFilter: () => void;
  resetFilters: () => void;
}

const initialState = {
  selectedChannels: [
    "13기-공지사항",
    "13기-취업공고",
    "13기-취업정보",
    "서울1반-공지사항",
  ],
  selectedAcademicCategories: ["할일", "특강", "정보", "행사"] as Subcategory[],
  selectedCareerCategories: ["할일", "특강", "정보", "행사"] as Subcategory[],
  searchQuery: "",
  periodFilter: "전체" as PeriodFilter,
  sortBy: "latest" as SortOption,
  showBookmarkedOnly: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,

  toggleChannel: (channel) =>
    set((state) => ({
      selectedChannels: state.selectedChannels.includes(channel)
        ? state.selectedChannels.filter((c) => c !== channel)
        : [...state.selectedChannels, channel],
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

  setSortBy: (sortBy) => set({ sortBy }),

  toggleBookmarkFilter: () =>
    set((state) => ({ showBookmarkedOnly: !state.showBookmarkedOnly })),

  resetFilters: () => set(initialState),
}));
