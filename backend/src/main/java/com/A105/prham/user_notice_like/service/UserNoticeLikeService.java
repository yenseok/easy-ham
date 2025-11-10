package com.A105.prham.user_notice_like.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.repository.UserRepository;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.user_notice.repository.UserNoticeRepository;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeDto;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeGetResponse;
import com.A105.prham.user_notice_like.entity.UserNoticeLike;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeCreateResponse;
import com.A105.prham.user_notice_like.dto.response.UserNoticeLikeDeleteResponse;
import com.A105.prham.user_notice_like.repository.UserNoticeLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserNoticeLikeService {

    private final UserNoticeLikeRepository userNoticeLikeRepository;
    private final UserRepository userRepository;
    private final UserNoticeRepository userNoticeRepository;

    @Transactional
    public UserNoticeLikeCreateResponse saveBookmarks(Long userId, Long userNoticeId){

        // 유저 유효성 검사
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 공지사항 유효성 검사
        UserNotice userNotice =userNoticeRepository.findById(userNoticeId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));

        // 해당 유저와 게시물에 대한 북마크가 이미 있는 경우 예외 처리
        if(userNoticeLikeRepository.existsByUserAndUserNotice(user, userNotice)){
            throw new CustomException(ErrorCode.DUPLICATED_USER_NOTICE_LIKE);
        }

        // 북마크 객체 생성 후 저장
        UserNoticeLike userNoticeLike = UserNoticeLike.builder()
                .user(user)
                .notice(userNotice.getNotice())
                .team(userNotice.getTeam())
                .channel(userNotice.getChannel())
                .post(userNotice.getPost())
                .userNotice(userNotice)
                .isLiked(true)
                .build();

        userNoticeLikeRepository.save(userNoticeLike);

        //결과 반환
        return UserNoticeLikeCreateResponse.builder()
                .userNoticeId(userNoticeId)
                .isLiked(true)
                .build();
    }

    @Transactional
    public UserNoticeLikeDeleteResponse deleteBookmarks(Long userId, Long userNoticeId){

        // 유저 유효성 검사
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 공지 유효성 검사
        UserNotice userNotice =userNoticeRepository.findById(userNoticeId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTICE_NOT_FOUND));

        // 저장되어 있는 북마크가 맞는지 검사
        if(!userNoticeLikeRepository.existsByUserAndUserNotice(user, userNotice)){
            throw new CustomException(ErrorCode.INVALID_USER_NOTICE_LIKE);
        }

        // 해당 북마크 찾은 후 삭제
        UserNoticeLike userNoticeLike = userNoticeLikeRepository.findByUserAndUserNotice(user,userNotice);
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
                        .noticeId(userNoticeLike.getUserNotice().getId()) //확인 필요
                        .title(userNoticeLike.getNotice().getTitle())
                        .contentPreview(userNoticeLike.getNotice().getContent())
                        .mainCategory(userNoticeLike.getNotice().getMaincode().getMainCodeName())
                        .subCategory(userNoticeLike.getNotice().getSubcode().getSubcodeName())
                        .authorId(userNoticeLike.getNotice().getAuthorId())
                        // .authorName(userNoticeLike.getNotice().getPost().getUserName())
                        .channelName(userNoticeLike.getNotice().getChannel().getChannelName())
                        .createdAt(userNoticeLike.getUserNotice().getCreatedAt().toString())
                        .deadline(userNoticeLike.getNotice().getDeadline())
                        .isLiked(userNoticeLike.getIsLiked())
                        .isCompleted(userNoticeLike.getUserNotice().getIsCompleted())
                        .build()).toList();

        return UserNoticeLikeGetResponse.builder()
                .notices(userNoticeLikeDtoList)
                .build();
    }
}
