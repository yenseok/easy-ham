package com.A105.prham.bot.event;

import com.A105.prham.bot.service.DMService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AlarmEventListener {

    private final DMService dmService;

    @Value("${mattermost.bot.user-id}")
    private String botUserId;

    @EventListener
    public void onAlarmEvent(AlarmEvent event) {
        dmService.sendDirectMessageByEmail(
                botUserId,
                event.getTargetEmail(),
                event.getMessage()
        );
    }
}