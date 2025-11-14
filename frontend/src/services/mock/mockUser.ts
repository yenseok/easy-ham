/**
 * Mock 사용자 데이터
 */

import type { User } from '@/types/user';

export const getMockUser = (): User => ({
  id: 'user-ssafy-13-001',
  nickname: '김싸피',
  email: 'kim.ssafy@ssafy.com',
  profileImage: null,
  campus: '서울',
  classNumber: 1,
  selectedJobs: ['프론트엔드', '백엔드'],
  selectedTechStack: [
    'React',
    'TypeScript',
    'Node.js',
    'Spring',
    'MySQL',
    'Docker',
  ],
  subscribedKeywords: ['프로젝트', '취업', '특강', '채용', '알고리즘'],
  createdAt: '2024-07-01T00:00:00',
  updatedAt: '2024-10-30T00:00:00',
});
