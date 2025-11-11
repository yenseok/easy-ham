package com.A105.prham.post_user_completed.entity;

import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.user.entity.User;
import com.A105.prham.webhook.entity.Post;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "post_user_completed",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"}))
public class PostUserCompleted extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "completed_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Builder
    public PostUserCompleted(User user, Post post, Boolean isCompleted) {
        this.user = user;
        this.post = post;
        this.isCompleted = isCompleted != null ? isCompleted : false;
    }

    // 완료 상태 토글
    public void toggleCompleted() {
        this.isCompleted = !this.isCompleted;
    }

    // 완료 상태 설정
    public void setCompleted(Boolean completed) {
        this.isCompleted = completed;
    }
}