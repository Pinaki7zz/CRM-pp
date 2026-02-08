package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportExecutionDTO {
    private String module;                      // "Lead", "Account", etc.
    private List<String> columns;               // Selected columns to display
    private List<String> groups;                // Grouping fields
    private Map<String, Object> filters;        // Applied filters
}
