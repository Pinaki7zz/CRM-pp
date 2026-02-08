package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.entities.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EmployeeListResponseDto {
	private UUID id;
	private String userId;
	private String firstName;
	private String lastName;
	private String username;
	private String email;
	private String phone;
	private String personalStreet;
	private User.UserStatus status;
	private UUID businessRoleId;
	private String businessRoleName;
	private Instant createdAt;
}
