/**
 * SSE (Server-Sent Events) 관련 타입 정의
 */

/**
 * SSE 연결 상태
 */
export type SSEConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * SSE 이벤트 기본 인터페이스
 */
export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

/**
 * newPost 이벤트 스키마
 * /api/v1/posts/stream에서 수신
 */
export interface NewPostEvent {
  id: number;
  postId: string;
  title: string;
  content: string;
  mainCategory: string;
  subCategory: string;
  channelId: string;
  channelName: string;
  teamName?: string;
  userId: string;
  userName: string;
  deadline: string | null;
  campusList: string | null;
  createdAt: string;
  webhookTimestamp: number;
  fileIds: string[] | string | null;
  positionId: number | null;
  positionName: string | null;
  url: string | null;
  position: string | null;
}

/**
 * keyword_matching 이벤트 스키마
 * /api/v1/notifications/stream에서 수신
 */
export interface KeywordMatchingEvent {
  notice_id: string;
  title: string;
  match_keyword: string[];
  [key: string]: unknown;
}

/**
 * deadline_approaching 이벤트 스키마
 * /api/v1/notifications/stream에서 수신
 * 마감일이 다가올 때 발송되는 긴급 알림
 */
export interface DeadlineApproachingEvent {
  notice_id: number;
  title: string;
  deadline: string; // ISO 8601 형식
  hours_left: number;
  created_at: string;
  [key: string]: unknown;
}

/**
 * SSE Notification 이벤트 Union 타입
 * keyword_matching과 deadline_approaching을 모두 지원
 */
export type NotificationEvent = KeywordMatchingEvent | DeadlineApproachingEvent;

/**
 * SSE 에러 상태
 */
export interface SSEError {
  code?: string;
  message: string;
  timestamp: number;
}

/**
 * SSE 매니저의 콜백 함수 타입
 */
export type SSEMessageCallback = (data: unknown) => void;
export type SSEErrorCallback = (error: SSEError) => void;
export type SSEStatusCallback = (status: SSEConnectionStatus) => void;
