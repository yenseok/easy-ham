/**
 * Mock Feature 데이터 (Landing 페이지 캐러셀용)
 */

import { Sparkles, Bell, Search, Zap } from 'lucide-react';

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: typeof Sparkles;
  image: string;
}

export const getMockFeatures = (): Feature[] => [
  {
    id: 1,
    title: 'AI 기반 공지사항 자동 분류',
    description:
      '흩어진 공지사항을 AI가 자동으로 분석하고 카테고리별로 분류합니다. 중요도에 따라 우선순위를 정렬하여 놓치기 쉬운 공지를 한눈에 확인하세요.',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1745674684468-b9fc392fda3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MXx8fHwxNzYxNTMyOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    title: '데드라인 중심 알림',
    description:
      '마감일을 놓치지 마세요. 달력 뷰를 통해 데드라인을 한눈에 파악하고, 맞춤형 알림으로 중요한 일정을 사전에 관리할 수 있습니다.',
    icon: Bell,
    image:
      'https://images.unsplash.com/photo-1703300450387-047da16a89c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMGRlYWRsaW5lJTIwc2NoZWR1bGV8ZW58MXx8fHwxNzYxNTM4MDI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    title: '통합 검색',
    description:
      '기존 메신저보다 훨씬 빠르고 정확한 검색 기능을 제공합니다. 필요한 공지사항을 즉시 찾아 업무 효율을 극대화하세요.',
    icon: Search,
    image:
      'https://images.unsplash.com/photo-1686061594183-8c864f508b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFyY2glMjBpbnRlcmZhY2UlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzYxNTM4MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    title: '실시간 모니터링',
    description:
      '새로운 공지사항이 등록되는 즉시 실시간으로 알림을 받습니다. SSE 기반 실시간 알림으로 중요한 공지를 절대 놓치지 마세요.',
    icon: Zap,
    image:
      'https://images.unsplash.com/photo-1731846584223-81977e156b2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBub3RpZmljYXRpb24lMjBzeXN0ZW18ZW58MXx8fHwxNzYxNTM4MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];
