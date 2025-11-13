package com.A105.prham.sse.dto;

import java.time.format.DateTimeFormatter;

import com.A105.prham.webhook.entity.Post;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostNotificationDto {
	private Long id;
	private String postId;
	private String channelId;
	private String channelName;
	private String userId;
	private String userName;
	private String title;
	private String content;
	private String mainCategory;
	private String subCategory;
	private String deadline;
	private String campusList;
	private String createdAt;
	private String fileIds;
	private Long webhookTimestamp;

	// 채용 공고 필드 추가
	private Long postiionId;
	private String positionName;
	private String url;
	private String position;

	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	public static PostNotificationDto from(Post post) {

		//url
		String url = null;
		String positionText = post.getCleanedText();

		if (post.getCleanedText() != null && post.getCleanedText().contains("|||URL|||")) {
			String delimiter = "|||URL|||";
			int delimiterIndex = positionText.indexOf(delimiter);

			if (delimiterIndex != -1) {
				positionText = post.getCleanedText().substring(0, delimiterIndex).trim();
				url = post.getCleanedText().substring(delimiterIndex + delimiter.length()).trim();

			}
		}

		//position
		String positionName = null;
		Long positionId = null;

		if (post.getPosition() != null) {
			positionId = post.getPosition().getId();
			positionName = post.getPosition().getPositionName();
		}

		Long webhookTimestamp = null;
		if (post.getWebhookTimestamp() != null) {
			try {
				webhookTimestamp = Long.parseLong(post.getWebhookTimestamp());
			} catch (NumberFormatException e) {

			}
		}

		return PostNotificationDto.builder()
			.id(post.getId())
			.postId(post.getPostId())
			.channelId(post.getChannelId())
			.channelName(post.getChannelName())
			.userId(post.getUserId())
			.userName(post.getUserName())
			.title(post.getTitle())
			.content(post.getCleanedText())
			.mainCategory(post.getMainCategory())
			.subCategory(post.getSubCategory())
			.deadline(post.getDeadline())
			.campusList(post.getCampusList())
			.createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(FORMATTER) : null)
			.webhookTimestamp(webhookTimestamp)
			.fileIds(post.getFileIds())
			.build();
	}
}
