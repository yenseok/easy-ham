package com.A105.prham.webhook.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProcessedWebhook {
	private String postId;
	private String channelId;
	private String teamId;
	private String userId;
	private String userName;
	private String timestamp;

	private String deadline;

	// 메시지 내용
	private String originalText;
	private String cleanedText;

	// 파일 정보
	private List<String> fileIds = new ArrayList<>();

	// 메타데이터
	private String processedAt;
}