package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderDTO {
    
    private Long id;
    private String name;
    private String description;
    private Boolean isFavourite;
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
