package com.A105.prham.bot.repository;

import com.A105.prham.bot.entity.DeadlineNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeadlineNotificationRepository extends JpaRepository<DeadlineNotification, Long> {

    boolean existsByPostIdAndUserId(Long postId, Long userId);
}