package com.A105.prham.user_notice.repository;

import com.A105.prham.user.entity.User;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.webhook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNoticeRepository extends JpaRepository<UserNotice,Long> {
    UserNotice findByUserAndPost(User user, Post post);

}
