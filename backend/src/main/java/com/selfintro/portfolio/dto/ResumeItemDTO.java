package com.selfintro.portfolio.dto;

import com.selfintro.portfolio.entity.ResumeCategory;

public record ResumeItemDTO(
        Long id,
        ResumeCategory category,
        String title,
        String org,
        String description,
        String startYear,
        String endYear,
        Integer sortOrder
) {
}
