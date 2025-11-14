/**
 * 시간 관련 유틸리티 함수
 */

/**
 * ISO 8601 문자열을 상대 시간으로 변환
 * @param isoString ISO 8601 형식의 날짜/시간 문자열 또는 한국 시간 문자열
 * @returns "n분전", "n시간전" 형식의 문자열
 */
export function formatRelativeTime(timeString: string): string {
  try {
    // ISO 8601 또는 일반 시간 문자열을 Date 객체로 변환
    const time = new Date(timeString);
    const now = new Date();

    // 유효한 날짜인지 확인
    if (isNaN(time.getTime())) {
      console.warn(`[timeUtils] Invalid time string: ${timeString}`);
      return "방금 전";
    }

    const diffMs = now.getTime() - time.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // 1시간 미만
    if (diffMinutes < 60) {
      if (diffMinutes <= 0) return "방금 전";
      return `${diffMinutes}분전`;
    }

    // 1시간 이상 24시간 미만
    if (diffHours < 24) {
      return `${diffHours}시간전`;
    }

    // 24시간 이상
    if (diffDays < 7) {
      return `${diffDays}일전`;
    }

    // 일주일 이상은 원래 시간 표시
    return timeString;
  } catch (error) {
    console.error(`[timeUtils] Error formatting time:`, error);
    return "방금 전";
  }
}

/**
 * 현재 시간을 한국 표준시로 포매팅
 * @returns "오전/오후 h:mm:ss" 형식의 문자열
 */
export function getCurrentTimeKR(): string {
  return new Date().toLocaleTimeString("ko-KR");
}
