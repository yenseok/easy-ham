package com.A105.prham.webhook.service;

import com.A105.prham.webhook.entity.Post; // ✨ Message -> Post
import com.A105.prham.webhook.repository.PostRepository; // ✨ MessageRepository -> PostRepository
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PostService {

	private final PostRepository postRepository; // ✨ 수정

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
}