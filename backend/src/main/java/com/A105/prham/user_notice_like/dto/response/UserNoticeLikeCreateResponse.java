package com.A105.prham.user_notice_like.dto.response;

import lombok.Builder;

@Builder
public record UserNoticeLikeCreateResponse(
        Long postId,
        Boolean isLiked
) {
}
