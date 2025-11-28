package com.A105.prham.webhook.service;

import com.A105.prham.classification.dto.LlmClassificationResult;
import com.A105.prham.classification.service.LlmClassificationService;
import com.A105.prham.webhook.dto.MattermostWebhookDto;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.entity.PostStatus;
import com.A105.prham.webhook.monitoring.WebhookPerformanceMetrics;
import com.A105.prham.webhook.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeoutException;

/**
 * 동기 처리 방식 - 성능 측정용
 * 실제 프로덕션에서는 사용하지 않음
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SyncWebhookTestService {

	private final PostRepository postRepository;
	private final LlmClassificationService llmClassificationService;
	private final WebhookPerformanceMetrics metrics;

	// Mattermost timeout 시뮬레이션 (설정 가능)
	private static final long SIMULATED_TIMEOUT_MS = 5000; // 5초

	/**
	 * 동기 처리 방식으로 웹훅 처리
	 * - 모든 작업을 순차적으로 처리
	 * - HTTP 응답 전에 LLM 분류까지 완료
	 */
	@Transactional
	public void handleSynchronously(MattermostWebhookDto payload) {
		long startTime = System.currentTimeMillis();
		boolean success = false;
		boolean timeout = false;

		try {
			// 1. 중복 체크
			if (postRepository.existsByPostId(payload.getPostId())) {
				log.info("🚫 [SYNC] Duplicate detected: {}", payload.getPostId());
				metrics.recordWebhookResponse(System.currentTimeMillis() - startTime, true);
				return;
			}

			// 2. Post 생성 및 저장
			Post post = createPost(payload);
			post = postRepository.save(post);
			log.info("✅ [SYNC] Post saved: {}", post.getPostId());

			// 3. 텍스트 전처리
			String cleanedText = preprocessText(post.getOriginalText());
			post.updateCleanedText(cleanedText);

			// 4. LLM 분류 (⚠️ 여기서 2-5초 소요!)
			long llmStartTime = System.currentTimeMillis();
			LlmClassificationResult result = llmClassificationService.classify(post);
			long llmDuration = System.currentTimeMillis() - llmStartTime;
			metrics.recordLlmCall(llmDuration);

			if (result == null) {
				throw new RuntimeException("LLM classification failed");
			}

			// 5. 분류 결과 업데이트
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

			// 6. 성공 처리
			long totalDuration = System.currentTimeMillis() - startTime;

			// Timeout 체크 (Mattermost는 보통 3-5초)
			if (totalDuration > SIMULATED_TIMEOUT_MS) {
				timeout = true;
				log.error("❌ [SYNC] Timeout! Duration: {}ms (limit: {}ms)",
					totalDuration, SIMULATED_TIMEOUT_MS);
			} else {
				success = true;
				log.info("✅ [SYNC] Completed in {}ms", totalDuration);
			}

			metrics.recordTotalProcessing(totalDuration, success, timeout);

		} catch (Exception e) {
			long totalDuration = System.currentTimeMillis() - startTime;

			log.error("❌ [SYNC] Error processing webhook: {}", e.getMessage(), e);

			// Timeout 여부 판단
			if (totalDuration > SIMULATED_TIMEOUT_MS) {
				timeout = true;
			}

			metrics.recordTotalProcessing(totalDuration, false, timeout);

			// 실패 상태로 표시
			try {
				Post failedPost = postRepository.findByPostId(payload.getPostId())
					.orElse(null);
				if (failedPost != null) {
					failedPost.markAsFailed();
					postRepository.save(failedPost);
				}
			} catch (Exception ignored) {
				// 이미 실패한 상태이므로 추가 예외는 무시
			}
		}
	}

	private Post createPost(MattermostWebhookDto payload) {
		return Post.builder()
			.postId(payload.getPostId())
			.channelId(payload.getChannelId())
			.channelName(payload.getChannelName())
			.userId(payload.getUserId())
			.userName(payload.getUserName())
			.originalText(payload.getText())
			.webhookTimestamp(payload.getTimestamp())
			.fileIds(payload.getFileIds())
			.teamId(payload.getTeamId())
			.teamName("Test Team")
			.status(PostStatus.PENDING)
			.build();
	}

	private String preprocessText(String text) {
		if (text == null) return "";

		// 이모지 제거 (간단한 버전)
		return text.replaceAll("[\\p{So}\\p{Sk}]", "")
			.replaceAll(":[a-z_]+:", "")
			.trim();
	}
}