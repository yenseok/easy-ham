import { getDdayBadgeColor } from '@/utils/colorUtils';

interface DdayBadgeProps {
  dday: number | null;
}

export const DdayBadge = ({ dday }: DdayBadgeProps) => {
  if (dday === null) return null;

  const color = getDdayBadgeColor(dday);
  const text = dday === 0 ? 'D-Day' : dday > 0 ? `D-${dday}` : '마감';

  return (
    <span
      className="px-2 py-1 rounded text-xs font-semibold text-white inline-block whitespace-nowrap"
      style={{ backgroundColor: color.hex }}
    >
      {text}
    </span>
  );
};
