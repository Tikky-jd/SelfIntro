package com.selfintro.portfolio.controller;

import com.selfintro.portfolio.dto.UploadResponse;
import com.selfintro.portfolio.service.StorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping
    public UploadResponse upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String url = storageService.store(file);
        return new UploadResponse(url);
    }
}
