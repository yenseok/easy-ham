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
                    list.add(f);
                }
            }
            log.info("Parsed {} file(s) from Mattermost", list.size());
        } catch (Exception e) {
            log.error("Failed to parse Mattermost JSON: {}", e.getMessage(), e);
        }
        return list;
    }
}
