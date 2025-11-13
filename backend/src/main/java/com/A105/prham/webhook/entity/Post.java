package com.A105.prham.webhook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.position.entity.Position;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "post_id", nullable = false, unique = true)
	private String postId;

	@Column(name = "channel_id", nullable = false)
	private String channelId;

	@Column(name = "channel_name")
	private String channelName;

	@Column(name = "user_id", nullable = false)
	private String userId;

	@Column(name = "user_name")
	private String userName;

	@Column(name = "webhook_timestamp")
	private String webhookTimestamp;

	@Column(name = "original_text", columnDefinition = "TEXT")
	private String originalText;

	@Column(name = "file_ids")
	private String fileIds;


	// after llm
	@Column(name = "cleaned_text", columnDefinition = "TEXT")
	private String cleanedText;

	@Column(name = "deadline")
	private String deadline;

	@Column(name = "main_category")
	private String mainCategory;

	@Column(name = "sub_category")
	private String subCategory;

	@Column(name = "title", length=500)
	private String title;

	@Column(name = "campus_list")
	private String campusList;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private PostStatus status;

	@Column(name = "processed_at")
	private String processedAt;

	@Column(name = "team_id", nullable = false)
	private String teamId;

	@Column(name = "team_name", nullable = false)
	private String teamName;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "position_id")
	private Position position;

	// 상태 변경
	public void updateStatus(PostStatus newStatus) {
		this.status = newStatus;
	}

	// llm 분류 완료
	public void markAsProcessed() {
		this.status = PostStatus.PROCESSED;
		this.processedAt = LocalDateTime.now().toString();
	}

	// llm 분류 실패
	public void markAsFailed() {
		this.status = PostStatus.FAILED;
		this.processedAt = LocalDateTime.now().toString();
	}

	// cleanedText
	public void updateCleanedText(String cleanedText) {
		this.cleanedText = cleanedText;
	}

	// llm 분류 결과 업데이트
	public void updateClassificationResult(
		String cleanedText,
		String title,
		String mainCategory,
		String subCategory,
		String deadline,
		String campusList
	) {
		this.cleanedText = cleanedText;
		this.title = title;
		this.mainCategory = mainCategory;
		this.subCategory = subCategory;
		this.deadline = deadline;
		this.campusList = campusList;
	}

	// 채용 공고 업데이트
	public void updatePosition(Position position) {
		this.position = position;
	}

}