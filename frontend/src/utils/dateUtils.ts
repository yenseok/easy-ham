import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import type { PeriodFilter } from '@/types';

export function getPeriodRange(
  period: PeriodFilter
): { startDate: string; endDate: string } | null {
  if (period === '전체') {
    return null;
  }

  const now = new Date();

  switch (period) {
    case '오늘': {
      const start = startOfDay(now);
      const end = endOfDay(now);
      return {
        startDate: String(start.getTime()),
        endDate: String(end.getTime()),
      };
    }

    case '이번주': {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      return {
        startDate: String(start.getTime()),
        endDate: String(end.getTime()),
      };
    }

    case '이번달': {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        startDate: String(start.getTime()),
        endDate: String(end.getTime()),
      };
    }

    default:
      return null;
  }
}
