package com.galvinusanalytics.backend_at.dto.module;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeadDataDTO {
    // Basic Information
    private String leadId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String secondaryEmail;
    private String fax;
    private String website;
    private String title;
    private String company;
    
    // Lead Qualification
    private String leadSource;
    private String leadStatus;
    private String interestLevel;
    private String stage;
    private Double budget;
    private Double potentialRevenue;
    
    // Location Information
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String zipcode;
    
    // Ownership & Timestamps
    private String leadOwner;
    private String createdBy;
    private String lastModifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private LocalDateTime lastInteractionDate;
    
    // Interaction Tracking
    private String interactionType;
    private String interactionOutcome;
    private String interactionNote;
    
    // Related Entities
    private String accountId;
    private String contactId;
    
    // Additional notes
    private String notes;
}
