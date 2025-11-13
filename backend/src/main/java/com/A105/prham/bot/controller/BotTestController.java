package com.A105.prham.bot.controller;

import com.A105.prham.bot.dto.SendDMRequest;
import com.A105.prham.bot.event.AlarmEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/bot")
@RequiredArgsConstructor
public class BotTestController {

    private final ApplicationEventPublisher eventPublisher;

    @PostMapping("/send")
    public String testSendMessageByEmail(
            @RequestBody SendDMRequest request
            ) {
        eventPublisher.publishEvent(new AlarmEvent(request.getEmail(), request.getMessage()));
        return "Event Published (email): " + request.getEmail();
    }

}
