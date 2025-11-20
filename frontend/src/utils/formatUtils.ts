/**
 * 포맷 유틸 함수
 */

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const pluralize = (
  count: number,
  singular: string,
  plural: string
): string => {
  return count === 1 ? singular : plural;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * 팀명 포맷팅: 첫 단어만 반환
 * 예: "13기 공지 전용" → "13기"
 */
export const formatTeamName = (teamName: string): string => {
  return teamName.split(' ')[0];
};

/**
 * 채널명 포맷팅: 앞의 "숫자." 패턴 제거
 * 예: "5. [취업] 공지사항" → "[취업] 공지사항"
 */
export const formatChannelName = (channelName: string): string => {
  return channelName.replace(/^\d+\.\s*/, '');
};

/**
 * 채널 디스플레이 이름 포맷팅
 * 예: ("13기", "5. [취업] 공지사항") → "13기 - [취업] 공지사항"
 */
export const formatChannelDisplayName = (displayName: string, channelName: string): string => {
  return `${displayName} - ${formatChannelName(channelName)}`;
};
