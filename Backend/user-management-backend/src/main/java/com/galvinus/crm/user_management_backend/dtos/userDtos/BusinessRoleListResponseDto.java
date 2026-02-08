package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.entities.BusinessRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class BusinessRoleListResponseDto {
	private UUID id;
	private String businessRoleId;
	private String businessRoleName;
	private BusinessRole.Status status;
	private boolean isObsolete;
	private Instant createdAt;
}
