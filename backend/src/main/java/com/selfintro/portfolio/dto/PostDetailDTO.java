package com.selfintro.portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostDetailDTO(
        Long id,
        String title,
        String summary,
        String content,
        String coverUrl,
        List<String> images,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<String> tags
) {
}
