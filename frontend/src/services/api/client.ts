/**
 * API 클라이언트
 * Authorization 헤더 자동 추가 및 토큰 자동 갱신 처리
 */

import type { ApiResponse } from "@/types/common";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Authorization 헤더 자동 추가
 */
const getAuthHeaders = (): Record<string, string> => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
  return {};
};

/**
 * 401 응답 헤더에서 새 토큰 추출 및 저장
 */
const handleTokenRefresh = (headers: Headers): void => {
  const newAccessToken = headers.get("New-Access-Token");
  const newRefreshToken = headers.get("New-Refresh-Token");

  if (newAccessToken && newRefreshToken) {
    localStorage.setItem("access_token", newAccessToken);
    localStorage.setItem("refresh_token", newRefreshToken);
  }
};

/**
 * 401 응답 분석 후 처리
 */
const handle401Response = (headers: Headers): void => {
  const refreshExpired = headers.get("Refresh-Token-Expired");
  const loginRequired = headers.get("Login-Required");

  if (refreshExpired === "true" && loginRequired === "true") {
    // Refresh Token 만료 - 로그인 필요
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  } else {
    // Access Token 만료 - 새 토큰이 헤더에 있음
    handleTokenRefresh(headers);
  }
};

export const apiClient = {
  /**
   * 인증 필요 없는 GET 요청 (SSO 콜백 등)
   * HTTP 상태 코드를 그대로 반환하며, 응답 본문을 파싱합니다
   */
  getPublic: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      // 상태 코드를 명시적으로 추가
      return {
        status: response.status,
        ...data,
      };
    } catch (error) {
      console.error("API GET (public) error:", error);
      throw error;
    }
  },

  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      // 401 응답 처리 (토큰 갱신)
      if (response.status === 401) {
        handle401Response(response.headers);
        // 새 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  },

  post: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    try {
      // console.log(`[API POST] ${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      // 401 응답 처리 (토큰 갱신)
      if (response.status === 401) {
        handle401Response(response.headers);
        // 새 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  },

  put: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      // 401 응답 처리 (토큰 갱신)
      if (response.status === 401) {
        handle401Response(response.headers);
        // 새 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },

  patch: async <T>(
    endpoint: string,
    data: unknown
  ): Promise<ApiResponse<T>> => {
    try {
      // console.log(`[API PATCH] ${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      // 401 응답 처리 (토큰 갱신)
      if (response.status === 401) {
        handle401Response(response.headers);
        // 새 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        const retryData = await retryResponse.json();
        // console.log(`[API PATCH RESPONSE] ${API_BASE_URL}${endpoint}`, retryData);
        return retryData;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      // console.log(`[API PATCH RESPONSE] ${API_BASE_URL}${endpoint}`, responseData);
      return responseData;
    } catch (error) {
      // console.error("API PATCH error:", error);
      throw error;
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      // 401 응답 처리 (토큰 갱신)
      if (response.status === 401) {
        handle401Response(response.headers);
        // 새 토큰으로 재시도
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API DELETE error:", error);
      throw error;
    }
  },
};
