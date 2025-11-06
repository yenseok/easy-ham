package com.A105.prham.notification.dto.request;

import lombok.Builder;

@Builder
public record KeywordCreateRequest(
        String word
) {
}
