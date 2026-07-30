package com.selfintro.portfolio.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(@Value("${storage.cloudinary.cloud-name}") String cloudName,
                                    @Value("${storage.cloudinary.api-key}") String apiKey,
                                    @Value("${storage.cloudinary.api-secret}") String apiSecret) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException(
                    "Cloudinary credentials are required when storage.mode=cloudinary. " +
                    "Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.");
        }
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return (String) result.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank()) return;
        try {
            String publicId = extractPublicId(url);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception ignored) {
        }
    }

    private String extractPublicId(String url) {
        // https://res.cloudinary.com/<cloud>/image/upload/v123/<publicId>.<ext>
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx < 0) return null;
        String tail = url.substring(uploadIdx + "/upload/".length());
        tail = tail.replaceFirst("^v\\d+/", "");
        int dot = tail.lastIndexOf('.');
        return dot > 0 ? tail.substring(0, dot) : tail;
    }
}
