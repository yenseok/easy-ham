package com.A105.prham.notification.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;// alias 사용
import org.bson.Document; // BSON Document
import java.time.LocalDateTime;

@org.springframework.data.mongodb.core.mapping.Document(collection = "notifications")
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Notification {

    @Id
    private String id;

    @Indexed
    private Long userId;

    @Indexed
    private String eventType;

    private Document eventData; //Document 타입 - 자유형 데이터

    @Indexed
    @CreatedDate //생성 시간 자동 설정
    private LocalDateTime createdAt;

    @Indexed
    private Boolean isRead;

    public void updateStatus(Boolean isRead){
        this.isRead = isRead;
    }
}
