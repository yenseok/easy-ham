/**
 * 알림 상태 관리 스토어
 * 일반 알림 + SSE 실시간 알림 모두 처리
 */

import { create } from "zustand";

export interface Notification {
  id: string; // SSE notice_id를 그대로 사용 (고유성 보장)
  type: "info" | "danger" | "success" | "default";
  title: string;
  time: string; // ISO 8601 형식 또는 locale 시간 문자열 (내부적으로 상대시간 변환)
  read: boolean;
  content?: string;
  badge?: string; // 오른쪽에 표시할 배지 텍스트 (키워드, 마감시간, 직무 등)
  relativeTime?: string; // 캐시된 상대 시간 문자열 (최적화용)
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  addSSENotification: (
    notification: Omit<Notification, "time"> & { id: string; time?: string; relativeTime?: string }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  /**
   * SSE에서 받은 실시간 알림 추가
   * time과 relativeTime을 자동으로 생성/관리합니다 (id는 notice_id로 전달됨)
   */
  addSSENotification: (notification) => {
    const now = new Date();
    const newNotification: Notification = {
      ...notification,
      time: notification.time || now.toISOString(),
      relativeTime: notification.relativeTime || "방금 전",
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

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        read: true,
      })),
      unreadCount: 0,
    })),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
