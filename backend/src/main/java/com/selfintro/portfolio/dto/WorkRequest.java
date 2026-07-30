package com.selfintro.portfolio.dto;

import com.selfintro.portfolio.entity.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorkRequest(
        @NotBlank String title,
        String description,
        @NotNull MediaType mediaType,
        @NotBlank String url,
        String coverUrl
) {
}
