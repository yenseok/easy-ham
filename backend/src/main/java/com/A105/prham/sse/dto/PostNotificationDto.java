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
	private String teamName;
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

	// 채용 공고 전용 필드
	private Long positionId;
	private String positionName;
	private String url;
	private String position;

	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	public static PostNotificationDto from(Post post) {
		String content = post.getCleanedText();
		String url = null;
		String position = null;

		// 채용 공고인 경우에만 URL과 position 분리
		boolean isJobPosting = "취업".equals(post.getMainCategory())
			&& "채용".equals(post.getSubCategory());

		if (isJobPosting && content != null && content.contains("|||URL|||")) {
			String delimiter = "|||URL|||";
			int delimiterIndex = content.indexOf(delimiter);

			if (delimiterIndex != -1) {
				position = content.substring(0, delimiterIndex).trim();
				url = content.substring(delimiterIndex + delimiter.length()).trim();
				content = position; // content에도 position(직무명)만 넣기
			}
		}

		// position 정보
		String positionName = null;
		Long positionId = null;

		if (post.getPosition() != null) {
			positionId = post.getPosition().getId();
			positionName = post.getPosition().getPositionName();
		}

		// webhookTimestamp 파싱
		Long webhookTimestamp = null;
		if (post.getWebhookTimestamp() != null) {
			try {
				webhookTimestamp = Long.parseLong(post.getWebhookTimestamp());
			} catch (NumberFormatException e) {
				// 무시
			}
		}

		return PostNotificationDto.builder()
			.id(post.getId())
			.postId(post.getPostId())
			.channelId(post.getChannelId())
			.channelName(post.getChannelName())
			.teamName(post.getTeamName())
			.userId(post.getUserId())
			.userName(post.getUserName())
			.title(post.getTitle())
			.content(content)
			.mainCategory(post.getMainCategory())
			.subCategory(post.getSubCategory())
			.deadline(post.getDeadline())
			.campusList(post.getCampusList())
			.createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(FORMATTER) : null)
			.webhookTimestamp(webhookTimestamp)
			.fileIds(post.getFileIds())
			.positionId(isJobPosting ? positionId : null)
			.positionName(isJobPosting ? positionName : null)
			.url(isJobPosting ? url : null)
			.position(isJobPosting ? position : null)
			.build();
	}
}