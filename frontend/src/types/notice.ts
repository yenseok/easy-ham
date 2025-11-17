/**
 * 공지사항 관련 타입 정의
 */

export type Category = "학사" | "취업";

export type Subcategory = "할일" | "특강" | "정보" | "행사";

export interface Attachment {
  id: string; // 백엔드 API에서 string으로 반환
  type: "image" | "file" | "pdf" | "excel";
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  channel: string;
  teamName?: string;
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
  campusId?: string | null; // 캠퍼스 정보 (예: "서울,부울경" 또는 null)

  // 캘린더 필드
  startDate?: string | Date; // 이벤트/공지 시작일
  endDate?: string | Date; // 다중일 이벤트 종료일
  startTime?: string; // 시작 시간 (예: "14:00")
  endTime?: string; // 종료 시간 (예: "16:00")
  location?: string; // 행사 장소 (예: "대강당")
  allDay?: boolean; // 종일 여부
}
