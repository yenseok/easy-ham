/**
 * API 요청/응답 관련 타입 정의
 */

import type { Category, Subcategory } from "./notice";

/**
 * API 공통 응답 형식
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * 백엔드 공지사항 API 응답 (Notice 목록 조회)
 */
export interface NoticeApiResponse {
  postId: number; // 북마크 API에서는 postId 사용
  title: string;
  contentPreview: string;
  mainCategory: string; // "공지사항" 등
  subCategory: string; // "일반공지" 등
  authorId: string;
  authorName: string;
  channelName: string;
  createdAt: string;
  deadline: string | null;
  isLiked: boolean; // 프론트엔드의 bookmarked
  isCompleted?: boolean; // 프론트엔드의 completed (북마크 API에서는 없을 수 있음)
}

/**
 * 북마크 목록 조회 응답 데이터
 */
export interface BookmarksListData {
  notices: NoticeApiResponse[];
}

/**
 * 북마크 추가/삭제 응답 데이터
 */
export interface BookmarkToggleData {
  userNoticeId?: number;
  isLiked: boolean;
}

/**
 * 공지사항 목록 조회 Query Parameters
 */
export interface NoticeListParams {
  page?: number;
  limit?: number;
  search?: string;
  bookmarked?: boolean;
  completed?: boolean;
  category?: Category;
  subcategory?: Subcategory;
  channel?: string;
  deadline_from?: string;
  deadline_to?: string;
  sort_by?: "latest" | "deadline" | "title";
  sort_order?: "asc" | "desc";
}

/**
 * 북마크 목록 조회 Query Parameters
 */
export interface BookmarksListParams {
  type?: "channel" | "dm";
  sort?: "recent" | "oldest";
}

/**
 * 검색 API - 첨부파일 타입
 */
export interface SearchFileItem {
  id: string;
  name: string;
  extension: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  hasPreviewImage: boolean;
}

/**
 * 검색 API - 검색 결과 아이템
 */
export interface SearchResultItem {
  id: number;
  mmMessageId: string;
  mmChannelId: string;
  channelName: string;
  title: string;
  userName: string;
  content: string;
  highlightedContent: string;
  mmCreatedAt: number;
  deadline: string | null;
  mainCategory: number | null;
  subCategory: number | null;
  files: SearchFileItem[] | null;
  isLiked?: boolean;
  isCompleted?: boolean;
  originalLink?: string;  // Mattermost 원문 링크
}

/**
 * 검색 API - 메타데이터
 */
export interface SearchMetadata {
  query: string;
  totalHits: number;
  page: number;
  size: number;
  totalPages: number;
  processingTimeMs: number;
  appliedFilters: {
    channelIds: string[] | null;
    categoryIds: number[] | null;
    startDate: string | null;
    endDate: string | null;
    isLiked: boolean | null;
  };
}

/**
 * 검색 API - 응답 데이터
 */
export interface SearchResponse {
  items: SearchResultItem[];
  metadata: SearchMetadata;
}

/**
 * 검색 API - 요청 파라미터
 */
export interface SearchParams {
  keyword?: string;
  channelIds?: string[];
  categoryIds?: number[];  // subCodeId 배열 (1~8)
  startDate?: string;
  endDate?: string;
  isLiked?: boolean;       // 북마크 필터
  isCompleted?: boolean;   // 완료 필터
  page?: number;
  size?: number;
}

/**
 * 알림 설정 데이터
 */
export interface NotificationSettings {
  deadlineAlertHours: number;
  jobAlertEnabled: boolean;
  keywordAlertEnabled: boolean;
}

/**
 * 알림 설정 조회 응답
 */
export interface NotificationSettingsResponse {
  deadlineAlertHours: number;
  jobAlertEnabled: boolean;
  keywordAlertEnabled: boolean;
}

/**
 * 구독 키워드 데이터
 */
export interface SubscriptionKeyword {
  keywordId: number;
  keyword: string;
}

/**
 * 구독 키워드 목록 조회 응답
 */
export interface KeywordListResponse {
  keywordList: SubscriptionKeyword[];
}

/**
 * 사용자 채널 정보
 */
export interface UserChannel {
  channelId: string;
  channelName: string;
  teamId: string;
  teamName: string;
  type: 'GLOBAL' | 'CLASS';
}

/**
 * 사용자 채널 목록 조회 응답
 */
export interface UserChannelsResponse {
  channels: UserChannel[];
}
