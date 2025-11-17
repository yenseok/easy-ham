package com.A105.prham.classification.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.A105.prham.campus.service.CampusService;
import com.A105.prham.classification.dto.ChatMessage;
import com.A105.prham.classification.dto.LlmClassificationResult;
import com.A105.prham.classification.dto.OpenAiChatRequest;
import com.A105.prham.classification.dto.OpenAiChatResponse;
import com.A105.prham.classification.dto.ResponseFormat;
import com.A105.prham.common.code.dto.reponse.MaincodeResponseDto;
import com.A105.prham.common.code.dto.reponse.SubcodeResponseDto;
import com.A105.prham.common.code.service.CodeService;
import com.A105.prham.webhook.entity.Post;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LlmClassificationService {
	private final CodeService codeService;
	private final CampusService campusService;
	private final RestTemplate llmRestTemplate;
	private final ObjectMapper objectMapper;

	@Value("${llm.api.key}")
	private String llmApiKey;

	@Value("${llm.api.url}")
	private String llmApiUrl;

	// llmRestTemplate
	public LlmClassificationService(
		CodeService codeService,
		CampusService campusService,
		@Qualifier("llmRestTemplate") RestTemplate llmRestTemplate,
		ObjectMapper objectMapper
	) {
		this.codeService = codeService;
		this.campusService = campusService;
		this.llmRestTemplate = llmRestTemplate;
		this.objectMapper = objectMapper;
	}

	public LlmClassificationResult classify(Post post){
		List<MaincodeResponseDto> mainCodes = codeService.getAllMaincodes();
		String categoryListString = formatCategoriesForPrompt(mainCodes);

		List<String> campusNames = campusService.getAllCampusNames();
		String campusListString = String.join(",", campusNames);

		// 현재 날짜와 연도
		String currentDate = LocalDate.now().toString();
		int currentYear = LocalDate.now().getYear();

		String prompt = createFullPrompt(post, categoryListString, campusListString, currentDate, currentYear);

		OpenAiChatRequest request = OpenAiChatRequest.builder()
			.model("gpt-4o")
			.messages(List.of(new ChatMessage("user", prompt)))
			.responseFormat(new ResponseFormat("json_object"))
			.build();

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(llmApiKey);

		HttpEntity<OpenAiChatRequest> entity = new HttpEntity<>(request, headers);

		try {
			log.info("OpenAi API 호출 시작");

			OpenAiChatResponse response = llmRestTemplate.postForObject(llmApiUrl, entity, OpenAiChatResponse.class);

			if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
				throw new RuntimeException("llm 응답이 비었음");
			}

			String llmResponseJson = response.getChoices().get(0).getMessage().getContent();
			log.info("LLM 응답 json 수신: {}", llmResponseJson);

			return objectMapper.readValue(llmResponseJson, LlmClassificationResult.class);

		} catch (Exception e) {
			log.error("llm 응답 json 파싱 실패: {}", e.getMessage(), e);
			return null;
		}
	}

	private String formatCategoriesForPrompt(List<MaincodeResponseDto> mainCodes) {
		return mainCodes.stream()
			.map(main -> "-" + main.getMainCodeName() + ": " +
				main.getSubcodes().stream()
					.map(SubcodeResponseDto::getSubcodeName)
					.collect(Collectors.joining(", ")))
			.collect(Collectors.joining("\n"));
	}

	private String createFullPrompt(Post post, String categoryListString, String campusListString,
		String currentDate, int currentYear) {
		return """
		당신은 삼성 청년 SW AI 아카데미(SSAFY) 공지사항 분석 AI입니다.
		주어진 [채널명]과 [메시지]를 [분류 규칙]에 따라 분석하여, [출력 형식]에 맞는 JSON 객체만 반환하세요.
		
		**중요**:\s
		1. 원본 메시지의 마크다운 형식과 줄바꿈(\\\\n)을 그대로 유지해야 합니다.
		2. mainCategory와 subCategory는 **반드시** 아래 [카테고리 목록]에서만 선택해야 합니다.
		3. **이모지와 특수문자 처리**:
			- 이모지는 제거하세요.
			- URL, 이메일, 전화번호의 특수문자는 **절대 수정하지 마세요**.
			- 하이픈(-), 언더스코어(_), 점(.), 슬래시(/) 등 URL 구성 문자는 보존하세요.
		
		[현재 날짜]: %s
		[현재 연도]: %d
		[오늘 요일]: %s
		
		[채널명]: %s
		
		[메시지]:
		%s
		
		[카테고리 목록] - 이 목록에 없는 카테고리는 절대 사용하지 마세요:
		%s
		
		[캠퍼스 목록]:
		%s
		
		[분류 규칙]:
		1. **카테고리 제약**: mainCategory는 "학사" 또는 "취업"만 가능하고, subCategory는 "할일", "특강", "정보", "이벤트"만 가능합니다.
		2. 채널 힌트: [채널명]에 "[취업]"이 있으면 '취업'으로, "공지사항"이 있으면 '학사'로 우선 판단합니다 (가중치 70%%).
		3. **필수 vs 선택 액션 구분 (매우 중요)**:
			**필수 액션 (subCategory를 '할일'로 분류)**:
			- 명시적 필수 표현: "제출", "필수", "의무", "반드시", "꼭", "필히"
			- 마감 기한이 있는 액션: "~까지 제출", "~까지 작성", "~까지 참여"
			- 승인/확인 필요: "승인 필요", "확인 요망", "서명 필요"
			- 출석 체크: "출석", "참석 필수", "불참시 불이익"
			- 설문/투표: "설문 작성", "투표 참여" (마감 기한 명시된 경우)
			
			**선택 액션 (원래 카테고리 유지)**:
			- 신청/지원: "신청", "지원", "모집", "참가 희망자"
			- 선택 참여: "희망자", "관심 있는", "원하시는 분"
			- 안내성 표현: "안내", "공유", "알림"
			
			**판단 우선순위**"
			1. "필수", "반드시", "의무" 등 명시적 표현 -> 무조건 '할일'
			2. 마감기한 + 액션 동사 ("~까지 제출") -> '할일'
			3. "신청", "희망자" 등 선택 표현 -> 원래 카테고리
			4. 애매한 경우 채널 맥락 고려
			
		4. **특강 vs 이벤트 판단**:
			- **특강**: "특강", "강연", "강의", "교수님", "세미나", "워크샵", "멘토링", "코칭"
			→ 지식/기술 전달이 주 목적
			- **이벤트**: "간담회", "네트워킹", "교류회", "만남", "소통의 장", "MT", "회식"
			→ 소통/친목/교류가 주 목적
			- 단, "특강 출석 체크" 처럼 필수 액션이 명시되면 '할일'이 우선입니다.
			
		5. **캠퍼스 추출 규칙**:
			  - mainCategory가 "취업"이고 메시지에 특정 캠퍼스가 명시된 경우, [캠퍼스 목록]에서 해당 캠퍼스를 추출합니다.
			  - 캠퍼스 키워드: "서울", "대전", "광주", "구미", "부울경"
			  - 여러 캠퍼스가 언급되면 모두 배열로 추출
			  - "전국", "전체", "모든 캠퍼스", 캠퍼스 언급 없음 → null
			  - 예시:
			    * "부울경캠퍼스 대상" → ["부울경"]
			    * "서울, 대전 교육생" → ["서울", "대전"]
			    * "전 캠퍼스" → null		
		6. **제목 생성 규칙**:
		   - 본문의 핵심 내용을 자연스럽고 명확하게 요약합니다.
		   - 누가, 무엇을, 언제, 어디서 등 5W1H 요소 중 핵심 정보를 포함합니다.
		   - 특수문자(#, *, :emoji:)와 이모지는 제외하지만, 의미 있는 내용은 유지합니다.
		   - 15자 이내의 자연스러운 문장으로 작성합니다.
		   - 예시:
		     * "서울대 문병로 교수님 AI 특강"
		     * "특화PJT 영상 포트폴리오 투표"
		     * "취업 특강 신청 및 출석 체크"
		7. **마감일 추출 규칙 (매우 중요)**: 
		   
		   **절대 날짜 표현**:
		   - "2025-01-15", "1월 15일", "01/15" -> 2025-01-15로 변환
		   - 시간 포함: "1월 15일 18시", "1/15 오후 6시" -> 2025-01-15T18:00:00
		   - 연도 없으면 [현재 연도] %d 사용
		   
		   **상대 날짜 표현 ([현재 날짜] %s 기준)**:
		   - "오늘": 현재 날짜
		   - "내일": 현재 날짜 + 1일
		   - "모레": 현재 날짜 + 2일
		   - "이번 주 금요일": 현재 주의 금요일 날짜 계산
		   - "다음 주 월요일": 다음 주의 월요일 날짜 계산
		   - "이번 달 말": 현재 월의 마지막 날
		   - "다음 달 5일": 다음 월의 5일
		   
		   **시간 표현**:
		   - "오전 9시", "AM 9:00" -> 09:00:00
		   - "오후 6시", "PM 6:00", "18시" -> 18:00:00
		   - "정오", "낮 12시" -> 12:00:00
		   - "자정", "밤 12시" -> 00:00:00
		   - 시간만 있고 날짜 없으면 오늘 날짜 사용
		   
		   **기간 표현**:
		   - "~까지": 종료 날짜만 추출
		   - "~ ~ ~": 종료 날짜 추출
		   - 시작일과 종료일 모두 있으면 종료일 사용
		   
		   **마감 없음**:
		   - 명확한 마감일이 없거나 "상시", "수시", "별도 공지" -> null
		   
		   **예시**:
		   - "오늘 18시까지" -> 2025-11-17T18:00:00
		   - "내일 정오" -> 2025-11-18T12:00:00
		   - "이번 주 금요일" -> 2025-11-21T23:59:59 (금요일 계산)
		   - "12/25 오후 3시" -> 2025-12-25T15:00:00
		   - "다음 주 월요일 오전 9시" -> 2025-11-24T09:00:00
		
		[출력 형식 (JSON)]
		{
			"title": "string (20-30자 정도의 본문 요약)",
			"mainCategory": "학사" | "취업",
			"subCategory": "할일" | "특강" | "정보" | "이벤트",
			"deadline": "YYYY-MM-DDTHH:MM:SS" | null,
			"campusList": ["string"] | null
		}
		
		**최종 체크리스트**:
		1. 필수 액션 키워드 ("제출", "필수", "~까지") 확인 -> '할일'
		2. 상대 날짜 표현("오늘", "내일") -> 절대 날짜로 변환
		3. 시간 표현 정규화 ("오후 6시" -> "18:00:00")
		4. 카테고리가 [카테고리 목록]에 있는지 확인
		5. JSON 형식 준수
    """.formatted(
			currentDate,                    // 1. [현재 날짜]
			currentYear,                    // 2. [현재 연도]
			LocalDate.now().getDayOfWeek().getDisplayName(
				java.time.format.TextStyle.FULL,
				java.util.Locale.KOREAN),   // 3. [오늘 요일]
			post.getChannelName(),          // 4. [채널명]
			post.getOriginalText(),         // 5. [메시지]
			categoryListString,             // 6. [카테고리 목록]
			campusListString,               // 7. [캠퍼스 목록]
			currentYear,                    // 8. 규칙 7번의 [현재 연도]
			currentDate,                    // 9. 규칙 7번의 [현재 날짜]
			currentDate,                    // 10. 예시의 "오늘 18시까지"
			currentYear                     // 11. 예시의 "12/25 오후 3시"
		);
	}
}