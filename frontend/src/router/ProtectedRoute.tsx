/**
 * 인증된 사용자만 접근할 수 있는 페이지를 보호하는 컴포넌트
 * Protected 페이지 진입 시 SSE notifications/stream 구독 시작
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { sseManager } from '@/services/sse/sseManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const { loadNotifications } = useNotificationStore();

  // Protected 페이지 진입 시:
  // 1. SSE 실시간 알림 스트림 시작
  // 2. 기존 알림 로드 (새로고침 후 이전 알림 복구)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[ProtectedRoute] Starting SSE notifications/stream and loading existing notifications');

      // SSE 연결 (이미 연결되어 있으면 connectNotificationStream 내부에서 방지됨)
      sseManager.connectNotificationStream();

      // 서버에서 기존 알림 로드
      loadNotifications().catch((error) => {
        console.error('[ProtectedRoute] Failed to load notifications:', error);
      });
    }
  }, [isAuthenticated, loadNotifications]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
