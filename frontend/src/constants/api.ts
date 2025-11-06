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
  },

  // Code lookups (campus, skill, position)
  codes: {
    campuses: "/campus",
    skills: "/skill",
    positions: "/position",
  },
} as const;
