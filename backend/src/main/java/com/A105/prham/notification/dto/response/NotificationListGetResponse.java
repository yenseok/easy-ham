package com.A105.prham.notification.dto.response;

import com.A105.prham.notification.entity.Notification;
import lombok.Builder;

import java.util.List;

@Builder
public record NotificationListGetResponse(
        List<NotificationDto> notificationList
) {
}
