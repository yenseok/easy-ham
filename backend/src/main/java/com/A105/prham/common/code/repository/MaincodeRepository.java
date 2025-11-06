package com.A105.prham.common.code.repository;

import com.A105.prham.common.code.entity.Maincode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaincodeRepository extends JpaRepository<Maincode, Long> {

    // isUsed = true 인 데이터만 조회
    List<Maincode> findAllByIsUsedTrue();
}
