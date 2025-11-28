package com.A105.prham.webhook.service;

import com.A105.prham.classification.dto.LlmClassificationResult;
import com.A105.prham.classification.service.LlmClassificationService;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.event.PostReceivedEvent;
import com.A105.prham.webhook.monitoring.WebhookPerformanceMetrics;
import com.A105.prham.webhook.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncPostProcessorWithMetrics {

	private final PostRepository postRepository;
	private final LlmClassificationService llmClassificationService;
	private final WebhookPerformanceMetrics metrics;

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handlePostReceivedWithMetrics(PostReceivedEvent event) {
		Long postId = event.getPostId();
		long startTime = System.currentTimeMillis();

		log.info("🚀 [ASYNC] Starting async processing for post ID: {}", postId);

		try {
			processPost(postId);

			long totalDuration = System.currentTimeMillis() - startTime;
			metrics.recordAsyncSuccess();

			log.info("✅ [ASYNC] Post processed successfully: {} in {}ms",
				postId, totalDuration);

		} catch (Exception e) {
			long totalDuration = System.currentTimeMillis() - startTime;

			log.error("❌ [ASYNC] Failed to process post {}: {}",
				postId, e.getMessage(), e);

			String failureReason = e.getClass().getSimpleName();
			metrics.recordAsyncFailure(failureReason);

			markPostAsFailed(postId);
		}
	}

	@Transactional
	protected void processPost(Long postId) {
		Post post = postRepository.findById(postId)
			.orElseThrow(() -> new RuntimeException("Post not found: " + postId));

		String cleanedText = preprocessText(post.getOriginalText());
		post.updateCleanedText(cleanedText);

		long llmStartTime = System.currentTimeMillis();
		LlmClassificationResult result = llmClassificationService.classify(post);
		long llmDuration = System.currentTimeMillis() - llmStartTime;
		metrics.recordLlmCall(llmDuration);

		if (result == null) {
			throw new RuntimeException("LLM classification returned null");
		}

		post.updateClassificationResult(
			cleanedText,
			result.getTitle(),
			result.getMainCategory(),
			result.getSubCategory(),
			result.getDeadline(),
			result.getCampusList() != null ? String.join(",", result.getCampusList()) : null
		);
		post.markAsProcessed();
		postRepository.save(post);
	}

	@Transactional
	protected void markPostAsFailed(Long postId) {
		try {
			Post failedPost = postRepository.findById(postId).orElse(null);
			if (failedPost != null) {
				failedPost.markAsFailed();
				postRepository.save(failedPost);
			}
		} catch (Exception e) {
			log.warn("Failed to mark post as FAILED: {}", postId);
		}
	}

	private String preprocessText(String text) {
		if (text == null) return "";
		return text.replaceAll("[\\p{So}\\p{Sk}]", "")
			.replaceAll(":[a-z_]+:", "")
			.trim();
	}
}