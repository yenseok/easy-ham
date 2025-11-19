/**
 * 채널 조회 API
 * 사용자가 가입된 채널 목록을 조회합니다.
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, UserChannel } from '@/types/api';

/**
 * 사용자 채널 목록 조회
 *
 * @returns 사용자가 가입된 채널 리스트
 *
 * @example
 * ```typescript
 * const response = await getUserChannels();
 * console.log(response.data); // [{ channelId: "...", channelName: "1. 공지사항", ... }]
 * ```
 */
export const getUserChannels = async (): Promise<ApiResponse<UserChannel[]>> => {
  return apiClient.get<UserChannel[]>(API_ENDPOINTS.users.channels);
};