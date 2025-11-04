/**
 * 색상 유틸 함수
 */

import { colors } from "@/styles/tokens";
import type { Subcategory } from "@/types/notice";

/**
 * 카테고리에 따른 색상 반환
 */
export const getCategoryColor = (subcategory: Subcategory) => {
  const categoryMap = {
    할일: colors.category.todo,
    특강: colors.category.lecture,
    정보: colors.category.info,
    행사: colors.category.event,
  };
  return categoryMap[subcategory];
};

/**
 * D-day에 따른 배지 색상 반환
 */
export const getDdayBadgeColor = (dday: number | null) => {
  if (dday === null) return { hex: colors.dday.default };
  if (dday <= 3) return { hex: colors.dday.urgent };
  if (dday <= 7) return { hex: colors.dday.warning };
  return { hex: colors.dday.normal };
};

/**
 * 카테고리 버튼 색상 반환 (선택 여부에 따라)
 */
export const getCategoryButtonColor = (
  subcategory: Subcategory,
  isSelected: boolean
) => {
  const color = getCategoryColor(subcategory);
  return isSelected ? color.text : color.bg;
};
