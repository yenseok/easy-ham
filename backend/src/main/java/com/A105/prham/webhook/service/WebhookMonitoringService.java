package com.A105.prham.webhook.service;

import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WebhookMonitoringService {

	// 전체 요청 수
	private final AtomicLong totalRequests = new AtomicLong(0);
	// 성공한 요청 수
	private final AtomicLong successfulRequests = new AtomicLong(0);
	// 실패한 요청 수 (timeout 포함)
	private final AtomicLong failedRequests = new AtomicLong(0);
	// Timeout으로 실패한 요청 수
	private final AtomicLong timeoutRequests = new AtomicLong(0);

	public void recordRequest(boolean success, boolean timeout) {
		totalRequests.incrementAndGet();

		if (success) {
			successfulRequests.incrementAndGet();
		} else {
			failedRequests.incrementAndGet();
			if (timeout) {
				timeoutRequests.incrementAndGet();
			}
		}
	}

	public Map<String, Object> getMetrics() {
		long total = totalRequests.get();
		long success = successfulRequests.get();
		long failed = failedRequests.get();
		long timeout = timeoutRequests.get();

		return Map.of(
			"totalRequests", total,
			"successRate", total > 0 ? (success * 100.0 / total) + "%" : "0%",
			"failureRate", total > 0 ? (failed * 100.0 / total) + "%" : "0%",
			"timeoutRate", total > 0 ? (timeout * 100.0 / total) + "%" : "0%"
		);
	}
}

