package com.selfintro.portfolio.dto;

import com.selfintro.portfolio.entity.SocialLink;

import java.util.List;

public record ProfileDTO(
        Long id,
        String name,
        String headline,
        String avatarUrl,
        String email,
        String phone,
        String location,
        String about,
        List<SocialLink> socials,
        List<ResumeItemDTO> resumeItems
) {
}
