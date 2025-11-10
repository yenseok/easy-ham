package com.A105.prham.webhook.entity;

public enum PostStatus {
	PENDING,    // 처리 대기 중
	PROCESSING, // 처리 중
	PROCESSED,  // 처리 완료
	FAILED      // 처리 실패
}
