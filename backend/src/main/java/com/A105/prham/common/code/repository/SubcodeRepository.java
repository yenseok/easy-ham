package com.A105.prham.common.code.repository;

import com.A105.prham.common.code.entity.Subcode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubcodeRepository extends JpaRepository<Subcode, Long> {

    @Query("""
        SELECT s.id
        FROM Subcode s
        JOIN s.maincode m
        WHERE m.mainCodeName = :maincode
          AND s.subcodeName = :subcode
    """)
    Long findByCodes(@Param("maincode") String maincode,
                     @Param("subcode") String subcode);
}