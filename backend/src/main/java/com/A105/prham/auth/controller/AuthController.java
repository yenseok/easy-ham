package com.A105.prham.auth.controller;

import com.A105.prham.auth.dto.request.RefreshTokenRequest;
import com.A105.prham.auth.dto.response.AccessTokenResponse;
import com.A105.prham.auth.dto.response.DetailUserInfoResponse;
import com.A105.prham.auth.dto.response.LoginResponse;
import com.A105.prham.auth.dto.response.RefreshTokenResponse;
import com.A105.prham.auth.service.SsoAuthService;
import com.A105.prham.auth.util.JwtUtils;
import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    @Value("${ssafy.sso.client-id}")
    private String clientId;

    @Value("${ssafy.sso.client-secret}")
    private String clientSecret;

    @Value("${ssafy.sso.redirect-uri}")
    private String redirectUri;

    private final SsoAuthService ssoAuthService;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    @GetMapping("/sso/login-url")
    public ApiResponseDto<String> getURL() {
        return ApiResponseDto.success(SuccessCode.LOGIN_URL_TRANSFER,
                "https://project.ssafy.com/oauth/sso-check");
    }

    @GetMapping("/sso/callback")
    public ApiResponseDto<LoginResponse> callback(@RequestParam("code") String code) {
        try {
            // 1.액세스 토큰 획득
            AccessTokenResponse tokenResponse = ssoAuthService.getAccessToken(code);

            // 2.사용자 기본 + 상세 정보 조회 (합쳐진 메서드)
            DetailUserInfoResponse userInfo = ssoAuthService.getFullUserInfo(tokenResponse.getAccessToken());

            // 3.로그인 응답 DTO 구성
            LoginResponse loginResponse = LoginResponse.builder()
                    .token(tokenResponse)
                    .email(userInfo.getEmail())
                    .name(userInfo.getName())
                    .edu(userInfo.getEdu())
                    .entRegn(userInfo.getEntRegn())
                    .build();

            // 토큰에서 SSAFY SSO UUID 추출
            String ssoSubId = jwtUtils.getUserIdFromToken(tokenResponse.getAccessToken());
            // 4. 이미 가입된 사용자 여부 확인
            try {

                User user = userService.findBySsoSubId(ssoSubId);
                loginResponse.setUserId(user.getId());
                return ApiResponseDto.success(SuccessCode.LOGIN_SUCCESS, loginResponse);
            } catch (Exception e) {
                // 신규 가입 필요
                log.warn("미등록 사용자: {}", e.getMessage());
                return ApiResponseDto.success(SuccessCode.NOT_REGISTERED, loginResponse);
            }

        } catch (Exception e) {
            log.error("SSO 콜백 처리 실패: {}", e.getMessage(), e);
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // 테스트용 토큰 갱신 API
    @PostMapping("/refresh")
    public ApiResponseDto<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = ssoAuthService.refreshToken(request.getRefreshToken());
        return ApiResponseDto.success(SuccessCode.REFRESH_SUCCESS, response);
    }
}
