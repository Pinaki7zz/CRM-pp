package com.crm.backend.repository;

import com.crm.backend.dto.ContactIdNameDTO;
import com.crm.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    @Query("SELECT new com.crm.backend.dto.ContactIdNameDTO(c.contactId, c.account.accountId, c.firstName, c.lastName, c.isPrimary) FROM Contact c")
    List<ContactIdNameDTO> findAllIdsNames();

    // ✅ Add this method
    long countByAccount_AccountId(String accountId);
}
