/**
 * 색상 맵 상수
 */

export const CATEGORY_COLORS = {
  할일: {
    bg: "bg-red-100",
    text: "text-red-700",
    hex: "#FEE2E2",
    darkHex: "#B91C1C",
  },
  특강: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    hex: "#DBEAFE",
    darkHex: "#1E40AF",
  },
  정보: {
    bg: "bg-green-100",
    text: "text-green-700",
    hex: "#D1FAE5",
    darkHex: "#065F46",
  },
  행사: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    hex: "#E9D5FF",
    darkHex: "#6B21A8",
  },
} as const;

export const DDAY_COLORS = {
  urgent: { bg: "bg-red-500", text: "text-white", hex: "#EF4444" },
  warning: { bg: "bg-yellow-500", text: "text-white", hex: "#EAB308" },
  normal: { bg: "bg-green-500", text: "text-white", hex: "#22C55E" },
  default: { bg: "bg-gray-400", text: "text-white", hex: "#9CA3AF" },
} as const;

export const BRAND_COLORS = {
  orange: "#FF6B35",
  orangeDark: "#E55A2B",
  orangeLight: "#FFF5EE",
} as const;
