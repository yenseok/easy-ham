/**
 * API Endpoints
 * Centralized endpoint management for all API calls
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    getSsoLoginUrl: "/auth/sso/login-url",
    logout: "/auth/logout",
    ssoCallback: "/auth/sso/callback",
  },

  // User endpoints
  users: {
    signup: "/users",
    getMe: "/users/me",
    updateMe: "/users/me",
    delete: "/users/delete",
  },

  // Code lookups (campus, skill, position)
  codes: {
    campuses: "/campus",
    skills: "/skill",
    positions: "/position",
    categories: "/code", // 공지사항 분류 코드
  },

  // 공지사항 엔드포인트
  notices: {
    list: "/notices",
    detail: (id: number) => `/notices/${id}`,
  },

  // 북마크 엔드포인트
  bookmarks: {
    list: "/bookmarks",
    add: (userNoticeId: number) => `/bookmarks/${userNoticeId}`,
    remove: (userNoticeId: number) => `/bookmarks/${userNoticeId}`,
  },

  // 검색 엔드포인트
  search: {
    posts: "/search/posts",
  },

  // 파일 엔드포인트 (Mattermost)
  files: {
    thumbnail: (fileId: string) =>
      `https://k13a105.p.ssafy.io/chat/api/v4/files/${fileId}/thumbnail`,
    download: (fileId: string) =>
      `https://k13a105.p.ssafy.io/chat/api/v4/files/${fileId}`,
  },

  // 알림 설정 엔드포인트
  notifications: {
    initializeSettings: "/notifications/settings",
    getSettings: "/notifications/settings",
    updateSettings: "/notifications/settings",
    keywords: {
      list: "/notifications/keywords",
      add: "/notifications/keywords",
      remove: (keywordId: number) => `/notifications/keywords/${keywordId}`,
    },
  },
} as const;
