package com.A105.prham.classification.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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
@RequiredArgsConstructor
public class LlmClassificationService {
	private final CodeService codeService;
	private final CampusService campusService;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Value("${llm.api.key}")
	private String llmApiKey;

	@Value("${llm.api.url}")
	private String llmApiUrl;

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

			OpenAiChatResponse response = restTemplate.postForObject(llmApiUrl, entity, OpenAiChatResponse.class);

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
		
		**중요**: 
		1. 원본 메시지의 마크다운 형식과 줄바꿈(\\n)을 그대로 유지해야 합니다.
		2. mainCategory와 subCategory는 **반드시** 아래 [카테고리 목록]에서만 선택해야 합니다.
		
		[현재 날짜]: %s
		[현재 연도]: %d
		
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
		3. 의무/필수 액션: "제출", "설문" 등 *필수* 작업이 명시되면, 내용이 '특강'이라도 subCategory를 '할일'로 분류합니다.
		4. 선택적 액션: "신청", "참여" 등 *선택* 작업은 원래 카테고리('특강', '이벤트')를 유지합니다.
		5. 특강 판단: "특강", "강연", "강의", "교수님" 등의 키워드가 있으면 subCategory를 "특강"으로 분류합니다.
		6. **캠퍼스 추출 규칙 (중요)**:
			  - mainCategory가 "취업"이고 메시지에 특정 캠퍼스가 명시된 경우, [캠퍼스 목록]에서 해당 캠퍼스를 추출합니다.
			  - 캠퍼스 키워드: "서울", "대전", "광주", "구미", "부울경"
			  - 여러 캠퍼스가 언급되면 모두 배열로 추출
			  - "전국", "전체", "모든 캠퍼스", 캠퍼스 언급 없음 → null
			  - 예시:
			    * "부울경캠퍼스 대상" → ["부울경"]
			    * "서울, 대전 교육생" → ["서울", "대전"]
			    * "전 캠퍼스" → null		
		7. **제목 생성 규칙**:
		   - 본문의 핵심 내용을 자연스럽고 명확하게 요약합니다.
		   - 누가, 무엇을, 언제, 어디서 등 5W1H 요소 중 핵심 정보를 포함합니다.
		   - 특수문자(#, *, :emoji:)와 이모지는 제외하지만, 의미 있는 내용은 유지합니다.
		   - 15자 이내의 자연스러운 문장으로 작성합니다.
		   - 예시:
		     * "서울대 문병로 교수님 AI 특강"
		     * "특화PJT 영상 포트폴리오 투표"
		     * "취업 특강 신청 및 출석 체크"
		8. 마감일: 
		   - "YYYY-MM-DDTHH:MM:SS" 형식으로 추출합니다.
		   - **중요**: 연도가 명시되지 않았거나 "오늘", "내일" 같은 상대적 표현이면, [현재 연도] %d을 사용합니다.
		   - 시간만 있고 날짜가 없으면 오늘 날짜로 설정합니다.
		   - 명확한 마감일이 없으면 null입니다.
		
		[출력 형식 (JSON)]
		{
			"title": "string (20-30자 정도의 본문 요약)",
			"mainCategory": "학사" | "취업",
			"subCategory": "할일" | "특강" | "정보" | "이벤트",
			"deadline": "YYYY-MM-DDTHH:MM:SS" | null,
			"campusList": ["string"] | null
		}
		
		제목 생성 예시:
		- "서울대학교 문병로 교수님 AI 인문학 리터러시 특강 좌석배치도" → "서울대 문병로 교수님 AI 특강"
		- "특화PJT 영상 포트폴리오 경진대회 투표 안내" → "특화PJT 영상 포트폴리오 투표"
		- "취업 특강 신청 및 출석 안내" → "취업 특강 신청 및 출석 체크"
		- "관통 프로젝트 최종 제출 안내" → "관통 프로젝트 최종 제출 마감"
		""".formatted(
			currentDate,
			currentYear,
			post.getChannelName(),
			post.getOriginalText(),
			categoryListString,
			campusListString,
			currentYear
		);
	}
}