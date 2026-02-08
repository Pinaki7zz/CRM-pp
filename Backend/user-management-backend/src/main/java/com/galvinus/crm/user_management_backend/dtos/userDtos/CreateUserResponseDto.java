package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.entities.User;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CreateUserResponseDto {
	private UUID id;
	private String userId;
	private String firstName;
	private String lastName;
	private String username;
	private String email;
	private String phone;
	private String department;
	private String personalCountry;
	private String personalState;
	private String personalCity;
	private String personalStreet;
	private String personalPostalCode;
	private User.TimeZone timeZone;
	private User.UserStatus status;
	private UUID businessRoleId;
	private String businessRoleName;
	private Instant createdAt;
	private Instant updatedAt;
}
