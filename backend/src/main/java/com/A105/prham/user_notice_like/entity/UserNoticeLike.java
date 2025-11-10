package com.A105.prham.user_notice_like.entity;

import com.A105.prham.channel.entity.Channel;
import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.notice.entity.Notice;
import com.A105.prham.team.entity.Team;
import com.A105.prham.user.entity.User;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.webhook.entity.Post;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "user_notice_likes")
public class UserNoticeLike extends BaseTimeEntity { //북마크

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_notice_like_id")
    private Long id;

    @JoinColumn(name = "user_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_notice_id")
    private UserNotice userNotice;

    @Column(nullable = false)
    private Boolean isLiked;

    @Builder
    public UserNoticeLike(User user, Post post, UserNotice userNotice, Boolean isLiked) {
        this.user = user;
        this.post = post;
        this.userNotice = userNotice;
        this.isLiked = isLiked;
    }
}
