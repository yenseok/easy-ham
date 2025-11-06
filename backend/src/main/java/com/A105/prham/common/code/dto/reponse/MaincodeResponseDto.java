package com.A105.prham.common.code.dto.reponse;

import com.A105.prham.common.code.dto.reponse.SubcodeResponseDto;
import com.A105.prham.common.code.entity.Maincode;
import com.A105.prham.common.code.entity.Subcode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class MaincodeResponseDto {

    private String mainCode;
    private String mainCodeName;
    private String mainCodeDescription;

    // ✅ 하위 Subcode 전체 정보 포함
    private List<SubcodeResponseDto> subcodes;

    public static MaincodeResponseDto from(Maincode entity) {
        return MaincodeResponseDto.builder()
                .mainCode(entity.getMainCode())
                .mainCodeName(entity.getMainCodeName())
                .mainCodeDescription(entity.getMainCodeDescription())
                .subcodes(entity.getSubcodes().stream()
                        .map(SubcodeResponseDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
