package com.A105.prham.webhook.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MarkdownFormatterService {

	/**
	 * 단일 줄바꿈(\n)을 마크다운 줄바꿈(\n\n)으로 변환
	 * 단, 이미 연속된 줄바꿈은 유지
	 */
	public String formatForMarkdown(String text) {
		if (text == null || text.isEmpty()) {
			return text;
		}

		// 1. 이미 연속된 줄바꿈(\n\n 이상)을 플레이스홀더로 임시 보호
		String result = text.replaceAll("\n\n+", "###MARKDOWN_BREAK###");

		// 2. 남은 단일 줄바꿈(\n)을 마크다운 줄바꿈(\n\n)으로 변환
		result = result.replaceAll("\n", "\n\n");

		// 3. 플레이스홀더를 다시 \n\n으로 복원
		result = result.replaceAll("###MARKDOWN_BREAK###", "\n\n");

		return result;
	}
}