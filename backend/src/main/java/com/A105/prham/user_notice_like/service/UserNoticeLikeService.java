package com.A105.prham.user_notice_like.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.repository.UserRepository;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeDto;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeGetResponse;
import com.A105.prham.user_notice_like.entity.UserNoticeLike;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeCreateResponse;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeDeleteResponse;
import com.A105.prham.user_notice_like.repository.UserNoticeLikeRepository;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserNoticeLikeService {

    private final UserNoticeLikeRepository userNoticeLikeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public UserNoticeLikeCreateResponse saveBookmarks(User user, Long postId){

        // 유저 유효성 검사
        if(user == null) throw new CustomException(ErrorCode.USER_NOT_FOUND);

        // 메시지 유효성 검사
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 해당 유저와 게시물에 대한 북마크가 이미 있는 경우 예외 처리
        if(userNoticeLikeRepository.existsByUserAndPost(user, post)){
            throw new CustomException(ErrorCode.DUPLICATED_USER_NOTICE_LIKE);
        }

        // 북마크 객체 생성 후 저장
        UserNoticeLike userNoticeLike = UserNoticeLike.builder()
                .user(user)
                .post(post)
                .isLiked(true)
                .build();

        userNoticeLikeRepository.save(userNoticeLike);

        //결과 반환
        return UserNoticeLikeCreateResponse.builder()
                .postId(postId)
                .isLiked(true)
                .build();
    }

    @Transactional
    public UserNoticeLikeDeleteResponse deleteBookmarks(User user, Long postId){

        if(user == null) throw new CustomException(ErrorCode.USER_NOT_FOUND);

        // 메시지 유효성 검사
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        // 저장되어 있는 북마크가 맞는지 검사
        if(!userNoticeLikeRepository.existsByUserAndPost(user, post)){
            throw new CustomException(ErrorCode.INVALID_USER_NOTICE_LIKE);
        }

        // 해당 북마크 찾은 후 삭제
        UserNoticeLike userNoticeLike = userNoticeLikeRepository.findByUserAndPost(user,post);
        userNoticeLikeRepository.delete(userNoticeLike);

        return UserNoticeLikeDeleteResponse.builder()
                .isLiked(false)
                .build();
    }

    public UserNoticeLikeGetResponse getBookmarks(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<UserNoticeLike> userNoticeLikes = userNoticeLikeRepository.findByUser(user);

        List<UserNoticeLikeDto> userNoticeLikeDtoList = userNoticeLikes.stream()
                .map(userNoticeLike -> UserNoticeLikeDto.builder()
                        .postId(userNoticeLike.getPost().getId()) //확인 필요
                        .title(userNoticeLike.getPost().getTitle())
                        .contentPreview(userNoticeLike.getPost().getCleanedText())
                        .mainCategory(userNoticeLike.getPost().getMainCategory())
                        .subCategory(userNoticeLike.getPost().getSubCategory())
                        .authorId(userNoticeLike.getPost().getUserId())
                        .authorName(userNoticeLike.getPost().getUserName())
                        .channelName(userNoticeLike.getPost().getChannelName())
                        .createdAt(userNoticeLike.getPost().getCreatedAt().toString())
                        .deadline(userNoticeLike.getPost().getDeadline())
                        .isLiked(userNoticeLike.getIsLiked())
                        .teamName(userNoticeLike.getPost().getTeamName())
                        .build()).toList();

        return UserNoticeLikeGetResponse.builder()
                .notices(userNoticeLikeDtoList)
                .build();
    }
}
