package com.A105.prham.search.controller;

import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.search.dto.request.PostSearchRequest;
import com.A105.prham.search.dto.response.PostSearchItem;
import com.A105.prham.search.dto.response.PostSearchResponse;
import com.A105.prham.search.service.SearchService;
import com.A105.prham.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * 게시물 검색 (Post 기반 - 개선된 버전)
     *
     * @param keyword 검색어 (선택) - title, cleanedText, userId, channelName, campusList에서 검색
     * @param channelIds 채널 ID 리스트 (다중 선택, 선택)
     * @param categoryIds 카테고리 ID 리스트 (subCategory 기준, 다중 선택, 선택)
     * @param startDate 시작 날짜 timestamp (선택)
     * @param endDate 종료 날짜 timestamp (선택)
     * @param isLiked 좋아요 필터 (선택)
     * @param sort 정렬 기준 (기본: timestamp:desc)
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
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(defaultValue = "timestamp:desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        try {
            // 요청 객체 생성
            PostSearchRequest request = PostSearchRequest
                    .builder()
                    .keyword(keyword)
                    .categoryIds(categoryIds)
                    .channelIds(channelIds)
                    .startDate(startDate)
                    .endDate(endDate)
                    .isLiked(isLiked)
                    .isCompleted(isCompleted)
                    .sort(sort)
                    .page(page)
                    .size(size)
                    .build();


            // 검색 실행
            PostSearchResponse result = searchService.searchPosts(request, user.getId());

            return ApiResponseDto.success(SuccessCode.SUCCESS, result);

        } catch (Exception e) {
            log.error("❌ Search failed", e);
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * postId로 단일 게시물 조회
     */
    @GetMapping("/posts/{postId}")
    public ApiResponseDto<PostSearchItem> getPostByPostId(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        try {
            log.info("단일 조회 시도 : {}",postId);
            Long userId = user != null ? user.getId() : null;
            if(userId == null){
                return ApiResponseDto.fail(ErrorCode.USER_NOT_FOUND);
            }
            PostSearchItem item = searchService.getPostByPostId(postId, userId);

            if (item == null) {
                return ApiResponseDto.fail(ErrorCode.NOT_FOUND);
            }

            return ApiResponseDto.success(SuccessCode.SUCCESS, item);

        } catch (Exception e) {
            log.error("❌ Failed to get post by postId: {}", postId, e);
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}