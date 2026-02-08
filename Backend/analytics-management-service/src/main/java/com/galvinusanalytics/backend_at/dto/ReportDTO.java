package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    
    private Long id;
    private String reportName;
    private String description;
    private String module;
    private Long folderId;
    private String folderName; // populated in ReportService.convertToDTO
    private String filters;
    private String groups;
    private String columns;
    private String charts;
    private String visibility;
    private Boolean isFavourite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastRunAt;
    private String createdBy;
}
