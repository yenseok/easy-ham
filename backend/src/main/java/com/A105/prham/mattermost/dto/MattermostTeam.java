package com.A105.prham.mattermost.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MattermostTeam {

	@Setter
	@JsonProperty("id")
	private String id;

	@Setter
	@JsonProperty("display_name")
	private String displayName;
}
