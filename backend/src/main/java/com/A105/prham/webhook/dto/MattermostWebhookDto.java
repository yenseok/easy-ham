package com.A105.prham.webhook.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MattermostWebhookDto {
	private String token;

	@JsonProperty("team_id")
	private String teamId;

	@JsonProperty("team_domain")
	private String teamDomain;

	@JsonProperty("channel_id")
	private String channelId;

	@JsonProperty("channel_name")
	private String channelName;

	private String timestamp;

	@JsonProperty("user_id")
	private String userId;

	@JsonProperty("user_name")
	private String userName;

	@JsonProperty("post_id")
	private String postId;

	private String text;

	@JsonProperty("trigger_word")
	private String triggerWord;

	@JsonProperty("file_ids")
	private String fileIds;
}