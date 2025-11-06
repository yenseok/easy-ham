package com.A105.prham.search.service;

import com.A105.prham.messages.dto.FileInfo;
import com.A105.prham.messages.dto.ProcessedMessage;
import com.A105.prham.search.dto.request.PostSearchRequest;
import com.A105.prham.search.dto.response.PostSearchItem;
import com.A105.prham.search.dto.response.PostSearchResponse;
import com.A105.prham.search.dto.response.SearchMetadata;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.SearchRequest;
import com.meilisearch.sdk.model.SearchResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final Client meilisearchClient;
    private static final String INDEX_NAME = "posts";
    private final ObjectMapper objectMapper = new ObjectMapper();

    // TODO: 좋아요 리포지토리 주입 필요
    // private final LikeRepository likeRepository;

    /**
     * 검색 모드 정의
     */
    private enum SearchMode {
        KEYWORD_ONLY,    // 키워드만 (전체 검색)
        FILTER_ONLY,     // 필터만 (목록 브라우징)
        HYBRID,          // 키워드 + 필터 (복합 검색)
        BROWSE_ALL       // 아무 조건 없음 (전체 목록)
    }

    /**
     * 게시물 검색 (개선된 버전)
     */
    public PostSearchResponse searchPosts(PostSearchRequest request) {
        try {
            // 1. 검색 모드 결정
            SearchMode mode = determineSearchMode(request);
            log.info("🔍 Search Mode: {}", mode);

            // 2. Meilisearch 검색 실행
            SearchResult meilisearchResult = executeSearch(request, mode);

            // 3. 좋아요 필터 적용 (후처리)
            List<PostSearchItem> items = convertToSearchItems(meilisearchResult);
            if (Boolean.TRUE.equals(request.getIsLiked())) {
                items = filterByLikes(items, getCurrentUserId());
            }

            // 4. 응답 생성
            return buildResponse(items, meilisearchResult, request, mode);

        } catch (Exception e) {
            log.error("❌ Failed to search posts", e);
            throw new RuntimeException("Failed to search posts", e);
        }
    }

    /**
     * 검색 모드 결정
     */
    private SearchMode determineSearchMode(PostSearchRequest request) {
        boolean hasKeyword = request.hasKeyword();
        boolean hasFilters = request.hasFilters();

        if (hasKeyword && hasFilters) {
            return SearchMode.HYBRID;
        } else if (hasKeyword) {
            return SearchMode.KEYWORD_ONLY;
        } else if (hasFilters) {
            return SearchMode.FILTER_ONLY;
        } else {
            return SearchMode.BROWSE_ALL;
        }
    }

    /**
     * Meilisearch 검색 실행
     */
    private SearchResult executeSearch(PostSearchRequest request, SearchMode mode) throws Exception {
        Index index = meilisearchClient.index(INDEX_NAME);

        // 필터 빌드
        String filter = buildEnhancedFilter(request);

        // 정렬 결정
        String[] sort = new String[]{determineSortOrder(mode, request.getSort())};

        // 검색 요청 빌드
        SearchRequest.SearchRequestBuilder builder = SearchRequest.builder()
                .q(request.hasKeyword() ? request.getKeyword().trim() : "")
                .limit(request.getSize())
                .offset(request.getOffset())
                .sort(sort)
                .attributesToHighlight(new String[]{"cleanedText", "userId"})
                .showMatchesPosition(false);

        if (!filter.isEmpty()) {
            builder.filter(new String[]{filter});
        }

        SearchRequest searchRequest = builder.build();

        // 디버깅 로그
        log.info("📊 Search Request:");
        log.info("   - Query: '{}'", request.hasKeyword() ? request.getKeyword() : "(empty)");
        log.info("   - Filter: {}", filter.isEmpty() ? "(none)" : filter);
        log.info("   - Sort: {}", sort[0]);
        log.info("   - Pagination: offset={}, limit={}", request.getOffset(), request.getSize());

        SearchResult result = (SearchResult) index.search(searchRequest);

        log.info("✅ Search completed: {} results found in {}ms",
                result.getHits().size(),
                result.getProcessingTimeMs());

        return result;
    }

    /**
     * 개선된 필터 빌드 (OR 조건 지원)
     */
    private String buildEnhancedFilter(PostSearchRequest request) {
        List<String> filterParts = new ArrayList<>();

        // 1. 채널 필터 (OR)
        if (request.getChannelIds() != null && !request.getChannelIds().isEmpty()) {
            String channelFilter = request.getChannelIds().stream()
                    .map(id -> "channelId = '" + escapeFilterValue(id) + "'")
                    .collect(Collectors.joining(" OR "));
            filterParts.add("(" + channelFilter + ")");
        }

        // 2. 카테고리 필터 (OR - mainCategory, subCategory 모두 검색)
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            String categoryFilter = request.getCategoryIds().stream()
                    .map(id -> "(mainCategory = " + id + " OR subCategory = " + id + ")")
                    .collect(Collectors.joining(" OR "));
            filterParts.add("(" + categoryFilter + ")");
        }

        // 3. 날짜 범위 필터 (AND) - timestamp는 이제 Long이므로 숫자 비교
        if (request.getStartDate() != null && request.getEndDate() != null) {
            filterParts.add("(timestamp >= " + request.getStartDate() +
                    " AND timestamp <= " + request.getEndDate() + ")");
        } else if (request.getStartDate() != null) {
            filterParts.add("timestamp >= " + request.getStartDate());
        } else if (request.getEndDate() != null) {
            filterParts.add("timestamp <= " + request.getEndDate());
        }

        // 최종 필터: 모든 조건을 AND로 결합
        String finalFilter = String.join(" AND ", filterParts);

        return finalFilter;
    }

    /**
     * 정렬 순서 결정
     */
    private String determineSortOrder(SearchMode mode, String userSort) {
        // 사용자가 명시적으로 지정한 정렬이 있으면 우선
        if (userSort != null && !userSort.equals("mmCreatedAt:desc")) {
            // mmCreatedAt -> timestamp 변환
            return userSort.replace("mmCreatedAt", "timestamp");
        }

        // 모드별 기본 정렬
        // Meilisearch는 키워드가 있으면 자동으로 관련성 우선 정렬
        // 키워드가 없으면 sort 파라미터대로 정렬
        return "timestamp:desc";
    }

    /**
     * Meilisearch 결과를 SearchItem 리스트로 변환
     */
    private List<PostSearchItem> convertToSearchItems(SearchResult meilisearchResult) {
        return meilisearchResult.getHits().stream()
                .map(this::convertToSearchItem)
                .collect(Collectors.toList());
    }

    /**
     * 좋아요 필터링 (후처리)
     */
    private List<PostSearchItem> filterByLikes(List<PostSearchItem> items, String userId) {
        // TODO: 실제 좋아요 데이터와 연동
        // Set<Long> likedPostIds = likeRepository.findByUserId(userId)
        //         .stream()
        //         .map(Like::getPostId)
        //         .collect(Collectors.toSet());
        //
        // return items.stream()
        //         .filter(item -> likedPostIds.contains(item.getId()))
        //         .collect(Collectors.toList());

        log.warn("⚠️ isLiked filter requested but Like repository not implemented yet");
        return items; // 임시: 필터링 없이 반환
    }

    /**
     * 현재 사용자 ID 가져오기
     */
    private String getCurrentUserId() {
        // TODO: Spring Security Context에서 현재 사용자 정보 가져오기
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // return auth.getName();
        return "temp_user_id";
    }

    /**
     * 최종 응답 생성
     */
    private PostSearchResponse buildResponse(
            List<PostSearchItem> items,
            SearchResult meilisearchResult,
            PostSearchRequest request,
            SearchMode mode) {

        // 메타데이터 생성
        int totalHits = meilisearchResult.getEstimatedTotalHits();
        int totalPages = (int) Math.ceil((double) totalHits / request.getSize());

        SearchMetadata metadata = SearchMetadata.builder()
                .query(request.hasKeyword() ? request.getKeyword() : "")
                .totalHits(totalHits)
                .page(request.getPage())
                .size(request.getSize())
                .totalPages(totalPages)
                .processingTimeMs(meilisearchResult.getProcessingTimeMs())
                .appliedFilters(SearchMetadata.AppliedFilters.builder()
                        .channelIds(request.getChannelIds())
                        .categoryIds(request.getCategoryIds())
                        .startDate(request.getStartDate())
                        .endDate(request.getEndDate())
                        .isLiked(request.getIsLiked())
                        .build())
                .build();

        return PostSearchResponse.builder()
                .items(items)
                .metadata(metadata)
                .build();
    }

//    /**
//     * Meilisearch Hit를 PostSearchItem으로 변환
//     */
//    private PostSearchItem convertToSearchItem(Object hit) {
//        try {
//            @SuppressWarnings("unchecked")
//            Map<String, Object> hitMap = (Map<String, Object>) hit;
//
//            // _formatted에서 하이라이트된 content 추출
//            @SuppressWarnings("unchecked")
//            Map<String, Object> formatted = (Map<String, Object>) hitMap.get("_formatted");
//            String highlightedContent = formatted != null ?
//                    (String) formatted.get("cleanedText") :
//                    (String) hitMap.get("cleanedText");
//
//            return PostSearchItem.builder()
//                    .id(getLongValue(hitMap.get("postId")))  // postId를 id로 사용
//                    .mmMessageId((String) hitMap.get("postId"))  // postId를 mmMessageId로 매핑
//                    .mmChannelId((String) hitMap.get("channelId"))  // channelId를 mmChannelId로 매핑
//                    .userName((String) hitMap.get("userId"))  // userId를 userName으로 사용
//                    .content((String) hitMap.get("cleanedText"))
//                    .highlightedContent(highlightedContent)
//                    .mmCreatedAt(getLongValue(hitMap.get("timestamp")))  // timestamp를 mmCreatedAt로 매핑 (이미 Long)
//                    .mainCategory(getLongValue(hitMap.get("mainCategory")))
//                    .subCategory(getLongValue(hitMap.get("subCategory")))
//                    .build();
//        } catch (Exception e) {
//            log.error("Failed to convert search item", e);
//            throw new RuntimeException("Failed to convert search item", e);
//        }
//    }

    /**
     * Object를 Long으로 안전하게 변환
     */
    private Long getLongValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 필터 값 이스케이프 (SQL 인젝션 방지)
     */
    private String escapeFilterValue(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("'", "\\'");
    }

    // ========== ProcessedMessage 인덱싱 메서드 ==========

    public void indexMessage(ProcessedMessage message) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            Map<String, Object> document = messageToDocument(message);

            String json = objectMapper.writeValueAsString(List.of(document));
            index.addDocuments(json);
            log.info("📄 JSON to send: {}", json);
            log.info("✅ Indexed message: {}", message.getPostId());
        } catch (Exception e) {
            log.error("❌ Failed to index message: {}", message.getPostId(), e);
            throw new RuntimeException("Failed to index message", e);
        }
    }

    public void indexMessages(List<ProcessedMessage> messages) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);

            List<Map<String, Object>> documents = messages.stream()
                    .map(this::messageToDocument)
                    .collect(Collectors.toList());

            String json = objectMapper.writeValueAsString(documents);
            index.addDocuments(json);

            log.info("✅ Indexed {} messages", messages.size());
        } catch (Exception e) {
            log.error("❌ Failed to index messages", e);
            throw new RuntimeException("Failed to index messages", e);
        }
    }

    public void deleteMessage(String postId) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            index.deleteDocument(postId);
            log.info("✅ Deleted message: {}", postId);
        } catch (Exception e) {
            log.error("❌ Failed to delete message: {}", postId, e);
            throw new RuntimeException("Failed to delete message", e);
        }
    }

    public Object getIndexStats() {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            return index.getStats();
        } catch (Exception e) {
            log.error("Failed to get index stats", e);
            throw new RuntimeException("Failed to get index stats", e);
        }
    }

    public void deleteAllDocuments() {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            index.deleteAllDocuments();
            log.info("✅ Deleted all documents from Meilisearch");
        } catch (Exception e) {
            log.error("❌ Failed to delete all documents", e);
            throw new RuntimeException("Failed to delete all documents", e);
        }
    }

    /**
     * ProcessedMessage를 Meilisearch Document로 변환
     * timestamp는 Long 타입으로 저장됨
     */
    // SearchService.java의 수정 사항

// 1. messageToDocument 메서드에서 파일 정보 추가
    private Map<String, Object> messageToDocument(ProcessedMessage message) {
        Map<String, Object> document = new HashMap<>();
        document.put("postId", message.getPostId());
        document.put("channelId", message.getChannelId());
        document.put("userId", message.getUserId());
        document.put("cleanedText", message.getCleanedText());
        document.put("timestamp", message.getTimestamp());
        document.put("mainCategory", message.getMainCategory());
        document.put("subCategory", message.getSubCategory());
        document.put("deadline", message.getDeadline());
        document.put("processedAt", message.getProcessedAt());

        // 파일 정보 추가 (JSON으로 직렬화)
        if (message.getFiles() != null && !message.getFiles().isEmpty()) {
            document.put("files", message.getFiles());
            // 파일 개수도 저장 (검색/필터에 활용 가능)
            document.put("fileCount", message.getFiles().size());
        } else {
            document.put("files", null);
            document.put("fileCount", 0);
        }

        return document;
    }

    // 2. convertToSearchItem 메서드에서 파일 정보 파싱
    private PostSearchItem convertToSearchItem(Object hit) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> hitMap = (Map<String, Object>) hit;

            // _formatted에서 하이라이트된 content 추출
            @SuppressWarnings("unchecked")
            Map<String, Object> formatted = (Map<String, Object>) hitMap.get("_formatted");
            String highlightedContent = formatted != null ?
                    (String) formatted.get("cleanedText") :
                    (String) hitMap.get("cleanedText");

            // 파일 정보 파싱
            List<FileInfo> files = parseFileInfos(hitMap.get("files"));

            return PostSearchItem.builder()
                    .id(getLongValue(hitMap.get("postId")))
                    .mmMessageId((String) hitMap.get("postId"))
                    .mmChannelId((String) hitMap.get("channelId"))
                    .userName((String) hitMap.get("userId"))
                    .content((String) hitMap.get("cleanedText"))
                    .highlightedContent(highlightedContent)
                    .mmCreatedAt(getLongValue(hitMap.get("timestamp")))
                    .mainCategory(getLongValue(hitMap.get("mainCategory")))
                    .subCategory(getLongValue(hitMap.get("subCategory")))
                    .files(files)  // 파일 정보 추가
                    .build();
        } catch (Exception e) {
            log.error("Failed to convert search item", e);
            throw new RuntimeException("Failed to convert search item", e);
        }
    }

    // 3. 파일 정보 파싱 헬퍼 메서드 추가
    @SuppressWarnings("unchecked")
    private List<FileInfo> parseFileInfos(Object filesObj) {
        if (filesObj == null) {
            return null;
        }

        try {
            if (filesObj instanceof List) {
                List<Map<String, Object>> filesList = (List<Map<String, Object>>) filesObj;
                return filesList.stream()
                        .map(this::mapToFileInfo)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("Failed to parse file infos: {}", e.getMessage());
        }

        return null;
    }

    private FileInfo mapToFileInfo(Map<String, Object> map) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setId((String) map.get("id"));
        fileInfo.setName((String) map.get("name"));
        fileInfo.setExtension((String) map.get("extension"));
        fileInfo.setSize(getLongValue(map.get("size")));
        fileInfo.setMimeType((String) map.get("mimeType"));
        fileInfo.setWidth(getIntValue(map.get("width")));
        fileInfo.setHeight(getIntValue(map.get("height")));

        Object hasPreview = map.get("hasPreviewImage");
        if (hasPreview instanceof Boolean) {
            fileInfo.setHasPreviewImage((Boolean) hasPreview);
        }

        return fileInfo;
    }

    // 4. getIntValue 헬퍼 메서드 추가 (기존에 없다면)
    private Integer getIntValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }



}