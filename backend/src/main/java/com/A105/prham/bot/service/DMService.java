package com.A105.prham.bot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
public class DMService {

    @Value("${mattermost.api.url}")
    private String apiUrl;

    @Value("${mattermost.bot.token}")
    private String botToken;

    @Value("${mattermost.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate;

    public void sendDirectMessageByEmail(String botUserId, String targetEmail, String text) {
        String userId = getUserIdByEmail(targetEmail);

        if (userId == null) {
            log.error("해당 이메일의 Mattermost 유저를 찾을 수 없습니다: {}", targetEmail);
            return;
        }

        sendDirectMessage(botUserId, userId, text);
    }

    public void sendDirectMessage(String botUserId, String targetUserId, String text) {
        String channelId = getOrCreateDirectChannel(botUserId, targetUserId);
        if (channelId != null) {
            postMessage(channelId, text);
        }
    }

    private String getOrCreateDirectChannel(String botUserId, String targetUserId) {
        String url = apiUrl + "/api/v4/channels/direct";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(botToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<String> users = List.of(botUserId, targetUserId);
        HttpEntity<List<String>> entity = new HttpEntity<>(users, headers);

        try {
            ResponseEntity<JsonNode> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);

            log.info("[MM API] POST {} → status={}, body={}",
                    url, response.getStatusCode(), response.getBody());

            return response.getBody().get("id").asText();
        } catch (Exception e) {
            log.error("DM 채널 생성 실패", e);
            return null;
        }
    }

    private void postMessage(String channelId, String message) {
        String url = apiUrl + "/api/v4/posts";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(botToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectNode body = new ObjectMapper().createObjectNode();
        body.put("channel_id", channelId);
        body.put("message", message);

        HttpEntity<JsonNode> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // 🔥 응답 로그
            log.info("[MM API] POST {} → status={}, body={}",
                    url, response.getStatusCode(), response.getBody());

        } catch (Exception e) {
            log.error("DM 메시지 전송 실패", e);
        }
    }

    public String getUserIdByEmail(String email) {
        String url = apiUrl + "/api/v4/users/email/" + email;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<JsonNode> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);

            log.info("[MM API] GET {} → status={}, body={}",
                    url, response.getStatusCode(), response.getBody());

            return response.getBody().get("id").asText();
        } catch (Exception e) {
            log.error("Mattermost 사용자 조회 실패. email={}", email, e);
            return null;
        }
    }


}
