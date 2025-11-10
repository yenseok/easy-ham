package com.A105.prham.notification.controller;

import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.notification.dto.request.KeywordCreateRequest;
import com.A105.prham.notification.dto.request.NotificationSettingUpdateRequest;
import com.A105.prham.notification.dto.response.KeywordListGetResponse;
import com.A105.prham.notification.dto.response.NotificationSettingGetResponse;
import com.A105.prham.notification.service.NotificationService;
import com.A105.prham.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/keywords")
    public ApiResponseDto addKeyword(@AuthenticationPrincipal User user, @RequestBody KeywordCreateRequest keywordCreateRequest) {
        notificationService.addKeyword(user, keywordCreateRequest);
        return ApiResponseDto.success(SuccessCode.KEYWORD_ADD_SUCCESS);
    }

    @DeleteMapping("/keywords/{keywordId}")
    public ApiResponseDto removeKeyword(@AuthenticationPrincipal User user, @PathVariable Long keywordId) {
        notificationService.deleteKeyword(user, keywordId);
        return ApiResponseDto.success(SuccessCode.KEYWORD_DELETE_SUCCESS);
    }

    @GetMapping("/keywords")
    public ApiResponseDto<KeywordListGetResponse> getKeywords(@AuthenticationPrincipal User user) {
        return ApiResponseDto.success(SuccessCode.KEYWORD_LIST_GET_SUCCESS, notificationService.getKeywordList(user));
    }

    @PostMapping("/settings")
    public ApiResponseDto createNotificationSetting(@AuthenticationPrincipal User user) {
        notificationService.createNotificationSetting(user);
        return ApiResponseDto.success(SuccessCode.NOTIFICATION_SETTING_CREATE_SUCCESS);
    }

    @GetMapping("/settings")
    public ApiResponseDto<NotificationSettingGetResponse> getNotificationSetting(@AuthenticationPrincipal User user) {
        return ApiResponseDto.success(SuccessCode.NOTIFICATION_SETTING_GET_SUCCESS, notificationService.getNotificationSetting(user));
    }

    @PatchMapping("/settings")
    public ApiResponseDto updateNotificationSetting(@AuthenticationPrincipal User user, @RequestBody NotificationSettingUpdateRequest  notificationSettingUpdateRequest) {
        notificationService.updateNotificationSetting(user, notificationSettingUpdateRequest);
        return ApiResponseDto.success(SuccessCode.NOTIFICATION_SETTING_UPDATE_SUCCESS);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@AuthenticationPrincipal User user,
                                              @RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "")
                                              String lastEventId) {
        return notificationService.subscribe(user, lastEventId);
    }
}
