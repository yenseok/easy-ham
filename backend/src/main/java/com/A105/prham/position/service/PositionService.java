package com.A105.prham.position.service;

import com.A105.prham.campus.dto.response.CampusResponse;
import com.A105.prham.campus.dto.response.CampusResponseDto;
import com.A105.prham.campus.repository.CampusRepository;
import com.A105.prham.position.dto.response.PositionResponse;
import com.A105.prham.position.dto.response.PositionResponseDto;
import com.A105.prham.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    public PositionResponse getAllPositions() {
        List<PositionResponseDto> positionList = positionRepository.findAll().stream()
                .map(position -> PositionResponseDto.builder()
                        .id(position.getId())
                        .name(position.getPositionName())
                        .build())
                .collect(Collectors.toList());

        return PositionResponse.builder()
                .positions(positionList)
                .build();
    }

    //Post의 positionId가 사용자 포지션 목록에 포함되는지 확인
    public boolean isMatchingPosition(Long postPositionId, Set<Long> userPositionIds) {
        if (postPositionId == null) {
            // 공고 직무 없음
            return false;
        }

        if (userPositionIds == null || userPositionIds.isEmpty()) {
            //사용자 선호 직무 없음
            return true;
        }

        boolean directMatch = userPositionIds.contains(postPositionId);

        if (directMatch) {
            return true;
        }else  {
            return false;
        }
    }
}