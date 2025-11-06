package com.A105.prham.search.controller;

import com.A105.prham.messages.dto.ProcessedMessage;
import com.A105.prham.messages.entity.Message;
import com.A105.prham.messages.repository.MessageRepository;
import com.A105.prham.messages.service.MessageService;
import com.A105.prham.search.dto.request.CreateTestPostRequest;
import com.A105.prham.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/test/search")
@RequiredArgsConstructor
public class TestDataController {

    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final SearchService searchService;

    /**
     * 테스트용 Message 데이터 생성 및 자동 인덱싱
     * Webhook 구현 전까지 임시로 사용
     */
    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createTestPost(@RequestBody CreateTestPostRequest request) {
        try {
            log.info("Creating test message: {}", request);

            // 1. Message Entity 생성
            Message message = new Message();
            message.setPostId(request.getMmMessageId());
            message.setChannelId(request.getMmChannelId());
            message.setUserId(request.getMmUserId() != null ? request.getMmUserId() : "test_user");
            message.setTimestamp(request.getMmCreatedAt() != null ?
                    request.getMmCreatedAt() :
                    System.currentTimeMillis());  // Long 타입으로 저장
            message.setOriginalText(request.getContent());
            message.setCleanedText(request.getContent()); // 간단히 원본 사용
            message.setDeadline(null); // 테스트에서는 null
            message.setProcessedAt(java.time.LocalDateTime.now().toString());

            // 2. DB에 저장
            Message savedMessage = messageRepository.save(message);
            log.info("Message saved to DB with postId: {}", savedMessage.getPostId());

            // 3. ProcessedMessage로 변환
            ProcessedMessage processed = messageService.convertToProcessedMessage(savedMessage);

            // 4. 카테고리 정보 추가 (테스트 요청에서 받은 값)
            processed.setMainCategory(request.getMainCategory());
            processed.setSubCategory(request.getSubCategory());

            // 5. Meilisearch에 인덱싱
            searchService.indexMessage(processed);
            log.info("Message indexed to Meilisearch: {}", savedMessage.getPostId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("postId", savedMessage.getPostId());
            response.put("message", "Test message created and indexed successfully");
            response.put("data", savedMessage);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to create test message", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 여러 테스트 Message 한번에 생성
     */
    @PostMapping("/posts/bulk")
    public ResponseEntity<Map<String, Object>> createTestPostsBulk(@RequestBody CreateTestPostRequest[] requests) {
        try {
            log.info("Creating {} test messages", requests.length);

            int successCount = 0;
            for (CreateTestPostRequest request : requests) {
                try {
                    Message message = new Message();
                    message.setPostId(request.getMmMessageId());
                    message.setChannelId(request.getMmChannelId());
                    message.setUserId(request.getMmUserId() != null ? request.getMmUserId() : "test_user");
                    message.setTimestamp(request.getMmCreatedAt() != null ?
                            request.getMmCreatedAt() :
                            System.currentTimeMillis());  // Long 타입으로 저장
                    message.setOriginalText(request.getContent());
                    message.setCleanedText(request.getContent());
                    message.setDeadline(null);
                    message.setProcessedAt(java.time.LocalDateTime.now().toString());

                    Message savedMessage = messageRepository.save(message);

                    ProcessedMessage processed = messageService.convertToProcessedMessage(savedMessage);
                    processed.setMainCategory(request.getMainCategory());
                    processed.setSubCategory(request.getSubCategory());

                    searchService.indexMessage(processed);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to create message: {}", request, e);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalRequests", requests.length);
            response.put("successCount", successCount);
            response.put("failedCount", requests.length - successCount);
            response.put("message", String.format("Created and indexed %d/%d messages", successCount, requests.length));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to create bulk test messages", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 테스트 Message 삭제 (DB + Meilisearch)
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deleteTestPost(@PathVariable String postId) {
        try {
            log.info("Deleting test message: {}", postId);

            // 1. DB에서 삭제
            Message message = messageRepository.findByPostId(postId)
                    .orElseThrow(() -> new RuntimeException("Message not found: " + postId));
            messageRepository.delete(message);
            log.info("Message deleted from DB: {}", postId);

            // 2. Meilisearch에서 삭제
            searchService.deleteMessage(postId);
            log.info("Message deleted from Meilisearch: {}", postId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("postId", postId);
            response.put("message", "Test message deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to delete test message: {}", postId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 모든 테스트 데이터 삭제 (주의: DB의 모든 Message + Meilisearch 인덱스 삭제)
     */
    @DeleteMapping("/posts/all")
    public ResponseEntity<Map<String, Object>> deleteAllTestPosts() {
        try {
            log.warn("Deleting ALL messages from DB and Meilisearch");

            long count = messageRepository.count();

            // 1. DB에서 모든 Message 삭제
            messageRepository.deleteAll();
            log.info("✅ Deleted {} messages from DB", count);

            // 2. Meilisearch에서 모든 문서 삭제
            searchService.deleteAllDocuments();
            log.info("✅ Deleted all documents from Meilisearch");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deletedCount", count);
            response.put("message", String.format("Successfully deleted %d messages from both DB and Meilisearch", count));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to delete all test messages", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}