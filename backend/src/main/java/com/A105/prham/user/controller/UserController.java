package com.A105.prham.user.controller;

import com.A105.prham.auth.util.JwtUtils;
import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.common.response.SuccessCode;
import com.A105.prham.user.dto.request.UserSignupRequest;
import com.A105.prham.user.dto.request.UserUpdateRequest;
import com.A105.prham.user.dto.response.MyInfoResponse;
import com.A105.prham.user.entity.User;
import com.A105.prham.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashSet;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    /**
     * 회원가입 API
     * ACCESS TOKEN 필요
     * BODY : UserSignupRequest
     */
    @PostMapping
    public ApiResponseDto<User> createUser(
            @RequestBody UserSignupRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String token = authorizationHeader.replace("Bearer ", "");
            // 토큰에서 SSAFY SSO UUID 추출
            String ssoSubId = jwtUtils.getUserIdFromToken(token);

            User user = userService.createUser(request, ssoSubId);
            return ApiResponseDto.success(SuccessCode.SIGNUP_SUCCESSED);
        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage());
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }

    @PostMapping("/delete")
    public ApiResponseDto<User> signOut(@AuthenticationPrincipal User user) {
        try {
            userService.deleteUser(user.getSsoSubId());
            return ApiResponseDto.success(SuccessCode.SUCCESS);
        } catch (Exception e) {
            log.error("회원 탈퇴 실패: {}", e.getMessage());
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }

    @GetMapping("/me")
    public ApiResponseDto<MyInfoResponse> getMyInfomation(@AuthenticationPrincipal User user){
        try{
            MyInfoResponse response = MyInfoResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .generation(user.getGeneration())
                    .classroom(user.getClassroom())
                    .campus(user.getCampus().getName())
                    .profileImage(user.getProfileImage())
                    .userPositions(
                            user.getUserPositions().stream()
                                    .map(position -> position.getPosition().getPositionName())
                                    .collect(Collectors.toSet())
                    )
                    .userSkills(
                            user.getUserSkills().stream()
                                    .map(skill -> skill.getSkill().getSkillName())
                                    .collect(Collectors.toSet())
                    )
                    .build();
            return ApiResponseDto.success(SuccessCode.SUCCESS,response);
        } catch (Exception e) {
            {
                log.error(e.getMessage());
                return ApiResponseDto.fail(ErrorCode.USER_NOT_FOUND);
            }
        }
    }


    @PatchMapping("/me")
    public ApiResponseDto<MyInfoResponse> updateMyInfo(
            @AuthenticationPrincipal User user,
            @RequestBody UserUpdateRequest request) {
        try {
            log.info(String.valueOf(user));
            User updated = userService.updateUserInfo(user.getSsoSubId(), request);

            MyInfoResponse response = MyInfoResponse.builder()
                    .userId(updated.getId())
                    .email(updated.getEmail())
                    .name(updated.getName())
                    .generation(updated.getGeneration())
                    .classroom(updated.getClassroom())
                    .campus(updated.getCampus().getName())
                    .profileImage(updated.getProfileImage())
                    .userPositions(
                            updated.getUserPositions().stream()
                                    .map(p -> p.getPosition().getPositionName())
                                    .collect(Collectors.toSet())
                    )
                    .userSkills(
                            updated.getUserSkills().stream()
                                    .map(s -> s.getSkill().getSkillName())
                                    .collect(Collectors.toSet())
                    )
                    .build();

            return ApiResponseDto.success(SuccessCode.SUCCESS, response);
        } catch (Exception e) {
            log.error("회원정보 수정 실패", e);
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }



}

