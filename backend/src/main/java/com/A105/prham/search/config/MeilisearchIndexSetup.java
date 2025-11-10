package com.A105.prham.search.config;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.model.TypoTolerance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class MeilisearchIndexSetup implements ApplicationRunner {

    private final Client meilisearchClient;

    @Override
    public void run(ApplicationArguments args) {
        try {
            try {
                meilisearchClient.createIndex("posts", "postId");
            } catch (Exception e) {
                log.debug("Index already exists, updating settings...");
            }

            Index index = meilisearchClient.index("posts");

            // 1. 필터 가능 속성
            index.updateFilterableAttributesSettings(new String[]{
                    "channelId",      // mmChannelId -> channelId
//                    "mainCategory",
                    "subCategory",
                    "timestamp",       // mmCreatedAt -> timestamp
                    "campusList"
            });

            // 2. 정렬 가능 속성
            index.updateSortableAttributesSettings(new String[]{
                    "timestamp"       // mmCreatedAt -> timestamp
            });

            // 3. 키워드 검색 가능 속성 (우선순위 순서)
            index.updateSearchableAttributesSettings(new String[]{
                    "title",          // 제목 (가장 중요)
                    "cleanedText",    // 본문 내용
                    "userId",         // 작성자
                    "userName",
                    "channelName",    // 채널명
                    "campusList"      // 캠퍼스 정보
            });

            // 4. 랭킹 규칙 (한국어에 최적화)
            index.updateRankingRulesSettings(new String[]{
                    "words",        // 검색어 포함 여부 (가장 중요)
                    "typo",         // 오타 허용
                    "proximity",    // 단어 간 거리
                    "attribute",    // 속성 우선순위
                    "sort",         // 정렬
                    "exactness"     // 정확도
            });

            // 5. 타이포 허용 설정 (한글은 엄격하게)
            TypoTolerance typoTolerance = new TypoTolerance();
            typoTolerance.setEnabled(true);

            // HashMap으로 minWordSizeForTypos 설정
            HashMap<String, Integer> minWordSizeTypos = new HashMap<String, Integer>() {{
                put("oneTypo", 4);   // 4글자 이상만 1개 오타 허용
                put("twoTypos", 9);  // 9글자 이상만 2개 오타 허용
            }};
            typoTolerance.setMinWordSizeForTypos(minWordSizeTypos);

            index.updateTypoToleranceSettings(typoTolerance);

            log.info("✅ Meilisearch index settings configured successfully");


        } catch (Exception e) {
            log.warn("⚠️ Meilisearch unavailable – skipping index setup: {}", e.getMessage());
        }
    }
}