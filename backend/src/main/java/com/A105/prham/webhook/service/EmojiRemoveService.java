package com.A105.prham.webhook.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
public class EmojiRemoveService {

	// Mattermost 이모지 패턴만 제거 (:emoji_name:)
	private static final Pattern EMOJI_PATTERN = Pattern.compile(":[a-zA-Z0-9_+\\-]+:");

	// 멘션 패턴
	private static final Pattern MENTION_PATTERN = Pattern.compile("@(all|here|channel|everyone)\\b");

	public String removeEmojis(String text) {
		if (text == null || text.isEmpty()) {
			return text;
		}

		// 1. 멘션 제거 (@all, @here 등)
		String cleaned = MENTION_PATTERN.matcher(text).replaceAll("");

		// 2. Mattermost :emoji_name: 형태만 제거
		cleaned = EMOJI_PATTERN.matcher(cleaned).replaceAll("");
		log.info("Mattermost 이모지 제거 후: {}", cleaned.substring(0, Math.min(200, cleaned.length())));

		// 유니코드 이모지는 LLM이 처리하도록 그대로 유지

		// 3. 줄바꿈은 유지하되, 같은 줄 내의 연속된 공백만 하나로 정리
		cleaned = cleaned.replaceAll("[ \\t]+", " ");

		// 4. 줄 시작/끝 공백 제거 (각 줄별로)
		cleaned = cleaned.replaceAll("(?m)^[ \\t]+|[ \\t]+$", "");

		// 5. 시작 부분의 빈 줄 제거
		cleaned = cleaned.replaceAll("^\\s+", "");

		log.info("최종 정리 후: {}", cleaned.substring(0, Math.min(200, cleaned.length())));

		return cleaned;
	}
}