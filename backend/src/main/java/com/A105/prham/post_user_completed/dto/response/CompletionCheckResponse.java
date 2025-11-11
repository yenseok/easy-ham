package com.A105.prham.post_user_completed.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 간단한 완료 체크 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletionCheckResponse {
    private Long userId;
    private Long postId;
    private Boolean isCompleted;
}