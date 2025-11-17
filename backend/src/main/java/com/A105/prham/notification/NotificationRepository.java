package com.A105.prham.notification;

import com.A105.prham.notification.entity.Notification;
import org.glassfish.jaxb.runtime.v2.schemagen.xmlschema.NoFixedFacet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification,String> {

    List<Notification> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);

    List<Notification> findByUserIdAndIsReadFalse(Long userId, Boolean isRead);

    @Query("{ 'userId': ?0, 'isRead': false }")
    @Update("{ '$set': { 'isRead': true } }")
    void updateAllToRead(Long userId);
}
