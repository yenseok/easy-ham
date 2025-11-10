package com.A105.prham.webhook.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
public class EmojiRemoveService {

	// 이모지 패턴들
	private static final Pattern EMOJI_PATTERN = Pattern.compile(":[a-zA-Z0-9_+-]+:");
	private static final Pattern UNICODE_EMOJI_PATTERN = Pattern.compile(
		"[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]+|[\\u2600-\\u26FF]|[\\u2700-\\u27BF]"
	);

	// 멘션 패턴
	private static final Pattern MENTION_PATTERN = Pattern.compile("@(all|here|channel|everyone)\\b");

	public String removeEmojis(String text) {
		if (text == null || text.isEmpty()) {
			return text;
		}

		// 1. 멘션 제거 (@all, @here 등)
		String cleaned = MENTION_PATTERN.matcher(text).replaceAll("");

		// 2. :emoji_name: 형태 제거 - cleaned를 사용!
		cleaned = EMOJI_PATTERN.matcher(cleaned).replaceAll("");

		// 3. 유니코드 이모지 제거 - cleaned를 사용!
		cleaned = UNICODE_EMOJI_PATTERN.matcher(cleaned).replaceAll("");

		// 4. 줄바꿈은 유지하되, 같은 줄 내의 연속된 공백만 하나로 정리
		cleaned = cleaned.replaceAll("[ \\t]+", " ");

		// 5. 줄 시작/끝 공백 제거 (각 줄별로)
		cleaned = cleaned.replaceAll("(?m)^[ \\t]+|[ \\t]+$", "");

		// 6. 시작 부분의 빈 줄 제거
		cleaned = cleaned.replaceAll("^\\s+", "");

		return cleaned;
	}
}