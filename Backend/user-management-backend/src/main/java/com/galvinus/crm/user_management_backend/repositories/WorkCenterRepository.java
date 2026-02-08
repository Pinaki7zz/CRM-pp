package com.galvinus.crm.user_management_backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.galvinus.crm.user_management_backend.entities.WorkCenter;

public interface WorkCenterRepository extends JpaRepository<WorkCenter, String> {

	Optional<WorkCenter> findByWorkCenterId(String workCenterId);

	Optional<WorkCenter> getReferenceByWorkCenterId(String workCenterId);
}
