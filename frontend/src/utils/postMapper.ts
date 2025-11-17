/**
 * 게시물 상세조회 API 응답 데이터를 MessageDetail 타입으로 변환하는 유틸리티
 * Search 페이지의 searchMapper.ts를 참고하여 동일한 방식으로 구현
 */

import type { MessageDetail } from '@/components/modals/MessageDetailModal';
import type { PostDetailResponse } from '@/services/api/posts';
import type { Attachment, Subcategory } from '@/types/notice';

/**
 * 카테고리 문자열을 정규화된 카테고리로 매핑
 * 백엔드에서 제공하는 mainCategory 문자열 → "학사" | "취업"
 *
 * @param mainCategory - 대카테고리 ("학사", "취업" 등)
 * @returns 정규화된 카테고리
 */
function normalizeMainCategory(mainCategory: string): "학사" | "취업" {
  if (mainCategory?.includes("취업") || mainCategory?.includes("JOB")) {
    return "취업";
  }
  return "학사"; // 기본값
}

/**
 * 소카테고리 문자열을 정규화된 서브카테고리로 매핑
 * 백엔드에서 제공하는 subCategory 문자열 → "할일" | "특강" | "정보" | "행사"
 *
 * @param subCategory - 소카테고리 ("할일", "특강", "정보", "행사" 등)
 * @returns 정규화된 서브카테고리
 */
function normalizeSubCategory(subCategory: string): Subcategory {
  const normalized = subCategory?.toLowerCase() || "정보";

  const mapping: Record<string, Subcategory> = {
    "할일": "할일",
    "todo": "할일",
    "특강": "특강",
    "lecture": "특강",
    "정보": "정보",
    "info": "정보",
    "information": "정보",
    "행사": "행사",
    "event": "행사",
  };

  return mapping[normalized] || "정보"; // 기본값
}

/**
 * deadline 문자열에서 D-day 계산
 * Search 페이지의 searchMapper.ts와 동일한 로직
 *
 * @param deadline - ISO 8601 형식의 마감일 문자열
 * @returns D-day 숫자 (null이면 null)
 */
function calculateDday(deadline: string | null | undefined): number | null {
  if (!deadline) return null;

  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();

    // 시간을 무시하고 날짜만 비교 (자정 기준)
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // 밀리초 차이를 일수로 변환
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
}

/**
 * fileIds 문자열을 Attachment 배열로 변환
 * PostDetailResponse의 fileIds는 쉼표로 구분된 문자열
 * 실제 파일 정보는 별도 API에서 조회해야 하므로,
 * 현재는 파일 ID만으로 기본 Attachment 생성
 *
 * @param fileIds - 쉼표로 구분된 파일 ID 문자열
 * @returns Attachment 배열 (없으면 undefined)
 */
function convertFileIds(fileIds: string): Attachment[] | undefined {
  if (!fileIds || fileIds.trim().length === 0) return undefined;

  // 쉼표로 구분된 파일 ID 파싱
  const ids = fileIds.split(",").map(id => id.trim()).filter(Boolean);

  if (ids.length === 0) return undefined;

  // 각 파일 ID로 기본 Attachment 생성
  return ids.map(fileId => ({
    id: fileId,
    name: `File: ${fileId}`, // 파일명이 없으므로 ID 사용
    type: "file" as const,
    // Mattermost 파일 다운로드 URL
    url: `https://k13a105.p.ssafy.io/chat/api/v4/files/${fileId}`,
  }));
}

/**
 * 게시물 상세조회 응답 → MessageDetail 타입 변환
 *
 * PostDetailResponse를 프론트엔드에서 사용하는 MessageDetail 타입으로 변환합니다.
 * Search 페이지의 handleNoticeClick과 동일한 형식으로 변환합니다.
 *
 * @param postDetail - 게시물 상세조회 API 응답
 * @returns MessageDetail 객체 (모달에서 사용)
 */
export function convertPostDetailToMessageDetail(
  postDetail: PostDetailResponse
): MessageDetail {
  // Mattermost 링크 생성
  const mattermostUrl =
    postDetail.url ||
    `https://mattermost.ssafy.com/message/${postDetail.postId}`;

  return {
    // 기본 정보
    id: postDetail.id,
    title: postDetail.title,
    content: postDetail.content,
    author: postDetail.userName, // userName → author

    // 카테고리 (정규화)
    category: normalizeMainCategory(postDetail.mainCategory),
    subcategory: normalizeSubCategory(postDetail.subCategory),

    // 메타 정보
    created_at: postDetail.createdAt,
    updated_at: postDetail.updatedAt || postDetail.createdAt,
    channel: postDetail.channelName,
    teamName: postDetail.teamName,

    // D-day 및 deadline
    dday: calculateDday(postDetail.deadline),
    deadline: postDetail.deadline || undefined,

    // Mattermost 링크
    mattermostUrl,

    // 첨부파일
    attachments: convertFileIds(postDetail.fileIds),
  };
}
