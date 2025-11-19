import { getCategoryColor } from '@/utils/colorUtils';
import type { Subcategory } from '@/types/notice';

interface CategoryBadgeProps {
  subcategory: Subcategory;
  variant?: 'solid' | 'outline';
}

export const CategoryBadge = ({ subcategory, variant = 'solid' }: CategoryBadgeProps) => {
  const color = getCategoryColor(subcategory);

  if (variant === 'outline') {
    return (
      <span
        className="px-2 py-1 rounded text-xs font-semibold inline-block border"
        style={{
          color: color.text,
          borderColor: color.border,
          backgroundColor: 'transparent',
        }}
      >
        {subcategory}
      </span>
    );
  }

  return (
    <span
      className="px-2 py-1 rounded text-xs font-semibold text-white inline-block"
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {subcategory}
    </span>
  );
};
