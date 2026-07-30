package com.selfintro.portfolio.controller;

import com.selfintro.portfolio.dto.ProfileDTO;
import com.selfintro.portfolio.service.ProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileDTO getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    public ProfileDTO updateProfile(@RequestBody ProfileDTO dto) {
        return profileService.updateProfile(dto);
    }
}
