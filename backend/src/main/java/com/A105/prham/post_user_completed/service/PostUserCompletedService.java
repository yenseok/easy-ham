package com.A105.prham.post_user_completed.service;

import com.A105.prham.post_user_completed.dto.response.CompletionCheckResponse;
import com.A105.prham.post_user_completed.dto.response.CompletionResponse;

import com.A105.prham.post_user_completed.entity.PostUserCompleted;
import com.A105.prham.post_user_completed.repository.PostUserCompletedRepository;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.repository.UserRepository;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostUserCompletedService {

    private final PostUserCompletedRepository postUserCompletedRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 공지사항 완료 상태 토글 (완료 <-> 미완료)
     */
    @Transactional
    public CompletionResponse toggleCompletion(User user, Long postId) {
        if(user==null) throw new RuntimeException("사용자 정보를 찾을 수 없습니다");

        Post post = postRepository.findPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다."));

        PostUserCompleted completed = postUserCompletedRepository.findByUserAndPost(user, post)
                .orElseGet(() -> PostUserCompleted.builder()
                        .user(user)
                        .post(post)
                        .isCompleted(false)
                        .build());

        completed.toggleCompleted();
        PostUserCompleted saved = postUserCompletedRepository.save(completed);

        return convertToResponse(saved);
    }


    /**
     * 특정 사용자의 특정 게시물 완료 여부 조회
     */
    public CompletionCheckResponse checkCompletion(User user, Long postId) {
        Boolean isCompleted = postUserCompletedRepository.findByUserIdAndPostId(user.getId(), postId)
                .map(PostUserCompleted::getIsCompleted)
                .orElse(false);

        return CompletionCheckResponse.builder()
                .userId(user.getId())
                .postId(postId)
                .isCompleted(isCompleted)
                .build();
    }

    /**
     * 특정 사용자가 완료한 게시물 목록 조회
     */
    public List<CompletionResponse> getCompletedPostsByUser(User user) {
        return postUserCompletedRepository.findByUserAndIsCompletedTrue(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }




    /**
     * Entity를 Response DTO로 변환
     * BaseTimeEntity 필드: createdAt, updatedAt 사용
     */
    private CompletionResponse convertToResponse(PostUserCompleted completed) {
        String completedAt = null;

        if (completed.getUpdatedAt() != null) {
            completedAt = completed.getUpdatedAt().format(FORMATTER);
        } else if (completed.getCreatedAt() != null) {
            completedAt = completed.getCreatedAt().format(FORMATTER);
        }

        return CompletionResponse.builder()
                .completedId(completed.getId())
                .userId(completed.getUser().getId())
                .userName(completed.getUser().getName())
                .postId(completed.getPost().getId())
                .postTitle(completed.getPost().getTitle())
                .isCompleted(completed.getIsCompleted())
                .completedAt(completedAt)
                .build();
    }
}