package com.A105.prham.notification.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;// alias 사용
import org.bson.Document; // BSON Document
import java.time.LocalDateTime;

@org.springframework.data.mongodb.core.mapping.Document(collection = "notifications")
@CompoundIndex(def = "{'userId': 1. 'isRead': 1}", name = "userId_isRead_idx")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class Notification {

    @Id
    private String id;

    private Long userId;

    private String eventType;

    private Document eventData; //Document 타입 - 자유형 데이터

    @CreatedDate //생성 시간 자동 설정
    private LocalDateTime createdAt;

    private Boolean isRead;

    public void updateStatus(Boolean isRead){
        this.isRead = isRead;
    }
}
