package com.A105.prham.messages.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProcessedMessage {

    private String postId;
    private String channelId;
    private String userId;
    private Long timestamp;  // Long 타입 (밀리초 타임스탬프)

    // 메시지 내용
    private String originalText;    // 원본 텍스트
    private String cleanedText;     // 이모지 제거된 텍스트

    // 파싱된 정보
    private String deadline;  // 파싱된 마감일

    // 카테고리 정보
    private Long mainCategory;      // 메인 카테고리
    private Long subCategory;       // 서브 카테고리

    // 파일 정보
    private List<FileInfo> files;   // 첨부 파일 메타데이터 리스트

    // 메타데이터
    private String processedAt;
}