package com.galvinus.crm.user_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(updatable = false, nullable = false)
	private UUID id;

	@Column(name = "user_id", unique = true, nullable = false)
	private String userId; // e.g. U-001

	@Column(nullable = true)
	@ToString.Exclude
	private String password;

	@Column(name = "refresh_token", length = 2048)
	private String refreshToken;

	@Column(name = "must_change_password", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean mustChangePassword;

	@Column(name = "temp_password")
	private String tempPassword;

	@Column(name = "temp_password_expires")
	private Instant tempPasswordExpires;

	@Column(name = "terms_accepted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean termsAccepted;

	@Column(name = "remember_me", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private boolean rememberMe;

	@Column(name = "first_name", nullable = false)
	private String firstName;

	@Column(name = "last_name", nullable = false)
	private String lastName;

	@Column(unique = true, nullable = false)
	private String username;

	@Column(unique = true, nullable = false)
	private String email;

	@Column(unique = true)
	private String phone;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	@Builder.Default
	private Language language = Language.ENGLISH;

	@Column(name = "personal_country")
	private String personalCountry;

	@Column(name = "personal_state")
	private String personalState;

	@Column(name = "personal_city")
	private String personalCity;

	@Column(name = "personal_street")
	private String personalStreet;

	@Column(name = "personal_postal_code")
	private String personalPostalCode;

	@Column(name = "company_address_line1")
	private String companyAddressLine1;

	@Column(name = "company_address_line2")
	private String companyAddressLine2;

	@Column(name = "company_country")
	private String companyCountry;

	@Column(name = "company_state")
	private String companyState;

	@Column(name = "company_city")
	private String companyCity;

	@Column(name = "company_postal_code")
	private String companyPostalCode;

	@Column(name = "time_zone")
	@Enumerated(EnumType.STRING)
	private TimeZone timeZone;

	@Column(name = "time_format", nullable = false)
	@Enumerated(EnumType.STRING)
	@Builder.Default
	private TimeFormat timeFormat = TimeFormat.TWELVE_HOUR;

	@Column(name = "date_format", nullable = false)
	@Enumerated(EnumType.STRING)
	@Builder.Default
	private DateFormat dateFormat = DateFormat.DD_MM_YYYY;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	@Builder.Default
	private UserStatus status = UserStatus.INACTIVE;

	@Column(name = "business_name")
	private String businessName;

	@Column(name = "legal_entity_type")
	private String legalEntityType;

	private String department;

	private String job;

	@CreationTimestamp // Automatically set when entity is created
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp // Automatically updated on every update
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@ManyToOne
	@JoinColumn(name = "business_role_id", nullable = true) // ✅ Change nullable to true
	private BusinessRole businessRole;

	public enum UserStatus {
		ACTIVE,
		INACTIVE
	}

	public enum TimeZone {
		IST,
		JST,
		CET,
		PST
	}

	public enum TimeFormat {
		TWELVE_HOUR,
		TWENTY_FOUR_HOUR
	}

	public enum DateFormat {
		DD_MM_YYYY,
		MM_DD_YYYY,
		YYYY_MM_DD
	}

	public enum Language {
		ENGLISH,
		GERMAN,
		FRENCH
	}
}
