package com.A105.prham.webhook.entity;

import com.A105.prham.messages.dto.FileInfo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.A105.prham.common.domain.BaseTimeEntity;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

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

//	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
//	private List<File> files = new ArrayList<>();

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

	@Column(name = "created_at", nullable = false)
	private String createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now().toString();
		if (status == null) {
			status = PostStatus.PENDING; // ✨ 기본 상태는 PENDING
		}
	}

//	public void addFile(File file) {
//		files.add(file);
//		file.setPost(this); // File 엔티티의 setPost 메서드 호출
//	}
}