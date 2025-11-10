package com.A105.prham.search.dto.response;

import com.A105.prham.messages.dto.FileInfo;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PostSearchItem {
    private Long id;                        // Post ID
    private String mmMessageId;             // Mattermost 메시지 ID
    private String mmChannelId;             // Mattermost 채널 ID
    private String channelName;
    private String title;
    private String deadline;
    private String campusId;
    private String userName;                // 작성자 이름
    private String content;                 // 원본 내용
    private String highlightedContent;      // 하이라이트된 내용 (검색어 강조)
    private Long mmCreatedAt;               // 작성 시간 (timestamp)
//    private Long mainCategory;              // 메인 카테고리
    private Long subCategory;               // 서브 카테고리
    private List<FileInfo> files;           // 첨부 파일 메타데이터 리스트
    private String originalLink; //원문 링크
}