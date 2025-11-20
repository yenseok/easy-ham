/**
 * 마감 시간 관련 유틸 함수
 */

/**
 * deadline 기반 남은 시간 계산
 * @param deadline ISO 8601 형식의 마감 시간
 * @returns 포맷된 남은 시간 문자열 (예: "24시간", "45분", "마감됨")
 */
export function calculateRemainingTime(deadline: string): string {
  try {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();

    // 마감 시간이 지남
    if (diffMs <= 0) {
      return '마감';
    }

    // 시간과 분 계산
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    // 1시간 이상: 시간 단위
    if (diffHours >= 1) {
      return `${Math.round(diffHours)}시간`;
    }

    // 1시간 미만: 분 단위
    return `${diffMinutes}분`;
  } catch (error) {
    console.error('[deadlineUtils] Failed to calculate remaining time:', error);
    return '시간 오류';
  }
}
