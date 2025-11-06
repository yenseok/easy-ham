package com.A105.prham.keyword;

import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "keywords")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Keyword extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "word", nullable = false)
    private String word;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public Keyword(String word, User user) {
        this.word = word;
        this.user = user;
    }
}
