package com.galvinusanalytics.backend_at.dto.module;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDataDTO {

    private String accountId;
    private String name;
    private String type;
    private String ownerId;
    private String website;
    private String industry;
    private String parentAccountId;
    private String note;

    // Billing
    private String billingCountry;
    private String billingState;
    private String billingCity;
    private String billingZipCode;
    private String billingAddressLine1;
    private String billingAddressLine2;

    // Shipping
    private String shippingCountry;
    private String shippingState;
    private String shippingCity;
    private String shippingZipCode;
    private String shippingAddressLine1;
    private String shippingAddressLine2;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
