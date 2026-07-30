package com.selfintro.portfolio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final Path uploadDir;

    public LocalStorageService(@Value("${storage.upload-dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory", e);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(filename));
        return "/files/" + filename;
    }

    @Override
    public void delete(String url) {
        if (url == null || !url.startsWith("/files/")) return;
        try {
            Files.deleteIfExists(uploadDir.resolve(Paths.get(url).getFileName().toString()));
        } catch (IOException ignored) {
        }
    }

    private String getExtension(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        return idx >= 0 ? name.substring(idx).toLowerCase() : "";
    }
}
