package com.A105.prham.common.code.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "maincode")
public class Maincode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "upper_code_id")
    private Long id;

    @Column(name = "main_code", nullable = false, length = 10)
    private String mainCode;

    @Column(name = "main_code_name", nullable = false, length = 100)
    private String mainCodeName;

    @Column(name = "main_code_description", nullable = false, length = 100)
    private String mainCodeDescription;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed;

    // 추가 (양방향 매핑)
    @OneToMany(mappedBy = "maincode", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Subcode> subcodes = new ArrayList<>();
}
