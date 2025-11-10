package com.A105.prham.user_notice_like.repository;

import com.A105.prham.notice.entity.Notice;
import com.A105.prham.user.entity.User;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.user_notice_like.entity.UserNoticeLike;
import com.A105.prham.webhook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserNoticeLikeRepository extends JpaRepository<UserNoticeLike, Long> {
    boolean existsByUserAndPost(User user, Post post);

    UserNoticeLike findByUserAndPost(User user, Post post);

    List<UserNoticeLike> findByUser(User user);
}
