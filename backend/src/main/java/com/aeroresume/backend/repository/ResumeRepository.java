package com.aeroresume.backend.repository;

import com.aeroresume.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    // JpaRepository gives us findAll().
    java.util.Optional<Resume> findByUserIdAndTemplateId(Long userId, Long templateId);
}
