/**
 * 알림 관련 타입 정의
 * 서버 응답 타입과 UI용 타입을 분리
 */

/**
 * 서버에서 받은 알림 목록 응답
 */
export interface ServerNotificationListResponse {
  notificationList: ServerNotification[];
}

/**
 * 서버에서 받은 개별 알림
 */
export interface ServerNotification {
  id: string; // 알림 고유 ID (MongoDB ObjectId)
  eventType: "keyword_matching" | "deadline_approaching" | "job_recommendation";
  eventData: KeywordMatchingEventData | DeadlineApproachingEventData | JobRecommendationEventData;
  createdAt: string; // ISO 8601 형식
  isRead: boolean;
}

/**
 * 키워드 매칭 이벤트 데이터
 */
export interface KeywordMatchingEventData {
  notice_id: number; // posts 테이블의 id
  title: string;
  match_keyword: string[];
  created_at: string;
}

/**
 * 마감시간 임박 이벤트 데이터
 */
export interface DeadlineApproachingEventData {
  notice_id: number; // posts 테이블의 id
  title: string;
  deadline: string; // ISO 8601 형식
  hours_left: number;
  created_at: string;
}

/**
 * 직무 추천 이벤트 데이터
 */
export interface JobRecommendationEventData {
  notice_id: number; // posts 테이블의 id
  title: string;
  company: string;
  matched_jobs: string[];
  deadline?: string;
  created_at: string;
}

/**
 * UI용 알림 타입
 * ServerNotification을 UI 맞춤 포맷으로 변환
 */
export interface UINotification {
  id: string; // 알림 고유 ID
  type: "info" | "danger" | "success" | "default"; // 알림 종류 (이벤트 타입 기반)
  title: string; // 공지사항 제목
  time: string; // ISO 8601 형식
  read: boolean; // 읽음 여부
  badge?: string; // 우측 배지 (키워드, 남은 시간, 직무 등)
  relativeTime?: string; // 상대 시간 ("방금 전", "5분 전" 등)
  notice_id: number; // 상세조회용 공지사항 ID
  deadline?: string; // deadline_approaching 이벤트의 마감 시간 (ISO 8601 형식)
}

/**
 * 서버 응답에서 UI 타입으로 변환할 때 사용하는 임시 타입
 */
export type EventData = KeywordMatchingEventData | DeadlineApproachingEventData | JobRecommendationEventData;
