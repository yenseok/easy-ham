package com.A105.prham.user.repository;


import com.A105.prham.position.entity.Position;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.entity.UserPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPositionRepository extends JpaRepository<UserPosition, Long> {

    List<UserPosition> findByUser(User user);

    List<UserPosition> findByPosition(Position position);

    // UserRepository.java

    @Query("SELECT DISTINCT u FROM User u " +
        "LEFT JOIN FETCH u.userPositions up " +
        "LEFT JOIN FETCH up.position " +
        "LEFT JOIN FETCH u.notificationSetting " +
        "WHERE u.notificationSetting.jobAlertEnabled = true")
    List<User> findUsersWithJobAlertEnabled();
}
