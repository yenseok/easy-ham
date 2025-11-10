package com.A105.prham.search.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PostSearchRequest {
    // 검색어 (title, cleanedText, userId, channelName, campusList에서 검색)
    private String keyword;

    // 채널 필터 (다중 선택)
    private List<String> channelIds;

    // 카테고리 필터 (subCategory 기준, 다중 선택)
    private List<Long> categoryIds;

    // 날짜 범위 필터
    private Long startDate;
    private Long endDate;

    // 좋아요 필터 (내가 좋아요한 게시물만)
    private Boolean isLiked;

    // 정렬 (timestamp:desc, timestamp:asc)
    private String sort = "timestamp:desc"; // 기본값: 최신순

    // 페이징
    private int page = 0;
    private int size = 20;

    public int getOffset() {
        return page * size;
    }

    /**
     * 검색 조건이 있는지 확인
     */
    public boolean hasKeyword() {
        return keyword != null && !keyword.trim().isEmpty();
    }

    /**
     * 필터 조건이 있는지 확인
     */
    public boolean hasFilters() {
        return (channelIds != null && !channelIds.isEmpty()) ||
                (categoryIds != null && !categoryIds.isEmpty()) ||
                startDate != null ||
                endDate != null ||
                Boolean.TRUE.equals(isLiked);
    }
}