package com.A105.prham.search.service;

import com.A105.prham.messages.dto.FileInfo;
import com.A105.prham.messages.service.MattermostService;
import com.A105.prham.post_user_completed.repository.PostUserCompletedRepository;
import com.A105.prham.search.dto.document.PostIndexDocument;
import com.A105.prham.search.dto.request.PostSearchRequest;
import com.A105.prham.search.dto.response.PostSearchItem;
import com.A105.prham.search.dto.response.PostSearchResponse;
import com.A105.prham.search.dto.response.SearchMetadata;
import com.A105.prham.user_notice_like.repository.UserNoticeLikeRepository;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.service.PostProcessorService;
import com.A105.prham.webhook.service.PostService;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.SearchRequest;
import com.meilisearch.sdk.model.SearchResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.A105.prham.user.entity.User;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final Client meilisearchClient;
    private static final String INDEX_NAME = "posts";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PostProcessorService postProcessorService;
    private final MattermostService mattermostService;
    private final PostService postService;
    private final UserNoticeLikeRepository userNoticeLikeRepository;
    private final PostUserCompletedRepository postUserCompletedRepository;
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
     * 게시물 검색 (Post 기반)
     */
    public PostSearchResponse searchPosts(PostSearchRequest request) {
        try {
            // 1. 검색 모드 결정
            SearchMode mode = determineSearchMode(request);
            log.info("🔍 Search Mode: {}", mode);

            // 2. Meilisearch 검색 실행
            SearchResult meilisearchResult = executeSearch(request, mode);

            // 3. 검색 결과 전환
            List<PostSearchItem> items = convertToSearchItems(meilisearchResult);

            // 4. 사용자별 데이터 추가 (isLiked, isCompleted)
            Long currentUserId = getCurrentUserId();
            items = enrichWithUserData(items, currentUserId);

            // 5. 좋아요 필터 적용 (후처리)
            if (Boolean.TRUE.equals(request.getIsLiked())) {
                items = items.stream()
                        .filter(item -> Boolean.TRUE.equals(item.getIsLiked()))
                        .collect(Collectors.toList());
                log.info("✅ Filtered by isLiked=true: {} items", items.size());
            }

            // 6. 완료 필터 적용 (후처리)
            if (request.getIsCompleted() != null) {
                if (Boolean.TRUE.equals(request.getIsCompleted())) {
                    items = items.stream()
                            .filter(item -> Boolean.TRUE.equals(item.getIsCompleted()))
                            .collect(Collectors.toList());
                    log.info("✅ Filtered by isCompleted=true: {} items", items.size());
                } else {
                    items = items.stream()
                            .filter(item -> !Boolean.TRUE.equals(item.getIsCompleted()))
                            .collect(Collectors.toList());
                    log.info("✅ Filtered by isCompleted=false: {} items", items.size());
                }
            }

            // 6. 응답 생성
            return buildResponse(items, meilisearchResult, request, mode);

        } catch (Exception e) {
            log.error("❌ Failed to search posts", e);
            throw new RuntimeException("Failed to search posts", e);
        }
    }

    /**
     * 검색 결과에 사용자별 데이터(좋아요, 완료 여부) 추가
     */
    private List<PostSearchItem> enrichWithUserData(List<PostSearchItem> items, Long userId) {
        if (userId == null || items.isEmpty()) {
            // 로그인하지 않은 경우 모두 false로 설정
            items.forEach(item -> {
                item.setIsLiked(false);
                item.setIsCompleted(false);
            });
            return items;
        }

        try {
            // 사용자가 좋아요한 게시물 ID 목록 조회
            Set<Long> likedPostIds = userNoticeLikeRepository.findLikedPostIdsByUserId(userId);

            // 사용자가 완료한 게시물 ID 목록 조회
            Set<Long> completedPostIds = postUserCompletedRepository.findCompletedPostIdsByUserId(userId);

            // 각 아이템에 isLiked, isCompleted 값 설정
            items.forEach(item -> {
                item.setIsLiked(likedPostIds.contains(item.getId()));
                item.setIsCompleted(completedPostIds.contains(item.getId()));
            });

            log.info("✅ Enriched {} items with user data (userId: {}, liked: {}, completed: {})",
                    items.size(), userId, likedPostIds.size(), completedPostIds.size());
            return items;

        } catch (Exception e) {
            log.error("❌ Failed to enrich items with user data", e);
            // 실패 시에도 false로 설정
            items.forEach(item -> {
                item.setIsLiked(false);
                item.setIsCompleted(false);
            });
            return items;
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
                .attributesToHighlight(new String[]{"title", "cleanedText"})
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

        // 2. 카테고리 필터 (subCategory 기준)
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            String categoryFilter = request.getCategoryIds().stream()
                    .map(id -> "subCategory = " + id)
                    .collect(Collectors.joining(" OR "));
            filterParts.add("(" + categoryFilter + ")");
        }

        // 3. 날짜 범위 필터 (AND)
        if (request.getStartDate() != null && request.getEndDate() != null) {
            filterParts.add("(timestamp >= " + request.getStartDate() +
                    " AND timestamp <= " + request.getEndDate() + ")");
        } else if (request.getStartDate() != null) {
            filterParts.add("timestamp >= " + request.getStartDate());
        } else if (request.getEndDate() != null) {
            filterParts.add("timestamp <= " + request.getEndDate());
        }

        // 최종 필터: 모든 조건을 AND로 결합
        return String.join(" AND ", filterParts);
    }

    /**
     * 정렬 순서 결정
     */
    private String determineSortOrder(SearchMode mode, String userSort) {
        // 사용자가 명시적으로 지정한 정렬이 있으면 우선
        if (userSort != null && !userSort.equals("timestamp:desc")) {
            return userSort;
        }

        // 기본 정렬: 최신순
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
     * 개별 검색 결과를 PostSearchItem으로 변환 //개별 말고, 뭉탱이로 검색할 필요가 있음.
     */
    private PostSearchItem convertToSearchItem(Object hit) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> hitMap = (Map<String, Object>) hit;

            // _formatted에서 하이라이트된 content 추출
            @SuppressWarnings("unchecked")
            Map<String, Object> formatted = (Map<String, Object>) hitMap.get("_formatted");

            String highlightedTitle = formatted != null ?
                    (String) formatted.get("title") : (String) hitMap.get("title");

            String highlightedContent = formatted != null ?
                    (String) formatted.get("cleanedText") : (String) hitMap.get("cleanedText");

            List<FileInfo> files = parseFileInfos(hitMap.get("files"));
//여기서 검색 응답 구조 설정 가능
            //TODO 여기 2N+1 문제 있음. 개선하고싶은 사람이 하면 됨
            //유저 네임 찾아서 넣기
            String userName = mattermostService.getUserNameFromID((String) hitMap.get("userId"));

            //post id 찾아서 넣기
            Long id = postService.getPostIdByMMPostId((String) hitMap.get("postId"));

            return PostSearchItem.builder()
//                    .id(getLongValue(hitMap.get("postId")))
                    .id(id)
                    .mmMessageId((String) hitMap.get("postId"))
                    .title((String) hitMap.get("title"))
                    .campusId((String) hitMap.get("campusList"))
                    .channelName((String) hitMap.get("channelName"))
                    .mmChannelId((String) hitMap.get("channelId"))
                    .userName(userName)
                    .deadline((String) hitMap.get("deadline"))
                    .campusId((String) hitMap.get("campusId"))
                    .content((String) hitMap.get("cleanedText"))
                    .highlightedContent(highlightedContent != null ? highlightedContent : (String) hitMap.get("cleanedText"))
                    .mmCreatedAt(getLongValue(hitMap.get("timestamp")))
                    .subCategory(getLongValue(hitMap.get("subCategory")))
                    .originalLink((String) hitMap.get("originalLink"))
                    .files(files)
                    .build();
        } catch (Exception e) {
            log.error("Failed to convert search item", e);
            throw new RuntimeException("Failed to convert search item", e);
        }
    }



    /**
     * 현재 사용자 ID 가져오기
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("⚠️ No authenticated user found");
                return null;
            }

            // JwtAuthenticationFilter에서 설정한 User 객체 가져오기
            Object principal = authentication.getPrincipal();

            if (principal instanceof User) {
                User user = (User) principal;
                log.info("name : {} , Id : {} ",user.getName(),user.getId());
                return user.getId();  // User 엔티티의 ID 반환
            }

            log.warn("⚠️ Principal is not a User instance: {}", principal.getClass());
            return null;

        } catch (Exception e) {
            log.error("❌ Failed to get current user ID", e);
            return null;
        }
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
                        .isCompleted(request.getIsCompleted())
                        .build())
                .build();

        return PostSearchResponse.builder()
                .items(items)
                .metadata(metadata)
                .build();
    }

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

    // ========== Post 인덱싱 메서드 ==========

    /**
     * Post 인덱싱 (메인 메서드)
     */
    public void indexPost(Post post) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            PostIndexDocument doc = postProcessorService.preprocess(post);

            String json = objectMapper.writeValueAsString(List.of(doc));
            index.addDocuments(json);

            log.info("✅ Indexed Post: {}", post.getPostId());
        } catch (Exception e) {
            log.error("❌ Failed to index Post: {}", post.getPostId(), e);
            throw new RuntimeException("Failed to index post", e);
        }
    }

    /**
     * 여러 Post 일괄 인덱싱
     */
    public void indexPosts(List<Post> posts) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);

            List<PostIndexDocument> documents = posts.stream()
                    .map(postProcessorService::preprocess)
                    .collect(Collectors.toList());

            String json = objectMapper.writeValueAsString(documents);
            index.addDocuments(json);

            log.info("✅ Indexed {} posts", posts.size());
        } catch (Exception e) {
            log.error("❌ Failed to index posts", e);
            throw new RuntimeException("Failed to index posts", e);
        }
    }

    /**
     * Post 삭제
     */
    public void deletePost(String postId) {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            index.deleteDocument(postId);
            log.info("✅ Deleted post: {}", postId);
        } catch (Exception e) {
            log.error("❌ Failed to delete post: {}", postId, e);
            throw new RuntimeException("Failed to delete post", e);
        }
    }

    /**
     * 인덱스 통계 조회
     */
    public Object getIndexStats() {
        try {
            Index index = meilisearchClient.index(INDEX_NAME);
            return index.getStats();
        } catch (Exception e) {
            log.error("Failed to get index stats", e);
            throw new RuntimeException("Failed to get index stats", e);
        }
    }

    /**
     * 모든 문서 삭제
     */
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