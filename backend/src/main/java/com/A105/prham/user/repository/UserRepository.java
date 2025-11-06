package com.A105.prham.user.repository;

import com.A105.prham.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.campus
        LEFT JOIN FETCH u.userSkills us
        LEFT JOIN FETCH us.skill
        LEFT JOIN FETCH u.userPositions up
        LEFT JOIN FETCH up.position
        WHERE u.email = :email
    """)
    Optional<User> findByEmail(@Param("email") String email);

    @Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.campus
        LEFT JOIN FETCH u.userSkills us
        LEFT JOIN FETCH us.skill
        LEFT JOIN FETCH u.userPositions up
        LEFT JOIN FETCH up.position
        WHERE u.ssoSubId = :ssoSubId
        AND u.exited = false
    """)
    Optional<User> findBySsoSubId(@Param("ssoSubId") String ssoSubId);

    boolean existsByEmailAndExitedFalse(String email);

    boolean existsBySsoSubIdAndExitedFalse(String ssoSubId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE User u
        SET u.exited = true
        WHERE u.ssoSubId = :ssoSubId
    """)
    int setUserUnable(@Param("ssoSubId") String ssoSubId);
}
