/**
 * 채널 관련 상수
 *
 * @deprecated CHANNEL_OPTIONS는 더 이상 사용되지 않습니다.
 * 대신 getUserChannels() API를 통해 실제 사용자 채널 목록을 가져옵니다.
 *
 * 이 파일은 하위 호환성을 위해 유지되며, 향후 제거될 예정입니다.
 */

export const CHANNEL_OPTIONS = [
  '전체',
  '13기-공지사항',
  '13기-취업공고',
  '13기-취업정보',
  '서울1반-공지사항',
] as const;

export type ChannelOption = (typeof CHANNEL_OPTIONS)[number];
