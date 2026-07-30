package com.selfintro.portfolio.service;

import com.selfintro.portfolio.dto.PostDetailDTO;
import com.selfintro.portfolio.dto.PostRequest;
import com.selfintro.portfolio.dto.PostSummaryDTO;
import com.selfintro.portfolio.entity.Post;
import com.selfintro.portfolio.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepo;

    public PostService(PostRepository postRepo) {
        this.postRepo = postRepo;
    }

    public Page<PostSummaryDTO> list(Pageable pageable) {
        return postRepo.findAllByOrderByCreatedAtDesc(pageable).map(this::toSummary);
    }

    public PostDetailDTO get(Long id) {
        Post p = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        return toDetail(p);
    }

    @Transactional
    public PostDetailDTO create(PostRequest req) {
        Post p = new Post();
        apply(p, req);
        return toDetail(postRepo.save(p));
    }

    @Transactional
    public PostDetailDTO update(Long id, PostRequest req) {
        Post p = postRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        apply(p, req);
        return toDetail(postRepo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        if (!postRepo.existsById(id)) {
            throw new IllegalArgumentException("Post not found: " + id);
        }
        postRepo.deleteById(id);
    }

    private void apply(Post p, PostRequest req) {
        p.setTitle(req.title());
        p.setSummary(req.summary());
        p.setContent(req.content());
        p.setCoverUrl(req.coverUrl());
        p.setImages(req.images() == null ? List.of() : req.images());
        p.setTags(req.tags() == null ? List.of() : req.tags());
    }

    private PostSummaryDTO toSummary(Post p) {
        return new PostSummaryDTO(p.getId(), p.getTitle(), p.getSummary(), p.getCoverUrl(),
                p.getCreatedAt(), p.getTags());
    }

    private PostDetailDTO toDetail(Post p) {
        return new PostDetailDTO(p.getId(), p.getTitle(), p.getSummary(), p.getContent(),
                p.getCoverUrl(), p.getImages(), p.getCreatedAt(), p.getUpdatedAt(), p.getTags());
    }
}
