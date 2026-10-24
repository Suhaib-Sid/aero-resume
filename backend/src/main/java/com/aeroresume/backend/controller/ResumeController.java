package com.aeroresume.backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aeroresume.backend.dto.CompileResumeRequest;
import com.aeroresume.backend.security.CustomUserDetails;
import com.aeroresume.backend.service.ResumeService;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/compile")
    public ResponseEntity<byte[]> compileResume(@RequestBody CompileResumeRequest request, @AuthenticationPrincipal CustomUserDetails userDetail) {
        Long userId = userDetail.getId();

        byte[] pdfBytes = resumeService.compileResume(
            request.getLatexString(),
            request.isFinalExport(),
            userId,
            request.getResumeId(),
            request.getResumeName(),
            request.getTemplateId()
        );
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename="+request.getResumeName().trim()+".pdf")
                .body(pdfBytes);

    }

    @PostMapping("/latex")
    public String getLatexString(@AuthenticationPrincipal CustomUserDetails userDetail, @RequestParam Long templateId) {
        Long userId = userDetail.getId();
        return resumeService.getLatex(userId, templateId);
    }
}