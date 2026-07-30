package com.selfintro.portfolio.service;

import com.selfintro.portfolio.dto.ProfileDTO;
import com.selfintro.portfolio.dto.ResumeItemDTO;
import com.selfintro.portfolio.entity.Profile;
import com.selfintro.portfolio.entity.ResumeItem;
import com.selfintro.portfolio.repository.ProfileRepository;
import com.selfintro.portfolio.repository.ResumeItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepo;
    private final ResumeItemRepository resumeRepo;

    public ProfileService(ProfileRepository profileRepo, ResumeItemRepository resumeRepo) {
        this.profileRepo = profileRepo;
        this.resumeRepo = resumeRepo;
    }

    public ProfileDTO getProfile() {
        Profile p = profileRepo.findById(1L).orElseGet(() -> profileRepo.save(new Profile()));
        return toDto(p, resumeRepo.findAllByOrderBySortOrderAsc());
    }

    @Transactional
    public ProfileDTO updateProfile(ProfileDTO dto) {
        Profile p = profileRepo.findById(1L).orElseGet(Profile::new);
        p.setId(1L);
        p.setName(dto.name());
        p.setHeadline(dto.headline());
        p.setAvatarUrl(dto.avatarUrl());
        p.setEmail(dto.email());
        p.setPhone(dto.phone());
        p.setLocation(dto.location());
        p.setAbout(dto.about());
        p.setSocials(dto.socials() == null ? new ArrayList<>() : dto.socials());
        profileRepo.save(p);

        resumeRepo.deleteAllInBatch();
        if (dto.resumeItems() != null) {
            int i = 0;
            for (ResumeItemDTO r : dto.resumeItems()) {
                ResumeItem item = new ResumeItem(
                        r.category(), r.title(), r.org(), r.description(),
                        r.startYear(), r.endYear(),
                        r.sortOrder() == null ? i : r.sortOrder());
                resumeRepo.save(item);
                i++;
            }
        }
        return getProfile();
    }

    private ProfileDTO toDto(Profile p, List<ResumeItem> items) {
        List<ResumeItemDTO> itemDtos = items.stream().map(it -> new ResumeItemDTO(
                it.getId(), it.getCategory(), it.getTitle(), it.getOrg(),
                it.getDescription(), it.getStartYear(), it.getEndYear(), it.getSortOrder()))
                .toList();
        return new ProfileDTO(
                p.getId(), p.getName(), p.getHeadline(), p.getAvatarUrl(),
                p.getEmail(), p.getPhone(), p.getLocation(), p.getAbout(),
                p.getSocials(), itemDtos);
    }
}
