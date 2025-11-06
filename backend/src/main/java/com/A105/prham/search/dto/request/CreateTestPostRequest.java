package com.A105.prham.search.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CreateTestPostRequest {
    // 필수 필드
    private String mmMessageId;
    private String mmChannelId;
    private String userName;
    private String content;

    // 선택 필드 (null이면 기본값 사용)
    private String mmTeamId;        // 기본값: "default_team"
    private String mmUserId;        // 기본값: "test_user"
    private Long mmCreatedAt;       // 기본값: 현재 시간

    private Long mainCategory;
    private Long subCategory;
}