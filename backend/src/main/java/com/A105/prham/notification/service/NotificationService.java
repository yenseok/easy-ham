package com.A105.prham.notification.service;

import com.A105.prham.common.exception.CustomException;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.keyword.Keyword;
import com.A105.prham.keyword.repository.KeywordRepository;
import com.A105.prham.notification.NotificationRepository;
import com.A105.prham.notification.NotificationType;
import com.A105.prham.notification.dto.request.KeywordCreateRequest;
import com.A105.prham.notification.dto.request.NotificationSettingUpdateRequest;
import com.A105.prham.notification.dto.response.*;
import com.A105.prham.notification.entity.Notification;
import com.A105.prham.notification_setting.entity.NotificationSetting;
import com.A105.prham.notification_setting.repository.NotificationSettingRepository;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.entity.UserPosition;
import com.A105.prham.user.repository.UserRepository;
import com.A105.prham.webhook.entity.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final KeywordRepository keywordRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<String, Notification> eventCache = new ConcurrentHashMap<>();
    private final Long TIME_OUT = 60L * 60L * 1000L * 2L; // 2시간
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TaskScheduler taskScheduler;
    private final ApplicationEventPublisher eventPublisher;

    // ✅ Heartbeat용 스케줄러 추가
    private ScheduledExecutorService heartbeatScheduler;

    @PostConstruct
    public void init() {
        // ✅ 30초마다 모든 연결에 heartbeat 전송
        heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();
        heartbeatScheduler.scheduleAtFixedRate(() -> {
            sendHeartbeatToAll();
        }, 30, 30, TimeUnit.SECONDS);
        log.info("✅ 알림 SSE Heartbeat 스케줄러 시작 (30초 간격)");
    }

    @PreDestroy
    public void destroy() {
        if (heartbeatScheduler != null) {
            heartbeatScheduler.shutdown();
            log.info("🛑 알림 SSE Heartbeat 스케줄러 종료");
        }
    }

    // ✅ 모든 연결에 heartbeat 전송
    private void sendHeartbeatToAll() {
        if (emitters.isEmpty()) {
            return;
        }

        log.debug("💓 알림 Heartbeat 전송 - 연결 수: {}", emitters.size());

        List<String> deadEmitters = new ArrayList<>();

        emitters.forEach((emitterId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("ping"));
            } catch (Exception e) {
                log.debug("💔 알림 Heartbeat 실패 (연결 끊김): {}", emitterId);
                deadEmitters.add(emitterId);
            }
        });

        // 죽은 연결 정리
        deadEmitters.forEach(emitterId -> {
            emitters.remove(emitterId);
            eventCache.entrySet().removeIf(entry -> entry.getKey().startsWith(emitterId));
        });

        if (!deadEmitters.isEmpty()) {
            log.info("🧹 죽은 알림 연결 정리: {}개", deadEmitters.size());
        }
    }

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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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

    // ✅ SSE 구독 활성화
    public SseEmitter subscribe(User user, String lastEventId) {
        SseEmitter sseEmitter = new SseEmitter(TIME_OUT);
        String emitterId = user.getId() + "_" + System.currentTimeMillis();
        emitters.put(emitterId, sseEmitter);

        log.info("✅ 알림 SSE 구독 시작 - User ID: {}, emitterId: {}", user.getId(), emitterId);

        // 시간 초과 or 비동기 요청 불가 시 해당 아이디의 emitter 삭제
        sseEmitter.onCompletion(() -> {
            emitters.remove(emitterId);
            log.info("알림 SSE 연결 정상 종료: {}", emitterId);
        });

        sseEmitter.onTimeout(() -> {
            emitters.remove(emitterId);
            log.warn("알림 SSE 연결 타임아웃: {}", emitterId);
            sseEmitter.complete();
        });

        sseEmitter.onError((e) -> {
            emitters.remove(emitterId);
            log.debug("알림 SSE 연결 에러: {}", emitterId);
        });

        // 503 오류 방지용 더미 전송
        try {
            sseEmitter.send(SseEmitter.event()
                .name("connected")
                .data("Notification stream created. userId: " + user.getId()));
        } catch (Exception e) {
            log.warn("알림 SSE 초기 연결 메시지 전송 실패: {}", emitterId, e);
            emitters.remove(emitterId);
            throw new RuntimeException("SSE connection failed", e);
        }

        // lastEventId가 있으면 미전송 이벤트 재전송
        if(lastEventId != null && !lastEventId.isEmpty()){
            Map<String, Notification> events = findAllEventCacheByUserId(user.getId().toString());
            events.entrySet().stream()
                .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
                .forEach(entry -> {
                    Notification notification = entry.getValue();
                    try {
                        sseEmitter.send(SseEmitter.event()
                            .id(entry.getKey())
                            .name(notification.getEventType())
                            .data(notification.getEventData()));
                    } catch (Exception e) {
                        log.error("알림 SSE 캐시 이벤트 전송 실패: {}", e.getMessage());
                    }
                });
        }

        return sseEmitter;
    }

    // ✅ 핵심 send 메서드 - DB 저장 + SSE 전송
    private void send(User user, Document data, String eventType) {
        try {
            // 1️⃣ MongoDB에 알림 저장
            Notification notification = Notification.builder()
                .userId(user.getId())
                .eventType(eventType)
                .eventData(data)
                .isRead(false)
                .build();

            Notification savedNotification = notificationRepository.save(notification);
            log.info("✅ 알림 DB 저장 완료 - User ID: {}, Type: {}, Notification ID: {}",
                user.getId(), eventType, savedNotification.getId());

            // 2️⃣ SSE로 실시간 전송
            String userId = user.getId().toString();
            emitters.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(userId + "_"))
                .forEach(entry -> {
                    String emitterId = entry.getKey();
                    SseEmitter emitter = entry.getValue();
                    try {
                        emitter.send(SseEmitter.event()
                            .id(savedNotification.getId())
                            .name(eventType)
                            .data(data));
                        log.info("✅ 알림 SSE 전송 성공 - User ID: {}, Type: {}", user.getId(), eventType);
                    } catch (IOException e) {
                        if (e.getMessage() != null && e.getMessage().contains("Broken pipe")) {
                            log.debug("🔌 알림 클라이언트 연결 끊김 (Broken pipe) - emitterId: {}", emitterId);
                        } else {
                            log.warn("⚠️ 알림 SSE 전송 실패 - emitterId: {}: {}", emitterId, e.getMessage());
                        }
                        emitters.remove(emitterId);
                    } catch (Exception e) {
                        log.error("❌ 알림 SSE 예상치 못한 에러 - emitterId: {}: {}", emitterId, e.getMessage(), e);
                        emitters.remove(emitterId);
                    }
                });

            // 3️⃣ 캐시에 저장 (재전송용)
            String cacheKey = userId + "_" + System.currentTimeMillis();
            eventCache.put(cacheKey, savedNotification);

        } catch (Exception e) {
            log.error("❌ 알림 전송 실패 - User ID: {}, Type: {}, Error: {}",
                user.getId(), eventType, e.getMessage(), e);
        }
    }

    private Map<String, Notification> findAllEventCacheByUserId(String userId) {
        return eventCache.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(userId + "_"))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    // 🎯 키워드 매칭 알림
    @Async
    public void sendKeywordMatchingNotification(Post post){
        try {
            if (post == null) {
                log.warn("❌ Post가 null입니다");
                return;
            }

            List<User> usersWithKeywords = fetchUsersWithKeywords();
            log.info("📢 키워드 알림 대상 사용자 수: {}", usersWithKeywords.size());

            int successCount = 0;

            for(User user : usersWithKeywords){
                try {
                    NotificationSetting setting = user.getNotificationSetting();
                    if(setting == null || !setting.getKeywordAlertEnabled()) {
                        log.debug("키워드 알림 비활성화 - User ID: {}", user.getId());
                        continue;
                    }

                    List<String> matchedKeywords = user.getKeywords().stream()
                        .map(Keyword::getWord)
                        .filter(keyword ->
                            (post.getTitle() != null && post.getTitle().contains(keyword)) ||
                                (post.getCleanedText() != null && post.getCleanedText().contains(keyword)))
                        .collect(Collectors.toList());

                    if(!matchedKeywords.isEmpty()){
                        log.info("✅ 키워드 매칭 성공 - User ID: {}, 매칭된 키워드: {}, 제목: {}",
                            user.getId(), matchedKeywords, post.getTitle());

                        Document data = new Document()
                            .append("notice_id", post.getId())
                            .append("title", post.getTitle())
                            .append("match_keyword", matchedKeywords)
                            .append("created_at", LocalDateTime.now());
                        send(user, data, NotificationType.KEYWORD_MATCHING.name().toLowerCase());
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("❌ 개별 사용자 키워드 알림 실패 - User ID: {}, Error: {}",
                        user.getId(), e.getMessage());
                }
            }

            log.info("✅ 키워드 알림 완료 - 성공: {}명 / 전체: {}명", successCount, usersWithKeywords.size());

        } catch (Exception e) {
            log.error("❌ 키워드 알림 전체 실패 - Post ID: {}, Error: {}",
                post != null ? post.getId() : "null", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    protected List<User> fetchUsersWithKeywords() {
        return userRepository.findUsersWithKeywordsFetch();
    }

    // 🎯 데드라인 알림 스케줄링
    public void scheduleDeadlineNotification(Post post){
        try {
            if(post == null || post.getDeadline() == null) {
                log.debug("Deadline이 없는 공지. Post Id: {}", post != null ? post.getId() : "null");
                return;
            }

            List<User> usersWithSettings = fetchUsersWithNotificationSettings();
            log.info("📢 데드라인 알림 대상 사용자 수: {}", usersWithSettings.size());

            String deadline = post.getDeadline();
            LocalDateTime parsedDeadline = LocalDateTime.parse(deadline);

            int successCount = 0;

            for(User user : usersWithSettings){
                try {
                    NotificationSetting setting = user.getNotificationSetting();

                    Integer hoursBefore;
                    if (setting == null) {
                        hoursBefore = 24;
                    } else {
                        hoursBefore = setting.getDeadlineAlertHours();
                    }

                    LocalDateTime notificationTime = parsedDeadline.minusHours(hoursBefore);

                    if(notificationTime.isBefore(LocalDateTime.now())) {
                        log.debug("알림 시간이 이미 지났습니다. User: {}, Post: {}", user.getId(), post.getId());
                        continue;
                    }

                    Instant instant = notificationTime.atZone(ZoneId.systemDefault()).toInstant();
                    taskScheduler.schedule(() -> sendDeadlineNotification(user, post, hoursBefore), instant);
                    log.info("✅ 알림 예약 완료. Post Id: {}, User Id: {}, 예약 시간: {}",
                        post.getId(), user.getId(), instant);
                    successCount++;

                } catch (Exception e) {
                    log.error("❌ 개별 사용자 데드라인 알림 스케줄링 실패 - User ID: {}, Error: {}",
                        user != null ? user.getId() : "unknown", e.getMessage());
                }
            }

            log.info("✅ 데드라인 알림 스케줄링 완료 - 성공: {}명 / 전체: {}명", successCount, usersWithSettings.size());

        } catch (Exception e) {
            log.error("❌ 데드라인 알림 스케줄링 전체 실패 - Post ID: {}, Error: {}",
                post != null ? post.getId() : "null", e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    protected List<User> fetchUsersWithNotificationSettings() {
        return userRepository.findAllWithNotificationSettings();
    }

    private void sendDeadlineNotification(User user, Post post, Integer hoursLeft){
        try {
            Document data = new Document()
                .append("notice_id", post.getId())
                .append("title", post.getTitle())
                .append("deadline", post.getDeadline())
                .append("hours_left", hoursLeft)
                .append("created_at", LocalDateTime.now());
            send(user, data, NotificationType.DEADLINE_APPROACHING.name().toLowerCase());

            log.info("✅ 데드라인 알림 전송 완료 - User ID: {}, Post ID: {}", user.getId(), post.getId());

        } catch (Exception e) {
            log.error("❌ 데드라인 알림 전송 실패 - User ID: {}, Post ID: {}, Error: {}",
                user.getId(), post.getId(), e.getMessage());
        }
    }

    // 🎯 채용 공고 매칭 알림
    @Async
    public void sendJobMatchingNotification(Post post){
        try {
            if (post == null) {
                log.warn("❌ Post가 null입니다");
                return;
            }

            if (post.getPosition() == null) {
                log.debug("Position이 없는 채용 공고. Post Id: {}", post.getId());
                return;
            }

            if (post.getOriginalPostId() == null) {
                log.warn("❌ originalPostId가 null입니다. Post Id: {}", post.getId());
                return;
            }

            List<User> users = userRepository.findUsersWithJobAlertEnabled();
            log.info("📢 채용 공고 알림 대상 사용자 수: {}", users.size());

            String postPositionName = post.getPosition().getPositionName();
            log.info("📋 채용 공고 포지션: {}", postPositionName);

            int successCount = 0;

            for(User user : users){
                try {
                    Set<UserPosition> userPositions = user.getUserPositions();

                    if (userPositions == null || userPositions.isEmpty()) {
                        log.debug("사용자 포지션 없음 - User ID: {}", user.getId());
                        continue;
                    }

                    List<String> matchingPositions = new ArrayList<>();

                    for(UserPosition userPosition : userPositions){
                        if(userPosition.getPosition() != null &&
                            userPosition.getPosition().getPositionName() != null &&
                            userPosition.getPosition().getPositionName().equals(postPositionName)){
                            matchingPositions.add(userPosition.getPosition().getPositionName());
                        }
                    }

                    if(matchingPositions.isEmpty()){
                        log.debug("포지션 매칭 안됨 - User ID: {}", user.getId());
                        continue;
                    }

                    log.info("✅ 채용 공고 매칭 성공 - User ID: {}, 매칭된 포지션: {}, 회사: {}",
                        user.getId(), matchingPositions, post.getTitle());

                    Document data = new Document()
                        .append("notice_id", post.getOriginalPostId())
                        .append("company", post.getTitle())
                        .append("matched_jobs", matchingPositions)
                        .append("deadline", post.getDeadline())
                        .append("created_at", LocalDateTime.now());

                    send(user, data, NotificationType.JOB_RECOMMENDATION.name().toLowerCase());
                    successCount++;

                } catch (Exception e) {
                    log.error("❌ 개별 사용자 채용 알림 실패 - User ID: {}, Error: {}",
                        user.getId(), e.getMessage());
                }
            }

            log.info("✅ 채용 공고 알림 완료 - 성공: {}명 / 전체: {}명", successCount, users.size());

        } catch (Exception e) {
            log.error("❌ 채용 공고 알림 전체 실패 - Post ID: {}, Error: {}",
                post != null ? post.getId() : "null", e.getMessage(), e);
        }
    }

    public NotificationListGetResponse getNotificationList(User user){
        List<Notification> notificationList = notificationRepository.findByUserIdAndIsReadFalse(user.getId(), false);
        List<NotificationDto> notificationDtoList = notificationList.stream()
            .map(notification -> NotificationDto.builder()
                .id(notification.getId())
                .eventType(notification.getEventType())
                .eventData(notification.getEventData())
                .createdAt(notification.getCreatedAt())
                .isRead(notification.getIsRead())
                .build())
            .toList();
        return NotificationListGetResponse.builder()
            .notificationList(notificationDtoList)
            .build();
    }

    public void updateNotificationIsReadStatus(User user, String notificationId){
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if(!notification.getUserId().equals(user.getId())){
            log.error("해당 유저의 공지가 아닙니다, userId: {}, notification.getUserId: {}",
                user.getId(), notification.getUserId());
            throw new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
        notification.updateStatus(true);
        notificationRepository.save(notification);
    }

    public void updateAllNotificationIsReadStatus(User user){
        notificationRepository.updateAllToRead(user.getId());
    }
}