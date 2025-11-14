package com.A105.prham.webhook.service;

import com.A105.prham.classification.dto.JobPostingParseResponseDto;
import com.A105.prham.classification.dto.LlmClassificationResult;
import com.A105.prham.classification.service.JobPostingParseService;
import com.A105.prham.classification.service.LlmClassificationService;
import com.A105.prham.position.entity.Position;
import com.A105.prham.position.repository.PositionRepository;
import com.A105.prham.notification.service.NotificationService;
import com.A105.prham.sse.service.SsePostService;
import com.A105.prham.search.service.SearchService;
import com.A105.prham.webhook.entity.Post;
import com.A105.prham.webhook.entity.PostStatus;
import com.A105.prham.webhook.event.PostReceivedEvent;
import com.A105.prham.webhook.repository.PostRepository;
import com.meilisearch.sdk.Client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncPostProcessor {

	private final PostRepository postRepository;
	private final EmojiRemoveService emojiRemovalService;
	private final LlmClassificationService llmService;
	private final SsePostService ssePostService;
	private final SearchService searchService;
	private final JobPostingParseService jobPostingParseService;
	private final PositionRepository positionRepository;
	private final Client meilisearchClient;
	private final NotificationService notificationService;

	private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	private final MarkdownFormatterService markdownFormatterService;

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
			post.updateStatus(PostStatus.PROCESSING);

			// 3. 텍스트 전처리
			String cleanedText = emojiRemovalService.removeEmojis(post.getOriginalText());
			post.updateCleanedText(cleanedText); //llm 전 원본 메시지 저장

			LlmClassificationResult result = llmService.classify(post);

			if(result == null) {
				throw new RuntimeException("llm 분류 실패");
			}

			//채용 공고인 경우에 한번 더 llm
			if ("취업".equals(result.getMainCategory()) && "정보".equals(result.getSubCategory())) {

				JobPostingParseResponseDto parseResult = jobPostingParseService.parseJobPostings(cleanedText);

				if (parseResult != null && parseResult.getJobPostings() != null && !parseResult.getJobPostings().isEmpty()) {
					List<JobPostingParseResponseDto.SingleJobPosting> jobPostings = parseResult.getJobPostings();

					// 각 채용 공고를 개별 Post로 저장
					for (JobPostingParseResponseDto.SingleJobPosting jobPosting : jobPostings) {
						createIndividualJobPost(post, jobPosting, result);
					}

					post.updateClassificationResult(
						cleanedText,
						result.getTitle(),
						result.getMainCategory(),
						result.getSubCategory(),
						null,
						null
					);
					post.markAsProcessed();
					Post savedOriginalPost = postRepository.save(post);
					searchService.indexPost(savedOriginalPost);
				} else {
					log.warn("채용 공고 파싱 실패 - 원본 그대로 저장");
					saveOriginalPost(post, result, fileProcessingFailed);
				}
			} else {
				//일반 공지사항은 기존 방식 그대로
				saveOriginalPost(post, result, fileProcessingFailed);
			}
		} catch (Exception e) {
			log.error("[비동기] post 처리 실패: {}", postId, e);
			if (post.getStatus() != PostStatus.FAILED) {
				post.markAsFailed();
				postRepository.save(post);
			}
		}
	}

	// 일반 공지사항 저장
	private void saveOriginalPost(Post post, LlmClassificationResult result, boolean fileProcessingFailed) {
		// 마감일 처리
		String adjustedDeadline = null;
		if (result.getDeadline() != null && !result.getDeadline().isBlank()) {
			LocalDateTime deadlineDateTime = parseAndAdjustDeadline(result.getDeadline());
			if (deadlineDateTime != null) {
				adjustedDeadline = deadlineDateTime.format(ISO_FORMATTER);
			}
		}

		//캠퍼스 리스트 처리
		String campusList = null;
		if (result.getCampusList() != null && !result.getCampusList().isEmpty()) {
			campusList = String.join(",", result.getCampusList());
		}

		String markdownText = markdownFormatterService.formatForMarkdown(post.getCleanedText());

		//분류 결과 업데이트
		post.updateClassificationResult(
			markdownText,
			result.getTitle(),
			result.getMainCategory(),
			result.getSubCategory(),
			adjustedDeadline,
			campusList
		);

		// 상태 설정
		if (fileProcessingFailed) {
			post.markAsProcessed();
		} else {
			post.markAsProcessed();
		}

		Post savedPost = postRepository.save(post);

		searchService.indexPost(savedPost);

		//sse 전송
		if (savedPost.getStatus() == PostStatus.PROCESSED) {
			ssePostService.sendNewPost(savedPost);
			notificationService.sendKeywordMatchingNotification(savedPost);
			notificationService.scheduleDeadlineNotification(savedPost);
		}
	}

	// 채용 공고를 개별 post로 생성
	private void createIndividualJobPost(Post originalPost, JobPostingParseResponseDto.SingleJobPosting jobPosting, LlmClassificationResult classificationResult) {

		try {
			// position 매핑
			Position position = findPositionByCategory(jobPosting.getPositionCategory());

			//llm이 db에 없는 직무로 추출하면 일단 무조건 다 전산으로 때려박음
			if (position == null) {
				log.warn("position 매핑 실패: {}, 다 전산으로 때려박는다", jobPosting.getPositionCategory());
				position = findDefaultPosition();
			}

			String uniquePostId = originalPost.getPostId() + "_" + UUID.randomUUID().toString().substring(0,8);

			//제목은 회사명만
			String title = jobPosting.getCompany();

			//내용: 직무명 + url
			String content = jobPosting.getPosition();
			if (jobPosting.getUrl() != null && !jobPosting.getUrl().isEmpty()) {
				content += "\n|||URL|||" + jobPosting.getUrl();
			}

			// 개별 post 생성
			Post individualPost = Post.builder()
				.postId(uniquePostId)
				.channelId(originalPost.getChannelId())
				.channelName(originalPost.getChannelName())
				.userId(originalPost.getUserId())
				.userName(originalPost.getUserName())
				.webhookTimestamp(originalPost.getWebhookTimestamp())
				.teamId(originalPost.getTeamId())
				.teamName(originalPost.getTeamName())
				.fileIds(null)
				.originalText(content)
				.cleanedText(content)
				.title(title)
				.mainCategory(classificationResult.getMainCategory())
				.subCategory("채용")
				.position(position)
				.deadline(parseDeadline(jobPosting.getDeadline()))
				.campusList(classificationResult.getCampusList() != null ?
					String.join(",", classificationResult.getCampusList()) : null)
				.status(PostStatus.PROCESSED)
				.processedAt(LocalDateTime.now().toString())
				.build();

			// 개별 채용 공고로 저장 완료
			Post savedPost = postRepository.save(individualPost);

			// sse 전송
			ssePostService.sendNewPost(savedPost);
			notificationService.sendKeywordMatchingNotification(savedPost);
			notificationService.scheduleDeadlineNotification(savedPost);

		} catch (Exception e) {
			log.error("개별 채용 공고 생성 실패: {}", jobPosting.getCompany(), e);
		}
	}

	// 채용 공고 마감일 파싱 (MM/DD) -> ISO 형식
	private String parseDeadline(String deadline) {
		if (deadline == null || deadline.isEmpty()) {
			return null;
		}

		try {
			String[] parts = deadline.replaceAll("[^0-9/]", "").split("/");
			if (parts.length < 2) {
				return null;
			}

			int month = Integer.parseInt(parts[0]);
			int day = Integer.parseInt(parts[1]);
			int year = LocalDate.now().getYear();

			return LocalDateTime.of(year, month, day, 23, 59, 59).format(ISO_FORMATTER);
		} catch (Exception e) {
			return null;
		}
	}

	private String formatJobPostingText(JobPostingParseResponseDto.SingleJobPosting jobPosting) {
		return String.format("%s / %s / %s\n%s",
			jobPosting.getCompany(),
			jobPosting.getPosition(),
			jobPosting.getDeadline(),
			jobPosting.getUrl() != null ? jobPosting.getUrl() : "");
	}

	private Long findDefaultPositionId() {
		return positionRepository.findByPositionName("전산")
			.map(Position::getId)
			.orElse(null);
	}

	//llm이 추출한 positionCategory로 DB position 찾기
	private Long findPositionIdByCategory(String positionCategory) {
		if (positionCategory == null || positionCategory.isEmpty()) {
			return null;
		}

		Optional<Position> position = positionRepository.findByPositionName(positionCategory);
		return position.map(Position::getId).orElse(null);
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

	// position entyty 반환
	private Position findPositionByCategory(String positionCategory) {
		if (positionCategory == null || positionCategory.isEmpty())	{
			return null;
		}
		return positionRepository.findByPositionName(positionCategory).orElse(null);
	}

	//기본 position entuty 반환
	private Position findDefaultPosition() {
		return positionRepository.findByPositionName("전산").orElse(null);
	}
}