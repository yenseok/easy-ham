package com.A105.prham.webhook.controller;

import java.util.List;

import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.search.service.SearchService;
import com.A105.prham.webhook.dto.UpdatePostRequest;
import com.A105.prham.webhook.service.WebhookIngestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
@Slf4j
public class PostController {

	private final PostService postService;
	private final SearchService searchService;
	private final WebhookIngestionService webhookIngestionService;

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


	@PostMapping("/post-event")
	public ApiResponseDto updatePost(@RequestBody UpdatePostRequest request){
		try{
			if ("post_updated".equals(request.getEventType())) {
				// 수정 이벤트: DB업데이트 meilisearch에서 업데이트
				log.info("{} changed",request.getPostId());
				//TODO 엔티티수정
				webhookIngestionService.updateAndPublish(request);
			} else {
				log.info("{} deleted",request.getPostId());
				// 삭제 이벤트: DB삭제, meilisearch에서 삭제
				searchService.deletePost(request.getPostId());
				int result = postService.DeletePostByPostId(request.getPostId());
				if(result ==0){
					log.error("존재하지 않는 Post를 삭제 시도 하였습니다.");
					return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
				}

			}

			return ApiResponseDto.success(SuccessCode.SUCCESS,"업데이트 성공");
		}catch (Exception e){
			return ApiResponseDto.success(SuccessCode.SUCCESS,e.getMessage());
		}
	}
}
