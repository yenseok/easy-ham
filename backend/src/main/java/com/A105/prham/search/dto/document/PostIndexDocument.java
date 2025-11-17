package com.A105.prham.search.dto.document;

import com.A105.prham.messages.dto.FileInfo;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.messages.dto.ProcessedMessage;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 📄 MeiliSearch 인덱스 전용 DTO
 * DB 엔티티(Post) 또는 메시지 객체(ProcessedMessage)에서 변환되어 들어간다.
 */
@Data
@Builder
@Slf4j
public class PostIndexDocument {

    private Long postId;
    private String mmPostId;
    private String channelId;
    private String channelName;
    private String teamName;
    private String userId;
    private String cleanedText;
    private Long timestamp;       // webhookTimestamp → long 변환
//    private Long mainCategory;
    private Long subCategory;
    private String deadline;
    private String processedAt;
    private String title;
    private String campusList;
    private List<FileInfo> files;
    private Integer fileCount;
    private String originalLink;
    private List<String> fileNames;
    // ====== 변환 헬퍼 ======
    public static PostIndexDocument from(Post post, String originalLink) {
        Long ts = parseLong(post.getWebhookTimestamp());
        Long main = parseLong(post.getMainCategory());
        Long sub = parseLong(post.getSubCategory());

        return PostIndexDocument.builder()
                .postId(post.getId())
                .mmPostId(post.getPostId())
                .channelId(post.getChannelId())
                .channelName(post.getChannelName())
                .userId(post.getUserId())
                .cleanedText(post.getCleanedText())
                .timestamp(ts != null ? ts : System.currentTimeMillis())
                .teamName(post.getTeamName())
//                .mainCategory(main)
                .subCategory(sub)
                .deadline(post.getDeadline())
                .processedAt(post.getProcessedAt())
                .title(post.getTitle())
                .campusList(post.getCampusList())
                .originalLink(originalLink)
                .build();
    }

    public static PostIndexDocument from(ProcessedMessage msg, String originalLink) {
        return PostIndexDocument.builder()
                .mmPostId(msg.getPostId())
                .channelId(msg.getChannelId())
                .userId(msg.getUserId())
                .cleanedText(msg.getCleanedText())
                .timestamp(msg.getTimestamp())
//                .mainCategory(msg.getMainCategory())
                .subCategory(msg.getSubCategory())
                .deadline(msg.getDeadline())
                .processedAt(msg.getProcessedAt())
                .files(msg.getFiles())
                .fileCount(msg.getFiles() != null ? msg.getFiles().size() : 0)
                .originalLink(originalLink)
                .build();
    }

    private static Long parseLong(String val) {
        if (val == null) return null;
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public void setFiles(List<FileInfo> files) {
        this.files = files;
        if (files != null && !files.isEmpty()) {
            this.fileNames = files.stream()
                    .map(FileInfo::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .collect(Collectors.toList());
        } else {
            this.fileNames = null;
        }
    }
}
