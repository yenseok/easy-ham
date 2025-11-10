package com.A105.prham.sse.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.A105.prham.webhook.entity.Post;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SsePostService {

	// key: emitterId (userId + UUID)
	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	// key: emitterId, Value: 해당 emitter가 구독할 mm 채널 id 목록
	private final Map<String, List<String>> emitterChannelMap = new ConcurrentHashMap<>();

	private final Long TIME_OUT = 60L * 60 * 1000 * 2; //2시간

	// 새 공지사항 스트림 구독 시작
	public SseEmitter subscribe(String userId, List<String> allowedChannels) {
		SseEmitter emitter = new SseEmitter(TIME_OUT);
		String emitterId = userId + "_" + System.currentTimeMillis();

		this.emitters.put(emitterId, emitter);
		this.emitterChannelMap.put(emitterId, allowedChannels);

		emitter.onCompletion(() -> {
			this.emitters.remove(emitterId);
			this.emitterChannelMap.remove(emitterId);
			log.info("sse 연결 끊김: {}", emitterId);
		});
		emitter.onTimeout(() -> emitter.complete());

		// 503 오류 방지용 더미 데이터
		try {
			emitter.send(SseEmitter.event().name("connected").data("stream connected"));
		} catch (Exception e) {
			log.warn("dummy data do bo nae gi shil pae", e);
		}
		return emitter;
	}

	// AsyncPostProcessor가 호출할 메서드
	public void sendNewPost(Post post) {
		String targetChannelId = post.getChannelId();
		//postnotificationdto 추가

		emitterChannelMap.forEach((emitterId, allowedChannels) -> {
			if (allowedChannels.contains(targetChannelId)) {

				SseEmitter emitter = emitters.get(emitterId);

				if (emitter != null) {
					try {
						//newPost 이벤트로 공지 데이터 전송
						emitter.send(SseEmitter.event().name("newPost").data(post)); // DTO 전송
					} catch (Exception e) {
						log.warn("sse로 공지사항 전송 실패 {}: {}", emitterId, e.getMessage());
					}
				}
			}
		});
	}
}
