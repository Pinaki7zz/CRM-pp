 

package com.crm.backend.dto;

import java.util.List;

public class AccountSummaryDTO {
    private String accountId;
    private String name;
    private String billingCountry;
    private String billingState;
    private String billingCity;
    private String billingZipCode;
    private String billingAddressLine1;
    private String shippingCountry;
    private String shippingState;
    private String shippingCity;
    private String shippingZipCode;
    private String shippingAddressLine1;
    private List<ContactSummaryDTO> contacts;

    // Nested ContactSummaryDTO
    public static class ContactSummaryDTO {
        private String contactId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private Boolean isPrimary;

        // Getters and Setters
        public String getContactId() { return contactId; }
        public void setContactId(String contactId) { this.contactId = contactId; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }

    // Getters and Setters
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

    public List<ContactSummaryDTO> getContacts() { return contacts; }
    public void setContacts(List<ContactSummaryDTO> contacts) { this.contacts = contacts; }
}