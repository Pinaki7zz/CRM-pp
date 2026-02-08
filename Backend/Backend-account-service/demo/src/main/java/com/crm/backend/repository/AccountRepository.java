// package com.crm.backend.repository;

// import com.crm.backend.model.Account;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.Optional;
// import java.util.UUID;

// // Repository interface for Account CRUD.
// // Spring auto-implements methods like findById, save, deleteById.
// @Repository
// public interface AccountRepository extends JpaRepository<Account, UUID> {

//     // Custom finder for unique accountId (used in relations)
//     Optional<Account> findByAccountId(String accountId);
// }

package com.crm.backend.repository;

import com.crm.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

// Repository interface for Account CRUD.
// Spring auto-implements methods like findById, save, deleteById.
@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    // Custom finder for unique accountId (used in relations and GET/UPDATE/DELETE)
    Optional<Account> findByAccountId(String accountId);

    // Find by name of the account
    Optional<Account> findFirstByNameIgnoreCase(String name);

    // Custom delete by accountId for DELETE operation
    void deleteByAccountId(String accountId);
}
