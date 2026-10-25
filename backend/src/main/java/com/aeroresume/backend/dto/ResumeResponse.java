package com.aeroresume.backend.dto;

public class ResumeResponse {
    private Long id;
    private String name;
    private String latexContent;
    private String finalExportUrl;

    public ResumeResponse() {}

    public ResumeResponse(Long id, String name, String latexContent, String finalExportUrl) {
        this.id = id;
        this.name = name;
        this.latexContent = latexContent;
        this.finalExportUrl = finalExportUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLatexContent() {
        return latexContent;
    }

    public void setLatexContent(String latexContent) {
        this.latexContent = latexContent;
    }

    public String getFinalExportUrl() {
        return finalExportUrl;
    }

    public void setFinalExportUrl(String finalExportUrl) {
        this.finalExportUrl = finalExportUrl;
    }
}
