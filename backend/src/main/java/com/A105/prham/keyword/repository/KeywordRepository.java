package com.A105.prham.keyword.repository;

import com.A105.prham.keyword.Keyword;
import com.A105.prham.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KeywordRepository extends JpaRepository<Keyword, Long> {

    List<Keyword> findByUser(User user);
    boolean existsByUserAndWord(User user, String word);
}
