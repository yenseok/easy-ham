package com.A105.prham.webhook.service;

import com.A105.prham.webhook.dto.MattermostWebhookDto;
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

		// 2. 최소 정보로 Post Entity 생성 (PENDING 상태)
		Post post = new Post();
		post.setPostId(payload.getPostId());
		post.setChannelId(payload.getChannelId());
		post.setUserId(payload.getUserId());
		post.setUserName(payload.getUserName());
		post.setOriginalText(payload.getText());
		post.setWebhookTimestamp(payload.getTimestamp());
		post.setStatus(PostStatus.PENDING);
		post.setChannelName(payload.getChannelName());
		// 3.  원본 File ID 문자열 저장 (비동기 프로세서가 이 값을 사용)
		post.setFileIds(payload.getFileIds());

		// 4. DB에 저장
		Post savedPost = postRepository.save(post);
		log.info("Post saved with PENDING status. DB ID: {}", savedPost.getId());

		// 5. 비동기 처리를 위해 이벤트 발행
		eventPublisher.publishEvent(new PostReceivedEvent(this, savedPost.getId()));
		log.info("Published PostReceivedEvent for DB ID: {}", savedPost.getId());
	}
}