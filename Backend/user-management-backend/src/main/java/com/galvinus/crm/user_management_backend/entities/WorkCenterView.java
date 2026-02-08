package com.galvinus.crm.user_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "work_center_view")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class WorkCenterView {
	@Id
	@Column(name = "work_center_view_id", unique = true, nullable = false)
	private String workCenterViewId; // e.g., "OPPORTUNITY_LIST"

	@Column(name = "work_center_view_name")
	private String workCenterViewName;

	@CreationTimestamp // Automatically set when entity is created
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp // Automatically updated on every update
	@Column(name = "updated_at")
	private Instant updatedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "work_center_id", referencedColumnName = "work_center_id")
	private WorkCenter workCenter;

	@OneToMany(mappedBy = "workCenterView")
	private List<Permission> permissions;

	public WorkCenterView(String workCenterViewId, String workCenterViewName,
			WorkCenter workCenter, Instant createdAt, Instant updatedAt) {
		this.workCenterViewId = workCenterViewId;
		this.workCenterViewName = workCenterViewName;
		this.workCenter = workCenter;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
}
