package com.selfintro.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resume_items")
@Getter
@Setter
@NoArgsConstructor
public class ResumeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResumeCategory category; // EDUCATION, EXPERIENCE, SKILL, PROJECT, CERT

    private String title;   // degree / role / skill group / project name
    private String org;     // school / company
    private String description;

    private String startYear;
    private String endYear; // "Present" allowed

    private Integer sortOrder = 0;

    public ResumeItem(ResumeCategory category, String title, String org, String description,
                      String startYear, String endYear, Integer sortOrder) {
        this.category = category;
        this.title = title;
        this.org = org;
        this.description = description;
        this.startYear = startYear;
        this.endYear = endYear;
        this.sortOrder = sortOrder;
    }
}
