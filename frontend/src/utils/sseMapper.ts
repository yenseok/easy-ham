/**
 * SSE newPost 이벤트 데이터를 프론트엔드 Notice 타입으로 변환하는 유틸리티
 */

import type { Notice, Subcategory, Attachment } from '@/types/notice';
import type { NewPostEvent } from '@/services/sse/types';


/**
 * SSE mainCategory 문자열을 Notice Category로 변환
 *
 * @param mainCategory - SSE에서 받은 mainCategory ("학사", "취업" 등)
 * @returns "학사" | "취업"
 */
function mapMainCategory(mainCategory: string): "학사" | "취업" {
  // 한글 그대로 오는 경우
  if (mainCategory === "학사" || mainCategory === "취업") {
    return mainCategory;
  }

  // 영어 코드인 경우 (혹시 모를 경우 대비)
  const categoryMap: Record<string, "학사" | "취업"> = {
    "EDU": "학사",
    "EDUCATION": "학사",
    "JOB": "취업",
    "CAREER": "취업",
  };

  return categoryMap[mainCategory.toUpperCase()] || "학사";
}

/**
 * SSE subCategory 문자열을 Notice Subcategory로 변환
 *
 * @param subCategory - SSE에서 받은 subCategory ("할일", "특강", "정보", "행사" 등)
 * @returns "할일" | "특강" | "정보" | "행사"
 */
function mapSubCategory(subCategory: string): Subcategory {
  // 한글 그대로 오는 경우
  const validSubcategories: Subcategory[] = ["할일", "특강", "정보", "행사"];
  if (validSubcategories.includes(subCategory as Subcategory)) {
    return subCategory as Subcategory;
  }

  // 영어 코드인 경우 (혹시 모를 경우 대비)
  const subcategoryMap: Record<string, Subcategory> = {
    "TODO": "할일",
    "TASK": "할일",
    "LECTURE": "특강",
    "SEMINAR": "특강",
    "INFO": "정보",
    "INFORMATION": "정보",
    "EVENT": "행사",
  };

  return subcategoryMap[subCategory.toUpperCase()] || "정보";
}

/**
 * deadline 문자열에서 D-day 계산
 *
 * @param deadline - ISO 8601 형식의 마감일 문자열 또는 null
 * @returns D-day 숫자 (null이면 null, 오늘이면 0, 내일이면 1, 어제면 -1)
 */
function calculateDday(deadline: string | null): number | null {
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
    // 날짜 파싱 실패 시 null 반환
    return null;
  }
}

/**
 * SSE fileIds를 Attachment 배열로 변환
 *
 * fileIds는 백엔드에 따라 다음 형태로 올 수 있음:
 * - string[] 배열
 * - string (쉼표로 구분된 ID들)
 * - null/빈 문자열
 *
 * @param fileIds - SSE에서 받은 fileIds
 * @returns Attachment 배열 (없으면 undefined)
 */
function convertFileIds(fileIds: string[] | string | null): Attachment[] | undefined {
  if (!fileIds) return undefined;

  // 배열로 변환
  let idArray: string[] = [];
  if (Array.isArray(fileIds)) {
    idArray = fileIds;
  } else if (typeof fileIds === 'string' && fileIds.trim() !== '') {
    idArray = fileIds.split(',').map(id => id.trim()).filter(id => id !== '');
  }

  if (idArray.length === 0) return undefined;

  return idArray.map(fileId => ({
    id: fileId,
    name: `file_${fileId}`,
    type: 'file' as const, // 실제 타입은 알 수 없으므로 기본값
    url: `https://k13a105.p.ssafy.io/chat/api/v4/files/${fileId}`,
  }));
}

/**
 * Mattermost URL 생성
 *
 * @param postId - 게시글 ID
 * @param channelId - 채널 ID
 * @returns Mattermost 메시지 링크
 */
function constructMattermostUrl(postId: string, channelId: string): string {
  return `https://k13a105.p.ssafy.io/chat/${channelId}/pl/${postId}`;
}

/**
 * SSE NewPostEvent를 Notice 타입으로 변환
 *
 * 이 함수는 SSE로 수신한 newPost 이벤트를 Dashboard에서 사용하는
 * Notice 타입으로 변환합니다.
 *
 * @param event - SSE newPost 이벤트 데이터
 * @returns Notice 객체
 */
export function convertSSEEventToNotice(event: NewPostEvent): Notice {
  return {
    // 직접 매핑
    id: event.id,
    title: event.title,
    content: event.content,
    author: event.userName,
    channel: event.channelName,
    teamName: event.teamName,
    createdAt: event.createdAt,
    updatedAt: event.createdAt, // 새 게시글이므로 createdAt과 동일

    // 카테고리 변환
    category: mapMainCategory(event.mainCategory),
    subcategory: mapSubCategory(event.subCategory),

    // 날짜 계산
    dday: calculateDday(event.deadline),
    deadline: event.deadline || undefined,

    // 첨부파일 변환
    attachments: convertFileIds(event.fileIds),

    // Mattermost URL 생성
    mattermostUrl: constructMattermostUrl(event.postId, event.channelId),

    // 새 게시글 기본값
    bookmarked: false, // SSE로 온 게시글은 아직 북마크되지 않음
    completed: false,  // 새 게시글은 완료되지 않음
  };
}
