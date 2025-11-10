package com.A105.prham.notification.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.keyword.Keyword;
import com.A105.prham.keyword.repository.KeywordRepository;
import com.A105.prham.notification.NotificationRepository;
import com.A105.prham.notification.NotificationType;
import com.A105.prham.notification.dto.request.KeywordCreateRequest;
import com.A105.prham.notification.dto.request.NotificationSettingUpdateRequest;
import com.A105.prham.notification.dto.response.KeywordDto;
import com.A105.prham.notification.dto.response.KeywordListGetResponse;
import com.A105.prham.notification.dto.response.NotificationSettingGetResponse;
import com.A105.prham.notification.entity.Notification;
import com.A105.prham.notification_setting.entity.NotificationSetting;
import com.A105.prham.notification_setting.repository.NotificationSettingRepository;
import com.A105.prham.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {

    private final KeywordRepository keywordRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<String, Notification> eventCache = new ConcurrentHashMap<>();
    private final Long TIME_OUT = 60L * 1000;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void addKeyword(User user, KeywordCreateRequest keywordCreateRequest) {
        if(keywordRepository.existsByUserAndWord(user, keywordCreateRequest.word())) {
            throw new CustomException(ErrorCode.DUPLICATED_KEYWORD);
        }
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
                        .keywordId(keyword.getId())
                        .keyword(keyword.getWord())
                        .build()).toList();
        return KeywordListGetResponse.builder()
                .keywordList(keywordDtoList)
                .build();
    }

    @Transactional
    public void createNotificationSetting(User user){

        // 유효성 검사
        if(notificationSettingRepository.findByUser(user) != null){
            throw new CustomException(ErrorCode.DUPLICATED_NOTIFICATION_SETTING);
        }

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

    public SseEmitter subscribe(User user, String lastEventId) {

        // 고유 생성 아이디 + emitter 저장
        SseEmitter sseEmitter = new SseEmitter(TIME_OUT);
        String emitterId = user.getId() + "_" + UUID.randomUUID().toString();
        emitters.put(emitterId, sseEmitter);

        // 시간 초과 or 비동기 요청 불가 시 해당 아이디의 emitter 삭제
        sseEmitter.onCompletion(() -> emitters.remove(emitterId));
        sseEmitter.onTimeout(() -> emitters.remove(emitterId));

        // 503 오류 방지용 더미 전송
        sentToClient(sseEmitter, emitterId, "test","Event Stream Created. User Id : " + user.getId());

        if(!lastEventId.isEmpty()){
            Map<String, Notification> events = findAllEventCacheByUserId(user.getId().toString());
            events.entrySet().stream()
                    .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
                    .forEach(entry -> {
                        Notification notification = entry.getValue();
                        sentToClient(sseEmitter, entry.getKey(), notification.getEventType() ,entry.getValue());
                    });
        }

        return sseEmitter;
    }

    public void send(User receiver, Document eventData, NotificationType notificationType){
        Notification notification = new Notification(
                null, // MongoDB에서 자동 생성
                receiver.getId(),
                notificationType.name(),
                eventData, // 자유구조 알림 데이터
                LocalDateTime.now(),
                false // isRead
        );
        notificationRepository.save(notification);
        Map<String,SseEmitter> sseEmitters = findAllEmitterByUserId(receiver.getId().toString());
        sseEmitters.forEach((key, emitter) -> {
            eventCache.put(key, notification); // 캐시 저장 (복구용)
            sentToClient(emitter, key, notification.getEventType(), notification.getEventData());
        });
    }

    private void sentToClient(SseEmitter sseEmitter, String emitterId, String eventType, Object data){
        try {
            sseEmitter.send(SseEmitter.event()
                    .id(emitterId)
                    .name(eventType)
                    .data(data));
        } catch (Exception e) {
            emitters.remove(emitterId);
            log.error(e.getMessage(), e);
            throw new CustomException(ErrorCode.SSE_DATA_SEND_ERROR);
        }
    }

    private Map<String, Notification> findAllEventCacheByUserId(String userId){
        return eventCache.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(userId))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private Map<String, SseEmitter> findAllEmitterByUserId(String userId){
        return emitters.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(userId))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
