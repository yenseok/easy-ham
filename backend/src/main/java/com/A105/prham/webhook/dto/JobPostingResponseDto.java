package com.A105.prham.webhook.dto;

import java.time.format.DateTimeFormatter;

import com.A105.prham.webhook.entity.Post;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPostingResponseDto {
	private Long id;
	private String postId;
	private String company; //title (회사명)
	private String position; // content (직무명)
	private String url;
	private Long positionId;
	private String positionName;
	private String deadline;
	private String channelName;
	private String createdAt;

	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	public static JobPostingResponseDto from(Post post) {
		//url 추출
		String url = null;
		String position = post.getCleanedText();

		if (post.getCleanedText() != null) {
			String cleanedText = post.getCleanedText();
			String delimiter = "|||URL|||";

			// indexOf로 구분자 위치 찾기
			int delimiterIndex = cleanedText.indexOf(delimiter);

			if (delimiterIndex != -1) {
				// 구분자 이전 부분 = position
				position = cleanedText.substring(0, delimiterIndex).trim();

				// 구분자 이후 부분 = url (delimiter.length() = 9)
				url = cleanedText.substring(delimiterIndex + delimiter.length()).trim();
			}
		}
		// 우리 position 정보 가져오기
		String positionName = null;
		Long positionId = null;

		if (post.getPosition() != null) {
			positionId = post.getPosition().getId();
			positionName = post.getPosition().getPositionName();
		}

		return JobPostingResponseDto.builder()
			.id(post.getId())
			.postId(post.getPostId())
			.company(post.getTitle())
			.position(position)
			.url(url)
			.positionId(positionId)
			.positionName(positionName)
			.deadline(post.getDeadline())
			.channelName(post.getChannelName())
			.createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(FORMATTER) : null)
			.build();
	}


}
