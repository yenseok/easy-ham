package com.A105.prham.post_user_completed.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 완료 상태 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletionResponse {
    private Long completedId;
    private Long userId;
    private String userName;
    private Long postId;
    private String postTitle;
    private Boolean isCompleted;
    private String completedAt; // 완료/수정 시각
}