package com.A105.prham.webhook.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class DeadlineParserService {

	// 날짜 패턴들
	private static final Pattern DATE_PATTERN_1 = Pattern.compile("(\\d{1,2})/(\\d{1,2})\\([월화수목금토일]\\)\\s*(\\d{1,2})시까지");
	private static final Pattern DATE_PATTERN_2 = Pattern.compile("(\\d{1,2})/(\\d{1,2})\\s*까지");
	private static final Pattern DATE_PATTERN_3 = Pattern.compile("(\\d{1,2})일\\s*까지");

	public LocalDateTime parseDeadline(String text) {
		if (text == null || text.isEmpty()) {
			return null;
		}

		// 패턴 1: "9/29(월) 12시까지"
		Matcher matcher1 = DATE_PATTERN_1.matcher(text);
		if (matcher1.find()) {
			int month = Integer.parseInt(matcher1.group(1));
			int day = Integer.parseInt(matcher1.group(2));
			int hour = Integer.parseInt(matcher1.group(3));

			return createDateTime(month, day, hour, 0);
		}

		// 패턴 2: "9/29까지"
		Matcher matcher2 = DATE_PATTERN_2.matcher(text);
		if (matcher2.find()) {
			int month = Integer.parseInt(matcher2.group(1));
			int day = Integer.parseInt(matcher2.group(2));

			return createDateTime(month, day, 23, 59); // 기본 23:59
		}

		// 패턴 3: "29일까지"
		Matcher matcher3 = DATE_PATTERN_3.matcher(text);
		if (matcher3.find()) {
			int day = Integer.parseInt(matcher3.group(1));
			LocalDate now = LocalDate.now();

			return createDateTime(now.getMonthValue(), day, 23, 59);
		}

		// 상대적 날짜 처리
		if (text.contains("내일")) {
			return LocalDate.now().plusDays(1).atTime(23, 59);
		}

		if (text.contains("오늘")) {
			return LocalDate.now().atTime(23, 59);
		}

		if (text.contains("이번 주")) {
			return getThisWeekFriday().atTime(23, 59);
		}

		log.debug("No date pattern found in: {}", text);
		return null;
	}

	private LocalDateTime createDateTime(int month, int day, int hour, int minute) {
		int currentYear = LocalDate.now().getYear();

		try {
			return LocalDateTime.of(currentYear, month, day, hour, minute);
		} catch (Exception e) {
			log.warn("Invalid date: {}/{}/{} {}:{}", currentYear, month, day, hour, minute);
			return null;
		}
	}

	private LocalDate getThisWeekFriday() {
		LocalDate today = LocalDate.now();
		int dayOfWeek = today.getDayOfWeek().getValue(); // 1=월, 7=일
		int daysToFriday = 5 - dayOfWeek; // 5=금요일

		if (daysToFriday < 0) {
			daysToFriday += 7; // 다음 주 금요일
		}

		return today.plusDays(daysToFriday);
	}
}
