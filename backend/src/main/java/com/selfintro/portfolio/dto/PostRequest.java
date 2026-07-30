package com.selfintro.portfolio.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PostRequest(
        @NotBlank String title,
        String summary,
        String content,
        String coverUrl,
        List<String> images,
        List<String> tags
) {
}
