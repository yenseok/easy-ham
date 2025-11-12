package com.A105.prham.user_notice_like.repository;

import com.A105.prham.notice.entity.Notice;
import com.A105.prham.user.entity.User;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.user_notice_like.entity.UserNoticeLike;
import com.A105.prham.webhook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface UserNoticeLikeRepository extends JpaRepository<UserNoticeLike, Long> {
    boolean existsByUserAndPost(User user, Post post);

    UserNoticeLike findByUserAndPost(User user, Post post);

    List<UserNoticeLike> findByUser(User user);






    /**
     * 특정 사용자가 좋아요한 Post ID 목록 조회
     * - isLiked = true 인 것만
     * - post가 null이 아닌 것만
     */
    @Query("""
            SELECT unl.post.id FROM UserNoticeLike unl 
            WHERE unl.user.id = :userId
            AND unl.isLiked = true 
            AND unl.post IS NOT NULL
            """)
    Set<Long> findLikedPostIdsByUserId(@Param("userId") Long userId);

    /**
     * 특정 사용자가 특정 게시물을 좋아요 했는지 확인
     */
    @Query("""
            SELECT CASE WHEN COUNT(unl) > 0 THEN true ELSE false END 
            FROM UserNoticeLike unl 
            WHERE unl.user.id = :userId 
            AND unl.post.id = :postId 
            AND unl.isLiked = true
            """)
    boolean existsByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    Set<UserNoticeLike> findByUserIdAndIsLikedTrueAndPostIsNotNull(Long userId);
}
