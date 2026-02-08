package com.crm.backend.service;

import com.crm.backend.enums.Department;
import com.crm.backend.enums.ContactRole;

import com.crm.backend.dto.ContactDTO;
import com.crm.backend.dto.ContactIdNameDTO;
import com.crm.backend.exception.ResourceNotFoundException;
import com.crm.backend.model.Account;
import com.crm.backend.model.Contact;
import com.crm.backend.repository.AccountRepository;
import com.crm.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AccountRepository accountRepository;

    public Contact createContact(ContactDTO dto) {
        Account account = accountRepository.findByAccountId(dto.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + dto.getAccountId()));
    
        Contact contact = new Contact();
        mapDtoToEntity(dto, contact);
        contact.setAccount(account);
        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public List<ContactIdNameDTO> getAllContactIdsNames() {
        return contactRepository.findAllIdsNames();
    }

    public Optional<Contact> getContactById(Long contactId) {
        return contactRepository.findById(contactId);
    }

    public Contact updateContact(Long contactId, ContactDTO dto) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + dto.getAccountId()));
    
        Account account = accountRepository.findByAccountId(dto.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + dto.getAccountId()));
    
        mapDtoToEntity(dto, contact);
        contact.setAccount(account);
        return contactRepository.save(contact);
    }

    public void deleteContact(Long contactId) {
        if (!contactRepository.existsById(contactId)) {
            throw new ResourceNotFoundException("Contact not found with ID: " + contactId);
        }
        contactRepository.deleteById(contactId);
    }

    // private void mapDtoToEntity(ContactDTO dto, Contact contact) {
    //     contact.setFirstName(dto.getFirstName());
    //     contact.setLastName(dto.getLastName());
    //     contact.setEmail(dto.getEmail());
    //     contact.setPhone(dto.getPhone());
    //     contact.setDepartment(dto.getDepartment());
    //     contact.setContactStatus(dto.getContactStatus());
    //     contact.setRole(dto.getRole());
    //     contact.setNote(dto.getNote());
    //     contact.setBillingCountry(dto.getBillingCountry());
    //     contact.setBillingState(dto.getBillingState());
    //     contact.setBillingCity(dto.getBillingCity());
    //     contact.setBillingZipCode(dto.getBillingZipCode());
    //     contact.setBillingAddressLine1(dto.getBillingAddressLine1());
    //     contact.setBillingAddressLine2(dto.getBillingAddressLine2());
    //     contact.setShippingCountry(dto.getShippingCountry());
    //     contact.setShippingState(dto.getShippingState());
    //     contact.setShippingCity(dto.getShippingCity());
    //     contact.setShippingZipCode(dto.getShippingZipCode());
    //     contact.setShippingAddressLine1(dto.getShippingAddressLine1());
    //     contact.setShippingAddressLine2(dto.getShippingAddressLine2());
    //     contact.setIsPrimary(dto.getIsPrimary());
    // }
    private void mapDtoToEntity(ContactDTO dto, Contact contact) {

    contact.setFirstName(dto.getFirstName());
    contact.setLastName(dto.getLastName());
    contact.setEmail(dto.getEmail());
    contact.setPhone(dto.getPhone());

    if (dto.getDepartment() != null) {
        contact.setDepartment(Department.valueOf(dto.getDepartment().name()));
    }

    contact.setContactStatus(dto.getContactStatus());

    if (dto.getRole() != null) {
        contact.setRole(ContactRole.valueOf(dto.getRole().name()));
    }

    contact.setNote(dto.getNote());
    contact.setBillingCountry(dto.getBillingCountry());
    contact.setBillingState(dto.getBillingState());
    contact.setBillingCity(dto.getBillingCity());
    contact.setBillingZipCode(dto.getBillingZipCode());
    contact.setBillingAddressLine1(dto.getBillingAddressLine1());
    contact.setBillingAddressLine2(dto.getBillingAddressLine2());
    contact.setShippingCountry(dto.getShippingCountry());
    contact.setShippingState(dto.getShippingState());
    contact.setShippingCity(dto.getShippingCity());
    contact.setShippingZipCode(dto.getShippingZipCode());
    contact.setShippingAddressLine1(dto.getShippingAddressLine1());
    contact.setShippingAddressLine2(dto.getShippingAddressLine2());
    contact.setIsPrimary(dto.getIsPrimary());
}

    public void updateProfileImage(Long contactId, String fileName) {
    Contact contact = contactRepository.findById(contactId)
            .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + contactId));
    
    contact.setProfileImage(fileName);
    contactRepository.save(contact);
}

}