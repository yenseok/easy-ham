// package com.A105.prham.notification.service;
//
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;
// import java.util.concurrent.CopyOnWriteArrayList;
//
// import org.bson.Document;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
//
// import com.A105.prham.user.entity.User;
//
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
//
// @Service
// @RequiredArgsConstructor
// @Slf4j
// public class NotificationBatchService {
//
// 	private final NotificationService notificationService;
//
// 	//userId별 대기 중인 알림 큐
// 	private final Map<Long, List<PendingNotification>> pendingNotifications = new ConcurrentHashMap<>();
//
// 	//배치 사이즈 제한(한번에 최대 10개)
// 	private static final int MAX_BATCH_SIZE = 10;
//
// 	//알림 추가 (배치 큐에 쌓음)
// 	public void addNotification(User user, Document data, String eventType, boolean isUrgent) {
// 		PendingNotification notification = new PendingNotification(
// 			user, data, eventType, LocalDateTime.now(), isUrgent
// 		);
//
// 		if (isUrgent) {
// 			notificationService.send(user, data, eventType);
// 			return;
// 		}
//
// 		//일반 알림은 큐에 추가
// 		pendingNotifications
// 			.computeIfAbsent(user.getId(), k -> new CopyOnWriteArrayList<>())
// 			.add(notification);
// 	}
//
// 	//2초마다 배치 전송
// 	@Scheduled(fixedRate = 2000)
// 	public void sendBatchNotifications() {
// 		if (pendingNotifications.isEmpty()) {
// 			return;
// 		}
//
// 		int totalSent = 0;
// 		int totalFailed = 0;
//
// 		for (Map.Entry<Long, List<PendingNotification>> entry : pendingNotifications.entrySet()) {
// 			Long userId = entry.getKey();
// 			List<PendingNotification> notifications = entry.getValue();
//
// 			if (notifications.isEmpty()) {
// 				continue;
// 			}
//
// 			try {
// 				//최대 10개씩만 전송
// 				int batchSize = Math.min(notifications.size(), MAX_BATCH_SIZE);
// 				List<PendingNotification> batch = new ArrayList<>(notifications.subList(0, batchSize));
//
// 				//배치 전송
// 				for (PendingNotification notification : batch) {
// 					try {
// 						notificationService.send(notification.user, notification.data, notification.eventType);
// 						totalSent++;
// 					} catch (Exception e) {
// 						totalFailed++;
// 					}
// 				}
//
// 				//전송 완료된 알림 제거
// 				notifications.subList(0, batchSize).clear();
//
// 			} catch (Exception e) {
// 				totalFailed += notifications.size();
// 			}
// 		}
//
// 		//빈 큐 정리
// 		pendingNotifications.entrySet().removeIf(entry -> entry.getValue().isEmpty());
//
// 	}
//
//
// 	private record PendingNotification(
// 		User user,
// 		Document data,
// 		String eventType,
// 		LocalDateTime queuedAt,
// 		boolean isUrgent
// 	){}
// }
