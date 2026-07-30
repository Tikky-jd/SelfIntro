package com.selfintro.portfolio.service;

import com.selfintro.portfolio.dto.WorkDTO;
import com.selfintro.portfolio.dto.WorkRequest;
import com.selfintro.portfolio.entity.Work;
import com.selfintro.portfolio.repository.WorkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkService {

    private final WorkRepository workRepo;

    public WorkService(WorkRepository workRepo) {
        this.workRepo = workRepo;
    }

    public List<WorkDTO> list() {
        return workRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    public WorkDTO get(Long id) {
        Work w = workRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work not found: " + id));
        return toDto(w);
    }

    @Transactional
    public WorkDTO create(WorkRequest req) {
        Work w = new Work(req.title(), req.description(), req.mediaType(), req.url(), req.coverUrl());
        return toDto(workRepo.save(w));
    }

    @Transactional
    public WorkDTO update(Long id, WorkRequest req) {
        Work w = workRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work not found: " + id));
        w.setTitle(req.title());
        w.setDescription(req.description());
        w.setMediaType(req.mediaType());
        w.setUrl(req.url());
        w.setCoverUrl(req.coverUrl());
        return toDto(workRepo.save(w));
    }

    @Transactional
    public void delete(Long id) {
        if (!workRepo.existsById(id)) {
            throw new IllegalArgumentException("Work not found: " + id);
        }
        workRepo.deleteById(id);
    }

    private WorkDTO toDto(Work w) {
        return new WorkDTO(w.getId(), w.getTitle(), w.getDescription(), w.getMediaType(),
                w.getUrl(), w.getCoverUrl(), w.getCreatedAt());
    }
}
