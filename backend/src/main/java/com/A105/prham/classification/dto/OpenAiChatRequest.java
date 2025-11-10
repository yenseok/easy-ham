package com.A105.prham.classification.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OpenAiChatRequest {
	private String model;
	private List<ChatMessage> messages;
	@JsonProperty("response_format")
	private ResponseFormat responseFormat;
}
