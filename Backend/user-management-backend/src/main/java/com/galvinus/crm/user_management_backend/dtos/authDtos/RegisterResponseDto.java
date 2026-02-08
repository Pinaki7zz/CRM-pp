package com.galvinus.crm.user_management_backend.dtos.authDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.galvinus.crm.user_management_backend.entities.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponseDto {
	private UserResponseDto user;
	private String accessToken;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class UserResponseDto {
		private UUID id;
		private String userId;
		private String username;
		private String email;
		private String phone;
		private String firstName;
		private String lastName;
		private boolean mustChangePassword;
		private boolean rememberMe;
		private boolean termsAccepted;
		private BusinessRoleDto businessRole;
		private User.Language language;
		private String personalCountry;
		private String personalState;
		private String personalCity;
		private String personalStreet;
		private String personalPostalCode;
		private String companyCountry;
		private String companyState;
		private String companyCity;
		private String companyAddressLine1;
		private String companyAddressLine2;
		private String companyPostalCode;
		private User.TimeZone timeZone;
		private User.TimeFormat timeFormat;
		private User.DateFormat dateFormat;
		private User.UserStatus status;
		private String businessName;
		private String legalEntityType;
		private String department;
		private String job;
		private Instant createdAt;
		private Instant updatedAt;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class BusinessRoleDto {
		private UUID id;
		private String businessRoleName;
		private List<String> permissions;
	}
}
