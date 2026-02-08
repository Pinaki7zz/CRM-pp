package com.galvinus.crm.user_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "work_center")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class WorkCenter {
	@Id
	@Column(name = "work_center_id", unique = true, nullable = false)
	private String workCenterId; // e.g. "SALES", "HR"

	@Column(name = "work_center_name")
	private String workCenterName; // e.g. "Sales Management", "Human Resources"

	@CreationTimestamp // Automatically set when entity is created
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp // Automatically updated on every update
	@Column(name = "updated_at")
	private Instant updatedAt;

	@OneToMany(mappedBy = "workCenter")
	private List<WorkCenterView> workCenterViews;

	public WorkCenter(String workCenterId, String workCenterName, Instant createdAt, Instant updatedAt) {
		this.workCenterId = workCenterId;
		this.workCenterName = workCenterName;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
}
