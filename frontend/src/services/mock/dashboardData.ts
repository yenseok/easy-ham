/**
 * Overview 페이지용 목 데이터
 */

import type { Notice } from "@/types/notice";

interface CalendarEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  channel: string;
  category: string;
  subcategory: string;
}

interface DashboardData {
  notices: Notice[];
  weeklyEvents: CalendarEvent[];
}

export const getMockDashboardData = (): DashboardData => {
  const now = new Date();

  const notices: Notice[] = [
    // 북마크된 공지 5개
    {
      id: 1,
      title: "프로젝트 중간발표 PPT 제출",
      content: "팀별 프로젝트 진행상황을 정리하여 PPT로 제출해주세요.",
      author: "김민정 (컨설턴트)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 2,
      deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: true,
      completed: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/123",
    },
    {
      id: 2,
      title: "AI 특강 사전 설문 작성",
      content: "다음 주 AI 특강을 위한 사전 설문에 참여해주세요.",
      author: "안다은 (교육프로)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
      dday: 5,
      deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: true,
      completed: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/124",
    },
    {
      id: 3,
      title: "코드 리뷰 세션 안내",
      content: "우수 프로젝트 코드 리뷰 세션이 진행됩니다.",
      author: "김강토 (실습코치)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
      dday: null,
      bookmarked: true,
      completed: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/125",
    },
    {
      id: 4,
      title: "네트워킹 데이 참가 신청",
      content: "선배 개발자와의 만남 행사에 참여하세요.",
      author: "강승엽 (실습코치)",
      channel: "서울1반-공지사항",
      category: "학사",
      subcategory: "행사",
      dday: 8,
      deadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: true,
      completed: false,
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/126",
    },
    {
      id: 5,
      title: "Git 협업 가이드 공유",
      content: "팀 프로젝트를 위한 Git 협업 가이드가 업데이트되었습니다.",
      author: "이현석",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
      dday: null,
      bookmarked: true,
      completed: true,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/127",
    },

    // 마감 임박 할일 (D-7 이내)
    {
      id: 6,
      title: "알고리즘 과제 제출",
      content: "이번 주 알고리즘 문제 풀이 결과를 제출해주세요.",
      author: "최형준 (실습코치)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 1,
      deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/128",
    },
    {
      id: 7,
      title: "중간 점검 회의록 작성",
      content: "팀 중간 점검 회의록을 작성하여 제출해주세요.",
      author: "박프로 (프로 매니저)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 3,
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/129",
    },
    {
      id: 8,
      title: "개발환경 셋팅 확인서 제출",
      content: "다음 주 실습을 위한 개발환경 셋팅을 완료하고 확인서를 제출하세요.",
      author: "이실습 (교육 매니저)",
      channel: "서울1반-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 4,
      deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/130",
    },
    {
      id: 9,
      title: "팀 규칙 문서 작성",
      content: "팀 협업 규칙을 정리하여 문서화해주세요.",
      author: "최협업 (멘토)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 6,
      deadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/131",
    },
    {
      id: 10,
      title: "학습 일지 제출",
      content: "이번 주 학습 내용을 정리하여 제출해주세요.",
      author: "김교육 (교육 매니저)",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
      dday: 7,
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/132",
    },

    // 채용공고 (취업 카테고리)
    {
      id: 11,
      title: "삼성전자 DS부문 신입 공채",
      content: "삼성전자 DS부문에서 SW 개발 신입사원을 채용합니다.",
      author: "채용담당 (취업 지원팀)",
      channel: "13기-취업공고",
      category: "취업",
      subcategory: "정보",
      dday: 7,
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/133",
    },
    {
      id: 12,
      title: "네이버 신입 개발자 채용",
      content: "네이버에서 웹 프론트엔드/백엔드 개발자를 채용합니다.",
      author: "채용담당 (취업 지원팀)",
      channel: "13기-취업공고",
      category: "취업",
      subcategory: "정보",
      dday: 10,
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/134",
    },
    {
      id: 13,
      title: "카카오 인턴십 프로그램",
      content: "카카오에서 여름 인턴십 지원자를 모집합니다.",
      author: "채용담당 (취업 지원팀)",
      channel: "13기-취업공고",
      category: "취업",
      subcategory: "정보",
      dday: 14,
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/135",
    },
    {
      id: 14,
      title: "토스 프론트엔드 개발자 채용",
      content: "토스에서 프론트엔드 개발자를 채용합니다. React 경험자 우대.",
      author: "채용담당 (취업 지원팀)",
      channel: "13기-취업정보",
      category: "취업",
      subcategory: "정보",
      dday: 12,
      deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      bookmarked: false,
      completed: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      mattermostUrl: "https://mattermost.ssafy.com/posts/136",
    },
  ];

  // 이번 주 이벤트 (일~토)
  const getWeekStart = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  };

  const weekStart = getWeekStart();

  const weeklyEvents: CalendarEvent[] = [
    // 월요일 (2개)
    {
      id: 101,
      title: "알고리즘 스터디",
      startDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      startTime: "19:00",
      endTime: "21:00",
      description: "백준 문제 풀이",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
    },
    {
      id: 102,
      title: "프로젝트 기획 회의",
      startDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
      startTime: "14:00",
      endTime: "16:00",
      description: "팀 프로젝트 아이디어 논의",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
    },
    // 화요일 (1개)
    {
      id: 103,
      title: "Git 협업 특강",
      startDate: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
      startTime: "10:00",
      endTime: "12:00",
      description: "Git 브랜치 전략 및 PR 실습",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
    },
    // 수요일 (3개)
    {
      id: 104,
      title: "AI 실습 III",
      startDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      startTime: "13:00",
      endTime: "17:00",
      description: "머신러닝 모델 학습",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "특강",
    },
    {
      id: 105,
      title: "코드 리뷰 세션",
      startDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      startTime: "15:00",
      endTime: "17:00",
      description: "우수 프로젝트 코드 분석",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "정보",
    },
    {
      id: 106,
      title: "삼성 채용설명회",
      startDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
      startTime: "13:00",
      endTime: "15:00",
      description: "DS부문 채용 안내",
      channel: "13기-취업정보",
      category: "취업",
      subcategory: "행사",
    },
    // 목요일 (1개)
    {
      id: 107,
      title: "네트워킹 데이",
      startDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
      startTime: "18:00",
      endTime: "20:00",
      description: "선배 개발자와의 만남",
      channel: "서울1반-공지사항",
      category: "학사",
      subcategory: "행사",
    },
    // 금요일 (2개)
    {
      id: 108,
      title: "프로젝트 중간 발표",
      startDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: "14:00",
      endTime: "18:00",
      description: "팀별 진행상황 발표",
      channel: "13기-공지사항",
      category: "학사",
      subcategory: "할일",
    },
    {
      id: 109,
      title: "취업 특강",
      startDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: "14:00",
      endTime: "16:00",
      description: "이력서 작성 및 면접 팁",
      channel: "13기-취업공지",
      category: "취업",
      subcategory: "특강",
    },
  ];

  return {
    notices,
    weeklyEvents,
  };
};
