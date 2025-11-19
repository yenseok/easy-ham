/**
 * 알림 상태 관리 스토어
 * 일반 알림 + SSE 실시간 알림 + 서버 동기화
 */

import { create } from "zustand";
import type { ServerNotification, UINotification } from "@/types/notification";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/api/notifications";
import { calculateRemainingTime } from "@/utils/deadlineUtils";

export interface Notification {
  id: string; // 알림 고유 ID
  type: "info" | "danger" | "success" | "default";
  title: string;
  time: string; // ISO 8601 형식
  read: boolean;
  content?: string;
  badge?: string; // 오른쪽에 표시할 배지 텍스트 (키워드, 마감시간, 직무 등)
  notice_id?: number; // 공지사항 상세조회용 ID
  deadline?: string; // deadline_approaching 이벤트의 마감 시간 (ISO 8601 형식)
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Notification) => void;
  addSSENotification: (
    notification: Omit<Notification, "time"> & {
      id: string;
      time?: string;
    }
  ) => void;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
}

/**
 * 서버 알림을 UI 포맷으로 변환
 */
function convertServerNotificationToUI(
  notification: ServerNotification
): Notification {
  const eventData = notification.eventData;
  let type: "info" | "danger" | "success" | "default" = "info";
  let badge: string | undefined;
  let title: string = "";
  let notice_id: number = 0;

  // eventType별 처리
  if (notification.eventType === "keyword_matching") {
    type = "info";
    const data = eventData as any;
    title = `구독 키워드: ${data.title}`;
    badge = data.match_keyword?.join(", ");
    notice_id = data.notice_id;
  } else if (notification.eventType === "deadline_approaching") {
    type = "danger";
    const data = eventData as any;
    title = `마감 임박: ${data.title}`;
    badge = calculateRemainingTime(data.deadline);
    notice_id = data.notice_id;
  } else if (notification.eventType === "job_recommendation") {
    type = "success";
    const data = eventData as any;
    title = `관심 직무: ${data.company} 채용 공고`;
    badge = data.matched_jobs?.join(", ");
    notice_id = data.notice_id;
  }

  return {
    id: notification.id,
    type,
    title,
    time: notification.createdAt,
    read: notification.isRead,
    badge,
    notice_id,
    deadline:
      notification.eventType === "deadline_approaching"
        ? (eventData as any)?.deadline
        : undefined,
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  /**
   * SSE에서 받은 실시간 알림 추가
   * time과 relativeTime을 자동으로 생성/관리합니다
   */
  addSSENotification: (notification) => {
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      time: notification.time || now.toISOString(),
    };
    console.log(
      "[Notification Store] Adding SSE notification:",
      newNotification
    );
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  /**
   * 서버에서 기존 알림 로드
   * 새로고침 후 이전 알림들을 복구합니다
   */
  loadNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getNotifications();
      if (response.data?.notificationList) {
        const notifications = response.data.notificationList
          .map(convertServerNotificationToUI)
          .reverse();
        const unreadCount = notifications.filter((n) => !n.read).length;

        set({
          notifications,
          unreadCount,
          isLoading: false,
        });
        console.log(
          "[Notification Store] Loaded notifications:",
          notifications
        );
      }
    } catch (error) {
      console.error(
        "[Notification Store] Failed to load notifications:",
        error
      );
      set({
        error: error instanceof Error ? error.message : "알림 로드 실패",
        isLoading: false,
      });
    }
  },

  /**
   * 단일 알림 읽음 처리
   * 스토어와 서버 동시 업데이트
   */
  markAsRead: async (id) => {
    // 로컬 상태 즉시 업데이트
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    // 서버에 비동기 전송
    try {
      await markNotificationAsRead(id);
      console.log("[Notification Store] Marked as read:", id);
    } catch (error) {
      console.error("[Notification Store] Failed to mark as read:", error);
      // 실패 시 복원
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, read: false } : notif
        ),
        unreadCount: state.unreadCount + 1,
      }));
    }
  },

  /**
   * 전체 알림 읽음 처리
   * 스토어와 서버 동시 업데이트
   */
  markAllAsRead: async () => {
    // 로컬 상태 즉시 업데이트
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        read: true,
      })),
      unreadCount: 0,
    }));

    // 서버에 비동기 전송
    try {
      await markAllNotificationsAsRead();
      console.log("[Notification Store] Marked all as read");
    } catch (error) {
      console.error("[Notification Store] Failed to mark all as read:", error);
      // 실패 시 복원
      const previousNotifications = get().notifications;
      const previousUnreadCount = previousNotifications.filter(
        (n) => !n.read
      ).length;
      set({
        notifications: previousNotifications,
        unreadCount: previousUnreadCount,
      });
    }
  },

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
