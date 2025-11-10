package com.A105.prham.webhook.service;

// ✨ 필요한 임포트 추가
import com.A105.prham.classification.dto.LlmClassificationResult;
import com.A105.prham.classification.service.LlmClassificationService;
import com.A105.prham.sse.service.SsePostService;
import com.A105.prham.search.service.SearchService;
import com.A105.prham.webhook.entity.File;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.entity.PostStatus;
import com.A105.prham.webhook.event.PostReceivedEvent;
import com.A105.prham.webhook.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils; // ✨ StringUtils 임포트

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays; // ✨ Arrays 임포트
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncPostProcessor {

	private final PostRepository postRepository;
	private final EmojiRemoveService emojiRemovalService;
	private final LlmClassificationService llmService;
	private final SsePostService ssePostService;
	private final SearchService searchService;

	private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	@Async
	@TransactionalEventListener
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void handleMessageReceived(PostReceivedEvent event) {
		Long postId = event.getMessageId();
		log.info("[Async] Processing post ID: {}", postId);

		Post post = postRepository.findById(postId)
			.orElseThrow(() -> new RuntimeException("Post 없음: " + postId));

		//파일 처리 실패 추적 플러그
		boolean fileProcessingFailed = false;

		try {
			// 1. 상태 변경: PROCESSING
			post.setStatus(PostStatus.PROCESSING);

			// 3. 텍스트 전처리
			String cleanedText = emojiRemovalService.removeEmojis(post.getOriginalText());
			post.setCleanedText(cleanedText); //llm 전 원본 메시지 저장

			LlmClassificationResult result = llmService.classify(post);

			if(result == null) {
				throw new RuntimeException("llm 분류 실패");
			}

			// 5. DB에 최종 결과 업데이트
			post.setTitle(result.getTitle());
			post.setMainCategory(result.getMainCategory());
			post.setSubCategory(result.getSubCategory());

			if (result.getDeadline() != null && !result.getDeadline().isBlank()) {
				LocalDateTime adjustedDeadline = parseAndAdjustDeadline(result.getDeadline());
				if (adjustedDeadline != null) {
					post.setDeadline(adjustedDeadline.format(ISO_FORMATTER));
				}
			}

			if (result.getCampusList() != null && !result.getCampusList().isEmpty()) {
				post.setCampusList(String.join(",", result.getCampusList()));
			}

			if(fileProcessingFailed) {
				post.setStatus(PostStatus.FAILED);
				log.warn("[비동기] 파일 에러로 post 처리 실패, post 아이디: {}", postId);
			}else {
				post.setStatus(PostStatus.PROCESSED);
				log.info("[비동기] post 처리 성공, post 아이디: {}", postId );
			}

			post.setProcessedAt(LocalDateTime.now().toString());
			postRepository.save(post);

			//6. meilisearch에 저장
			searchService.indexPost(post);

			Post savedPost = postRepository.save(post);

			// llm에서 분류 완료된 공지사항만 전송
			if (savedPost.getStatus() == PostStatus.PROCESSED) {
								ssePostService.sendNewPost(savedPost);
				log.info("sse: 새 공지사항 전송 완료", savedPost.getPostId());
			}
		} catch (Exception e) {
			log.error("[비동기] post 처리 실패: {}", postId, e);
			if (post.getStatus() != PostStatus.FAILED) {
				post.setStatus(PostStatus.FAILED);
				postRepository.save(post);
			}
		}
	}

	//deadline 문자열을 파싱하고 연도 보정
	private LocalDateTime parseAndAdjustDeadline(String deadlineStr) {
		try {
			LocalDateTime deadline = LocalDateTime.parse(deadlineStr, ISO_FORMATTER);

			int currentYear = LocalDate.now().getYear();
			int deadlineYear = deadline.getYear();

			//deadline이 2023으로 나오면 현재 연도로 변경
			if (deadlineYear == 2023 || deadlineYear < currentYear - 1) {
				return  deadline.withYear(currentYear);
			}
			return deadline;
		} catch (Exception e) {
			return null;
		}
	}
}