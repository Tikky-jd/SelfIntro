package com.selfintro.portfolio.controller;

import com.selfintro.portfolio.dto.PostDetailDTO;
import com.selfintro.portfolio.dto.PostRequest;
import com.selfintro.portfolio.dto.PostSummaryDTO;
import com.selfintro.portfolio.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public Page<PostSummaryDTO> list(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postService.list(pageable);
    }

    @GetMapping("/{id}")
    public PostDetailDTO get(@PathVariable Long id) {
        return postService.get(id);
    }

    @PostMapping
    public PostDetailDTO create(@Valid @RequestBody PostRequest request) {
        return postService.create(request);
    }

    @PutMapping("/{id}")
    public PostDetailDTO update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }
}
