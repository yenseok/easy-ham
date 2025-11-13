package com.A105.prham.webhook.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.repository.UserRepository;
import com.A105.prham.webhook.dto.JobPostingResponseDto;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Pageable;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

	private final PostRepository postRepository;
	private final UserRepository userRepository;

	// (WebhookIngestionService가 저장을 담당)

	// 검색 메서드들 (Post 엔티티를 반환하도록 수정)
	// ⚠️ PostRepository에 아래 메서드들이 정의되어 있어야 합니다.
	public List<Post> searchByKeyword(String keyword) {
		return postRepository.findByCleanedTextContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
	}

	public List<Post> findByChannel(String channelId) {
		return postRepository.findByChannelIdOrderByCreatedAtDesc(channelId);
	}

	public List<Post> findUpcomingDeadlines() {
		return postRepository.findByDeadlineIsNotNullOrderByDeadlineAsc();
	}

	public Long getPostIdByMMPostId(String postId){
		return postRepository.SelectPostIdByMMPOSTID(postId);
	}

	public List<Long> getPostIdsByMMPostIds(List<String> postIds){
		return postRepository.selectPostIdsByMMPostIds(postIds);
	}

	// 전체 채용 공고 목록 조회
	public List<JobPostingResponseDto> getAllJobPostings() {
		List<Post> jobPostings = postRepository.findAllJobPostings();

		return jobPostings.stream()
			.map(JobPostingResponseDto::from)
			.collect(Collectors.toList());
	}

	//사용자 직무 맞춤 채용 공고 목록 조회
	public List<JobPostingResponseDto> getJobPostingByUserPosition(Long userId) {
		//사용자조회
		User user = userRepository.findById(userId)
			.orElseThrow(() -> {
				return new CustomException(ErrorCode.USER_NOT_FOUND);
			});
		//사용자 선호 직무 포지션id 목록 추출
		Set<Long> userPositionIds = user.getUserPositions().stream()
			.map(up -> up.getPosition().getId())
			.collect(Collectors.toSet());

		List<Post> jobPostings;

		if (userPositionIds.isEmpty()) {
			//선호 포지션이 없으면 전체 채용 공고 반환
			jobPostings = postRepository.findAllJobPostings();
		}else {
			// 선호 포지션에 맞는 채용 공고만 반환
			jobPostings = postRepository.findJobPostingsByPositions(userPositionIds);
		}

		return jobPostings.stream()
			.map(JobPostingResponseDto::from)
			.collect(Collectors.toList());


	}

	public int DeletePostByPostId(String postId){
		return postRepository.deleteByPostId(postId);
	}


}