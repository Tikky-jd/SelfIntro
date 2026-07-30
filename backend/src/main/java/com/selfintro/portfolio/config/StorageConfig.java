package com.selfintro.portfolio.config;

import com.selfintro.portfolio.service.CloudinaryStorageService;
import com.selfintro.portfolio.service.LocalStorageService;
import com.selfintro.portfolio.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    @Bean
    @ConditionalOnProperty(name = "storage.mode", havingValue = "cloudinary")
    public StorageService cloudinaryStorageService(
            @Value("${storage.cloudinary.cloud-name}") String cloudName,
            @Value("${storage.cloudinary.api-key}") String apiKey,
            @Value("${storage.cloudinary.api-secret}") String apiSecret) {
        return new CloudinaryStorageService(cloudName, apiKey, apiSecret);
    }

    @Bean
    @ConditionalOnProperty(name = "storage.mode", havingValue = "local", matchIfMissing = true)
    public StorageService localStorageService(@Value("${storage.upload-dir}") String uploadDir) {
        return new LocalStorageService(uploadDir);
    }
}
