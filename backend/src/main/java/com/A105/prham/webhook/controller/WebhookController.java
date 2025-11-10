package com.A105.prham.webhook.controller;

// ✨ messages 패키지가 아닌 webhook 패키지의 DTO 임포트
import com.A105.prham.webhook.dto.MattermostWebhookDto;
// ✨ messages 패키지가 아닌 webhook 패키지의 Service 임포트
import com.A105.prham.webhook.service.WebhookIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}