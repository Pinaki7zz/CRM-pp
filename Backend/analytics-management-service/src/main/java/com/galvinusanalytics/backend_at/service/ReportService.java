package com.galvinusanalytics.backend_at.service;

import com.galvinusanalytics.backend_at.dto.ReportDTO;
import com.galvinusanalytics.backend_at.entity.Report;
import com.galvinusanalytics.backend_at.entity.Folder;
import com.galvinusanalytics.backend_at.exception.ValidationException;
import com.galvinusanalytics.backend_at.repository.ReportRepository;
import com.galvinusanalytics.backend_at.repository.FolderRepository;
import com.galvinusanalytics.backend_at.validator.ReportValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final ReportRepository reportRepository;
    private final ReportValidator reportValidator;
    private final FolderRepository folderRepository;

    @Transactional
    public ReportDTO createReport(ReportDTO reportDTO, String userId) {
        List<String> errors = reportValidator.validateReportCreation(reportDTO);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("Report validation failed", errors);
        }
        
        errors = reportValidator.validateUserId(userId);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        Report report = new Report();
        report.setReportName(reportDTO.getReportName().trim());
        report.setDescription(reportDTO.getDescription() != null ? reportDTO.getDescription().trim() : "");
        report.setModule(reportDTO.getModule());
        report.setUserId(userId);
        report.setFolderId(reportDTO.getFolderId());
        report.setFilters(reportDTO.getFilters());
        report.setGroups(reportDTO.getGroups());
        report.setColumns(reportDTO.getColumns());
        report.setCharts(reportDTO.getCharts());
        report.setVisibility("PRIVATE");
        report.setIsFavourite(false);
        
        Report savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getAllReportsByUser(String userId) {
        List<String> errors = reportValidator.validateUserId(userId);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getFavouriteReports(String userId) {
        List<String> errors = reportValidator.validateUserId(userId);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return reportRepository.findFavouriteReportsByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getReportsByFolder(Long folderId) {
        return reportRepository.findByFolderIdOrderByCreatedAtDesc(folderId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getReportsByModule(String userId, String module) {
        return reportRepository.findByUserIdAndModuleOrderByCreatedAtDesc(userId, module)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getPrivateReports(String userId) {
        return reportRepository.findPrivateReportsByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> getPublicReports() {
        return reportRepository.findPublicReports()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ReportDTO getReportById(Long reportId, String userId) {
        List<String> errors = reportValidator.validateReportId(reportId);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("Report ID validation failed", errors);
        }
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        
        if (!report.getUserId().equals(userId) && !report.getVisibility().equals("PUBLIC")) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        return convertToDTO(report);
    }
    
    @Transactional
    public ReportDTO updateReport(Long reportId, ReportDTO reportDTO, String userId) {
        List<String> errors = reportValidator.validateReportId(reportId);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("Report ID validation failed", errors);
        }
        
        errors = reportValidator.validateReportUpdate(reportDTO);
        if (reportValidator.hasErrors(errors)) {
            throw new ValidationException("Report validation failed", errors);
        }
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        
        if (!report.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        report.setReportName(reportDTO.getReportName().trim());
        report.setDescription(reportDTO.getDescription() != null ? reportDTO.getDescription().trim() : "");
        report.setFolderId(reportDTO.getFolderId());
        report.setFilters(reportDTO.getFilters());
        report.setGroups(reportDTO.getGroups());
        report.setColumns(reportDTO.getColumns());
        report.setCharts(reportDTO.getCharts());
        
        if (reportDTO.getVisibility() != null) {
            report.setVisibility(reportDTO.getVisibility().toUpperCase());
        }
        
        Report updatedReport = reportRepository.save(report);
        return convertToDTO(updatedReport);
    }
    
    @Transactional
    public ReportDTO runReport(Long reportId, String userId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        
        if (!report.getUserId().equals(userId) && !report.getVisibility().equals("PUBLIC")) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        report.setLastRunAt(LocalDateTime.now());
        Report updatedReport = reportRepository.save(report);
        return convertToDTO(updatedReport);
    }
    
    @Transactional
    public ReportDTO toggleFavourite(Long reportId, String userId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        
        if (!report.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        report.setIsFavourite(!report.getIsFavourite());
        Report updatedReport = reportRepository.save(report);
        return convertToDTO(updatedReport);
    }
    
    @Transactional
    public void deleteReport(Long reportId, String userId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        
        if (!report.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        reportRepository.delete(report);
    }
    
    @Transactional(readOnly = true)
    public List<ReportDTO> searchReports(String userId, String searchTerm) {
        return reportRepository.searchReportsByName(userId, searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ReportDTO convertToDTO(Report report) {
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setReportName(report.getReportName());
        dto.setDescription(report.getDescription());
        dto.setModule(report.getModule());
        dto.setFolderId(report.getFolderId());

        // Lookup folder name with proper null handling
        if (report.getFolderId() != null) {
            try {
                folderRepository.findById(report.getFolderId())
                        .ifPresentOrElse(
                            folder -> {
                                dto.setFolderName(folder.getName());
                                log.debug("Report ID {} mapped to folder: {}", report.getId(), folder.getName());
                            },
                            () -> {
                                log.warn("Report ID {} has folderId {} but folder not found", 
                                        report.getId(), report.getFolderId());
                                dto.setFolderName("");
                            }
                        );
            } catch (Exception e) {
                log.error("Error looking up folder for report ID {}: {}", report.getId(), e.getMessage());
                dto.setFolderName("");
            }
        } else {
            log.debug("Report ID {} has no folder assigned", report.getId());
            dto.setFolderName("");
        }

        dto.setFilters(report.getFilters());
        dto.setGroups(report.getGroups());
        dto.setColumns(report.getColumns());
        dto.setCharts(report.getCharts());
        dto.setVisibility(report.getVisibility());
        dto.setIsFavourite(report.getIsFavourite());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        dto.setLastRunAt(report.getLastRunAt());
        dto.setCreatedBy(report.getUserId());
        
        return dto;
    }
}
