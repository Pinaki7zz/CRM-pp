package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardTileDTO {
    
    private Long id;
    private Long dashboardId;
    private Long reportId;
    private String reportName;
    private Long folderId;
    private String folderName;
    private String chartType;
    private String yAxis;
    private String xAxis;
    private String xRangeMode;
    private String xMin;
    private String xMax;
    private Integer tileOrder;
}
