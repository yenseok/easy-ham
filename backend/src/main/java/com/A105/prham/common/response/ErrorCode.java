package com.A105.prham.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
@AllArgsConstructor
public enum ErrorCode {
    //400 BAD REQUEST
    BAD_REQUEST(400, HttpStatus.BAD_REQUEST, "잘못된 접근입니다."),
    DUPLICATED_USER_NOTICE_LIKE(400, HttpStatus.BAD_REQUEST, "이미 북마크 된 공지사항입니다."),
    INVALID_WEBHOOK_PAYLOAD(400, HttpStatus.BAD_REQUEST, "유효하지 않은 웹훅 데이터입니다."),
    INVALID_USER_NOTICE_LIKE(400, HttpStatus.BAD_REQUEST, "유효하지 않은 북마크입니다."),

    //403 FORBIDDEN
    NOT_REGISTERED(403,HttpStatus.FORBIDDEN, "회원가입 후 이용해주세요."),

    //404 NOT FOUND
    NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 API를 찾을 수 없습니다."),
    USER_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 유저를 찾을 수 없습니다."),
    NOTICE_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 공지사항을 찾을 수 없습니다."),
    FILE_NOT_FOUND(404, HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다."),
    KEYWORD_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 키워드를 찾을 수 없습니다."),

    //405 METHOD NOT ALLOWED
    METHOD_NOT_ALLOWED(405, HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 메소드입니다."),

    //429 TOO MANY REQUESTS
    TOO_MANY_REQUESTS(429, HttpStatus.TOO_MANY_REQUESTS, "요청 횟수를 초과하였습니다."),

    //500 INTERNAL SERVER ERROR
    INTERNAL_SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류입니다."),
    WEBHOOK_PROCESSING_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "웹훅 처리 중 오류가 발생했습니다."),
    FILE_PROCESSING_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "파일 처리 중 오류가 발생했습니다.");


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
