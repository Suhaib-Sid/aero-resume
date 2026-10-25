package com.aeroresume.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.aeroresume.backend.dto.ResumeResponse;
import com.aeroresume.backend.model.Resume;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResumeMapper {
    ResumeResponse resumeToResumeResponse(Resume resume);
}
