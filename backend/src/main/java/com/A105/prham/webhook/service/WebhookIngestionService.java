package com.A105.prham.webhook.service;

import java.util.List;

import com.A105.prham.mattermost.dto.MattermostChannel;
import com.A105.prham.mattermost.dto.MattermostTeam;
import com.A105.prham.mattermost.service.MattermostAdminService;
import com.A105.prham.messages.service.MattermostService;
import com.A105.prham.webhook.dto.MattermostWebhookDto;
import com.A105.prham.webhook.dto.UpdatePostRequest;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.entity.PostStatus;
import com.A105.prham.webhook.event.PostReceivedEvent;
import com.A105.prham.webhook.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebhookIngestionService {

	private final PostRepository postRepository;
	private final ApplicationEventPublisher eventPublisher; // 이벤트 발행기
	private final MattermostService mattermostService;
	private final MattermostAdminService mattermostAdminService;

	/**
	 * Mattermost 웹훅 페이로드를 받아 DB에 PENDING 상태로 저장하고
	 * 비동기 처리를 위한 이벤트를 발행합니다.
	 */
	@Transactional
	public void ingestAndPublish(MattermostWebhookDto payload) {
		// 1. 중복 체크
		if (postRepository.existsByPostId(payload.getPostId())) {
			log.info("Post already exists, skipping: {}", payload.getPostId());
			return;
		}

		//팀 명 추가
		String teamName = getTeamName(payload.getTeamId(), payload.getUserId());

		String channelDisplayName = getChannelDisplayName(payload.getChannelId());

		log.info("채널 정보 - channelId: {}, displayName: {}, payload.channelName: {}",
			payload.getChannelId(), channelDisplayName, payload.getChannelName());

		// 2. 최소 정보로 Post Entity 생성 (PENDING 상태)
		Post post = Post.builder()
			.postId(payload.getPostId())
			.channelId(payload.getChannelId())
			.channelName(channelDisplayName != null ? channelDisplayName : payload.getChannelName())
			.userId(payload.getUserId())
			.userName(payload.getUserName())
			.originalText(payload.getText())
			.webhookTimestamp(payload.getTimestamp())
			.fileIds(payload.getFileIds())
			.teamId(payload.getTeamId())
			.teamName(teamName)
			.status(PostStatus.PENDING)
			.build();

		// 4. DB에 저장
		Post savedPost = postRepository.save(post);
		log.info("Post saved with PENDING status. DB ID: {}", savedPost.getId());

		// 5. 비동기 처리를 위해 이벤트 발행
		eventPublisher.publishEvent(new PostReceivedEvent(this, savedPost.getId()));
		log.info("Published PostReceivedEvent for DB ID: {}", savedPost.getId());
	}

	//팀 아이디로 팀명조회
	private String getTeamName(String teamId, String userId) {
		try {
			List<MattermostTeam> teams = mattermostAdminService.getTeamsByUserId(userId);

			return teams.stream()
				.filter(team -> teamId.equals(team.getId()))
				.map(MattermostTeam::getDisplayName)
				.findFirst()
				.orElseGet(() -> {
					return "unknow teamname";
				});
		} catch (Exception e) {
			return "unknown teamname";
		}
	}

	private String getChannelDisplayName(String channelId) {
		try {
			MattermostChannel channel = mattermostAdminService.getChannelById(channelId);

			if (channel != null && channel.getDisplayName() != null) {
				return channel.getDisplayName();
			}
			return null;
		}catch (Exception e) {
			return null;
		}
	}


	/**
	 * Mattermost 웹훅 페이로드를 받아 DB에 PENDING 상태로 저장하고
	 * 비동기 처리를 위한 이벤트를 발행합니다.
	 */
	@Transactional
	public void updateAndPublish(UpdatePostRequest request) {

		//post 찾기
		Post post = postRepository.findByPostId(request.getPostId()).orElseThrow(()-> new RuntimeException("존재하지 않는 post 수정 시도"));

		post.setOriginalText(request.getMessage());

		//DB에 저장
		Post savedPost = postRepository.save(post);
		log.info("Post changed. DB ID: {}", savedPost.getId());

		// 5. 비동기 처리를 위해 이벤트 발행
		eventPublisher.publishEvent(new PostReceivedEvent(this, savedPost.getId()));
		log.info("Published PostReceivedEvent for DB ID: {}", savedPost.getId());
	}
}