/**
 * 캘린더 이벤트 관련 타입 정의
 */

import type { Category, Subcategory } from './notice';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  channel: string;
  category: Category;
  subcategory: Subcategory;
  allDay: boolean;
}
