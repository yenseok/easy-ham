package com.A105.prham.webhook.entity;

import com.A105.prham.common.domain.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class File {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "file_id")
	private Long id;

	@Column(name = "mm_file_id", nullable = false, unique = true)
	private String mmFileId;

	// @Column(nullable = false, name = "file_url")
	// private String fileUrl;

	@Column(nullable = false, name = "file_name")
	private String fileName;

	@Column(name = "mime_type")
	private String mimeType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id", nullable = false)
	private Post post;

	@Builder
	public File(String mmFileId, String fileName, String mimeType) {
		this.mmFileId = mmFileId;
		// this.fileUrl = fileUrl;
		this.fileName = fileName;
		this.mimeType = mimeType;
	}

	protected void setPost(Post post) {
		this.post = post;
	}
}
