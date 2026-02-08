
// package com.crm.backend.dto;

// import com.crm.backend.enums.AccountType;
// import com.crm.backend.enums.Industry;
// import lombok.Data;

// // DTO for updating an account (similar to create, but partial fields allowed).
// @Data
// public class AccountUpdateDTO {

//     private String name;
//     private AccountType type;
//     private String ownerId;
//     private String website;
//     private Industry industry;
//     private String parentAccountId;  // Can be null to disconnect
//     private String note;

//     // Billing
//     private String billingCountry;
//     private String billingState;
//     private String billingCity;
//     private String billingZipCode;
//     private String billingAddressLine1;
//     private String billingAddressLine2;

//     // Shipping
//     private String shippingCountry;
//     private String shippingState;
//     private String shippingCity;
//     private String shippingZipCode;
//     private String shippingAddressLine1;
//     private String shippingAddressLine2;
// }

package com.crm.backend.dto;

import com.crm.backend.enums.AccountType;
import com.crm.backend.enums.Industry;

public class AccountUpdateDTO {
    private String name;
    private AccountType type;
    private String ownerId;
    private String website;
    private Industry industry;
    private String parentAccountId;
    private String note;
    private String accountStatus;

    private String billingCountry;
    private String billingState;
    private String billingCity;
    private String billingZipCode;
    private String billingAddressLine1;
    private String billingAddressLine2;

    private String shippingCountry;
    private String shippingState;
    private String shippingCity;
    private String shippingZipCode;
    private String shippingAddressLine1;
    private String shippingAddressLine2;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AccountType getType() { return type; }
    public void setType(AccountType type) { this.type = type; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Industry getIndustry() { return industry; }
    public void setIndustry(Industry industry) { this.industry = industry; }

    public String getParentAccountId() { return parentAccountId; }
    public void setParentAccountId(String parentAccountId) { this.parentAccountId = parentAccountId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getAccountStatus() { return accountStatus; }  
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getBillingCountry() { return billingCountry; }
    public void setBillingCountry(String billingCountry) { this.billingCountry = billingCountry; }

    public String getBillingState() { return billingState; }
    public void setBillingState(String billingState) { this.billingState = billingState; }

    public String getBillingCity() { return billingCity; }
    public void setBillingCity(String billingCity) { this.billingCity = billingCity; }

    public String getBillingZipCode() { return billingZipCode; }
    public void setBillingZipCode(String billingZipCode) { this.billingZipCode = billingZipCode; }

    public String getBillingAddressLine1() { return billingAddressLine1; }
    public void setBillingAddressLine1(String billingAddressLine1) { this.billingAddressLine1 = billingAddressLine1; }

    public String getBillingAddressLine2() { return billingAddressLine2; }
    public void setBillingAddressLine2(String billingAddressLine2) { this.billingAddressLine2 = billingAddressLine2; }

    public String getShippingCountry() { return shippingCountry; }
    public void setShippingCountry(String shippingCountry) { this.shippingCountry = shippingCountry; }

    public String getShippingState() { return shippingState; }
    public void setShippingState(String shippingState) { this.shippingState = shippingState; }

    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }

    public String getShippingZipCode() { return shippingZipCode; }
    public void setShippingZipCode(String shippingZipCode) { this.shippingZipCode = shippingZipCode; }

    public String getShippingAddressLine1() { return shippingAddressLine1; }
    public void setShippingAddressLine1(String shippingAddressLine1) { this.shippingAddressLine1 = shippingAddressLine1; }

    public String getShippingAddressLine2() { return shippingAddressLine2; }
    public void setShippingAddressLine2(String shippingAddressLine2) { this.shippingAddressLine2 = shippingAddressLine2; }
}