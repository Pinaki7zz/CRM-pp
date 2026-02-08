package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    
    private Long id;
    private String name;
    private String description;
    private Long folderId;
    private String folderName;
    private String visibility;
    private Boolean isFavourite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private List<DashboardTileDTO> tiles;
}
