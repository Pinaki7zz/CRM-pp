package com.galvinus.crm.user_management_backend.dtos.authDtos;

import com.galvinus.crm.user_management_backend.dtos.ValidationGroups;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequestDto {
	@NotBlank(message = "Username, temporary password, and new password is required", groups = ValidationGroups.BasicChecks.class)
	@Pattern(regexp = "^(?=.*[a-z])(?=.*\\d).+$", message = "Username must include lowercase letters followed by 3-digit number", groups = ValidationGroups.AdvancedChecks.class)
	private String username;

	@NotBlank(message = "Username, temporary password, and new password is required", groups = ValidationGroups.BasicChecks.class)
	private String tempPassword;

	@NotBlank(message = "Username, temporary password, and new password is required", groups = ValidationGroups.BasicChecks.class)
	@Size(min = 8, message = "Password must be at least 8 characters long", groups = ValidationGroups.AdvancedChecks.class)
	@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$", message = "Password must include uppercase, lowercase, number, and special character", groups = ValidationGroups.AdvancedChecks.class)
	private String password;

	@AssertTrue(message = "You must accept Terms & Conditions to proceed", groups = ValidationGroups.AdvancedChecks.class)
	private boolean termsAccepted;
}
