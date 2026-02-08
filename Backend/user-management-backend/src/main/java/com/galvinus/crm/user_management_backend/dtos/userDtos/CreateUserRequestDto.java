// File: src/main/java/com/galvinus/crm/user_management_backend/dtos/userDtos/CreateUserRequestDto.java
package com.galvinus.crm.user_management_backend.dtos.userDtos;

import com.galvinus.crm.user_management_backend.dtos.FieldLevelValidation;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateUserRequestDto {
    @NotBlank(message = "First name is required", groups = FieldLevelValidation.class)
    private String firstName;

    @NotBlank(message = "Last name is required", groups = FieldLevelValidation.class)
    private String lastName;

    @NotBlank(message = "User ID is required", groups = FieldLevelValidation.class)
    private String userId;

    @NotBlank(message = "Username is required", groups = FieldLevelValidation.class)
    private String username;

    @Pattern(regexp = "^$|^\\+?[0-9]{10,13}$", message = "Phone must be 10–13 digits (with optional +country code)", groups = FieldLevelValidation.class)
    private String phone;

    @NotBlank(message = "Email is required", groups = FieldLevelValidation.class)
    @Email(message = "Email must be a valid email address", groups = FieldLevelValidation.class)
    private String email;

    // ✅ FIXED: Removed @NotBlank. This allows empty strings from frontend.
    private String businessRole;

    // ✅ FIXED: Removed @NotBlank. Service will handle defaults.
    private String status;

    private String timeZone;
    private String department;
    private String job; 
    
    private String personalCountry;
    private String personalState;
    private String personalCity;
    private String personalStreet;

    // ✅ OPTIONAL: Consider relaxing this if you support non-6-digit countries
    // Currently strictly enforces 6 digits if provided.
    @Pattern(regexp = "^$|^[0-9]{6}$", message = "Postal code must be a 6-digit number", groups = FieldLevelValidation.class)
    private String personalPostalCode;
}