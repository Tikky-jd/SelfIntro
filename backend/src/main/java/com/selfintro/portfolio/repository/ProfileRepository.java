package com.selfintro.portfolio.repository;

import com.selfintro.portfolio.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
