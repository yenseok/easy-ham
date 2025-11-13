/**
 * SSE (Server-Sent Events) 클라이언트
 * EventSource 생성/관리 (낮은 수준)
 */

import type { SSEMessageCallback, SSEErrorCallback } from './types';

/**
 * SSE 클라이언트 클래스
 * EventSource를 래핑하여 간단한 인터페이스 제공
 */
class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string = '';
  private messageCallback: SSEMessageCallback | null = null;
  private errorCallback: SSEErrorCallback | null = null;

  /**
   * EventSource 생성 및 연결
   * @param url SSE 엔드포인트 URL
   * @param eventType 구독할 이벤트 타입 (예: 'newPost', 'keyword_match')
   * @param handshakeEvent 초기 핸드셰이크 이벤트 타입 (예: 'connected', 'test')
   */
  connect(url: string, eventType: string, handshakeEvent: string = 'connected'): void {
    try {
      this.url = url;
      console.log(`[SSE] Connecting to ${url}`);

      // EventSource 생성 + 쿠키 포함
      // withCredentials: true를 통해 Cookie 헤더에 accessToken 자동 포함
      this.eventSource = new EventSource(url, {
        withCredentials: true
      });

      // 초기 핸드셰이크 이벤트 리스닝 (연결 확인용)
      this.eventSource.addEventListener(handshakeEvent, (event: Event) => {
        if (event instanceof MessageEvent) {
          console.log(`[SSE] Handshake received: ${handshakeEvent}`);
        }
      });

      // 지정된 이벤트 타입 리스닝 (실제 데이터)
      this.eventSource.addEventListener(eventType, (event: Event) => {
        if (event instanceof MessageEvent) {
          try {
            const data = JSON.parse(event.data);
            console.log(`[SSE] Received event: ${eventType}`, data);
            this.messageCallback?.(data);
          } catch (error) {
            console.error(`[SSE] Failed to parse message data:`, error);
            this.errorCallback?.({
              message: 'Failed to parse SSE message',
              timestamp: Date.now(),
            });
          }
        }
      });

      // 연결 에러 처리
      this.eventSource.onerror = (event: Event) => {
        console.error('[SSE] Connection error:', event);
        const status = this.eventSource?.readyState;

        if (status === EventSource.CLOSED) {
          console.log('[SSE] Connection closed by server');
          this.errorCallback?.({
            code: 'CONNECTION_CLOSED',
            message: 'SSE connection closed by server',
            timestamp: Date.now(),
          });
        } else if (status === EventSource.CONNECTING) {
          console.log('[SSE] Attempting to reconnect...');
        } else {
          this.errorCallback?.({
            code: 'CONNECTION_ERROR',
            message: 'SSE connection error',
            timestamp: Date.now(),
          });
        }
      };

      console.log(`[SSE] Connected to ${url}`);
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.errorCallback?.({
        message: 'Failed to create EventSource',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * EventSource 연결 종료
   */
  disconnect(): void {
    if (this.eventSource) {
      console.log(`[SSE] Disconnecting from ${this.url}`);
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * 메시지 수신 콜백 등록
   */
  onMessage(callback: SSEMessageCallback): void {
    this.messageCallback = callback;
  }

  /**
   * 에러 콜백 등록
   */
  onError(callback: SSEErrorCallback): void {
    this.errorCallback = callback;
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * EventSource의 readyState 반환
   * 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
   */
  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }
}

// 싱글톤 인스턴스 (posts/stream용)
export const postStreamClient = new SSEClient();

// 싱글톤 인스턴스 (notifications/stream용)
export const notificationStreamClient = new SSEClient();

export default SSEClient;
