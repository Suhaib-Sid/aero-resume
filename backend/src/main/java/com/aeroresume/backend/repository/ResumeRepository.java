package com.aeroresume.backend.repository;

import com.aeroresume.backend.model.Resume;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    // JpaRepository gives us findAll().
    Optional<Resume> findByUserIdAndTemplateId(Long userId, Long templateId);

    Optional<Resume> findByIdAndUserId(Long id, Long userId);
}
