package com.A105.prham.notification;

import com.A105.prham.notification.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification,String> {
    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);

}
