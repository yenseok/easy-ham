package com.A105.prham.bot.dto;

public interface NotificationTargetDto {
    Long getPostId();
    String getMattermostPostId();
    String getTitle();
    String getDeadline();
    String getChannelName();
    String getLink();
    Long getUserId();
    String getUserName();
    String getEmail();
    Integer getDeadlineAlertHours();
}