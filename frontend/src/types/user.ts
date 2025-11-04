/**
 * 사용자 관련 타입 정의
 */

export type Campus = '서울' | '대전' | '광주' | '구미' | '부울경';

export type JobType =
  | '프론트엔드'
  | '백엔드'
  | 'DevOps'
  | '풀스택'
  | '모바일'
  | 'AI/ML'
  | '데이터'
  | '임베디드'
  | '보안'
  | '기타';

export interface User {
  id: string;
  nickname: string;
  email: string;
  profileImage: string | null;
  campus: Campus;
  classNumber: number;
  selectedJobs: JobType[];
  selectedTechStack: string[];
  subscribedKeywords: string[];
  createdAt: string;
  updatedAt: string;
}
