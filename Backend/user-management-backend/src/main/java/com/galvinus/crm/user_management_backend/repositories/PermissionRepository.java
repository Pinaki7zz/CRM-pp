package com.galvinus.crm.user_management_backend.repositories;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.galvinus.crm.user_management_backend.entities.Permission;
import com.galvinus.crm.user_management_backend.entities.BusinessRole;
import com.galvinus.crm.user_management_backend.entities.WorkCenterView;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

	List<Permission> findByBusinessRole(BusinessRole businessRole);

	List<Permission> findByWorkCenterView(WorkCenterView workCenterView);

	Optional<Permission> findByBusinessRoleAndWorkCenterView(BusinessRole businessRole, WorkCenterView workCenterView);
}