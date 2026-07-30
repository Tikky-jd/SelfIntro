package com.selfintro.portfolio.repository;

import com.selfintro.portfolio.entity.ResumeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeItemRepository extends JpaRepository<ResumeItem, Long> {
    List<ResumeItem> findAllByOrderBySortOrderAsc();
}
