import { format, formatDistanceToNow, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const minutesAgo = differenceInMinutes(now, date);
  const hoursAgo = differenceInHours(now, date);
  
  if (minutesAgo < 1) {
    return '방금';
  }
  
  if (minutesAgo < 60) {
    return `${minutesAgo}분 전`;
  }
  
  if (hoursAgo < 24 && isToday(date)) {
    return `${hoursAgo}시간 전`;
  }
  
  if (isYesterday(date)) {
    return '어제';
  }
  
  return format(date, 'yyyy-MM-dd');
}

export function formatExactDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd HH:mm', { locale: ko });
}
