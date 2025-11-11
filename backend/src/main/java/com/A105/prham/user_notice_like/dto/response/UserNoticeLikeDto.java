package com.A105.prham.user_notice_like.dto.response;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record UserNoticeLikeDto(
        Long postId,

        String title,

        String contentPreview,

        String mainCategory,

        String subCategory,

        String authorId,

        String authorName,

        String channelName,

        String createdAt,

        String deadline,

        Boolean isLiked
) {
}
