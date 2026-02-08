package com.crm.backend.dto;

public class ContactIdNameDTO {

    private Long contactId;
    private String accountId;
    private String firstName;
    private String lastName;
    private Boolean isPrimary;

    public ContactIdNameDTO(Long contactId, String accountId, String firstName, String lastName, Boolean isPrimary) {
        this.contactId = contactId;
        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isPrimary = isPrimary;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}