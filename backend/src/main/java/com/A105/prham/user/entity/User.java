package com.A105.prham.user.entity;

import com.A105.prham.auth.entity.RefreshToken;
import com.A105.prham.campus.entity.Campus;
import com.A105.prham.common.domain.BaseTimeEntity;
import com.A105.prham.keyword.Keyword;
import com.A105.prham.user_notice.entity.UserNotice;
import com.A105.prham.user_notice_like.entity.UserNoticeLike;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"campus", "userSkills", "userPositions", "userNotices", "userNoticeLikes", "keywords"})
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    // SSAFY SSO 식별자(UUID)
    @Column(name = "sso_sub_id", unique = true, nullable = false, length = 50)
    private String ssoSubId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer classroom;

    @Column(nullable = false)
    private Integer generation;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String profileImage;

    @Column(nullable = false)
    private Boolean exited;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campus_id")
    private Campus campus;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RefreshToken refreshToken;

//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
//    private Set<Notification> notifications = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserSkill> userSkills = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPosition> userPositions = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserNotice> userNotices = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UserNoticeLike> userNoticeLikes = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Keyword> keywords = new ArrayList<>();

    @Builder
    public User(String ssoSubId, String name, Integer generation, Boolean exited ,Integer classroom, String email, Campus campus) {
        this.ssoSubId = ssoSubId;
        this.name = name;
        this.generation = generation;
        this.classroom = classroom;
        this.email = email;
        this.campus = campus;
        this.exited = exited;
    }
    public void setSsoSubId(String ssoSubId) {this.ssoSubId=ssoSubId;}
    public void setExited(Boolean exited) {this.exited= exited;}
    public void setName(String name) { this.name = name; }
    public void setClassroom(Integer classroom) { this.classroom = classroom; }
    public void setGeneration(Integer generation) { this.generation = generation; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public void setCampus(Campus campus) { this.campus = campus; }

}
