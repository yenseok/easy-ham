package com.A105.prham.search.controller;

import com.A105.prham.messages.entity.Message;
import com.A105.prham.messages.repository.MessageRepository;
import com.A105.prham.messages.service.MessageService;
import com.A105.prham.search.service.SearchService;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.model.DocumentsQuery;
import com.meilisearch.sdk.model.Results;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
public class SearchAdminController {

    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final SearchService searchService;
    private final Client meilisearchClient;

    // 전체 재색인
    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindexAll() {
        log.info("Starting full reindex...");

        // Message Entity를 조회하여 ProcessedMessage로 변환 후 인덱싱
        List<Message> messages = messageRepository.findAll();

        List<com.A105.prham.messages.dto.ProcessedMessage> processedMessages = messages.stream()
                .map(messageService::convertToProcessedMessage)
                .collect(Collectors.toList());

        searchService.indexMessages(processedMessages);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("indexedCount", processedMessages.size());
        response.put("message", "Successfully reindexed all messages");

        log.info("Reindexed {} messages", processedMessages.size());
        return ResponseEntity.ok(response);
    }

    // 색인 상태 확인
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getIndexStatus() {
        try {
            Object stats = searchService.getIndexStats();

            Map<String, Object> response = new HashMap<>();
            response.put("stats", stats);
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 🆕 Meilisearch에 실제로 저장된 문서 확인
    @GetMapping("/documents")
    public ResponseEntity<Map<String, Object>> getDocuments(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Index index = meilisearchClient.index("posts");

            // DocumentsQuery 생성
            DocumentsQuery query = new DocumentsQuery()
                    .setOffset(offset)
                    .setLimit(limit);

            // Meilisearch에서 문서 가져오기
            Results<HashMap> documents = index.getDocuments(query, HashMap.class);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("results", documents.getResults());
            response.put("total", documents.getTotal());
            response.put("offset", documents.getOffset());
            response.put("limit", documents.getLimit());
            response.put("message", "Retrieved documents from Meilisearch");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get documents", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 🆕 Meilisearch 인덱스 설정 확인
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getIndexSettings() {
        try {
            Index index = meilisearchClient.index("posts");
            Object settings = index.getSettings();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("settings", settings);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get settings", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 🆕 특정 문서 조회 (postId로)
    @GetMapping("/documents/{postId}")
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable String postId) {
        try {
            Index index = meilisearchClient.index("posts");
            HashMap document = (HashMap) index.getDocument(postId, HashMap.class);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get document: {}", postId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 🆕 인덱스 완전히 삭제 (주의!)
    @DeleteMapping("/index")
    public ResponseEntity<Map<String, Object>> deleteIndex() {
        try {
            log.warn("⚠️ Deleting entire Meilisearch index!");
            meilisearchClient.deleteIndex("posts");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Index deleted successfully. Restart application to recreate.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete index", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 🆕 인덱스 Primary Key 확인
    @GetMapping("/index-info")
    public ResponseEntity<Map<String, Object>> getIndexInfo() {
        try {
            Index index = meilisearchClient.index("posts");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("uid", index.getUid());
            response.put("primaryKey", index.getPrimaryKey());
            response.put("createdAt", index.getCreatedAt());
            response.put("updatedAt", index.getUpdatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get index info", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}