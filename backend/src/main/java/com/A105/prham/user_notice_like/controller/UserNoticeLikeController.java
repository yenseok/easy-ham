package com.A105.prham.user_notice_like.controller;

import com.A105.prham.common.annotation.UserId;
import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.user.entity.User;
import com.A105.prham.user_notice_like.service.UserNoticeLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bookmarks")
public class UserNoticeLikeController {

    private final UserNoticeLikeService userNoticeLikeService;

    @PostMapping("/{postId}")
    public ApiResponseDto addBookmark(@AuthenticationPrincipal User user, @PathVariable Long postId) {
        return ApiResponseDto.success(SuccessCode.BOOKMARK_SAVE_SUCCESS, userNoticeLikeService.saveBookmarks(user, postId));
    }

    @DeleteMapping("/{postId}")
    public ApiResponseDto deleteBookmark(@AuthenticationPrincipal User user, @PathVariable Long postId) {
        return ApiResponseDto.success(SuccessCode.BOOKMARK_DELETE_SUCCESS, userNoticeLikeService.deleteBookmarks(user, postId));
    }

    @GetMapping
    public ApiResponseDto getBookmarks(@AuthenticationPrincipal User user) {
        return ApiResponseDto.success(SuccessCode.BOOKMARK_GET_SUCCESS, userNoticeLikeService.getBookmarks(user.getId()));
    }
}
