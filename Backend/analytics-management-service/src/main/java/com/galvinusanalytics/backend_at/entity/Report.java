package com.galvinusanalytics.backend_at.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String reportName;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String module; // Lead, Account, Opportunity, Contact, etc.
    
    @Column(nullable = false)
    private String userId;
    
    @Column(name = "folder_id")
    private Long folderId;
    
    @Column(columnDefinition = "TEXT")
    private String filters; // JSON string of filter configurations
    
    @Column(columnDefinition = "TEXT")
    private String groups; // JSON string of group configurations
    
    @Column(columnDefinition = "TEXT")
    private String columns; // JSON string of column configurations
    
    @Column(columnDefinition = "TEXT")
    private String charts; // JSON string of chart configurations
    
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'PRIVATE'")
    private String visibility; // PRIVATE, SHARED, PUBLIC
    
    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isFavourite = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_run_at")
    private LocalDateTime lastRunAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isFavourite == null) {
            isFavourite = false;
        }
        if (visibility == null) {
            visibility = "PRIVATE";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
