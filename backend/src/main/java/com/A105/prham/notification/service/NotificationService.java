package com.A105.prham.notification.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.keyword.Keyword;
import com.A105.prham.keyword.repository.KeywordRepository;
import com.A105.prham.notification.dto.request.KeywordCreateRequest;
import com.A105.prham.notification.dto.request.NotificationSettingUpdateRequest;
import com.A105.prham.notification.dto.response.KeywordDto;
import com.A105.prham.notification.dto.response.KeywordListGetResponse;
import com.A105.prham.notification.dto.response.NotificationSettingGetResponse;
import com.A105.prham.notification_setting.entity.NotificationSetting;
import com.A105.prham.notification_setting.repository.NotificationSettingRepository;
import com.A105.prham.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {

    private final KeywordRepository keywordRepository;
    private final NotificationSettingRepository notificationSettingRepository;

    @Transactional
    public void addKeyword(User user, KeywordCreateRequest keywordCreateRequest) {
        Keyword keyword = Keyword.builder()
                .word(keywordCreateRequest.word())
                .user(user)
                .build();
        keywordRepository.save(keyword);
    }

    @Transactional
    public void deleteKeyword(User user, Long keywordId) {
        Keyword keyword = keywordRepository.findById(keywordId)
                .orElseThrow(() -> new CustomException(ErrorCode.KEYWORD_NOT_FOUND));
        keywordRepository.delete(keyword);
    }

    public KeywordListGetResponse getKeywordList(User user) {
        List<Keyword> keywordList = keywordRepository.findByUser(user);
        List<KeywordDto> keywordDtoList = keywordList.stream()
                .map(keyword -> KeywordDto.builder()
                        .keyword(keyword.getWord())
                        .build()).toList();
        return KeywordListGetResponse.builder()
                .keywordList(keywordDtoList)
                .build();
    }

    @Transactional
    public void createNotificationSetting(User user){
        NotificationSetting notificationSetting = NotificationSetting.builder()
                .deadlineAlertHours(6)
                .jobAlertEnabled(true)
                .keywordAlertEnabled(true)
                .user(user)
                .build();
        notificationSettingRepository.save(notificationSetting);
    }

    public NotificationSettingGetResponse getNotificationSetting(User user){
        NotificationSetting notificationSetting = notificationSettingRepository.findByUser(user);
        return NotificationSettingGetResponse.builder()
                .deadlineAlertHours(notificationSetting.getDeadlineAlertHours())
                .jobAlertEnabled(notificationSetting.getJobAlertEnabled())
                .keywordAlertEnabled(notificationSetting.getKeywordAlertEnabled())
                .build();
    }

    @Transactional
    public void updateNotificationSetting(User user, NotificationSettingUpdateRequest notificationSettingUpdateRequest){
        NotificationSetting notificationSetting = notificationSettingRepository.findByUser(user);
        notificationSetting.updateNotificationSetting(
                notificationSettingUpdateRequest.deadlineAlertHours(),
                notificationSettingUpdateRequest.jobAlertEnabled(),
                notificationSettingUpdateRequest.keywordAlertEnabled()
        );
        notificationSettingRepository.save(notificationSetting);
    }
}
