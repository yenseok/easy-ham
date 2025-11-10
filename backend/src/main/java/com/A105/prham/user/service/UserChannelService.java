package com.A105.prham.user.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.A105.prham.mattermost.dto.MattermostChannel;
import com.A105.prham.mattermost.dto.MattermostTeam;
import com.A105.prham.mattermost.service.MattermostAdminService;
import com.A105.prham.user.dto.response.UserChannelInfoResponseDto;
import com.A105.prham.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserChannelService {

	private final MattermostAdminService mattermostService;

	private static final String GLOBAL_TEAM_NAME = "13기 공지 전용";
	private static final List<String> GLOBAL_CHANNEL_NAMES = List.of(
		"1. 공지사항", "5. [취업] 공지사항", "6. [취업] 취업정보"
	);
	private static final String CLASS_CHANNEL_NAME = "공지사항";

	/**
	 * 사용자가 구독 가능한 채널 ID 목록만 반환 (SSE용)
	 */
	public List<String> getUserAllowedChannelIds(User user) {
		log.info("사용자 {}의 구독 가능 채널 ID 조회", user.getId());

		if (!isValidUser(user)) {
			log.warn("사용자 정보 불완전: userId={}", user.getId());
			return List.of();
		}

		String mmUserId = mattermostService.getUserIdByEmail(user.getEmail());
		if (mmUserId == null) {
			log.warn("Mattermost 유저 찾을 수 없음: email={}", user.getEmail());  // 오타 수정
			return List.of();
		}

		List<String> allowedChannelIds = new ArrayList<>();

		String generationPrefix = user.getGeneration() + "기";
		String campusInfix = user.getCampus().getName();
		String classSuffix = user.getClassroom() + "반";

		List<MattermostTeam> allTeams = mattermostService.getTeamsByUserId(mmUserId);
		log.info("조회된 팀 개수: {}", allTeams != null ? allTeams.size() : 0);

		if (allTeams == null || allTeams.isEmpty()) {
			return List.of();
		}

		for (MattermostTeam team : allTeams) {
			String teamName = team.getDisplayName();

			// 전역 공지 팀
			if (teamName.equals(GLOBAL_TEAM_NAME)) {
				List<MattermostChannel> channels =
					mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());

				if (channels != null) {
					allowedChannelIds.addAll(
						channels.stream()
							.filter(c -> GLOBAL_CHANNEL_NAMES.contains(c.getDisplayName()))
							.map(MattermostChannel::getId)
							.collect(Collectors.toList())
					);
				}
			}
			// 현재 반 팀
			else if (teamName.startsWith(generationPrefix) &&
				teamName.contains(campusInfix) &&
				teamName.endsWith(classSuffix)) {  // endsWith로 수정!

				List<MattermostChannel> channels =
					mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());

				if (channels != null) {
					allowedChannelIds.addAll(
						channels.stream()
							.filter(c -> c.getDisplayName().endsWith(CLASS_CHANNEL_NAME))
							.map(MattermostChannel::getId)
							.collect(Collectors.toList())
					);
				}
			}
		}

		log.info("사용자 {}의 구독 가능 채널 ID: {} 개", user.getId(), allowedChannelIds.size());
		return allowedChannelIds;
	}

	/**
	 * 사용자가 구독 가능한 채널 상세 정보 반환 (프론트엔드 UI용)
	 */
	public List<UserChannelInfoResponseDto> getUserAllowedChannels(User user) {
		log.info("사용자 {}의 구독 가능 채널 상세 정보 조회", user.getId());

		if (!isValidUser(user)) {
			log.warn("사용자 정보 불완전: userId={}", user.getId());
			return List.of();
		}

		String mmUserId = mattermostService.getUserIdByEmail(user.getEmail());
		if (mmUserId == null) {
			log.warn("Mattermost 유저 찾을 수 없음: email={}", user.getEmail());
			return List.of();
		}

		List<UserChannelInfoResponseDto> channelInfos = new ArrayList<>();

		String generationPrefix = user.getGeneration() + "기";
		String campusInfix = user.getCampus().getName();
		String classSuffix = user.getClassroom() + "반";

		List<MattermostTeam> allTeams = mattermostService.getTeamsByUserId(mmUserId);
		log.info("조회된 팀 개수: {}", allTeams != null ? allTeams.size() : 0);

		if (allTeams == null || allTeams.isEmpty()) {
			return List.of();
		}

		for (MattermostTeam team : allTeams) {
			String teamName = team.getDisplayName();

			// 전역 공지 팀
			if (teamName.equals(GLOBAL_TEAM_NAME)) {
				List<MattermostChannel> channels =
					mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());

				if (channels != null) {
					channels.stream()
						.filter(c -> GLOBAL_CHANNEL_NAMES.contains(c.getDisplayName()))
						.forEach(c -> channelInfos.add(
							UserChannelInfoResponseDto.builder()
								.channelId(c.getId())
								.channelName(c.getDisplayName())
								.teamId(team.getId())
								.teamName(teamName)
								.type("GLOBAL")
								.build()
						));
				}
			}
			//  현재 반 팀 처리 추가!
			else if (teamName.startsWith(generationPrefix) &&
				teamName.contains(campusInfix) &&
				teamName.endsWith(classSuffix)) {

				List<MattermostChannel> channels =
					mattermostService.getChannelsForUsersInTeam(mmUserId, team.getId());

				if (channels != null) {
					channels.stream()
						.filter(c -> c.getDisplayName().endsWith(CLASS_CHANNEL_NAME))
						.forEach(c -> channelInfos.add(
							UserChannelInfoResponseDto.builder()
								.channelId(c.getId())
								.channelName(c.getDisplayName())
								.teamId(team.getId())
								.teamName(teamName)
								.type("CLASS")
								.build()
						));
				}
			}
		}

		log.info("사용자 {}의 구독 가능 채널: {} 개", user.getId(), channelInfos.size());
		return channelInfos;
	}

	/**
	 * 사용자 정보 유효성 검사
	 */
	private boolean isValidUser(User user) {
		return user.getGeneration() != null &&
			user.getCampus() != null &&
			user.getClassroom() != null;
	}
}