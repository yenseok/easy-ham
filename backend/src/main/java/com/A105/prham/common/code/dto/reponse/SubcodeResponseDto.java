package com.A105.prham.common.code.dto.reponse;

import com.A105.prham.common.code.entity.Subcode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SubcodeResponseDto {
    private Long subCodeId;
    private String subcode;
    private String subcodeName;
    private String subcodeDescription;


    public static SubcodeResponseDto from(Subcode entity) {
        return SubcodeResponseDto.builder()
                .subCodeId(entity.getId())
                .subcode(entity.getSubcode())
                .subcodeName(entity.getSubcodeName())
                .subcodeDescription(entity.getSubcodeDescription())
                .build();
    }
}
