/**
 * 검색 API 서비스
 *
 * 통합 검색 기능을 제공합니다.
 * 필터 조건에 따라 공지사항을 검색하고,
 * 백엔드 응답을 프론트엔드 타입으로 변환하여 반환합니다.
 */

import { apiClient } from './client';
import type { SearchResponse, SearchParams } from '@/types/api';
import type { Notice } from '@/types/notice';
import { convertSearchItemToNotice } from '@/utils/searchMapper';

export const searchApi = {
  /**
   * 통합 검색 API 호출
   *
   * 검색 조건에 맞는 공지사항을 가져옵니다.
   * 무한스크롤을 위해 page, size 파라미터를 사용합니다.
   *
   * @param params - 검색 파라미터
   * @returns Notice 배열과 메타데이터
   *
   * @example
   * ```typescript
   * const { notices, metadata } = await searchApi.searchPosts({
   *   keyword: '예산',
   *   page: 0,
   *   size: 15
   * });
   * ```
   */
  searchPosts: async (params: SearchParams) => {
    // 1. 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();

    // 검색 키워드
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }

    // 다중 채널 필터
    // channelIds=채널1&channelIds=채널2 형식으로 추가
    if (params.channelIds && params.channelIds.length > 0) {
      params.channelIds.forEach(channelId => {
        queryParams.append('channelIds', channelId);
      });
    }

    // 다중 카테고리 필터 (categoryIds = subCategory 코드)
    if (params.categoryIds && params.categoryIds.length > 0) {
      params.categoryIds.forEach(categoryId => {
        queryParams.append('categoryIds', String(categoryId));
      });
    }

    // 기간 필터 (시작일) - timestamp 밀리초
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }

    // 기간 필터 (종료일) - timestamp 밀리초
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    // 페이지네이션
    // page: 기본값 0
    queryParams.append('page', String(params.page ?? 0));
    // size: 기본값 15 (무한스크롤용)
    queryParams.append('size', String(params.size ?? 15));

    // 2. API 호출
    const queryString = queryParams.toString();
    const endpoint = `/search/posts${queryString ? '?' + queryString : ''}`;

    // console.log('[검색 API] 요청 엔드포인트:', endpoint);

    const response = await apiClient.get<SearchResponse>(endpoint);

    // console.log('[검색 API] 응답:', {
    //   총개수: response.data.metadata.totalHits,
    //   현재페이지: response.data.metadata.page,
    //   결과개수: response.data.items.length,
    // });

    // 3. 데이터 변환
    // SearchResultItem[] → Notice[]
    const notices: Notice[] = response.data.items.map(convertSearchItemToNotice);

    return {
      notices,
      metadata: response.data.metadata,
    };
  },
};
