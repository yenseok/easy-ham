package com.A105.prham.webhook.controller;

// ✨ messages 패키지가 아닌 webhook 패키지의 DTO 임포트
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;

import com.A105.prham.webhook.dto.MattermostWebhookDto;
// ✨ messages 패키지가 아닌 webhook 패키지의 Service 임포트
import com.A105.prham.webhook.monitoring.WebhookPerformanceMetrics;
import com.A105.prham.webhook.service.SyncWebhookTestService;
import com.A105.prham.webhook.service.WebhookIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; // ✨ 오타 수정 및 중복 제거
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhook")
@Slf4j
@RequiredArgsConstructor
public class WebhookController { // ✨ (참고) 파일명과 클래스명 일치 필요

	private final WebhookIngestionService ingestionService;

	private final ConcurrentLinkedQueue<Long> responseTimes = new ConcurrentLinkedQueue<>();

	@PostMapping("/mattermost")
	public ResponseEntity<String> receiveMattermostMessage(
		@RequestBody MattermostWebhookDto payload) { // ✨ 오타 수정 (Gott -> most)

		try {
			// ✨ 오타 수정으로 payload.getPostId()가 정상 동작합니다.
			log.info("Received message: {}", payload.getPostId());

			// ✨ 오타 수정으로 ingestionService.ingestAndPublish()가 정상 동작합니다.
			ingestionService.ingestAndPublish(payload);

			// 2. 즉시 OK 응답
			return ResponseEntity.ok("Message accepted for processing");

		} catch (Exception e) {
			log.error("Error ingesting webhook", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Error accepting message");
		}
	}

	private final WebhookIngestionService webhookIngestionService;
	private final SyncWebhookTestService syncWebhookTestService;
	private final WebhookPerformanceMetrics metrics;

	/**
	 * 비동기 처리 방식 (프로덕션)
	 */
	@PostMapping("/async")
	public ResponseEntity<Void> handleWebhookAsync(@RequestBody MattermostWebhookDto payload) {
		long startTime = System.currentTimeMillis();

		try {
			webhookIngestionService.ingestAndPublish(payload);
			return ResponseEntity.ok().build();

		} finally {
			long duration = System.currentTimeMillis() - startTime;
			metrics.recordWebhookResponse(duration, false);

			log.info("⏱️ [ASYNC] Webhook response time: {}ms, postId: {}",
				duration, payload.getPostId());
		}
	}

	/**
	 * 동기 처리 방식 (테스트용)
	 */
	@PostMapping("/sync")
	public ResponseEntity<Void> handleWebhookSync(@RequestBody MattermostWebhookDto payload) {
		long startTime = System.currentTimeMillis();

		try {
			syncWebhookTestService.handleSynchronously(payload);
			return ResponseEntity.ok().build();

		} finally {
			long duration = System.currentTimeMillis() - startTime;

			log.info("⏱️ [SYNC] Webhook response time: {}ms, postId: {}",
				duration, payload.getPostId());
		}
	}

	/**
	 * 성능 통계 조회
	 */
	@GetMapping("/metrics")
	public ResponseEntity<Map<String, Object>> getMetrics() {
		Map<String, Object> stats = metrics.getStatistics();
		return ResponseEntity.ok(stats);
	}

	/**
	 * 통계 초기화
	 */
	@PostMapping("/metrics/reset")
	public ResponseEntity<String> resetMetrics() {
		metrics.reset();
		return ResponseEntity.ok("Metrics reset successfully");
	}

	/**
	 * 통계 로그 출력
	 */
	@PostMapping("/metrics/print")
	public ResponseEntity<String> printMetrics() {
		metrics.printStatistics();
		return ResponseEntity.ok("Check logs for statistics");
	}
}