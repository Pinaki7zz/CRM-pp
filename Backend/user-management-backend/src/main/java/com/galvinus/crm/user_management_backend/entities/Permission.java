package com.galvinus.crm.user_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "permission", uniqueConstraints = @UniqueConstraint(name = "unique_businessRoleId_workCenterViewId", columnNames = {
		"business_role_id", "work_center_view_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Permission {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "business_role_id", referencedColumnName = "id")
	private BusinessRole businessRole;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "work_center_view_id", referencedColumnName = "work_center_view_id")
	private WorkCenterView workCenterView;

	@Column(name = "read_access", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean readAccess;

	@Column(name = "write_access", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean writeAccess;

	@Column(name = "update_access", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean updateAccess;

	@Column(name = "delete_access", columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean deleteAccess;

	@Column(name = "access_content")
	private String accessContent;

	@Column(name = "access_restriction")
	private String accessRestriction;

	@Column(name = "business_context")
	private String businessContext;

	@Column(name = "ui_text")
	private String uiText;

	@CreationTimestamp // Automatically set when entity is created
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp // Automatically updated on every update
	@Column(name = "updated_at")
	private Instant updatedAt;
}