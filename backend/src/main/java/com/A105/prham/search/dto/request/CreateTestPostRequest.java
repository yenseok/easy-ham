package com.A105.prham.search.dto.request;

import com.A105.prham.webhook.entity.Post;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class CreateTestPostRequest {
    private String postId;
    private String channelId;
    private String channelName;
    private String userId;
    private String originalText;
    private String fileIds;
    private String cleanedText;
    private String deadline;
    private String subCategory;
    private String mainCategory;
    private String title;
    private String campusList;
    private String createdAt;

    public Post convertPost(){
        Post post = new Post();
        post.setPostId(this.postId);
        post.setChannelId(this.channelId);
        post.setChannelName(this.channelName);
        post.setUserId(this.userId);
        post.setOriginalText(this.originalText);
        post.setFileIds(this.fileIds);
        post.setCleanedText(this.cleanedText);
        post.setDeadline(this.deadline);
        post.setSubCategory(this.subCategory);
        post.setTitle(this.title);
        post.setCampusList(this.campusList);
        post.setCreatedAt(this.createdAt);
        post.setWebhookTimestamp(this.createdAt);
        post.setMainCategory(this.mainCategory);
        return post;
    }
}