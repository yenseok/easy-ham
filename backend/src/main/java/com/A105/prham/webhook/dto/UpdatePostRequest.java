package com.A105.prham.webhook.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdatePostRequest {
    @JsonProperty("event_type")
    private String eventType; // post_updated 또는 post_deleted

    @JsonProperty("post_id")
    private String postId; // 수정 또는 삭제된 게시물 ID

    @JsonProperty("message")
    private String message; // 수정 후 내용 (삭제 시 빈 문자열)
}