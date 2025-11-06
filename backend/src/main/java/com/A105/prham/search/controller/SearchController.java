package com.A105.prham.search.controller;

import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.search.dto.request.PostSearchRequest;
import com.A105.prham.search.dto.response.PostSearchResponse;
import com.A105.prham.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * 게시물 검색 (개선된 버전)
     *
     * @param keyword 검색어 (선택)
     * @param channelIds 채널 ID 리스트 (다중 선택, 선택)
     * @param categoryIds 카테고리 ID 리스트 (다중 선택, 선택)
     * @param startDate 시작 날짜 timestamp (선택)
     * @param endDate 종료 날짜 timestamp (선택)
     * @param isLiked 좋아요 필터 (선택)
     * @param sort 정렬 기준 (기본: mmCreatedAt:desc)
     * @param page 페이지 번호 (0-based, 기본: 0)
     * @param size 페이지 크기 (기본: 20)
     */
    @GetMapping("/posts")
    public ApiResponseDto<PostSearchResponse> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> channelIds,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) Long startDate,
            @RequestParam(required = false) Long endDate,
            @RequestParam(required = false) Boolean isLiked,
            @RequestParam(defaultValue = "mmCreatedAt:desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // 요청 객체 생성
            PostSearchRequest request = new PostSearchRequest();
            request.setKeyword(keyword);
            request.setChannelIds(channelIds);
            request.setCategoryIds(categoryIds);
            request.setStartDate(startDate);
            request.setEndDate(endDate);
            request.setIsLiked(isLiked);
            request.setSort(sort);
            request.setPage(page);
            request.setSize(size);

            // 요청 파라미터 로깅
            log.info("📥 Search request received:");
            log.info("   - keyword: {}", keyword);
            log.info("   - channelIds: {}", channelIds);
            log.info("   - categoryIds: {}", categoryIds);
            log.info("   - dateRange: {} ~ {}", startDate, endDate);
            log.info("   - isLiked: {}", isLiked);
            log.info("   - page: {}, size: {}", page, size);

            // 검색 실행
            PostSearchResponse result = searchService.searchPosts(request);

            return ApiResponseDto.success(SuccessCode.SUCCESS, result);

        } catch (Exception e) {
            log.error("❌ Search failed", e);
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}