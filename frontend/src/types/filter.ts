/**
 * 필터 관련 타입 정의
 */

import type { Subcategory } from './notice';

export type PeriodFilter = '전체' | '오늘' | '이번주' | '이번달' | 'custom';

export type SortOption = 'latest' | 'deadline' | 'title';

export interface CustomPeriod {
  startDate: Date;
  endDate: Date;
}

export interface FilterState {
  channels: string[];
  academicCategories: Subcategory[];
  careerCategories: Subcategory[];
  period: PeriodFilter;
  searchQuery: string;
  sortBy: SortOption;
}
