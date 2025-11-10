package com.A105.prham.mattermost.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.A105.prham.mattermost.dto.MattermostChannel;
import com.A105.prham.mattermost.dto.MattermostTeam;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class MattermostAdminService {
	private final RestTemplate restTemplate;

	@Value("${mattermost.api.base-url}")
	private String mattermostApiBaseUrl;

	@Value("${mattermost.api.token}")
	private String mattermostApiToken;

	// 관리자 토큰 헤더 생성
	private HttpEntity<String> createAuthHeader() {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(mattermostApiToken);
		return new HttpEntity<>(headers);
	}

	// 이메일로 mattermost 유저 id 조회
	@Cacheable(value = "mattermostUser", key = "#email", cacheManager = "cacheManager10Min")
	public String getUserIdByEmail(String email) {
		log.info(" mattermost API 호출: getUserIdByEmail");
		try {
			String url = mattermostApiBaseUrl + "/api/v4/users/email/" + email;

			Map<String, Object> user = restTemplate.exchange(
				url, HttpMethod.GET, createAuthHeader(),
				new ParameterizedTypeReference<Map<String, Object>>() {}
			).getBody();

			return (user != null) ? (String) user.get("id") : null;
		} catch (Exception e) {
			log.error("mattermost 유저 아이디 조회 실패, 이메일: {} : {}", email, e);
			return null;
		}
	}

	// 사용자가 속한 팀 목록 조회
	@Cacheable(value = "mattermostTeams", key = "#mmUserId", cacheManager = "cacheManager10Min")
	public List<MattermostTeam> getTeamsByUserId(String mmUserId) {
		log.info("mm api 호출: getTeamsByUserId");
		try{
			String url = mattermostApiBaseUrl + "/api/v4/users/" + mmUserId + "/teams";
			return restTemplate.exchange(
				url, HttpMethod.GET, createAuthHeader(),
				new  ParameterizedTypeReference<List<MattermostTeam>>() {}
			).getBody();
		} catch (Exception e) {
			log.error("mm 팀 목록 조회 실패", mmUserId, e.getMessage());
			return List.of();
		}
	}

	// team에서 사용자 팀 목록 채널 조회
	@Cacheable(value = "mattermostTeamChannels", key = "#mmUserId + ':' + #teamId", cacheManager = "cacheManager10Min")
	public List<MattermostChannel> getChannelsForUsersInTeam(String mmUserId, String teamId) {
		log.info("mm api 호출");
		try {
			String url = mattermostApiBaseUrl + "/api/v4/users/" + mmUserId + "/teams/" + teamId + "/channels";
			return restTemplate.exchange(
				url, HttpMethod.GET, createAuthHeader(),
				new ParameterizedTypeReference<List<MattermostChannel>>() {}
			).getBody();
		} catch (Exception e) {
			log.error("mm 채널 목록 조회 실패, user: {}, team{}", mmUserId, teamId, e.getMessage());
			return List.of();
		}
	}

}
