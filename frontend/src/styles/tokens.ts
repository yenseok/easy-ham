/**
 * 디자인 토큰
 * - 프로젝트 전반에 걸쳐 일관된 디자인 시스템 적용
 * - 색상, 타이포그래피, 간격, 라인 높이 등을 정의
 */

// ========== 색상 토큰 ==========
export const colors = {
  // 브랜드 색상
  brand: {
    orange: '#FF6B35',
    orangeDark: '#E55A2B',
    orangeLight: '#FFF5EE',
    orangeLighter: '#FFE8D6',
  },

  // 카테고리 색상
  category: {
    todo: {
      bg: '#FEE2E2',
      text: '#B91C1C',
      border: '#FECACA',
    },
    lecture: {
      bg: '#DBEAFE',
      text: '#1E40AF',
      border: '#BFDBFE',
    },
    info: {
      bg: '#D1FAE5',
      text: '#065F46',
      border: '#A7F3D0',
    },
    event: {
      bg: '#E9D5FF',
      text: '#6B21A8',
      border: '#DDD6FE',
    },
  },

  // D-day 색상
  dday: {
    urgent: '#EF4444', // 1-3일
    warning: '#EAB308', // 4-7일
    normal: '#22C55E', // 8일+
    default: '#9CA3AF', // 없음
  },

  // 그레이스케일
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 시맨틱 색상
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // 배경 색상
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  // 텍스트 색상
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
} as const;

// ========== 타이포그래피 토큰 ==========
export const typography = {
  fontFamily: {
    primary:
      '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ========== 간격 토큰 ==========
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// ========== Border Radius 토큰 ==========
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ========== Shadow 토큰 ==========
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  none: 'none',
} as const;

// ========== Z-index 토큰 ==========
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const;

// ========== Transition 토큰 ==========
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ========== 타입 export ==========
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
