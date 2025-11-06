package com.A105.prham.common.code.service;


import com.A105.prham.common.code.dto.reponse.MaincodeResponseDto;
import com.A105.prham.common.code.repository.MaincodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeService {

    private final MaincodeRepository maincodeRepository;

    @Transactional(readOnly = true)
    public List<MaincodeResponseDto> getAllMaincodes() {
        return maincodeRepository.findAllByIsUsedTrue().stream()
                .map(MaincodeResponseDto::from)
                .collect(Collectors.toList());
    }
}
