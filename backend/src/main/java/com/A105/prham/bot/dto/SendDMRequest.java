package com.A105.prham.bot.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SendDMRequest {
    private String email;
    private String message;
}