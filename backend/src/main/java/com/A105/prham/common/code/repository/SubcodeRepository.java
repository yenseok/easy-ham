package com.A105.prham.common.code.repository;

import com.A105.prham.common.code.entity.Subcode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcodeRepository extends JpaRepository<Subcode, Long> {

    // isUsed = true 인 데이터만 조회
    List<Subcode> findAllByIsUsedTrue();
}
