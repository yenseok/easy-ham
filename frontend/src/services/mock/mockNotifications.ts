/**
 * Mock 알림 데이터
 */

import type { Notification } from '@/stores/useNotificationStore';

export const getMockNotifications = (): Notification[] => [
  {
    id: 1,
    type: 'info',
    title: '[중요] AI 실습특강 III 오늘 13시',
    time: '1시간 전',
    read: false,
  },
  {
    id: 2,
    type: 'danger',
    title: '프로젝트 중간발표 내일 마감',
    time: '2시간 전',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: '이력서 피드백 완료',
    time: '3시간 전',
    read: false,
  },
  {
    id: 4,
    type: 'default',
    title: '새로운 채용공고 2건',
    time: '5시간 전',
    read: false,
  },
];
