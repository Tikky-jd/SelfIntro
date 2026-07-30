package com.selfintro.portfolio.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.selfintro.portfolio.util.JsonUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content; // markdown

    private String coverUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String imagesJson; // JSON array of image URLs

    @Lob
    @Column(columnDefinition = "TEXT")
    private String tagsJson;   // JSON array of tags

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public List<String> getImages() {
        if (imagesJson == null || imagesJson.isBlank()) return new ArrayList<>();
        return JsonUtils.fromJson(imagesJson, new TypeReference<List<String>>() {});
    }

    public void setImages(List<String> images) {
        this.imagesJson = JsonUtils.toJson(images);
    }

    public List<String> getTags() {
        if (tagsJson == null || tagsJson.isBlank()) return new ArrayList<>();
        return JsonUtils.fromJson(tagsJson, new TypeReference<List<String>>() {});
    }

    public void setTags(List<String> tags) {
        this.tagsJson = JsonUtils.toJson(tags);
    }
}
