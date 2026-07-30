package com.selfintro.portfolio.dto;

import com.selfintro.portfolio.entity.MediaType;

import java.time.LocalDateTime;

public record WorkDTO(
        Long id,
        String title,
        String description,
        MediaType mediaType,
        String url,
        String coverUrl,
        LocalDateTime createdAt
) {
}
