package com.A105.prham.notification_setting.entity;

import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSetting extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deadline_alert_hours", nullable = false)
    private Integer deadlineAlertHours;

    @Column(name = "job_alert_enabled", nullable = false)
    private Boolean jobAlertEnabled;

    @Column(name = "keyword_alert_enabled", nullable = false)
    private Boolean keywordAlertEnabled;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public NotificationSetting(Integer deadlineAlertHours, Boolean jobAlertEnabled, Boolean keywordAlertEnabled, User user) {
        this.deadlineAlertHours = deadlineAlertHours;
        this.jobAlertEnabled = jobAlertEnabled;
        this.keywordAlertEnabled = keywordAlertEnabled;
        this.user = user;
    }

    public void updateNotificationSetting(Integer deadlineAlertHours, Boolean jobAlertEnabled, Boolean keywordAlertEnabled) {
        this.deadlineAlertHours = deadlineAlertHours;
        this.jobAlertEnabled = jobAlertEnabled;
        this.keywordAlertEnabled = keywordAlertEnabled;
    }
}
