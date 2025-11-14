package com.A105.prham.notification.dto.response;

import lombok.Builder;
import org.bson.Document;
import java.time.LocalDateTime;

@Builder
public record NotificationDto (
        String id,

        String eventType,

        Document eventData,//Document 타입 - 자유형 데이터

        LocalDateTime createdAt,

        Boolean isRead
){
}
