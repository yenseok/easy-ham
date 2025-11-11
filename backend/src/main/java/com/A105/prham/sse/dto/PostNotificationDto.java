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

	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	public static PostNotificationDto from(Post post) {
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
			.fileIds(post.getFileIds())
			.build();
	}
}
