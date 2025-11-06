package com.A105.prham.messages.dto;

import lombok.Data;

@Data
public class FileInfo {
    private String id;              // 파일 ID
    private String name;            // 파일 이름
    private String extension;       // 파일 확장자
    private Long size;              // 파일 크기 (bytes)
    private String mimeType;        // MIME 타입 (image/png, application/pdf 등)
    private Integer width;          // 이미지 너비 (이미지인 경우)
    private Integer height;         // 이미지 높이 (이미지인 경우)
    private Boolean hasPreviewImage; // 미리보기 이미지 존재 여부
}