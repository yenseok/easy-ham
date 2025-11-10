package com.A105.prham.webhook.event;

import org.springframework.context.ApplicationEvent;

// 비동기 프로세서에 전달할 이벤트 객체
public class PostReceivedEvent extends ApplicationEvent {

	private final Long postId; // DB에 저장된 Message의 PK

	public PostReceivedEvent(Object source, Long messageId) {
		super(source);
		this.postId = messageId;
	}

	public Long getMessageId() {
		return postId;
	}
}