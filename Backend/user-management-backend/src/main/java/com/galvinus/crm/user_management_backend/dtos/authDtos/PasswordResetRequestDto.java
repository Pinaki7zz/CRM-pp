package com.galvinus.crm.user_management_backend.dtos.authDtos;

import com.galvinus.crm.user_management_backend.dtos.ValidationGroups;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDto {
	@NotBlank(message = "Email is required", groups = ValidationGroups.BasicChecks.class)
	@Email(message = "Invalid email format", groups = ValidationGroups.AdvancedChecks.class)
	private String email;
}
