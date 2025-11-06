package com.A105.prham.notification.dto.response;

import lombok.Builder;

@Builder
public record NotificationSettingGetResponse(
        Integer deadlineAlertHours,
        Boolean jobAlertEnabled,
        Boolean keywordAlertEnabled
) {
}
