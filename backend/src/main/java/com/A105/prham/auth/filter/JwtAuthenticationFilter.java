package com.A105.prham.auth.filter;

import com.A105.prham.auth.util.JwtUtils;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserService userService;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1️⃣ 요청 헤더에서 JWT 추출
            String token = extractToken(request);

            if (token != null && !jwtUtils.isTokenExpired(token)) {
                // 2️⃣ SSAFY SSO의 sub(UUID) 추출
                String ssoSubId = jwtUtils.getUserIdFromToken(token);

                if (ssoSubId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // 3️⃣ DB에서 사용자 조회
                    User user = userService.findBySsoSubId(ssoSubId);

                    if (user != null) {
                        // 4️⃣ 인증 객체 생성 및 SecurityContext 등록
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>());

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

        } catch (Exception e) {
            log.error("JWT 인증 처리 중 오류 발생: {}", e.getMessage());
            // 예외 발생 시 SecurityContext 비워두고 다음 필터로 넘김
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Authorization: Bearer {token} 형식에서 토큰 부분만 추출
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
