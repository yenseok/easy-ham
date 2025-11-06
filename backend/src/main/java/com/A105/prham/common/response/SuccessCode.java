package com.A105.prham.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SuccessCode {

    //200 OK
    LOGIN_SUCCESS(200,HttpStatus.OK,"로그인 성공"),
    WEBHOOK_RECEIVED(200, HttpStatus.OK, "웹훅이 정상적으로 수신되었습니다."),
    LOGIN_URL_TRANSFER(200,HttpStatus.OK,"로그인 URL 전송 성공"),
    REFRESH_SUCCESS(200,HttpStatus.OK,"토큰 새로고침 성공"),
    SIGNUP_SUCCESSED(200,HttpStatus.OK ,"회원가입 성공" ),
    BOOKMARK_DELETE_SUCCESS(200, HttpStatus.OK, "북마크 해제 성공"),
    BOOKMARK_GET_SUCCESS(200, HttpStatus.OK, "북마크 목록 조회 성공"),
    KEYWORD_DELETE_SUCCESS(200, HttpStatus.OK, "키워드 삭제 성공"),
    KEYWORD_LIST_GET_SUCCESS(200, HttpStatus.OK, "키워드 목록 조회 성공"),
    NOTIFICATION_SETTING_GET_SUCCESS(200, HttpStatus.OK, "알림 설정 조회 성공"),
    NOTIFICATION_SETTING_UPDATE_SUCCESS(200, HttpStatus.OK, "알림 설정 수정 성공"),
    SUCCESS(200,HttpStatus.OK, "요청 성공"),

    // SSO용 Code
    NOT_REGISTERED(403, HttpStatus.FORBIDDEN,"회원가입 후 이용해 주세요"),

    //201 CREATED
    POST_CREATED(201, HttpStatus.CREATED, "메시지가 저장되었습니다."),
    BOOKMARK_SAVE_SUCCESS(201, HttpStatus.CREATED, "북마크 저장 성공"),
    KEYWORD_ADD_SUCCESS(201, HttpStatus.CREATED, "키워드 구독 성공"),
    NOTIFICATION_SETTING_CREATE_SUCCESS(201,HttpStatus.CREATED, "알림 설정 생성 성공"),
    ;


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
