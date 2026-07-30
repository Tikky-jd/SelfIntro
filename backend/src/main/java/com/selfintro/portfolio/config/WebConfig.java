package com.selfintro.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${storage.mode}")
    private String storageMode;

    @Value("${storage.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if ("local".equals(storageMode)) {
            String abs = Paths.get(uploadDir).toAbsolutePath().toString();
            registry.addResourceHandler("/files/**")
                    .addResourceLocations("file:" + abs + "/");
        }
    }
}
