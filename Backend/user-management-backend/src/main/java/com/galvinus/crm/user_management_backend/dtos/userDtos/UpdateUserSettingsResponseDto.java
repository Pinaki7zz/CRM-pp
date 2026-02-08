package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.entities.User.*;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UpdateUserSettingsResponseDto {
	private String username;
	private Language language;
	private UUID businessRole;
	private DateFormat dateFormat;
	private TimeFormat timeFormat;
	private TimeZone timeZone;
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
	private String businessName;
	private String legalEntityType;
	private Instant createdAt;
	private Instant updatedAt;
}
