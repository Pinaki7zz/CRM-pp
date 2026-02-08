package com.galvinusanalytics.backend_at.dto.module;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpportunityDataDTO {
    private String id;
    private String name;
    private String ownerId;
    private String accountId;
    private String primaryContactId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String stage;
    private Double amount;
    private String status;
    private String type;
    private Integer probability;
    private String leadSource;
    private String description;
    private String notes;
    private String contactName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
