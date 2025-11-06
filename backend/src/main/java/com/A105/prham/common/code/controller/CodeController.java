package com.A105.prham.common.code.controller;

import com.A105.prham.common.code.dto.reponse.MaincodeResponseDto;
import com.A105.prham.common.code.entity.Maincode;
import com.A105.prham.common.code.entity.Subcode;
import com.A105.prham.common.code.service.CodeService;
import com.A105.prham.common.response.ApiResponseDto;
import com.A105.prham.common.response.ErrorCode;
import com.A105.prham.common.response.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/code")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @GetMapping()
    public ApiResponseDto getAllMaincodes() {
        try{
            return ApiResponseDto.success(SuccessCode.SUCCESS,codeService.getAllMaincodes());
        } catch (Exception e) {
            return ApiResponseDto.fail(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


}
