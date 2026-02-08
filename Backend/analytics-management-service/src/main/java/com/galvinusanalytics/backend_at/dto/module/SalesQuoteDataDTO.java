package com.galvinusanalytics.backend_at.dto.module;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesQuoteDataDTO {
    private String id;
    private String quoteId;
    private String quoteOwnerId;
    private String opportunityId;
    private String accountId;
    private String primaryContactId;
    private String subject;
    private Double amount;
    private Integer successRate;
    private LocalDateTime dueDate;
    private String status;
    
    // Billing Address
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingCountry;
    private String billingPostalCode;
    
    // Shipping Address
    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingCountry;
    private String shippingPostalCode;
    
    private String description;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Nested opportunity data
    private OpportunityInfo opportunity;
    private List<Object> items;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OpportunityInfo {
        private String id;
        private String name;
    }
}
