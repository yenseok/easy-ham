package com.A105.prham.classification.dto;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenAiChatResponse {
	private List<Choice> choices;

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Choice {
		private ChatMessage message;
	}
}
