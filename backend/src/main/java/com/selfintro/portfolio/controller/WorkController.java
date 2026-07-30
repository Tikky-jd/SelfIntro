package com.selfintro.portfolio.controller;

import com.selfintro.portfolio.dto.WorkDTO;
import com.selfintro.portfolio.dto.WorkRequest;
import com.selfintro.portfolio.service.WorkService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    @GetMapping
    public List<WorkDTO> list() {
        return workService.list();
    }

    @GetMapping("/{id}")
    public WorkDTO get(@PathVariable Long id) {
        return workService.get(id);
    }

    @PostMapping
    public WorkDTO create(@Valid @RequestBody WorkRequest request) {
        return workService.create(request);
    }

    @PutMapping("/{id}")
    public WorkDTO update(@PathVariable Long id, @Valid @RequestBody WorkRequest request) {
        return workService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workService.delete(id);
    }
}
