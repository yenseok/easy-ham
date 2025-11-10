/**
 * 알림 설정 관련 API
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, NotificationSettings, NotificationSettingsResponse, KeywordListResponse } from '@/types/api';

// ===== 타입 정의 =====

export interface InitializeNotificationSettingsResponse {
  status: number;
  message: string;
}

// ===== API 함수 =====

/**
 * 알림 설정 초기화
 * 회원가입 완료 후 사용자의 알림 설정을 초기화하는 API
 * @returns 성공 메시지
 */
export const initializeNotificationSettings = async (): Promise<ApiResponse<InitializeNotificationSettingsResponse>> => {
  return apiClient.post<InitializeNotificationSettingsResponse>(
    API_ENDPOINTS.notifications.initializeSettings,
    {}
  );
};

/**
 * 알림 설정 조회
 * 사용자의 현재 알림 설정을 조회하는 API
 * @returns 알림 설정 데이터 (deadlineAlertHours, jobAlertEnabled, keywordAlertEnabled)
 */
export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettingsResponse>> => {
  return apiClient.get<NotificationSettingsResponse>(
    API_ENDPOINTS.notifications.getSettings
  );
};

/**
 * 알림 설정 수정
 * 사용자의 알림 설정을 수정하는 API
 * @param settings - 변경할 알림 설정 (deadlineAlertHours, jobAlertEnabled, keywordAlertEnabled)
 * @returns 성공 메시지
 */
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.patch<{ message: string }>(
    API_ENDPOINTS.notifications.updateSettings,
    settings
  );
};

// ===== 구독 키워드 관련 API =====

/**
 * 구독 키워드 목록 조회
 * 사용자가 구독 중인 키워드 목록을 조회하는 API
 * @returns 구독 키워드 목록
 */
export const getSubscriptionKeywords = async (): Promise<ApiResponse<KeywordListResponse>> => {
  return apiClient.get<KeywordListResponse>(
    API_ENDPOINTS.notifications.keywords.list
  );
};

/**
 * 구독 키워드 추가
 * 새로운 키워드를 구독하는 API
 * @param word - 추가할 키워드
 * @returns 성공 메시지
 */
export const addSubscriptionKeyword = async (
  word: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.post<{ message: string }>(
    API_ENDPOINTS.notifications.keywords.add,
    { word }
  );
};

/**
 * 구독 키워드 삭제
 * 구독 중인 키워드를 삭제하는 API
 * @param keywordId - 삭제할 키워드 ID
 * @returns 성공 메시지
 */
export const deleteSubscriptionKeyword = async (
  keywordId: number
): Promise<ApiResponse<{ message: string }>> => {
  return apiClient.delete<{ message: string }>(
    API_ENDPOINTS.notifications.keywords.remove(keywordId)
  );
};
