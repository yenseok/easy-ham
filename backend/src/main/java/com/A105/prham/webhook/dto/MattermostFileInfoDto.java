package com.A105.prham.webhook.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MattermostFileInfoDto {
	// 우리가 필요한 핵심 정보
	private String id;
	private String name; // 예: "image.png"
	@JsonProperty("mime_type")
	private String mimeType; // 예: "image/png"
	private long size;
}