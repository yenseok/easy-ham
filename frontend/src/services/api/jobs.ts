/**
 * 채용공고 API
 */

import { apiClient } from "./client";
import type { JobPostsResponse, JobPostItem } from "@/types/api";

/**
 * 사용자 맞춤 채용 공고 목록 조회
 * GET /api/v1/posts/jobs/me
 *
 * @returns 사용자의 관심 포지션에 맞춘 채용공고 목록
 */
export const getPersonalizedJobs = async (): Promise<JobPostItem[]> => {
  const response = await apiClient.get<JobPostsResponse>("/v1/posts/jobs/me");
  return response.data;
};

export const jobsApi = {
  getPersonalizedJobs,
};
