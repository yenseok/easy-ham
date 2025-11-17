package com.A105.prham.bot.service;

import com.A105.prham.bot.dto.NotificationTargetDto;
import com.A105.prham.bot.entity.DeadlineNotification;
import com.A105.prham.bot.event.AlarmEvent;
import com.A105.prham.bot.repository.DeadlineNotificationRepository;
import com.A105.prham.bot.repository.NotificationQueryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeadlineSchedulerService {


    private final NotificationQueryRepository notificationQueryRepository;
    private final DeadlineNotificationRepository deadlineNotificationRepository;
    private final ApplicationEventPublisher eventPublisher;
    @Scheduled(cron = "0 * * * * *") // 매 1분마다
    @Transactional
    public void checkDeadlines() {
        long startTime = System.currentTimeMillis();

        try {
            List<NotificationTargetDto> targets =
                    notificationQueryRepository.findNotificationTargets();

            log.info("Found {} notification targets", targets.size());

            int successCount = 0;
            int failCount = 0;

            for (NotificationTargetDto target : targets) {
                try {

                    String message = String.format("# [%s]:ttabong_ham:\n### %s님! 이 공지사항이 곧 마감이에요! 확인하세요! :running_ham: \n%s"
                            ,target.getTitle()
                            ,target.getUserName()
                            ,target.getLink());
                    AlarmEvent alarmEvent = new AlarmEvent(target.getEmail(), message);
//                    dmService.sendDirectMessageByEmail(botUserId, target.getEmail(), message);
                    eventPublisher.publishEvent(alarmEvent);

                    // 알림 로그 저장
                    saveNotificationLog(target.getPostId(), target.getUserId());
                    successCount++;

                } catch (Exception e) {
                    failCount++;
                    log.error("Failed to send notification to user {} for post {}",
                            target.getUserId(), target.getPostId(), e);
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Deadline check completed: {} success, {} failed in {}ms",
                    successCount, failCount, duration);

            if (duration > 3000) {
                log.warn("⚠️ Deadline check took too long: {}ms", duration);
            }

        } catch (Exception e) {
            log.error("Critical error in deadline scheduler", e);
        }
    }

    private void saveNotificationLog(Long postId, Long userId) {
        deadlineNotificationRepository.save(
                DeadlineNotification.builder()
                        .postId(postId)
                        .userId(userId)
                        .build()
        );
    }
}