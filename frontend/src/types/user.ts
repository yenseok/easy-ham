/**
 * 사용자 관련 타입 정의
 */

export interface User {
  // SSO 콜백에서 받는 기본 정보
  id: string;
  email: string;
  name: string;

  // 회원가입 후 추가되는 선택적 정보
  campusId?: number;
  generation?: number;
  classroom?: number;
  positionIds?: number[];
  skillIds?: number[];
}
