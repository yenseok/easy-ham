package com.A105.prham.notification.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record KeywordListGetResponse(
        List<KeywordDto> keywordList
) {
}
