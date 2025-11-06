package com.A105.prham.notification_setting.repository;

import com.A105.prham.notification_setting.entity.NotificationSetting;
import com.A105.prham.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting,Long> {
    NotificationSetting findByUser(User user);
}
