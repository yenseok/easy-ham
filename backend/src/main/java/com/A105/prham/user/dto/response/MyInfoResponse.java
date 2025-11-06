package com.A105.prham.user.dto.response;


import com.A105.prham.position.entity.Position;
import com.A105.prham.skill.entity.Skill;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class MyInfoResponse {
    private Long userId;
    private String name;
    private Integer classroom;
    private Integer generation;
    private String email;
    private String profileImage;
    private String campus;
    private Set<String> userSkills;
    private Set<String> userPositions;
    // TODO 구독 키워드 추가


}
