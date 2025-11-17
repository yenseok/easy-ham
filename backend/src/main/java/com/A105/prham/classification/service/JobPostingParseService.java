package com.A105.prham.classification.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.A105.prham.classification.dto.ChatMessage;
import com.A105.prham.classification.dto.JobPostingParseResponseDto;
import com.A105.prham.classification.dto.OpenAiChatRequest;
import com.A105.prham.classification.dto.OpenAiChatResponse;
import com.A105.prham.classification.dto.ResponseFormat;
import com.A105.prham.position.entity.Position;
import com.A105.prham.position.repository.PositionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class JobPostingParseService {

	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;
	private final PositionRepository positionRepository;

	@Value("${llm.api.key}")
	private String llmApiKey;

	@Value("${llm.api.url}")
	private String llmApiUrl;

	public JobPostingParseResponseDto parseJobPostings(String content) {
		//db에서 position 가져오기
		List<Position> positions = positionRepository.findAll();
		String positionList = positions.stream()
			.map(Position::getPositionName)
			.collect(Collectors.joining(", "));

		String prompt = createJobParsingPrompt(content, positionList);

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
			OpenAiChatResponse response = restTemplate.postForObject(llmApiUrl, entity, OpenAiChatResponse.class);

			if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
				throw new RuntimeException("llm 응답 비었음");
			}

			String llmResponseJson = response.getChoices().get(0).getMessage().getContent();

			return objectMapper.readValue(llmResponseJson, JobPostingParseResponseDto.class);
		} catch (Exception e) {
			log.error("채용 공고 파싱 실패: {}", e.getMessage(), e);
			return null;
		}
	}

	private String createJobParsingPrompt(String content, String positionList) {
		return """
		당신은 삼성 청년 SW AI 아카데미 (SSAFY) 채용 공고 파싱 및 직무 분류 전문가입니다.
		아래 채용 공고 메시지를 분석하여 **회사별로 개별 채용 공고**를 추출하고, 각 공고를 적절한 직무 카테고리로 분류하세요.
		
		**텍스트 정리 지침**:
		1. 이모지는 제거하세요.
		2. 불필요한 특수문자나 마크다운 기호(*, #, > 등)는 제거하세요.
		3. **단, URL의 모든 문자는 절대 수정하지 마세요** (하이픈, 슬래시, 점 등 모두 보존)
		
		[메시지]:
		%s
		
		[파싱 규칙]:
		1. **입력 패턴**: 각 줄은 "✔ 회사명 / 직무명 / 마감일 (URL)" 형식일 수 있습니다.
		2. **정확성**: 회사명, 직무명, 마감일(MM/DD), URL을 누락 없이 정확히 추출하세요.
		3. **URL 원본 보존 (매우 중요)**:\s
			- URL은 **절대 수정하지 마세요**. 문자 하나도 빠뜨리거나 추가하지 마세요.
			- 예: `https://yg-entertainment.recruiter.co.kr` → 하이픈 포함 그대로
		4. **회사명/직무명**: 이모지 제거, 특수문자는 의미 있으면 보존 (Node.js, C# 등)
		
		[직무 카테고리 목록] - 반드시 이 중에서만 선택:
		%s
		
		[직무 분류 가이드]:
		**백엔드**: 백엔드, backend, 서버, server, API, Spring, Java, Node.js, Python-backend
		**프론트엔드**: 프론트엔드, frontend, React, Vue, Next.js, 웹 퍼블리싱, UI/UX 개발
		**풀스택**: 풀스택, fullstack, 웹개발(Fullstack)
		**모바일**: 모바일, mobile, Andriod, iOS, 앱, Flutter, React-Native
		**AI**: AI, 머신러닝, ML, 딥러닝, LLM, Vision, NLP, AI알고리즘
		**데이터**: 데이터, data, DBA, 데이터 엔지니어, 빅데이터, 데이터 분석, Data Scientist
		**인프라**: 인프라, infra, DevOps, SRE, 클라우드, AWS, Azure, GCP, 시스템 엔지니어, 네트워크
		**보안**: 보안, security, 정보보호, 침해대응, CISO, 개인정보
		**임베디드**: 임베디드, embedded, 펌웨어, firmware, IoT, 하드웨어(H/W), 로봇, 전장
		**QA**: QA, 테스트, test, 품질관리, 검증, SDET
		**전산**: 전산, IT지원, IT운영, 정보시스템, ERP, Helpdesk
		**기획**: 기획, PM, PO, 서비스 기획, IT기획, 프로덕트 매니저
		**SW**: SW개발, 소프트웨어, software, Application, C++, C#, Windows (구체적 분야가 명시되지 않은 일반적인 SW)
		**게임**: 게임, game, Unity, Unreal, 게임 기획, 게임 개발
		
		[분류 원칙]:
		1. **우선 순위**: 항상 구체적인 카테고리를 먼저 선택하세요. (예: "Spring 백엔드 개발" -> "백엔드", "AI 연구원" -> "AI")
		2. **모호성 처리**: 직무명이 "IT", "전산", "ICT"등 모호하고 포괄적인 경우 "전산"으로 분류하세요. "Software Engineer"처럼 분야가 불명확하면 "SW"로 분류하세요.
		
		[출력 형식 (JSON)]:
		{
			"jobPostings": [
				{
					"company": "추출한 회사명",
					"position": "직무명 원문 (특수문자 보존)",
					"positionCategory": "직무 카테고리 (위 14개 목록 중 하나)",
					"deadline": "마감일 (MM/DD 형식)",
					"url": "채용 링크 (원본 url)",
				}
			]
		}
		
		[최종 지침]:
		1. 'positionCategory' 값은 [직무 카테고리 목록]에 있는 단어와 **정확히 일치**해야 합니다.
		2. 입력된 [메시지]의 모든 공고를 누락 없이 파싱해야 합니다.
		3. 유효한 JSON 형식('json_object' 모드)으로만 응답하세요.
			""".formatted(content, positionList);
	}

}
