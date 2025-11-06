package com.A105.prham.search.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PostSearchResponse {
    private List<PostSearchItem> items;    // 검색 결과 목록
    private SearchMetadata metadata;       // 검색 메타데이터
}