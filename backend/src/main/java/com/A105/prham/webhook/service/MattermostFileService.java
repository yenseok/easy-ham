package com.A105.prham.webhook.service;

import com.A105.prham.webhook.dto.MattermostFileInfoDto;
import com.A105.prham.webhook.entity.File;
import com.A105.prham.webhook.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class MattermostFileService {

	private final FileRepository fileRepository; // File 엔티티 저장을 위해
	private final RestTemplate restTemplate = new RestTemplate();

	// nohup 명령어에서 주입한 환경 변수를 사용합니다.
	@Value("${mattermost.api.base-url}")
	private String mattermostApiBaseUrl;

	@Value("${mattermost.api.token}")
	private String mattermostApiToken;

	// 파일을 저장할 EC2 내부 경로 (S3를 사용하기 전 임시 경로)
	private final String localFileStoragePath = "C:\\Users\\SSAFY\\Desktop\\S13P31A105\\backend/files/";
	// 이 메서드가 핵심입니다.
	public File getFileInfoAndCreateEntity(String fileId){
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(mattermostApiToken);
			HttpEntity<String> entity = new HttpEntity<>(headers);

			// 파일 메타데잍 가져오기
			String fileInfoUrl = mattermostApiBaseUrl + "/api/v4/files/" + fileId + "/info";
			MattermostFileInfoDto fileInfo = restTemplate.exchange(
				fileInfoUrl, HttpMethod.GET, entity, MattermostFileInfoDto.class
			).getBody();

			if(fileInfo == null){
				log.error("파일 정보 가져오기 실패 파일 아이디: {}", fileId);
				return null;
			}

			return File.builder()
				.mmFileId(fileId)
				.fileName(fileInfo.getName())
				.mimeType(fileInfo.getMimeType())
				.build();
		} catch (Exception e) {
			log.error("파일 아이디 못가져옴 파일 아이디 {}: {}", fileId, e.getMessage(), e);
			return null;
		}
	}

	public byte[] getFileData(String fileId){
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(mattermostApiToken);
			HttpEntity<String> entity = new HttpEntity<>(headers);

			String fileUrl = mattermostApiBaseUrl + "/api/v4/files/" + fileId;
			ResponseEntity<byte[]> response = restTemplate.exchange(
				fileUrl, HttpMethod.GET, entity, byte[].class
			);

			return response.getBody();
		} catch (Exception e) {
			log.error("파일 다운로드 실패, 파일 아이디: {}", fileId, e);
			return null;
		}
	}
}