package com.selfintro.portfolio.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Abstraction over where uploaded media lives.
 * Two implementations: local disk (dev) and Cloudinary (prod).
 */
public interface StorageService {
    /** Store the file and return a publicly accessible URL. */
    String store(MultipartFile file) throws IOException;

    /** Best-effort delete of a previously stored URL. */
    void delete(String url);
}
