package com.A105.prham.webhook.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
public class EmojiRemoveService {

	// Mattermost 이모지 패턴 - 백슬래시 이스케이프 처리 포함
	private static final Pattern EMOJI_PATTERN = Pattern.compile(":[a-zA-Z0-9_+\\\\-]+:");

	// 멘션 패턴
	private static final Pattern MENTION_PATTERN = Pattern.compile("@(all|here|channel|everyone)\\b");

	public String removeEmojis(String text) {
		if (text == null || text.isEmpty()) {
			return text;
		}

		log.info("원본 텍스트 (첫 300자): {}", text.substring(0, Math.min(300, text.length())));

		// 1. 멘션 제거 (@all, @here 등)
		String cleaned = MENTION_PATTERN.matcher(text).replaceAll("");

		// 2. Mattermost :emoji_name: 형태 제거 (백슬래시 포함)
		String beforeEmoji = cleaned;
		cleaned = EMOJI_PATTERN.matcher(cleaned).replaceAll("");

		if (!beforeEmoji.equals(cleaned)) {
			log.info("Mattermost 이모지 제거됨");
		}
		log.info("Mattermost 이모지 제거 후 (첫 300자): {}", cleaned.substring(0, Math.min(300, cleaned.length())));

		// 유니코드 이모지는 LLM이 처리하도록 그대로 유지

		// 3. 마크다운 이스케이프 문자 정리 (\*, \[, \] 등)
		cleaned = cleaned.replaceAll("\\\\([*\\[\\]_#])", "$1");

		// 4. 줄바꿈은 유지하되, 같은 줄 내의 연속된 공백만 하나로 정리
		cleaned = cleaned.replaceAll("[ \\t]+", " ");

		// 5. 줄 시작/끝 공백 제거 (각 줄별로)
		cleaned = cleaned.replaceAll("(?m)^[ \\t]+|[ \\t]+$", "");

		// 6. 시작 부분의 빈 줄 제거
		cleaned = cleaned.replaceAll("^\\s+", "");

		log.info("최종 정리 후 (첫 300자): {}", cleaned.substring(0, Math.min(300, cleaned.length())));

		return cleaned;
	}
}