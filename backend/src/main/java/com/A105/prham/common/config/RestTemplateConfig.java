package com.A105.prham.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Configuration
@Slf4j
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);

        RestTemplate restTemplate = new RestTemplate(factory);

        // 요청 로깅만 (헤더는 조작하지 않음)
        ClientHttpRequestInterceptor loggingInterceptor = (request, body, execution) -> {
            log.info("➡️ RestTemplate request: {} {}", request.getMethod(), request.getURI());
            log.info("➡️ Request headers: {}", request.getHeaders());
            return execution.execute(request, body);
        };

        restTemplate.setInterceptors(List.of(loggingInterceptor));
        return restTemplate;
    }
}
