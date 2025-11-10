/**
 * 알림 설정 상태 관리 스토어
 * Zustand 기반 알림 설정 (deadline, job alert, keyword alert) 및 구독 키워드 관리
 */

import { create } from 'zustand';
import { getNotificationSettings, updateNotificationSettings, getSubscriptionKeywords, addSubscriptionKeyword, deleteSubscriptionKeyword } from '@/services/api/notifications';
import type { NotificationSettings, SubscriptionKeyword } from '@/types/api';

interface NotificationSettingsState extends NotificationSettings {
  isLoading: boolean;
  error: string | null;

  // 구독 키워드 상태
  subscribedKeywords: SubscriptionKeyword[];
  keywordLoading: boolean;
  keywordError: string | null;

  // 액션
  fetchSettings: () => Promise<void>;
  updateDeadlineAlertHours: (hours: number) => Promise<void>;
  updateJobAlertEnabled: (enabled: boolean) => Promise<void>;
  updateKeywordAlertEnabled: (enabled: boolean) => Promise<void>;
  clearError: () => void;

  // 구독 키워드 액션
  fetchSubscribedKeywords: () => Promise<void>;
  addKeyword: (word: string) => Promise<void>;
  removeKeyword: (keywordId: number) => Promise<void>;
  clearKeywordError: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>((set, get) => ({
  deadlineAlertHours: 6,
  jobAlertEnabled: true,
  keywordAlertEnabled: true,
  isLoading: false,
  error: null,
  subscribedKeywords: [],
  keywordLoading: false,
  keywordError: null,

  /**
   * 알림 설정 조회
   * 서버에서 최신 알림 설정을 가져와 스토어에 저장
   */
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getNotificationSettings();
      set({
        deadlineAlertHours: response.data.deadlineAlertHours,
        jobAlertEnabled: response.data.jobAlertEnabled,
        keywordAlertEnabled: response.data.keywordAlertEnabled,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알림 설정 조회 실패';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * 마감 기한 알림 시간 업데이트
   * @param hours 마감 기한 전 몇 시간에 알림을 받을지
   */
  updateDeadlineAlertHours: async (hours: number) => {
    const currentState = get();
    set({ isLoading: true, error: null });

    try {
      await updateNotificationSettings({
        deadlineAlertHours: hours,
        jobAlertEnabled: currentState.jobAlertEnabled,
        keywordAlertEnabled: currentState.keywordAlertEnabled,
      });

      set({
        deadlineAlertHours: hours,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 저장 실패';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * 채용정보 알림 활성화 상태 업데이트
   * @param enabled 채용정보 알림 활성화 여부
   */
  updateJobAlertEnabled: async (enabled: boolean) => {
    const currentState = get();
    set({ isLoading: true, error: null });

    try {
      await updateNotificationSettings({
        deadlineAlertHours: currentState.deadlineAlertHours,
        jobAlertEnabled: enabled,
        keywordAlertEnabled: currentState.keywordAlertEnabled,
      });

      set({
        jobAlertEnabled: enabled,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 저장 실패';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * 키워드 알림 활성화 상태 업데이트
   * @param enabled 키워드 알림 활성화 여부
   */
  updateKeywordAlertEnabled: async (enabled: boolean) => {
    const currentState = get();
    set({ isLoading: true, error: null });

    try {
      await updateNotificationSettings({
        deadlineAlertHours: currentState.deadlineAlertHours,
        jobAlertEnabled: currentState.jobAlertEnabled,
        keywordAlertEnabled: enabled,
      });

      set({
        keywordAlertEnabled: enabled,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '설정 저장 실패';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * 에러 메시지 초기화
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * 구독 키워드 목록 조회
   * 서버에서 사용자의 구독 키워드 목록을 가져와 스토어에 저장
   */
  fetchSubscribedKeywords: async () => {
    set({ keywordLoading: true, keywordError: null });
    try {
      const response = await getSubscriptionKeywords();
      set({
        subscribedKeywords: response.data.keywordList,
        keywordLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '구독 키워드 조회 실패';
      set({ keywordError: errorMessage, keywordLoading: false });
      throw error;
    }
  },

  /**
   * 키워드 추가
   * 새로운 키워드를 구독 목록에 추가하는 API 호출
   * @param word 추가할 키워드
   */
  addKeyword: async (word: string) => {
    set({ keywordLoading: true, keywordError: null });
    try {
      await addSubscriptionKeyword(word);
      // 추가 후 최신 목록 재조회
      await get().fetchSubscribedKeywords();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '키워드 추가 실패';
      set({ keywordError: errorMessage, keywordLoading: false });
      throw error;
    }
  },

  /**
   * 키워드 삭제
   * 구독 중인 키워드를 삭제하는 API 호출
   * @param keywordId 삭제할 키워드 ID
   */
  removeKeyword: async (keywordId: number) => {
    set({ keywordLoading: true, keywordError: null });
    try {
      await deleteSubscriptionKeyword(keywordId);
      // 삭제 후 최신 목록 재조회
      await get().fetchSubscribedKeywords();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '키워드 삭제 실패';
      set({ keywordError: errorMessage, keywordLoading: false });
      throw error;
    }
  },

  /**
   * 키워드 에러 메시지 초기화
   */
  clearKeywordError: () => {
    set({ keywordError: null });
  },
}));
