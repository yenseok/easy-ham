package com.A105.prham.bot.repository;

import com.A105.prham.bot.dto.NotificationTargetDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationQueryRepository extends JpaRepository<com.A105.prham.user.entity.User, Long> {

    @Query(value = """
        SELECT 
            p.id AS postId,
            p.post_id AS mattermostPostId,
            p.title AS title,
            p.deadline AS deadline,
            p.channel_name AS channelName,
            p.link AS link,
            u.user_id AS userId,
            u.name AS userName,
            u.email AS email,
            ns.deadline_alert_hours AS deadlineAlertHours
        FROM posts p
        CROSS JOIN users u
        INNER JOIN campus c
            ON c.campus_id = u.campus_id
        INNER JOIN notification_settings ns 
            ON ns.user_id = u.user_id
        LEFT JOIN deadline_notifications dn 
            ON dn.post_id = p.id AND dn.user_id = u.user_id
        LEFT JOIN post_user_completed puc 
            ON puc.post_id = p.id AND puc.user_id = u.user_id
        WHERE 
            ns.job_alert_enabled = true
            AND u.exited = false
            AND p.deadline IS NOT NULL
            AND TIMESTAMP(p.deadline) > NOW()
            AND dn.id IS NULL
            AND (puc.is_completed IS NULL OR puc.is_completed = false)
            AND TIMESTAMPDIFF(MINUTE, NOW(), 
                TIMESTAMP(p.deadline) - INTERVAL ns.deadline_alert_hours HOUR) 
                BETWEEN 0 AND 1
            AND (p.campus_list IS NULL OR FIND_IN_SET(c.name, p.campus_list) > 0)
        """, nativeQuery = true)
    List<NotificationTargetDto> findNotificationTargets();
}