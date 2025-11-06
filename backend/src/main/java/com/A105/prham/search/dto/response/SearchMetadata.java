package com.A105.prham.search.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SearchMetadata {
    private String query;              // 검색어
    private int totalHits;             // 전체 결과 수
    private int page;                  // 현재 페이지 (0-based)
    private int size;                  // 페이지 크기
    private int totalPages;            // 전체 페이지 수
    private int processingTimeMs;      // 검색 처리 시간 (ms)

    // 적용된 필터 정보 (프론트엔드에서 현재 필터 상태 표시용)
    private AppliedFilters appliedFilters;

    @Getter
    @Builder
    public static class AppliedFilters {
        private List<String> channelIds;    // 적용된 채널 필터
        private List<Long> categoryIds;     // 적용된 카테고리 필터
        private Long startDate;             // 시작 날짜
        private Long endDate;               // 종료 날짜
        private Boolean isLiked;            // 좋아요 필터 여부
    }
}