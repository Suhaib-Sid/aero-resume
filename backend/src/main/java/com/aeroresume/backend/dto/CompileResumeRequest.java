package com.aeroresume.backend.dto;

public class CompileResumeRequest {
    
    private String resumeName;
    private String latexString;
    private boolean isFinalExport;
    private Long resumeId;
    private Long templateId;

    public CompileResumeRequest() {
    }

    public CompileResumeRequest(String resumeName, String latexString, boolean isFinalExport, Long resumeId, Long templateId) {
        this.resumeName = resumeName;
        this.latexString = latexString;
        this.isFinalExport = isFinalExport;
        this.resumeId = resumeId;
        this.templateId = templateId;
    }

    public String getResumeName() {
        return resumeName;
    }

    public void setResumeName(String resumeName) {
        this.resumeName = resumeName;
    }

    public String getLatexString() {
        return latexString;
    }

    public void setLatexString(String latexString) {
        this.latexString = latexString;
    }

    public boolean isFinalExport() {
        return isFinalExport;
    }

    public void setFinalExport(boolean finalExport) {
        isFinalExport = finalExport;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }
}
