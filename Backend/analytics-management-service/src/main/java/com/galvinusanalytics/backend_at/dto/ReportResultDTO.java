package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResultDTO {
    private List<String> columns;              // Column headers
    private List<Map<String, Object>> rows;    // Data rows
    private Integer totalRecords;              // Total number of records
    private String executedAt;                 // Timestamp of execution
}
