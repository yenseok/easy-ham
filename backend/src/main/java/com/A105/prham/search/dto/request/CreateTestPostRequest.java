package com.A105.prham.search.dto.request;

import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.entity.PostStatus;

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
    private String userName;
    private String originalText;
    private String fileIds;
    private String cleanedText;
    private String deadline;
    private String subCategory;
    private String mainCategory;
    private String title;
    private String campusList;
    private String teamId;
    private String teamName;
    private Long positionId;

    public Post convertPost() {
        return Post.builder()
            .postId(this.postId != null ? this.postId : "test_" + System.currentTimeMillis())
            .channelId(this.channelId != null ? this.channelId : "test_channel")
            .channelName(this.channelName != null ? this.channelName : "테스트 채널")
            .userId(this.userId != null ? this.userId : "test_user")
            .userName(this.userName != null ? this.userName : "테스트 사용자")
            .originalText(this.originalText)
            .fileIds(this.fileIds)
            .cleanedText(this.cleanedText)
            .deadline(this.deadline)
            .mainCategory(this.mainCategory != null ? this.mainCategory : "학사")
            .subCategory(this.subCategory != null ? this.subCategory : "할일")
            .title(this.title != null ? this.title : "테스트 공지사항")
            .campusList(this.campusList)
            .teamId(this.teamId != null ? this.teamId : "test_team")
            .teamName(this.teamName != null ? this.teamName : "테스트 팀")
            .webhookTimestamp(String.valueOf(System.currentTimeMillis()))
            .positionId(this.positionId)
            .status(PostStatus.PENDING)
            .build();
    }
}