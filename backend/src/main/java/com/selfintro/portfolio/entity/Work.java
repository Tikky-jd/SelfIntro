package com.selfintro.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "works")
@Getter
@Setter
@NoArgsConstructor
public class Work {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType mediaType; // IMAGE | VIDEO

    @Column(nullable = false)
    private String url;          // image or video URL

    private String coverUrl;     // poster for video / thumbnail for image

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Work(String title, String description, MediaType mediaType, String url, String coverUrl) {
        this.title = title;
        this.description = description;
        this.mediaType = mediaType;
        this.url = url;
        this.coverUrl = coverUrl;
    }
}
