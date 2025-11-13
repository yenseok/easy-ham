package com.A105.prham.webhook.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.mattermost.dto.MattermostChannel;
import com.A105.prham.mattermost.dto.MattermostTeam;
import com.A105.prham.mattermost.service.MattermostAdminService;
import com.A105.prham.sse.dto.PostNotificationDto;
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
import java.util.ArrayList;
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
	private final MattermostAdminService mattermostAdminService;

	private static final String GLOBAL_TEAM_NAME = "13기 공지 전용";
	private static final List<String> GLOBAL_CHANNEL_NAMES = List.of(
		"1. 공지사항", "5. [취업] 공지사항", "6. [취업] 취업정보"
	);
	private static final String CLASS_CHANNEL_SUFFIX = "공지사항";

	// 검색 메서드들 (Post 엔티티를 반환하도록 수정)
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

	// Post 싱세 조회
	public PostNotificationDto getPostDetail(Long postId) {
		Post post = postRepository.findById(postId)
			.orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

		return PostNotificationDto.from(post);
	}

	//사용자가 속한 채널 전체 post 목록 조회
	public List<PostNotificationDto> getPostsForUser(User user, String mainCategory, String subCategory) {
		//사용자 검증
		if (user.getGeneration() == null || user.getCampus() == null || user.getClassroom() == null) {
			return List.of();
		}

		//mm 사용자 id 조회
		String mmUserId = mattermostAdminService.getUserIdByEmail(user.getEmail());
		if (mmUserId == null) {
			return List.of();
		}

		//사용자가 속한 채널 id 목록 추출
		List<String> allowedChannelIds = getUserAllowedChannels(user, mmUserId);

		if (allowedChannelIds.isEmpty()) {
			return List.of();
		}

		//채널 id로 post 조회
		List<Post> posts = postRepository.findPostsByChannelIds(allowedChannelIds, mainCategory, subCategory);

		return posts.stream()
			.map(PostNotificationDto::from)
			.collect(Collectors.toList());
	}


	// 사용자가 속한 채널 ID 목록 추출
	private List<String> getUserAllowedChannels(User user, String mmUserId) {
		List<String> allowedChannelIds = new ArrayList<>();

		// User 정보에서 추출
		String generationPrefix = user.getGeneration() + "기";
		String campusInfix = user.getCampus().getName();
		String classSuffix = user.getClassroom() + "반";

		// 사용자가 속한 팀 목록 조회
		List<MattermostTeam> allTeams = mattermostAdminService.getTeamsByUserId(mmUserId);

		// 모든 팀 탐색
		for (MattermostTeam team : allTeams) {
			String teamName = team.getDisplayName();

			// 13기 공지 전용 팀
			if (teamName.equals(GLOBAL_TEAM_NAME)) {
				List<MattermostChannel> channels = mattermostAdminService.getChannelsForUsersInTeam(
					mmUserId, team.getId()
				);
				List<String> matchingIds = channels.stream()
					.filter(c -> GLOBAL_CHANNEL_NAMES.contains(c.getDisplayName()))
					.map(MattermostChannel::getId)
					.collect(Collectors.toList());
				allowedChannelIds.addAll(matchingIds);
			}
			// 현재 반 팀
			else if (teamName.startsWith(generationPrefix) &&
				teamName.contains(campusInfix) &&
				teamName.endsWith(classSuffix)) {
				log.info("현재 반 팀 찾음: {}", teamName);
				List<MattermostChannel> channels = mattermostAdminService.getChannelsForUsersInTeam(
					mmUserId, team.getId()
				);
				List<String> matchingIds = channels.stream()
					.filter(c -> c.getDisplayName().endsWith(CLASS_CHANNEL_SUFFIX))
					.map(MattermostChannel::getId)
					.collect(Collectors.toList());
				allowedChannelIds.addAll(matchingIds);
			}
		}

		return allowedChannelIds;
	}
}


