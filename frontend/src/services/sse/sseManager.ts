/**
 * SSE 매니저
 * 재연결, 토큰 감시, 상태 관리 (고급 로직)
 */

import { postStreamClient, notificationStreamClient } from "./sseClient";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSSEStore } from "@/stores/useSSEStore";
import { useSSEPostStore } from "@/stores/useSSEPostStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { API_ENDPOINTS } from "@/constants/api";
import { formatRelativeTime } from "@/utils/timeUtils";
import type {
  SSEError,
  NewPostEvent,
  NotificationEvent,
  KeywordMatchingEvent,
  DeadlineApproachingEvent,
  JobRecommendationEvent,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * SSE 재연결 설정
 */
const RECONNECT_CONFIG = {
  initialDelay: 1000, // 1초
  maxDelay: 30000, // 30초
  maxRetries: 5,
  backoffMultiplier: 2,
};

/**
 * SSE 매니저 싱글톤 클래스
 */
class SSEManager {
  private postStreamReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private notificationStreamReconnectTimer: ReturnType<
    typeof setTimeout
  > | null = null;
  private postStreamRetries = 0;
  private notificationStreamRetries = 0;
  private previousAccessToken: string | null = null;
  private authUnsubscribe: (() => void) | null = null;

  constructor() {
    this.setupAuthListener();
    this.setupNetworkListener();
  }

  /**
   * useAuthStore의 토큰 변경 감시 설정
   * 토큰 변경 시 보호된 라우트에서만 SSE 재연결
   */
  private setupAuthListener(): void {
    // 초기 토큰 저장
    this.previousAccessToken = useAuthStore.getState().accessToken;

    // 보호된 라우트 목록
    const protectedRoutes = [
      '/dashboard',
      '/calendar',
      '/search',
      '/mypage',
      '/overview',
    ];

    // 토큰 변경 감시 - 전체 상태를 받아서 토큰만 확인
    this.authUnsubscribe = useAuthStore.subscribe((state) => {
      const currentToken = state.accessToken;
      if (this.previousAccessToken !== currentToken && currentToken) {
        // 현재 경로 확인
        const currentPath = window.location.pathname;

        // 보호된 라우트에서만 notifications/stream 재연결
        if (protectedRoutes.includes(currentPath)) {
          console.log(`[SSE Manager] Access token changed on ${currentPath}, reconnecting notifications/stream...`);
          this.reconnectNotificationStream();

          // Dashboard에서는 posts/stream도 재연결
          // (DashboardPage의 useEffect는 의존성 배열이 비어 1번만 실행되므로)
          if (currentPath === '/dashboard') {
            console.log('[SSE Manager] On dashboard, also reconnecting posts/stream...');
            this.reconnectPostStream();
          }
        } else {
          console.log(`[SSE Manager] Token changed on ${currentPath}, skipping SSE reconnect`);
        }
      }
      this.previousAccessToken = currentToken;
    });
  }

  /**
   * 네트워크 상태 감시
   * online/offline 이벤트로 재연결 트리거
   */
  private setupNetworkListener(): void {
    window.addEventListener("online", () => {
      console.log("[SSE Manager] Network restored, reconnecting SSE...");
      this.reconnectPostStream();
      this.reconnectNotificationStream();
    });

    window.addEventListener("offline", () => {
      console.log("[SSE Manager] Network lost");
      this.closePostStream();
      this.closeNotificationStream();
    });
  }

  /**
   * posts/stream 연결
   * GET /api/v1/posts/stream
   */
  connectPostStream(): void {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || !state.accessToken) {
      console.warn(
        "[SSE Manager] Not authenticated, skipping posts/stream connection"
      );
      return;
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.sse.posts}`;
    const sseStore = useSSEStore.getState();

    // 이미 연결 중이거나 연결되어 있으면 무시
    if (
      sseStore.postStreamStatus === "connecting" ||
      sseStore.postStreamStatus === "connected"
    ) {
      console.log("[SSE Manager] posts/stream already connecting or connected");
      return;
    }

    sseStore.setPostStreamStatus("connecting");
    this.postStreamRetries = 0;

    postStreamClient.onMessage((data) => {
      console.log("[SSE Manager] Received post:", data);
      const postData = data as NewPostEvent;
      useSSEPostStore.getState().addPost(postData);
    });

    postStreamClient.onError((error: SSEError) => {
      console.error("[SSE Manager] posts/stream error:", error);
      sseStore.setLastError(error);
      sseStore.setPostStreamStatus("error");
      this.schedulePostStreamReconnect();
    });

    try {
      // posts/stream: handshake 이벤트는 "connected", 데이터 이벤트는 "newPost"
      postStreamClient.connect(url, "newPost", "connected");
      sseStore.setPostStreamStatus("connected");
      this.postStreamRetries = 0;
    } catch (error) {
      console.error("[SSE Manager] Failed to connect posts/stream:", error);
      sseStore.setLastError({
        message: "Failed to connect posts/stream",
        timestamp: Date.now(),
      });
      sseStore.setPostStreamStatus("error");
      this.schedulePostStreamReconnect();
    }
  }

  /**
   * notifications/stream 연결
   * GET /api/v1/notifications/stream
   */
  connectNotificationStream(): void {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || !state.accessToken) {
      console.warn(
        "[SSE Manager] Not authenticated, skipping notifications/stream connection"
      );
      return;
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.sse.notifications}`;
    const sseStore = useSSEStore.getState();

    // 이미 연결 중이거나 연결되어 있으면 무시
    if (
      sseStore.notificationStreamStatus === "connecting" ||
      sseStore.notificationStreamStatus === "connected"
    ) {
      console.log(
        "[SSE Manager] notifications/stream already connecting or connected"
      );
      return;
    }

    sseStore.setNotificationStreamStatus("connecting");
    this.notificationStreamRetries = 0;

    notificationStreamClient.onMessage((data) => {
      console.log("[SSE Manager] Received notification:", data);
      const notificationData = data as NotificationEvent;

      // keyword_matching 이벤트 처리
      if ("match_keyword" in notificationData) {
        const keywordEvent = notificationData as KeywordMatchingEvent;
        const keywords = Array.isArray(keywordEvent.match_keyword)
          ? keywordEvent.match_keyword.join(", ")
          : "Unknown keywords";
        const now = new Date();

        useNotificationStore.getState().addSSENotification?.({
          id: keywordEvent.notice_id,
          type: "info",
          title: `구독 키워드: ${keywordEvent.title}`,
          content: undefined,
          badge: keywords,
          time: now.toISOString(),
          relativeTime: formatRelativeTime(now.toISOString()),
          read: false,
        });
      }
      // deadline_approaching 이벤트 처리
      else if ("hours_left" in notificationData) {
        const deadlineEvent = notificationData as DeadlineApproachingEvent;

        // hours_left 기반 긴급도 판단
        let notificationType: "danger" | "info" = "danger";
        if (deadlineEvent.hours_left > 24) {
          notificationType = "info";
        }

        const hoursText =
          deadlineEvent.hours_left < 1
            ? "1시간 이내"
            : `${Math.round(deadlineEvent.hours_left)}시간`;
        const now = new Date();

        useNotificationStore.getState().addSSENotification?.({
          id: String(deadlineEvent.notice_id),
          type: notificationType,
          title: `마감 임박: ${deadlineEvent.title}`,
          content: undefined,
          badge: hoursText,
          time: now.toISOString(),
          relativeTime: formatRelativeTime(now.toISOString()),
          read: false,
        });
      }
      // job_recommendation 이벤트 처리
      else if ("matched_jobs" in notificationData) {
        const jobEvent = notificationData as JobRecommendationEvent;
        const jobs = Array.isArray(jobEvent.matched_jobs)
          ? jobEvent.matched_jobs.join(", ")
          : "Unknown jobs";
        const now = new Date();

        useNotificationStore.getState().addSSENotification?.({
          id: jobEvent.notice_id,
          type: "success",
          title: `관심 직무: ${jobEvent.title}`,
          content: undefined,
          badge: jobs,
          time: now.toISOString(),
          relativeTime: formatRelativeTime(now.toISOString()),
          read: false,
        });
      }
    });

    notificationStreamClient.onError((error: SSEError) => {
      console.error("[SSE Manager] notifications/stream error:", error);
      sseStore.setLastError(error);
      sseStore.setNotificationStreamStatus("error");
      this.scheduleNotificationStreamReconnect();
    });

    try {
      // notifications/stream: handshake 이벤트는 "connected"
      // 데이터 이벤트: "keyword_matching", "deadline_approaching", "job_recommendation"
      notificationStreamClient.connect(url, "keyword_matching", "connected");

      // 추가 이벤트 타입 리스닝 (같은 연결에서)
      notificationStreamClient.addEventListenerForType("deadline_approaching");
      notificationStreamClient.addEventListenerForType("job_recommendation");

      sseStore.setNotificationStreamStatus("connected");
      this.notificationStreamRetries = 0;
    } catch (error) {
      console.error(
        "[SSE Manager] Failed to connect notifications/stream:",
        error
      );
      sseStore.setLastError({
        message: "Failed to connect notifications/stream",
        timestamp: Date.now(),
      });
      sseStore.setNotificationStreamStatus("error");
      this.scheduleNotificationStreamReconnect();
    }
  }

  /**
   * posts/stream 연결 종료
   */
  closePostStream(): void {
    console.log("[SSE Manager] Closing posts/stream");
    if (this.postStreamReconnectTimer) {
      clearTimeout(this.postStreamReconnectTimer);
      this.postStreamReconnectTimer = null;
    }
    postStreamClient.disconnect();
    useSSEStore.getState().setPostStreamStatus("disconnected");
  }

  /**
   * notifications/stream 연결 종료
   */
  closeNotificationStream(): void {
    console.log("[SSE Manager] Closing notifications/stream");
    if (this.notificationStreamReconnectTimer) {
      clearTimeout(this.notificationStreamReconnectTimer);
      this.notificationStreamReconnectTimer = null;
    }
    notificationStreamClient.disconnect();
    useSSEStore.getState().setNotificationStreamStatus("disconnected");
  }

  /**
   * 모든 SSE 연결 종료
   */
  closeAll(): void {
    console.log("[SSE Manager] Closing all SSE connections");
    this.closePostStream();
    this.closeNotificationStream();
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
  }

  /**
   * posts/stream 재연결 스케줄링
   * Exponential backoff 사용
   */
  private schedulePostStreamReconnect(): void {
    if (this.postStreamRetries >= RECONNECT_CONFIG.maxRetries) {
      console.error("[SSE Manager] Max retries reached for posts/stream");
      return;
    }

    const delay = Math.min(
      RECONNECT_CONFIG.initialDelay *
        Math.pow(RECONNECT_CONFIG.backoffMultiplier, this.postStreamRetries),
      RECONNECT_CONFIG.maxDelay
    );

    console.log(
      `[SSE Manager] Scheduling posts/stream reconnect in ${delay}ms (attempt ${
        this.postStreamRetries + 1
      })`
    );

    if (this.postStreamReconnectTimer) {
      clearTimeout(this.postStreamReconnectTimer);
    }

    this.postStreamReconnectTimer = setTimeout(() => {
      this.postStreamRetries++;
      this.reconnectPostStream();
    }, delay);
  }

  /**
   * notifications/stream 재연결 스케줄링
   * Exponential backoff 사용
   */
  private scheduleNotificationStreamReconnect(): void {
    if (this.notificationStreamRetries >= RECONNECT_CONFIG.maxRetries) {
      console.error(
        "[SSE Manager] Max retries reached for notifications/stream"
      );
      return;
    }

    const delay = Math.min(
      RECONNECT_CONFIG.initialDelay *
        Math.pow(
          RECONNECT_CONFIG.backoffMultiplier,
          this.notificationStreamRetries
        ),
      RECONNECT_CONFIG.maxDelay
    );

    console.log(
      `[SSE Manager] Scheduling notifications/stream reconnect in ${delay}ms (attempt ${
        this.notificationStreamRetries + 1
      })`
    );

    if (this.notificationStreamReconnectTimer) {
      clearTimeout(this.notificationStreamReconnectTimer);
    }

    this.notificationStreamReconnectTimer = setTimeout(() => {
      this.notificationStreamRetries++;
      this.reconnectNotificationStream();
    }, delay);
  }

  /**
   * posts/stream 강제 재연결
   */
  private reconnectPostStream(): void {
    console.log("[SSE Manager] Attempting to reconnect posts/stream");
    this.closePostStream();
    this.connectPostStream();
  }

  /**
   * notifications/stream 강제 재연결
   */
  private reconnectNotificationStream(): void {
    console.log("[SSE Manager] Attempting to reconnect notifications/stream");
    this.closeNotificationStream();
    this.connectNotificationStream();
  }
}

// 싱글톤 인스턴스
export const sseManager = new SSEManager();

export default sseManager;
