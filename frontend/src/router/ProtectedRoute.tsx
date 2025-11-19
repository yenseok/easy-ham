/**
 * 인증된 사용자만 접근할 수 있는 페이지를 보호하는 컴포넌트
 * Protected 페이지 진입 시 SSE notifications/stream 구독 시작
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { sseManager } from '@/services/sse/sseManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  // Protected 페이지 진입 시 SSE 실시간 알림 스트림 시작
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[ProtectedRoute] Starting SSE notifications/stream subscription');
      // 이미 연결되어 있으면 connectNotificationStream 내부에서 방지됨
      sseManager.connectNotificationStream();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
