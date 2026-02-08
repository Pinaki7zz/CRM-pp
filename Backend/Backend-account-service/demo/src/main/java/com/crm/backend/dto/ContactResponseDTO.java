package com.crm.backend.dto;

import com.crm.backend.enums.Department;
import com.crm.backend.enums.ContactRole;
import com.crm.backend.model.Contact;
import java.time.LocalDateTime; // Import LocalDateTime

public class ContactResponseDTO {

    private Long contactId;
    private String accountId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Department department;
    private String contactStatus;
    private ContactRole role;
    private String note;
    private String profileImage; // New Image Field

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

    private Boolean isPrimary;
    
    // Timestamps for sorting/display
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContactResponseDTO() {}

    // Static factory method
    public static ContactResponseDTO fromEntity(Contact contact) {
        ContactResponseDTO dto = new ContactResponseDTO();
        
        dto.contactId = contact.getContactId();
        // Check for null account to prevent NullPointerException
        if (contact.getAccount() != null) {
            dto.accountId = contact.getAccount().getAccountId();
        }
        
        dto.firstName = contact.getFirstName();
        dto.lastName = contact.getLastName();
        dto.email = contact.getEmail();
        dto.phone = contact.getPhone();
        dto.department = contact.getDepartment();
        dto.contactStatus = contact.getContactStatus();
        dto.role = contact.getRole();
        dto.note = contact.getNote();
        dto.profileImage = contact.getProfileImage(); // Map Image

        dto.billingCountry = contact.getBillingCountry();
        dto.billingState = contact.getBillingState();
        dto.billingCity = contact.getBillingCity();
        dto.billingZipCode = contact.getBillingZipCode();
        dto.billingAddressLine1 = contact.getBillingAddressLine1();
        dto.billingAddressLine2 = contact.getBillingAddressLine2();

        dto.shippingCountry = contact.getShippingCountry();
        dto.shippingState = contact.getShippingState();
        dto.shippingCity = contact.getShippingCity();
        dto.shippingZipCode = contact.getShippingZipCode();
        dto.shippingAddressLine1 = contact.getShippingAddressLine1();
        dto.shippingAddressLine2 = contact.getShippingAddressLine2();

        dto.isPrimary = contact.getIsPrimary();
        dto.createdAt = contact.getCreatedAt();
        dto.updatedAt = contact.getUpdatedAt();
        
        return dto;
    }

    // --- GETTERS AND SETTERS ---

    public Long getContactId() { return contactId; }
    public void setContactId(Long contactId) { this.contactId = contactId; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getContactStatus() { return contactStatus; }
    public void setContactStatus(String contactStatus) { this.contactStatus = contactStatus; }

    public ContactRole getRole() { return role; }
    public void setRole(ContactRole role) { this.role = role; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

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

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}