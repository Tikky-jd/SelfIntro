package com.selfintro.portfolio.repository;

import com.selfintro.portfolio.entity.Work;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkRepository extends JpaRepository<Work, Long> {
    List<Work> findAllByOrderByCreatedAtDesc();
}
