package com.A105.prham.post_user_completed.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자별 완료 목록 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCompletionList {
    private Long userId;
    private String userName;
    private Long totalPosts;
    private Long completedPosts;
    private Long pendingPosts;
}