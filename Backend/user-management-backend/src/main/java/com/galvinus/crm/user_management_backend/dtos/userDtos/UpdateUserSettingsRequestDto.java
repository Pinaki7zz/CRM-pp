package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.entities.User;

import java.util.UUID;

import jakarta.validation.constraints.*;

import lombok.Data;

@Data
public class UpdateUserSettingsRequestDto {
	@NotBlank
	private String username;

	@NotNull
	private User.Language language;

	private UUID businessRole;

	@NotNull
	private User.DateFormat dateFormat;

	@NotNull
	private User.TimeFormat timeFormat;

	@NotNull
	private User.TimeZone timeZone;

	@NotBlank
	private String personalCountry;

	@NotBlank
	private String personalState;

	@NotBlank
	private String personalCity;

	@NotBlank
	private String personalStreet;

	@NotBlank
	private String personalPostalCode;

	@NotBlank
	private String companyCountry;

	@NotBlank
	private String companyState;

	@NotBlank
	private String companyCity;

	@NotBlank
	private String companyAddressLine1;

	private String companyAddressLine2;

	@NotBlank
	private String companyPostalCode;

	private String businessName;
	private String legalEntityType;
}
