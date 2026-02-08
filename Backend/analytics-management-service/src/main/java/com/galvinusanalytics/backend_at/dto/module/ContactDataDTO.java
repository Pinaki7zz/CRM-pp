package com.galvinusanalytics.backend_at.dto.module;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContactDataDTO {
    private String id;
    private String contactId;
    private String accountId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String role;
    private String note;
    
    // Billing Address
    private String billingCountry;
    private String billingState;
    private String billingCity;
    private String billingZipCode;
    private String billingAddressLine1;
    private String billingAddressLine2;
    
    // Shipping Address
    private String shippingCountry;
    private String shippingState;
    private String shippingCity;
    private String shippingZipCode;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Nested account data
    private AccountInfo account;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AccountInfo {
        private String accountId;
        private String name;
        private String type;
        private String website;
    }
}
