package com.selfintro.portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostSummaryDTO(
        Long id,
        String title,
        String summary,
        String coverUrl,
        LocalDateTime createdAt,
        List<String> tags
) {
}
