package com.A105.prham.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@Builder
@ToString
public class LoginResponse {
    private AccessTokenResponse token;
    private String name;
    private String email;
    private Long userId;
    private String edu; //몇기
    private String entRegn; //어느지역
}