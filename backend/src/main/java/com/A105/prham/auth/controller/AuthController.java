package com.A105.prham.auth.controller;

import java.net.URI;
import java.util.Arrays;
import java.util.Map;

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

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
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
    public ApiResponseDto<LoginResponse> callback(@RequestParam("code") String code, HttpServletResponse response) {
        try {
            // 1.액세스 토큰 획득
            AccessTokenResponse tokenResponse = ssoAuthService.getAccessToken(code);

            // 2.사용자 기본 + 상세 정보 조회 (합쳐진 메서드)
            DetailUserInfoResponse userInfo = ssoAuthService.getFullUserInfo(tokenResponse.getAccessToken());

            // token cookie에 저장
            addTokenCookies(response, tokenResponse);

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
    public ApiResponseDto<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request, HttpServletResponse response) {
        RefreshTokenResponse refreshResponse = ssoAuthService.refreshToken(request.getRefreshToken());

        // 새 토큰을 쿠키에도 저정
        AccessTokenResponse tokenResponse = AccessTokenResponse.builder()
            .accessToken(refreshResponse.getAccessToken())
            .refreshToken(refreshResponse.getRefreshToken())
            .build();
        addTokenCookies(response, tokenResponse);
        return ApiResponseDto.success(SuccessCode.REFRESH_SUCCESS, refreshResponse);
    }

    @PostMapping("/logout")
    public ApiResponseDto<SuccessCode> logout(HttpServletResponse response) {
        clearTokenCookies(response);
        return ApiResponseDto.success(SuccessCode.SUCCESS);
    }

    // 토큰을 받아서 쿠키에 저장 test용
    @Profile("local")
    @PostMapping("/test/set-cookie")
    public ApiResponseDto<Void> setTestCookie(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String accessToken = request.get("accessToken");
        String refreshToken = request.get("refreshToken");

        if (accessToken == null) {
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }

        Cookie accessTokenCookie = createCookie("accessToken", accessToken, "/", 60*60);
        response.addCookie(accessTokenCookie);

        if (refreshToken != null) {
            Cookie refreshTokenCookie = createCookie("refreshToken", refreshToken, "/api/v1/auth/refresh", 60*60*24*7);
        }
        return ApiResponseDto.success(SuccessCode.SUCCESS);
    }

    //내가 만든 쿠키~
    // 토큰을 httponly 쿠키에 저장
    private void addTokenCookies(HttpServletResponse response, AccessTokenResponse tokenResponse) {
        // access token cookie
        Cookie accessTokenCookie = createCookie(
            "accessToken",
            tokenResponse.getAccessToken(),
            "/",
            60*60
        );
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = createCookie(
            "refreshToken",
            tokenResponse.getRefreshToken(),
            "/api/v1/auth/refresh",
            60*60*24*7
        );
        response.addCookie(refreshTokenCookie);
    }

    //httponly cookie 생성
    private Cookie createCookie(String name, String value, String path, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); //배포용
        // cookie.setSecure(false); //로컬용
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        // cookie.setAttribute("SameSite", "LAX"); //로컬용
        cookie.setAttribute("SameSite", "None");

        return cookie;
    }

    //token cookie 삭제
    private void clearTokenCookies(HttpServletResponse response) {
        Cookie accesTokenCookie = new Cookie("accessToken", null);
        accesTokenCookie.setMaxAge(0);
        accesTokenCookie.setPath("/");
        response.addCookie(accesTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setPath("/api/v1/auth/refresh");
        response.addCookie(refreshTokenCookie);
    }


}
