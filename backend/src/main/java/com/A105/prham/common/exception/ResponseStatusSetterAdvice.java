package com.A105.prham.common.exception;


import com.A105.prham.common.response.ApiResponseDto;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class ResponseStatusSetterAdvice implements ResponseBodyAdvice<ApiResponseDto<?>> {

    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return returnType.getParameterType() == ApiResponseDto.class;
    }

    @Override
    public ApiResponseDto<?> beforeBodyWrite(
            ApiResponseDto body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        // sse 요청은 처리 안함
        if (selectedContentType != null && selectedContentType.toString().contains("text/event-stream"))  {
            return body;
        }

        if (body != null) {
            HttpStatus status = body.httpStatus();
            response.setStatusCode(status);
        }

        return body;
    }
}