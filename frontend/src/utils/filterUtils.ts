/**
 * 필터 유틸 함수
 */

import type { Notice } from '@/types/notice';
import type { Subcategory } from '@/types/notice';
import type { PeriodFilter, SortOption } from '@/types/filter';

export const filterNoticesByChannels = (
  notices: Notice[],
  channels: string[]
): Notice[] => {
  if (channels.length === 0 || channels.includes('전체')) return notices;
  return notices.filter((notice) => channels.includes(notice.channel));
};

export const filterNoticesByCategories = (
  notices: Notice[],
  categories: Subcategory[]
): Notice[] => {
  if (categories.length === 0) return notices;
  return notices.filter((notice) => categories.includes(notice.subcategory));
};

export const filterNoticesBySearch = (
  notices: Notice[],
  query: string
): Notice[] => {
  if (!query.trim()) return notices;
  const lowerQuery = query.toLowerCase();
  return notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(lowerQuery) ||
      notice.content.toLowerCase().includes(lowerQuery) ||
      notice.author.toLowerCase().includes(lowerQuery)
  );
};

export const filterNoticesByPeriod = (
  notices: Notice[],
  period: PeriodFilter
): Notice[] => {
  if (period === '전체') return notices;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return notices.filter((notice) => {
    if (!notice.deadline) return false;
    const deadline = new Date(notice.deadline);
    deadline.setHours(0, 0, 0, 0);

    switch (period) {
      case '오늘':
        return deadline.getTime() === today.getTime();
      case '이번주': {
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);
        return deadline >= today && deadline < weekLater;
      }
      case '이번달': {
        return (
          deadline.getMonth() === today.getMonth() &&
          deadline.getFullYear() === today.getFullYear()
        );
      }
      default:
        return true;
    }
  });
};

export const filterNoticesByBookmark = (
  notices: Notice[],
  showBookmarkedOnly: boolean
): Notice[] => {
  if (!showBookmarkedOnly) return notices;
  return notices.filter((notice) => notice.bookmarked);
};

export const sortNotices = (
  notices: Notice[],
  sortBy: SortOption
): Notice[] => {
  const sorted = [...notices];

  switch (sortBy) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'deadline':
      return sorted.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
};
