/**
 * 북마크 API 응답 데이터를 프론트엔드 Notice 타입으로 변환하는 유틸리티
 */

import type { Notice, Subcategory } from '@/types/notice';
import type { NoticeApiResponse } from '@/types/api';

/**
 * mainCategory 문자열을 통해 카테고리 추론
 */
function mapMainCategory(mainCategory: string): "학사" | "취업" {
  // "공지사항" → 학사, 그 외 → 취업
  return mainCategory === "공지사항" ? "학사" : "취업";
}

/**
 * subCategory 문자열을 Subcategory로 매핑
 */
function mapSubCategory(subCategory: string): Subcategory {
  const mapping: Record<string, Subcategory> = {
    "일반공지": "정보",
    "할일": "할일",
    "특강": "특강",
    "정보": "정보",
    "행사": "행사",
  };

  return mapping[subCategory] || "정보";
}

/**
 * deadline 문자열에서 D-day 계산
 */
function calculateDday(deadline: string | null): number | null {
  if (!deadline) return null;

  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();

    // 시간을 무시하고 날짜만 비교
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
}

/**
 * 북마크 API 응답 아이템 → Notice 타입 변환
 */
export function convertBookmarkItemToNotice(item: NoticeApiResponse): Notice {
  return {
    id: item.postId, // postId 사용
    title: item.title,
    content: item.contentPreview,
    author: item.authorName,
    channel: item.channelName,
    category: mapMainCategory(item.mainCategory),
    subcategory: mapSubCategory(item.subCategory),
    bookmarked: item.isLiked,
    completed: Boolean(item.isCompleted), // 명시적 boolean 변환
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    dday: calculateDday(item.deadline),
    deadline: item.deadline || undefined,
  };
}
