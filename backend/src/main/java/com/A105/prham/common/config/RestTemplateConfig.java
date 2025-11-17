package com.A105.prham.common.config;

import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

@Configuration
@Slf4j
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();

        factory.setConnectTimeout(20000);
        factory.setReadTimeout(20000);

        RestTemplate restTemplate = new RestTemplate(factory);

        // 요청 로깅만 (헤더는 조작하지 않음)
        ClientHttpRequestInterceptor loggingInterceptor = (request, body, execution) -> {
//            log.info("➡️ RestTemplate request: {} {}", request.getMethod(), request.getURI());
//            log.info("➡️ Request headers: {}", request.getHeaders());
            return execution.execute(request, body);
        };

        restTemplate.setInterceptors(List.of(loggingInterceptor));
        return restTemplate;
    }

    //llm restTemplate
    //타임아웃 60초
    @Bean(name = "llmRestTemplate")
    public RestTemplate llmRestTemplate(RestTemplateBuilder builder) {
        return builder
            .requestFactory(() -> {
                SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(15000);
                factory.setReadTimeout(120000); //120초
                return new BufferingClientHttpRequestFactory(factory);
            })
            .interceptors(loggingInterceptor("LLM"))
            .build();
    }

    private ClientHttpRequestInterceptor loggingInterceptor(String template) {
        return (request, body, execution) -> {
            long startTime = System.currentTimeMillis();

            try {
                var response = execution.execute(request, body);
                long duration = System.currentTimeMillis() - startTime;

                return response;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                throw e;
            }
        };
    }
}
