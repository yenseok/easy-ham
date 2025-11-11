package com.A105.prham.sse.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.A105.prham.position.service.PositionService;
import com.A105.prham.sse.dto.PostNotificationDto;
import com.A105.prham.webhook.entity.Post;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SsePostService {

	private final PositionService positionService;

	// key: emitterId (userId + UUID)
	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	// key: emitterId, Value: 해당 emitter가 구독할 mm 채널 id 목록
	private final Map<String, List<String>> emitterChannelMap = new ConcurrentHashMap<>();

	private final Map<String, Set<Long>> emitterPositionIds = new ConcurrentHashMap<>();

	private final Long TIME_OUT = 60L * 60 * 1000 * 2; //2시간

	// 새 공지사항 스트림 구독 시작
	public SseEmitter subscribe(String userId, List<String> allowedChannels, List<Long> userPositionIds) {
		SseEmitter emitter = new SseEmitter(TIME_OUT);
		String emitterId = userId + "_" + System.currentTimeMillis();

		this.emitters.put(emitterId, emitter);
		this.emitterChannelMap.put(emitterId, allowedChannels);

		// positionId 저장
		if (userPositionIds != null && !userPositionIds.isEmpty()) {
			this.emitterPositionIds.put(emitterId, new HashSet<>(userPositionIds));
		}

		emitter.onCompletion(() -> {
			this.emitters.remove(emitterId);
			this.emitterChannelMap.remove(emitterId);
			this.emitterPositionIds.remove(emitterId);
			log.info("sse 연결 정상 종료: {}", emitterId);
		});

		emitter.onTimeout(() -> {
			this.emitters.remove(emitterId);
			this.emitterChannelMap.remove(emitterId);
			this.emitterPositionIds.remove(emitterId);
			emitter.complete();
		});

		emitter.onError(e -> {
			this.emitters.remove(emitterId);
			this.emitterChannelMap.remove(emitterId);
			this.emitterPositionIds.remove(emitterId);
		});

		// 503 오류 방지용 더미 데이터
		try {
			emitter.send(SseEmitter.event().name("connected").data("stream connected"));
		} catch (Exception e) {
			log.warn("dummy data do bo nae gi shil pae", e);
			this.emitters.remove(emitterId);
			this.emitterChannelMap.remove(emitterId);
			this.emitterPositionIds.remove(emitterId);
		}
		return emitter;
	}

	// 새 공지사항을 구독자들에게 전송
	// AsyncPostProcessor가 호출할 메서드
	public void sendNewPost(Post post) {
		String targetChannelId = post.getChannelId();
		String mainCategory = post.getMainCategory();
		String subCategory = post.getSubCategory();

		PostNotificationDto dto = PostNotificationDto.from(post);

		emitterChannelMap.forEach((emitterId, allowedChannels) -> {
			if (allowedChannels.contains(targetChannelId)) {

				SseEmitter emitter = emitters.get(emitterId);

				if (emitter != null) {
					try {
						// 채용 공고인 경우 포지션 매칭 확인
						if ("취업".equals(mainCategory) && "채용".equals(subCategory)) {
							Set<Long> userPositionIds = this.emitterPositionIds.get(emitterId);
							// 사용자가 선호 포지션을 설정했으면 매칭 확인
							if (userPositionIds != null && !userPositionIds.isEmpty()) {
								boolean isMatched = positionService.isMatchingPosition(
									post.getPositionId(),
									userPositionIds
								);

								if (!isMatched) {
									// 매칭 안되면 전송 안함
									return;
								}
							}
							//사용자가 선호 포지션을 설정하지 않았으면 모든 채용 공고 전송
						}
						//newPost 이벤트로 공지 데이터 전송
						emitter.send(SseEmitter.event().name("newPost").data(dto)); // DTO 전송
					} catch (Exception e) {
						log.warn("sse로 공지사항 전송 실패 {}: {}", emitterId, e.getMessage());
						//실패한 emitter는 제거
						emitters.remove(emitterId);
						emitterChannelMap.remove(emitterId);
						emitterPositionIds.remove(emitterId);
					}
				}
			}
		});
	}
}
