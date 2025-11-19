/**
 * SSE 연결 상태 관리 스토어
 * 두 스트림(posts, notifications)의 연결 상태 및 에러 추적
 */

import { create } from 'zustand';
import type { SSEConnectionStatus, SSEError } from '@/services/sse/types';

interface SSEState {
  // 연결 상태
  postStreamStatus: SSEConnectionStatus;
  notificationStreamStatus: SSEConnectionStatus;

  // 에러 정보
  lastError: SSEError | null;

  // 액션
  setPostStreamStatus: (status: SSEConnectionStatus) => void;
  setNotificationStreamStatus: (status: SSEConnectionStatus) => void;
  setLastError: (error: SSEError | null) => void;
  reset: () => void;
}

export const useSSEStore = create<SSEState>((set) => ({
  postStreamStatus: 'disconnected',
  notificationStreamStatus: 'disconnected',
  lastError: null,

  setPostStreamStatus: (status) => {
    console.log(`[SSE Store] Post stream status: ${status}`);
    set({ postStreamStatus: status });
  },

  setNotificationStreamStatus: (status) => {
    console.log(`[SSE Store] Notification stream status: ${status}`);
    set({ notificationStreamStatus: status });
  },

  setLastError: (error) => {
    if (error) {
      console.error('[SSE Store] Error:', error);
    }
    set({ lastError: error });
  },

  reset: () => {
    console.log('[SSE Store] Resetting SSE store');
    set({
      postStreamStatus: 'disconnected',
      notificationStreamStatus: 'disconnected',
      lastError: null,
    });
  },
}));
