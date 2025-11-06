package com.A105.prham.notification.dto.request;

public record NotificationSettingUpdateRequest(
        Integer deadlineAlertHours,
        Boolean jobAlertEnabled,
        Boolean keywordAlertEnabled
) {
}
