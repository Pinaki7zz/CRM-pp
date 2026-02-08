package com.galvinus.crm.user_management_backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.galvinus.crm.user_management_backend.entities.WorkCenterView;

public interface WorkCenterViewRepository extends JpaRepository<WorkCenterView, String> {

	Optional<WorkCenterView> findByWorkCenterViewId(String workCenterViewId);
}
