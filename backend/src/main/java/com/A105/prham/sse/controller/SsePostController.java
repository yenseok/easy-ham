package com.A105.prham.sse.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.A105.prham.mattermost.dto.MattermostChannel;
import com.A105.prham.mattermost.dto.MattermostTeam;
import com.A105.prham.mattermost.service.MattermostAdminService;
import com.A105.prham.sse.service.SsePostService;
import com.A105.prham.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class SsePostController {

	private final SsePostService ssePostService;
	private final MattermostAdminService mattermostService;

	// 필터링 상수 정의
	private static final String GLOBAL_TEAM_NAME = "13기 공지 전용";
	private static final List<String> GLOBAL_CHANNEL_NAMES = List.of(
		"1. 공지사항", "5. [취업] 공지사항", "6. [취업] 취업정보"
	);

	private static final String CLASS_CHANNEL_NAME = "공지사항";

	@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribePosts(@AuthenticationPrincipal User user) {

		String userEmail = user.getEmail();
		String springUserId = String.valueOf(user.getId());
		log.info("sse 구독 요청: userId={}, email={}", springUserId, userEmail);

		if (user.getGeneration() == null){
			log.warn("user {}의 generation이 null입니다. 빈 SSE를 반환합니다.", springUserId);
			return ssePostService.subscribe(springUserId, List.of());
		}

		if (user.getCampus() == null) {
			log.warn("user {}의 campus가 null입니다.", springUserId);
			return ssePostService.subscribe(springUserId, List.of());
		}

		if (user.getClassroom() == null) {
			log.warn("user {}의 classroom이 null입니다. 빈 sse를 반환합니다.", springUserId);
			return ssePostService.subscribe(springUserId, List.of());
		}

		String mmUserId = mattermostService.getUserIdByEmail(userEmail);

		if (mmUserId == null) {
			log.warn("mm 유저 찾을 수 없음. email: {}", userEmail);
			return ssePostService.subscribe(springUserId, List.of());
		}

		List<String> allowedChannelIds = new ArrayList<>();

		// User DB에서 정보 추출
		String generationPrefix = user.getGeneration() + "기";
		String campusInfix = user.getCampus().getName();
		String classSuffix = user.getClassroom() + "반";

		// 사용자가 속한 팀 목록 (캐시)
		List<MattermostTeam> allTeams = mattermostService.getTeamsByUserId(mmUserId);
		log.info("Step 7: 검색 조건 - {}, {}, {}반", generationPrefix, campusInfix, user.getClassroom());
		log.info("Step 9: 조회된 팀 개수: {}", allTeams != null ? allTeams.size() : "null");

		// 모든 팀 탐색
		for (MattermostTeam team : allTeams) {
			String teamName = team.getDisplayName();

			// 13기 공지 전용
			if (teamName.equals(GLOBAL_TEAM_NAME)) {
				List<MattermostChannel> channels = mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());
				List<String> matchingIds = channels.stream()
					.filter(c -> GLOBAL_CHANNEL_NAMES.contains(c.getDisplayName()))
					.map(MattermostChannel::getId)
					.collect(Collectors.toList());
				allowedChannelIds.addAll(matchingIds);
			}

			// 현재 반 팀
			else if (teamName.startsWith(generationPrefix) &&
					 teamName.contains(campusInfix) &&
					 teamName.endsWith(classSuffix)) {
				log.info("현재 반 팀 찾음: {}", teamName);
				List<MattermostChannel> channels = mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());
				List<String> matchingIds = channels.stream()
					.filter(c -> c.getDisplayName().endsWith(CLASS_CHANNEL_NAME))
					.map(MattermostChannel::getId)
					.collect(Collectors.toList());
				allowedChannelIds.addAll(matchingIds);
			}
		}

		log.info("유저 구독 채널 목록({}개): {}", allowedChannelIds.size(), allowedChannelIds);
		return ssePostService.subscribe(springUserId, allowedChannelIds);

	}
}
