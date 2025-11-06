package com.A105.prham.messages.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false, unique = true)
    private String postId;

    @Column(name = "channel_id", nullable = false)
    private String channelId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "timestamp")
    private Long timestamp;

    @Column(name = "original_text", columnDefinition = "TEXT")
    private String originalText;

    @Column(name = "cleaned_text", columnDefinition = "TEXT")
    private String cleanedText;

    @Column(name = "deadline")
    private String deadline;

    @Column(name = "processed_at", nullable = false)
    private String processedAt;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @PrePersist
    protected void onCreate() {
        // String 필드에 LocalDateTime.toString() 저장
        createdAt = LocalDateTime.now().toString();
        if (processedAt == null) {
            processedAt = LocalDateTime.now().toString();
        }
    }
}