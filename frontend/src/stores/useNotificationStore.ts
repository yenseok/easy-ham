/**
 * 알림 상태 관리 스토어
 * 일반 알림 + SSE 실시간 알림 모두 처리
 */

import { create } from 'zustand';

export interface Notification {
  id: number;
  type: 'info' | 'danger' | 'success' | 'default';
  title: string;
  time: string;
  read: boolean;
  content?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  addSSENotification: (notification: Omit<Notification, 'id' | 'time'>) => void;
  markAsRead: (id: number) => void;
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
   * id와 time을 자동으로 생성합니다
   */
  addSSENotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.floor(Math.random() * 1000000), // 임시 ID (고유성 보장 필요시 수정)
      time: new Date().toLocaleTimeString('ko-KR'),
    };
    console.log('[Notification Store] Adding SSE notification:', newNotification);
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
