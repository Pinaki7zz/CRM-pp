package com.galvinus.crm.user_management_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import com.galvinus.crm.user_management_backend.entities.BusinessRole;

@Repository
public interface BusinessRoleRepository extends JpaRepository<BusinessRole, UUID> {
	Optional<BusinessRole> findByBusinessRoleId(String businessRoleId);
}
