/**
 * 공지사항 관련 타입 정의
 */

export type Category = "학사" | "취업";

export type Subcategory = "할일" | "특강" | "정보" | "행사";

export interface Attachment {
  id: number;
  type: "image" | "file";
  name: string;
  url: string;
  size?: number;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  channel: string;
  category: Category;
  subcategory: Subcategory;
  dday: number | null;
  deadline?: string;
  bookmarked: boolean;
  completed: boolean;
  attachments?: Attachment[];
  mattermostUrl?: string;
  createdAt: string;
  updatedAt: string;

  // 캘린더 필드
  startDate?: string | Date; // 이벤트/공지 시작일
  endDate?: string | Date; // 다중일 이벤트 종료일
  startTime?: string; // 시작 시간 (예: "14:00")
  endTime?: string; // 종료 시간 (예: "16:00")
  location?: string; // 행사 장소 (예: "대강당")
  allDay?: boolean; // 종일 여부
}
