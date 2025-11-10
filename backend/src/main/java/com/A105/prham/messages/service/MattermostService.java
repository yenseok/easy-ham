package com.A105.prham.messages.service;

import com.A105.prham.messages.dto.FileInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class MattermostService {

    @Value("${mattermost.api.url}")
    private String mattermostApiUrl;

    @Value("${mattermost.api.token}")
    private String mattermostApiToken;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Authorization: Bearer <token>, Accept: application/json)
     * 로 요청하여 파일 정보를 가져온다.
     */
    public List<FileInfo> getFileInfosForPost(String postId) {
        String url = mattermostApiUrl + "/api/v4/posts/" + postId + "/files/info";
        log.info("Requesting Mattermost files info: {}", url);

        HttpHeaders headers = new HttpHeaders();
        // Authorization: Bearer <token>
        headers.setBearerAuth(mattermostApiToken);
        // Accept: application/json
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            log.info("Mattermost response status: {}", response.getStatusCodeValue());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return parseFileInfos(response.getBody());
            } else {
                log.warn("Mattermost returned non-OK status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error while calling Mattermost API: {}", e.getMessage(), e);
        }
        return new ArrayList<>();
    }

    private List<FileInfo> parseFileInfos(String json) {
        List<FileInfo> list = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                for (JsonNode node : root) {
                    FileInfo f = new FileInfo();
                    f.setId(node.path("id").asText(null));
                    f.setName(node.path("name").asText(null));
                    f.setExtension(node.path("extension").asText(null));
                    f.setSize(node.path("size").asLong(0));
                    f.setMimeType(node.path("mime_type").asText(null));
                    f.setWidth(node.path("width").asInt(0));
                    f.setHeight(node.path("height").asInt(0));
                    f.setHasPreviewImage(node.path("has_preview_image").asBoolean(false));
                    log.info("{} 포함",f.getName());
                    list.add(f);
                }
            }
            log.info("Parsed {} file(s) from Mattermost", list.size());
        } catch (Exception e) {
            log.error("Failed to parse Mattermost JSON: {}", e.getMessage(), e);
        }
        return list;
    }


    public String getPostLink(String postId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(mattermostApiToken);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            // 1. post_id → channel_id
            String postUrl = mattermostApiUrl + "/api/v4/posts/" + postId;
            ResponseEntity<String> postResponse = restTemplate.exchange(
                    postUrl, HttpMethod.GET, entity, String.class);

            if (!postResponse.getStatusCode().is2xxSuccessful() || postResponse.getBody() == null) {
                log.warn("Failed to get post info: {}", postResponse.getStatusCode());
                return null;
            }

            JsonNode postNode = objectMapper.readTree(postResponse.getBody());
            String channelId = postNode.path("channel_id").asText(null);
            if (channelId == null) {
                log.warn("No channel_id found for post {}", postId);
                return null;
            }

            // 2.️ channel_id → team_id, channel_name
            String channelUrl = mattermostApiUrl + "/api/v4/channels/" + channelId;
            ResponseEntity<String> channelResponse = restTemplate.exchange(
                    channelUrl, HttpMethod.GET, entity, String.class);

            if (!channelResponse.getStatusCode().is2xxSuccessful() || channelResponse.getBody() == null) {
                log.warn("Failed to get channel info: {}", channelResponse.getStatusCode());
                return null;
            }

            JsonNode channelNode = objectMapper.readTree(channelResponse.getBody());
            String teamId = channelNode.path("team_id").asText(null);
//            String channelName = channelNode.path("name").asText(null);

            // 3. team_id → team_name
            String teamUrl = mattermostApiUrl + "/api/v4/teams/" + teamId;
            ResponseEntity<String> teamResponse = restTemplate.exchange(
                    teamUrl, HttpMethod.GET, entity, String.class);

            if (!teamResponse.getStatusCode().is2xxSuccessful() || teamResponse.getBody() == null) {
                log.warn("Failed to get team info: {}", teamResponse.getStatusCode());
                return null;
            }

            JsonNode teamNode = objectMapper.readTree(teamResponse.getBody());
            String teamName = teamNode.path("name").asText(null);

            // 4. 최종 링크 조합
            String link = String.format("%s/%s/pl/%s",
                    mattermostApiUrl, teamName, postId);

            log.info("✅ Generated Mattermost post link: {}", link);
            return link;

        } catch (Exception e) {
            log.error("Error while building Mattermost post link for {}: {}", postId, e.getMessage(), e);
            return null;
        }
    }

    public String getUserNameFromID(String userId) {
        try {
            String url = mattermostApiUrl + "/api/v4/users/" + userId;
            log.info("🔍 Requesting Mattermost user info: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(mattermostApiToken);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("⚠️ Failed to get user info for {}: {}", userId, response.getStatusCode());
                return null;
            }

            JsonNode userNode = objectMapper.readTree(response.getBody());
            String username = userNode.path("username").asText(null);
            String nickname = userNode.path("nickname").asText("");
            String displayName = username != null && !username.isBlank() ? username :
                                nickname!= null && !nickname.isBlank()?nickname : "unknown";

            log.info("✅ Found username for {}: {}", userId, displayName);
            return displayName;

        } catch (Exception e) {
            log.error("❌ Error fetching Mattermost username for {}: {}", userId, e.getMessage(), e);
            return null;
        }
    }

}
