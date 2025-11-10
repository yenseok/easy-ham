package com.A105.prham.post_user_completed.repository;

import com.A105.prham.post_user_completed.entity.PostUserCompleted;
import com.A105.prham.user.entity.User;
import com.A105.prham.webhook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PostUserCompletedRepository extends JpaRepository<PostUserCompleted, Long> {

    // 특정 사용자와 게시물의 완료 여부 조회
    Optional<PostUserCompleted> findByUserAndPost(User user, Post post);

    // 특정 사용자의 완료한 게시물 목록 조회
    List<PostUserCompleted> findByUserAndIsCompletedTrue(User user);

    // 특정 사용자의 모든 완료 기록 조회
    List<PostUserCompleted> findByUser(User user);

    // userId와 postId로 조회
    @Query("SELECT puc FROM PostUserCompleted puc WHERE puc.user.id = :userId AND puc.post.id = :postId")
    Optional<PostUserCompleted> findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    /**
     * 특정 사용자가 완료한 Post ID 목록 조회
     * - isCompleted = true 인 것만
     * - post가 null이 아닌 것만
     */
    @Query("""
        SELECT puc.post.id FROM PostUserCompleted puc 
        WHERE puc.user.id = :userId
        AND puc.isCompleted = true 
        AND puc.post IS NOT NULL
        """)
    Set<Long> findCompletedPostIdsByUserId(@Param("userId") Long userId);

}