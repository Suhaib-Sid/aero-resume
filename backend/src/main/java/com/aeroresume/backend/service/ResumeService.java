package com.aeroresume.backend.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.aeroresume.backend.model.Resume;
import com.aeroresume.backend.model.Template;
import com.aeroresume.backend.model.User;
import com.aeroresume.backend.repository.ResumeRepository;
import com.aeroresume.backend.repository.TemplateRepository;
import com.aeroresume.backend.repository.UserRepository;

@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);

    private final String tempWorkspacePath;
    private final String permanentStoragePath;

    private ResumeRepository resumeRepository;
    private TemplateRepository templateRepository;
    private UserRepository userRepository;

    public ResumeService(@Value("${resume.storage.temp-workspace}") String tempWorkspacePath, 
                        @Value("${resume.storage.permanentPath}") String permanentStoragePath,
                        ResumeRepository resumeRepository,
                        TemplateRepository templateRepository,
                        UserRepository userRepository) {
        this.tempWorkspacePath = tempWorkspacePath;
        this.permanentStoragePath = permanentStoragePath;
        this.resumeRepository = resumeRepository;
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    /**
     * Compiles LaTeX code into a PDF. 
     * * @param latexCode     The raw LaTeX string from the frontend
     * @param userId        The ID of the user compiling the resume (for folder organization)
     * @param isFinalExport True if the user clicked "Download", False if they clicked "Compile/Preview"
     * @param resumeId      The ID of the resume (used for naming the final export file)
     * @return              The binary bytes of the generated PDF
     */
    public byte[] compileResume(String latexString, boolean isFinalExport, Long userId, Long resumeId, String resumeName, Long templateId) {

        String runId = UUID.randomUUID().toString();
        Path userWorkspace = Path.of(tempWorkspacePath, String.valueOf(userId));

        Path texFilePath = userWorkspace.resolve(runId + ".tex");
        Path pdfFilePath = userWorkspace.resolve(runId + ".pdf");

        // Other noisy files that might be generated during compilation. Tracking them for cleanup.
        Path logFilePath = userWorkspace.resolve(runId + ".log");
        Path auxFilePath = userWorkspace.resolve(runId + ".aux");
        Path outFilePath = userWorkspace.resolve(runId + ".out");

        Boolean compilationSuccess = false; // Track if compilation was successful for cleanup purposes

        try {
        
            // Create the user temp workspace directory if it doesn't exist
            Files.createDirectories(userWorkspace);

            // Write the LaTeX string to the .tex file
            Files.writeString(texFilePath, latexString);

            log.info("Starting LaTeX compilation for userId: {} on Run: {}", userId, runId);

            // Compile the LaTeX file to PDF using pdflatex
            ProcessBuilder processBuilder = new ProcessBuilder(
                "pdflatex",
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-output-directory=" + userWorkspace.toAbsolutePath(),
                texFilePath.toAbsolutePath().toString()
            );

            processBuilder.redirectErrorStream(true); // Merge stdout and stderr i.e. Redirect error stream to standard output to avoid blocking
            
            Process process;
            try{
                process = processBuilder.start();
            }
            catch(Exception e){
                log.error("Failed to start pdflatex process for userId: {} on Run: {}. Error: {}", userId, runId, e.getMessage(), e);
                throw new RuntimeException("Failed to start LaTeX compilation process: " + e.getMessage(), e);
            }

            boolean finalInTime = process.waitFor(10, TimeUnit.SECONDS); // Wait for the process to complete with a 10-second timeout

            if(!finalInTime) {
                process.destroyForcibly(); // Kill the process if it didn't finish in time
                log.error("LaTeX compilation timed out for userId: {} on Run: {}", userId, runId);
                throw new RuntimeException("LaTeX compilation timed out.");
            }

            compilationSuccess = process.exitValue() == 0;
            if(!compilationSuccess) {
                String errorOutput = Files.readString(logFilePath);
                log.error("LaTeX compilation failed for userId: {} on Run: {}. Error: {}", userId, runId, errorOutput);
                throw new RuntimeException("LaTeX compilation failed. Check log file for details.");
            }

            log.info("LaTex compilation succcessful for userId: {} on Run: {} for ResumeID: {}", userId, runId, resumeId);

            byte[] pdfBytes = Files.readAllBytes(pdfFilePath);

            Resume resume = null;
            if(resumeId > -1) {
                resume = resumeRepository.findById(resumeId).orElseThrow(() -> new RuntimeException("Resume not found."));
                resume.setLatexContent(latexString);
                resume.setTemplate(templateRepository.findById(templateId).orElse(null));
                resumeRepository.save(resume);
                log.info("Resume entity updated with LaTeX content and template for resumeId: {}", resumeId);
            } else {
                resume = new Resume();
                resume.setName(resumeName);
                resume.setLatexContent(latexString);
                resume.setTemplate(templateRepository.findById(templateId).orElse(null));
                resume.setUser(userRepository.findById(userId).orElse(null));
                resume = resumeRepository.save(resume);
                log.info("New Resume entity created with LaTeX content and template for userId: {}", userId);
            }

            if(isFinalExport) {
                // Move the PDF to permanent storage
                persistPdf(pdfFilePath, userId, resumeId);
                log.info("Final PDF persisted succesfully for userId: {} on Run: {} for ResumeID: {}", userId, runId, resumeId);
            }
            
            return pdfBytes;

        } catch (Exception e) {
            log.error("Error during LaTeX compilation for userId: {} on Run: {}. Error: {}", userId, runId, e.getMessage(), e);
            Thread.currentThread().interrupt(); // Restore interrupted status
            throw new RuntimeException("Error during LaTeX compilation: " + e.getMessage(), e);
        } finally {
            // Cleanup temporary files
            deleteIfExists(texFilePath);
            if(compilationSuccess) {
                deleteIfExists(logFilePath);
            }
            deleteIfExists(auxFilePath);
            deleteIfExists(outFilePath);
            deleteIfExists(pdfFilePath);
            deleteIfExists(userWorkspace);
            
            log.info("Temporary files cleaned up for userId: {} on Run: {}", userId, runId);
        }
    }

    private void deleteIfExists(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (Exception e) {
            log.warn("Failed to delete temp file: {}. This may cause a minor storage leak over time. Error: {}", path, e.getMessage(), e);
        }
    }

    private void persistPdf(Path pdfFilePath, Long userId, Long resumeId) {
        
        Path userPermanentStorage = Path.of(permanentStoragePath, String.valueOf(userId));

        if(!Files.exists(userPermanentStorage)) {
            try {
                Files.createDirectories(userPermanentStorage);
                log.info("Created permanent storage directory for userId: {}", userId);
            } catch (Exception e) {
                log.error("Failed to create permanent storage directory for userId: {}. Error: {}", userId, e.getMessage(), e);
                throw new RuntimeException("Failed to create permanent storage directory: " + e.getMessage(), e);
            }
        }

        Path finalPdfFile = userPermanentStorage.resolve(resumeId.toString() + ".pdf");

        try {
            Files.move(pdfFilePath, finalPdfFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("PDF successfully moved to permanent storage for userId: {}, resumeId: {}", userId, resumeId);
        }
        catch(Exception e) {
            log.error("Failed to move PDF to permanent storage for userId: {}, resumeId: {}. Error: {}", userId, resumeId, e.getMessage(), e);
            throw new RuntimeException("Failed to move PDF to permanent storage: " + e.getMessage(), e);
        }

        Resume resume = resumeRepository.findById(resumeId).orElseThrow(() -> new RuntimeException("Resume not found for id: " + resumeId));
        resume.setFinalExportUrl(finalPdfFile.toAbsolutePath().toString());
        resumeRepository.save(resume);
        log.info("Resume entity updated with final export URL for resumeId: {}", resumeId);

    }

    public String getLatex(Long userId, Long templateId) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found for id: " + templateId));
        
        String latexString = template.getLatexBoilerplate();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for id: " + userId));

        // Replace placeholders in the LaTeX boilerplate with user data
        
        return latexString;
    }
}
