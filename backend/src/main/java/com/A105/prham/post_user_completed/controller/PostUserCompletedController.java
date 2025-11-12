package com.A105.prham.post_user_completed.controller;

import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.post_user_completed.dto.response.CompletionCheckResponse;
import com.A105.prham.post_user_completed.dto.response.CompletionResponse;
import com.A105.prham.post_user_completed.service.PostUserCompletedService;
import com.A105.prham.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/post-completions")
@RequiredArgsConstructor
public class PostUserCompletedController {

    private final PostUserCompletedService postUserCompletedService;

    /**
     * 공지사항 완료 상태 토글
     * POST /api/post-completions/toggle
     */
    @PostMapping("/toggle")
    public ResponseEntity<CompletionResponse> toggleCompletion(
            @AuthenticationPrincipal User user,
            @RequestParam Long postId) {
        CompletionResponse response = postUserCompletedService.toggleCompletion(user, postId);
        return ResponseEntity.ok(response);
    }


    /**
     * 나의 특정 게시물 완료 여부 조회
     */
    @GetMapping("/check")
    public ApiResponseDto checkCompletion(
            @AuthenticationPrincipal User user,
            @RequestParam Long postId) {
        CompletionCheckResponse response = postUserCompletedService.checkCompletion(user, postId);
        return ApiResponseDto.success(SuccessCode.SUCCESS,response);
    }

    /**
     * 내가 완료한 게시물 목록 조회
     */
    @GetMapping("/me")
    public ApiResponseDto getCompletedPosts(
            @AuthenticationPrincipal User user) {
        List<CompletionResponse> responses = postUserCompletedService.getCompletedPostsByUser(user);
        return ApiResponseDto.success(SuccessCode.SUCCESS,responses);
    }





}