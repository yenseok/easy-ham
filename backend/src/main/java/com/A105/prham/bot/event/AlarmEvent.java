package com.A105.prham.bot.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AlarmEvent {
    private final String targetEmail;
    private final String message;
}