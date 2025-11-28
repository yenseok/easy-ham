package com.A105.prham.webhook.monitoring;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 웹훅 처리 성능을 측정하고 통계를 제공하는 서비스
 */
@Component
@Slf4j
public class WebhookPerformanceMetrics {

	// 웹훅 응답 시간 기록 (ms)
	private final ConcurrentLinkedQueue<Long> webhookResponseTimes = new ConcurrentLinkedQueue<>();

	// 전체 처리 시간 기록 (ms) - LLM 분류 포함
	private final ConcurrentLinkedQueue<Long> totalProcessingTimes = new ConcurrentLinkedQueue<>();

	// 요청 카운터
	private final AtomicLong totalRequests = new AtomicLong(0);
	private final AtomicLong successfulRequests = new AtomicLong(0);
	private final AtomicLong failedRequests = new AtomicLong(0);
	private final AtomicLong timeoutRequests = new AtomicLong(0);
	private final AtomicLong duplicateRequests = new AtomicLong(0);

	// 상태별 카운터
	private final AtomicLong pendingCount = new AtomicLong(0);
	private final AtomicLong processedCount = new AtomicLong(0);
	private final AtomicLong failedCount = new AtomicLong(0);

	// 실패 원인별 통계
	private final Map<String, AtomicLong> failureReasons = new ConcurrentHashMap<>();

	// LLM 호출 시간 기록
	private final ConcurrentLinkedQueue<Long> llmCallTimes = new ConcurrentLinkedQueue<>();

	/**
	 * 웹훅 응답 시간 기록
	 */
	public void recordWebhookResponse(long responseTimeMs, boolean isDuplicate) {
		totalRequests.incrementAndGet();
		webhookResponseTimes.add(responseTimeMs);

		if (isDuplicate) {
			duplicateRequests.incrementAndGet();
		}

		log.debug("⏱️ Webhook response: {}ms, duplicate: {}", responseTimeMs, isDuplicate);
	}

	/**
	 * 전체 처리 시간 기록 (동기 처리 시)
	 */
	public void recordTotalProcessing(long totalTimeMs, boolean success, boolean timeout) {
		totalProcessingTimes.add(totalTimeMs);

		if (success) {
			successfulRequests.incrementAndGet();
			processedCount.incrementAndGet();
		} else {
			failedRequests.incrementAndGet();
			failedCount.incrementAndGet();

			if (timeout) {
				timeoutRequests.incrementAndGet();
			}
		}

		log.info("🔄 Total processing: {}ms, success: {}, timeout: {}",
			totalTimeMs, success, timeout);
	}

	/**
	 * LLM 호출 시간 기록
	 */
	public void recordLlmCall(long llmTimeMs) {
		llmCallTimes.add(llmTimeMs);
		log.debug("🤖 LLM call: {}ms", llmTimeMs);
	}

	/**
	 * 비동기 처리 성공 기록
	 */
	public void recordAsyncSuccess() {
		successfulRequests.incrementAndGet();
		processedCount.incrementAndGet();
	}

	/**
	 * 비동기 처리 실패 기록
	 */
	public void recordAsyncFailure(String reason) {
		failedRequests.incrementAndGet();
		failedCount.incrementAndGet();
		failureReasons.computeIfAbsent(reason, k -> new AtomicLong(0)).incrementAndGet();
	}

	/**
	 * 통계 조회
	 */
	public Map<String, Object> getStatistics() {
		long total = totalRequests.get();
		long success = successfulRequests.get();
		long failed = failedRequests.get();
		long timeout = timeoutRequests.get();
		long duplicate = duplicateRequests.get();

		Map<String, Object> stats = new HashMap<>();

		// 기본 통계
		stats.put("totalRequests", total);
		stats.put("successfulRequests", success);
		stats.put("failedRequests", failed);
		stats.put("timeoutRequests", timeout);
		stats.put("duplicateRequests", duplicate);

		// 비율 계산
		if (total > 0) {
			stats.put("successRate", String.format("%.2f%%", (success * 100.0 / total)));
			stats.put("failureRate", String.format("%.2f%%", (failed * 100.0 / total)));
			stats.put("timeoutRate", String.format("%.2f%%", (timeout * 100.0 / total)));
			stats.put("duplicateRate", String.format("%.2f%%", (duplicate * 100.0 / total)));
		}

		// 웹훅 응답 시간 통계
		stats.put("webhookResponseTime", calculateTimeStats(webhookResponseTimes));

		// 전체 처리 시간 통계 (동기 처리 시)
		if (!totalProcessingTimes.isEmpty()) {
			stats.put("totalProcessingTime", calculateTimeStats(totalProcessingTimes));
		}

		// LLM 호출 시간 통계
		if (!llmCallTimes.isEmpty()) {
			stats.put("llmCallTime", calculateTimeStats(llmCallTimes));
		}

		// 실패 원인별 통계
		Map<String, Long> failures = new HashMap<>();
		failureReasons.forEach((reason, count) -> failures.put(reason, count.get()));
		stats.put("failureReasons", failures);

		return stats;
	}

	/**
	 * 시간 통계 계산
	 */
	private Map<String, String> calculateTimeStats(ConcurrentLinkedQueue<Long> times) {
		List<Long> timeList = new ArrayList<>(times);
		if (timeList.isEmpty()) {
			return Map.of("message", "No data");
		}

		long sum = timeList.stream().mapToLong(Long::longValue).sum();
		long avg = sum / timeList.size();
		long max = timeList.stream().mapToLong(Long::longValue).max().orElse(0);
		long min = timeList.stream().mapToLong(Long::longValue).min().orElse(0);

		// 중앙값 계산
		Collections.sort(timeList);
		long median = timeList.get(timeList.size() / 2);

		// 95 퍼센타일
		int p95Index = (int) (timeList.size() * 0.95);
		long p95 = timeList.get(Math.min(p95Index, timeList.size() - 1));

		return Map.of(
			"count", String.valueOf(timeList.size()),
			"average", avg + "ms",
			"median", median + "ms",
			"min", min + "ms",
			"max", max + "ms",
			"p95", p95 + "ms"
		);
	}

	/**
	 * 통계 초기화
	 */
	public void reset() {
		webhookResponseTimes.clear();
		totalProcessingTimes.clear();
		llmCallTimes.clear();

		totalRequests.set(0);
		successfulRequests.set(0);
		failedRequests.set(0);
		timeoutRequests.set(0);
		duplicateRequests.set(0);

		pendingCount.set(0);
		processedCount.set(0);
		failedCount.set(0);

		failureReasons.clear();

		log.info("📊 Performance metrics reset");
	}

	/**
	 * 현재 통계를 로그로 출력
	 */
	public void printStatistics() {
		Map<String, Object> stats = getStatistics();
		log.info("📊 ========== Performance Statistics ==========");
		stats.forEach((key, value) -> log.info("  {}: {}", key, value));
		log.info("📊 ============================================");
	}
}