/**
 * 채널 관련 상수
 */

export const CHANNEL_OPTIONS = [
  '전체',
  '13기-공지사항',
  '13기-취업공고',
  '13기-취업정보',
  '서울1반-공지사항',
] as const;

export type ChannelOption = (typeof CHANNEL_OPTIONS)[number];
