package com.A105.prham.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserChannelInfoResponseDto {
	private String channelId;
	private String channelName;
	private String teamId;
	private String teamName;
	private String type;
}
