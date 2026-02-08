package com.galvinus.crm.user_management_backend.dtos.authDtos;

import com.galvinus.crm.user_management_backend.dtos.ValidationGroups;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetConfirmationRequestDto {
	@NotBlank(message = "Reset token is required", groups = ValidationGroups.BasicChecks.class)
	private String token;

	@NotBlank(message = "Password is required", groups = ValidationGroups.BasicChecks.class)
	@Size(min = 8, message = "Password must be at least 8 characters long", groups = ValidationGroups.AdvancedChecks.class)
	private String password;
}
