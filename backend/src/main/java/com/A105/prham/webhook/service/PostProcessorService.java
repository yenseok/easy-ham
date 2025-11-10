package com.A105.prham.webhook.service;

import com.A105.prham.common.code.repository.SubcodeRepository;
import com.A105.prham.messages.dto.FileInfo;
import com.A105.prham.messages.service.MattermostService;
import com.A105.prham.search.dto.document.PostIndexDocument;
import com.A105.prham.webhook.entity.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PostProcessorService {

	private final MattermostService mattermostService;
	private final SubcodeRepository subcodeRepository;

	/**
	 *  Post → PostIndexDocument 변환
	 * - webhook DB에서 꺼낸 Post를 MeiliSearch 인덱싱용 DTO로 변환
	 * - fileIds → Mattermost 파일 메타데이터 조회
	 * - String 타입 필드(Long으로 변환)
	 */
	public PostIndexDocument preprocess(Post post) {
		log.info("🧩 Preprocessing Post for indexing: {}", post.getPostId());

		// 1️⃣ timestamp 변환
		Long timestamp = parseLong(post.getWebhookTimestamp());
		if (timestamp == null) {
			timestamp = System.currentTimeMillis();
		}

		// 2️⃣ 카테고리 변환
		Long subCategory = subcodeRepository.findByCodes(post.getMainCategory(),post.getSubCategory());

		// 3️⃣ 파일 ID → 파일 정보 조회
		List<FileInfo> files = fetchFiles(post.getFileIds(), post.getPostId());
		int fileCount = (files != null) ? files.size() : 0;

		// 4️⃣ 원문 링크 생성
		String link = null;
		try {
			link = mattermostService.getPostLink(post.getPostId());
		} catch (Exception e) {
			log.warn("⚠️ Failed to get post link for {}: {}", post.getPostId(), e.getMessage());
		}

		// 5️⃣ DTO 생성
		PostIndexDocument doc = PostIndexDocument.builder()
				.postId(post.getPostId())
				.channelId(post.getChannelId())
				.channelName(post.getChannelName())
				.userId(post.getUserId())
				.cleanedText(post.getCleanedText())
				.timestamp(timestamp)
				.subCategory(subCategory)
				.deadline(post.getDeadline())
				.processedAt(post.getProcessedAt())
				.title(post.getTitle())
				.campusList(post.getCampusList())
				.files(files)
				.fileCount(fileCount)
				.originalLink(link)
				.build();

		log.info("✅ Post processed for indexing: postId={}, fileCount={}, timestamp={}",
				post.getPostId(), fileCount, timestamp);

		return doc;
	}

	/**
	 * fileIds 문자열 -> 메타데이터 list
	 */
	private List<FileInfo> fetchFiles(String fileIds, String postId) {
		if (fileIds == null || fileIds.isBlank()) {
			return Collections.emptyList();
		}

		try {
			// 쉼표 기준 분리
			List<String> ids = Arrays.asList(fileIds.split(","));
			log.info("📎 Fetching {} file(s) for post {}", ids.size(), postId);
			return mattermostService.getFileInfosForPost(postId);
		} catch (Exception e) {
			log.warn("⚠️ Failed to fetch file info for post {}: {}", postId, e.getMessage());
			return Collections.emptyList();
		}
	}

	private Long parseLong(String val) {
		if (val == null || val.isBlank()) return null;
		try {
			return Long.parseLong(val);
		} catch (NumberFormatException e) {
			return null;
		}
	}
}
