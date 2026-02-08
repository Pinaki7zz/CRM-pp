package com.galvinusanalytics.backend_at.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_tiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardTile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dashboard_id", nullable = false)
    private Long dashboardId;
    
    @Column(name = "report_id")
    private Long reportId;
    
    @Column(name = "folder_id")
    private Long folderId;
    
    @Column(name = "chart_type", length = 50)
    private String chartType; // bar, line, pie, donut
    
    @Column(name = "y_axis")
    private String yAxis;
    
    @Column(name = "x_axis")
    private String xAxis;
    
    @Column(name = "x_range_mode", length = 20)
    private String xRangeMode; // automatic, custom
    
    @Column(name = "x_min")
    private String xMin;
    
    @Column(name = "x_max")
    private String xMax;
    
    @Column(name = "tile_order")
    private Integer tileOrder;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
