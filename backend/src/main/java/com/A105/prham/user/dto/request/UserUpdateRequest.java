package com.A105.prham.user.dto.request;

import lombok.Getter;
import java.util.List;

@Getter
public class UserUpdateRequest {
    private String name;
    private Integer classroom;
    private Integer generation;
    private String profileImage;
    private Long campusId;
    private List<Long> skillIds;
    private List<Long> positionIds;
}
