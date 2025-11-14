package com.A105.prham.keyword.repository;

import com.A105.prham.keyword.Keyword;
import com.A105.prham.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KeywordRepository extends JpaRepository<Keyword, Long> {

    List<Keyword> findByUser(User user);
    boolean existsByUserAndWord(User user, String word);

    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN FETCH u.keywords " +
            "WHERE SIZE(u.keywords) > 0")
    List<User> findUsersWithKeywordsFetch();
}
