package com.A105.prham.webhook.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.sse.dto.PostNotificationDto;
import com.A105.prham.user.entity.User;
import com.A105.prham.webhook.dto.JobPostingResponseDto;
import com.A105.prham.webhook.service.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

	private final PostService postService;

	//전체 채용 공고 목록 조회
	@GetMapping("/jobs")
	public ResponseEntity<ApiResponseDto<List<JobPostingResponseDto>>> getAllJobPostings() {

		List<JobPostingResponseDto> response = postService.getAllJobPostings();

		return ResponseEntity.ok(
			ApiResponseDto.success(SuccessCode.SUCCESS, response)
		);
	}

	//사용자 선호 직무 맞춤 차용 공고 목록 조회
	@GetMapping("/jobs/me")
	public ResponseEntity<ApiResponseDto<List<JobPostingResponseDto>>> getMyJobPostings(@AuthenticationPrincipal User user) {
		List<JobPostingResponseDto> response = postService.getJobPostingByUserPosition(user.getId());

		return ResponseEntity.ok(ApiResponseDto.success(SuccessCode.SUCCESS, response));
	}

	// post 상세 조회
	@GetMapping("/{postId}")
	public ResponseEntity<ApiResponseDto<PostNotificationDto>> getPostDetails(@PathVariable Long postId) {
		PostNotificationDto response = postService.getPostDetail(postId);
		return ResponseEntity.ok(ApiResponseDto.success(SuccessCode.SUCCESS, response));
	}

	//사용자가 속한 post 전체 목록 조회
	@GetMapping("/me")
	public ResponseEntity<ApiResponseDto<List<PostNotificationDto>>> getMyPosts(@AuthenticationPrincipal User user,
		@RequestParam(required = false) String mainCategory,
		@RequestParam(required = false) String subCategory
	) {
		List<PostNotificationDto> response = postService.getPostsForUser(user, mainCategory, subCategory);
		return ResponseEntity.ok(ApiResponseDto.success(SuccessCode.SUCCESS, response));
	}
}
