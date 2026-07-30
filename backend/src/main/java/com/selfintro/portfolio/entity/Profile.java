package com.selfintro.portfolio.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.selfintro.portfolio.util.JsonUtils;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profile")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @Column(name = "id")
    private Long id = 1L; // singleton row

    private String name;
    private String headline;     // e.g. "Full-stack Developer & Designer"
    private String avatarUrl;
    private String email;
    private String phone;
    private String location;

    @Column(length = 4000)
    private String about;        // short bio / markdown

    @Lob
    @Column(columnDefinition = "TEXT")
    private String socialsJson;  // JSON array of SocialLink

    public List<SocialLink> getSocials() {
        if (socialsJson == null || socialsJson.isBlank()) return new ArrayList<>();
        return JsonUtils.fromJson(socialsJson, new TypeReference<List<SocialLink>>() {});
    }

    public void setSocials(List<SocialLink> socials) {
        this.socialsJson = JsonUtils.toJson(socials);
    }
}
