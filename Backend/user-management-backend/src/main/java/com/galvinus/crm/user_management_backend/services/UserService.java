package com.galvinus.crm.user_management_backend.services;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.galvinus.crm.user_management_backend.dtos.userDtos.CreateUserRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.CreateUserResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.EmployeeListResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.GeneratePasswordResult;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserProfileRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserProfileResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserSettingsRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserSettingsResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UserListResponseDto;
import com.galvinus.crm.user_management_backend.entities.BusinessRole;
import com.galvinus.crm.user_management_backend.entities.User;
import com.galvinus.crm.user_management_backend.repositories.BusinessRoleRepository;
import com.galvinus.crm.user_management_backend.repositories.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BusinessRoleRepository businessRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BCryptPasswordEncoder bCrypt;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, BusinessRoleRepository businessRoleRepository,
            PasswordEncoder passwordEncoder, BCryptPasswordEncoder bCrypt, EmailService emailService) {
        this.userRepository = userRepository;
        this.businessRoleRepository = businessRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.bCrypt = bCrypt;
        this.emailService = emailService;
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private int extractNumericSuffix(String userId) {
        if (userId == null)
            return -1;
        String digits = userId.replaceAll("\\D+", "");
        try {
            return Integer.parseInt(digits);
        } catch (Exception e) {
            return -1;
        }
    }

    private String computeNextUserId(String lastUserId) {
        String prefix = lastUserId.replaceAll("\\d+$", "");
        String digits = lastUserId.replaceAll("\\D+", "");
        int width = digits.length();
        int next = Integer.parseInt(digits) + 1;
        return prefix + String.format("%0" + width + "d", next);
    }

    public List<GeneratePasswordResult> generateAndSendTempPasswords(List<UUID> userIds) {
        System.out.println("===========Just got inside generateAndSendTempPasswords service");

        List<GeneratePasswordResult> results = new ArrayList<>();
        if (userIds == null || userIds.isEmpty())
            return results;

        for (UUID id : userIds) {
            try {
                Optional<User> opt = userRepository.findById(id);
                if (opt.isEmpty()) {
                    results.add(GeneratePasswordResult.fail(id, "User not found"));
                    continue;
                }
                User user = opt.get();

                // 1) generate & hash
                String plain = generateSecureTempPassword(12);
                String hashed = bCrypt.encode(plain);

                // 2) compute expiry (24 hours)
                Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);

                // 3) persist changes
                try {
                    setTempPasswordForUser(user, hashed, expiresAt);
                } catch (Exception e) {
                    results.add(GeneratePasswordResult.fail(id, "DB update failed: " + e.getMessage()));
                    continue;
                }

                // 4) send email
                try {
                    String name = Stream.of(user.getFirstName(), user.getLastName())
                            .filter(Objects::nonNull).collect(Collectors.joining(" ")).trim();
                    emailService.sendUsernamePasswordEmail(
                            user.getEmail(),
                            name.isEmpty() ? user.getUsername() : name,
                            user.getUsername(),
                            plain,
                            expiresAt);
                    results.add(GeneratePasswordResult.ok(id));
                } catch (Exception mailEx) {
                    results.add(GeneratePasswordResult.fail(id, "Email failed: " + mailEx.getMessage()));
                }

            } catch (Exception ex) {
                results.add(GeneratePasswordResult.fail(id, "Unexpected error: " + ex.getMessage()));
            }
        }
        return results;
    }

    // Create User
    @Transactional
    public CreateUserResponseDto createUser(CreateUserRequestDto dto) {
        // 1️⃣ Validate & load Business Role (Optional now?) - keeping validation if provided
        BusinessRole role = null;
        if (dto.getBusinessRole() != null && !dto.getBusinessRole().isBlank()) {
             UUID businessRoleId;
            try {
                businessRoleId = UUID.fromString(dto.getBusinessRole());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid Business Role format: must be a valid UUID");
            }
             role = businessRoleRepository.findById(businessRoleId)
                .orElseThrow(() -> new RuntimeException("Business role not found"));
        }
       

        // 2️⃣ Generate temp password
        String tempPassword = generateRandomPassword(8);
        String hashedPassword = passwordEncoder.encode(tempPassword);

        // 3️⃣ Build new User entity
        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .userId(dto.getUserId())
                .username(dto.getUsername())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .personalCountry(dto.getPersonalCountry())
                .personalState(dto.getPersonalState())
                .personalCity(dto.getPersonalCity())
                .personalStreet(dto.getPersonalStreet())
                .personalPostalCode(dto.getPersonalPostalCode())
                .password(hashedPassword)
                .businessRole(role) // Can be null
                .status(User.UserStatus.INACTIVE)
                .build();

        // 4️⃣ Handle timeZone ENUM conversion
        if (dto.getTimeZone() != null && !dto.getTimeZone().isBlank()) {
            try {
                user.setTimeZone(User.TimeZone.valueOf(dto.getTimeZone()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid timeZone value: " + dto.getTimeZone());
            }
        }

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try {
                user.setStatus(User.UserStatus.valueOf(dto.getStatus()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid status value: " + dto.getStatus());
            }
        }

        // 5️⃣ Save user
        User savedUser = userRepository.save(user);

        // 6️⃣ Build Response DTO
        return CreateUserResponseDto.builder()
                .id(savedUser.getId())
                .userId(savedUser.getUserId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .department(savedUser.getDepartment())
                .personalCountry(savedUser.getPersonalCountry())
                .personalState(savedUser.getPersonalState())
                .personalCity(savedUser.getPersonalCity())
                .personalStreet(savedUser.getPersonalStreet())
                .personalPostalCode(savedUser.getPersonalPostalCode())
                .status(savedUser.getStatus())
                .timeZone(savedUser.getTimeZone())
                .businessRoleId(role != null ? role.getId() : null)
                .businessRoleName(role != null ? role.getBusinessRoleName() : null)
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .build();
    }

    @Transactional
    protected void setTempPasswordForUser(User user, String hashedTemP, Instant expiresAt) {
        user.setTempPassword(hashedTemP);
        user.setTempPasswordExpires(expiresAt);
        user.setMustChangePassword(true);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user); // Fixed: was user.save(user) which is incorrect
    }

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*_?";

    private String generateSecureTempPassword(int length) {
        if (length < 8)
            length = 8;
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        sb.append(UPPER.charAt(rnd.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(rnd.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(rnd.nextInt(DIGITS.length())));
        sb.append(SYMBOLS.charAt(rnd.nextInt(SYMBOLS.length())));

        String all = UPPER + LOWER + DIGITS + SYMBOLS;
        while (sb.length() < length) {
            sb.append(all.charAt(rnd.nextInt(all.length())));
        }

        List<Character> chars = sb.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
        Collections.shuffle(chars, rnd);
        StringBuilder out = new StringBuilder();
        for (char c : chars)
            out.append(c);
        return out.toString();
    }

    @Transactional(readOnly = true)
    public List<UserListResponseDto> getAllUsers() {
        System.out.println("=============Just got inside getAllUsers service");
        return userRepository.findAll().stream()
                .map(user -> UserListResponseDto.builder()
                        .id(user.getId())
                        .userId(user.getUserId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .status(user.getStatus())
                        .personalStreet(user.getPersonalStreet())
                        .businessRoleId(
                                user.getBusinessRole() != null ? user.getBusinessRole().getId() : null)
                        .businessRoleName(
                                user.getBusinessRole() != null ? user.getBusinessRole().getBusinessRoleName() : null)
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeeListResponseDto> getAllEmployees() {
        System.out.println("=============Just got inside getAllEmployees service");
        return userRepository.findAll().stream()
                .filter(user -> user.getBusinessRole() == null || // Allow users without roles to be employees? Or logic changed?
                        (user.getBusinessRole() != null && 
                        (user.getBusinessRole().getBusinessRoleName().equalsIgnoreCase("ADMIN") ||
                                user.getBusinessRole().getBusinessRoleName().equalsIgnoreCase("EMPLOYEE"))))
                .map(user -> EmployeeListResponseDto.builder()
                        .id(user.getId())
                        .userId(user.getUserId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .status(user.getStatus())
                        .personalStreet(user.getPersonalStreet())
                        .businessRoleId(user.getBusinessRole() != null ? user.getBusinessRole().getId() : null)
                        .businessRoleName(user.getBusinessRole() != null ? user.getBusinessRole().getBusinessRoleName() : null)
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public CreateUserResponseDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return CreateUserResponseDto.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .department(user.getDepartment())
                .personalCountry(user.getPersonalCountry())
                .personalState(user.getPersonalState())
                .personalCity(user.getPersonalCity())
                .personalStreet(user.getPersonalStreet())
                .personalPostalCode(user.getPersonalPostalCode())
                .timeZone(user.getTimeZone())
                .status(user.getStatus())
                .businessRoleId(
                        user.getBusinessRole() != null ? user.getBusinessRole().getId() : null)
                .businessRoleName(
                        user.getBusinessRole() != null ? user.getBusinessRole().getBusinessRoleName() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public String getNextUserId() {
        String lastUserId = userRepository.findLatestUserId();
        return lastUserId != null ? computeNextUserId(lastUserId) : "U-001";
    }

    @Transactional
    public Optional<UpdateUserProfileResponseDto> updateUserProfile(UUID id, UpdateUserProfileRequestDto dto) {
        System.out.println("=============Just got inside update user profile service");

        return userRepository.findById(id).map(existing -> {
            existing.setFirstName(dto.getFirstName());
            existing.setLastName(dto.getLastName());
            existing.setUserId(dto.getUserId());
            existing.setUsername(dto.getUsername());
            existing.setPhone(dto.getPhone());
            existing.setEmail(dto.getEmail());
            existing.setDepartment(dto.getDepartment());
            existing.setPersonalCountry(dto.getPersonalCountry());
            existing.setPersonalState(dto.getPersonalState());
            existing.setPersonalCity(dto.getPersonalCity());
            existing.setPersonalStreet(dto.getPersonalStreet());
            existing.setPersonalPostalCode(dto.getPersonalPostalCode());
            existing.setUpdatedAt(Instant.now());

            if (dto.getTimeZone() != null && !dto.getTimeZone().isBlank()) {
                try {
                    User.TimeZone tz = User.TimeZone.valueOf(dto.getTimeZone());
                    existing.setTimeZone(tz);
                } catch (IllegalArgumentException ex) {
                    throw new IllegalArgumentException("Invalid timeZone value: " + dto.getTimeZone());
                }
            } else {
                existing.setTimeZone(null);
            }

            if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
                try {
                    User.UserStatus s = User.UserStatus.valueOf(dto.getStatus());
                    existing.setStatus(s);
                } catch (IllegalArgumentException ex) {
                    throw new IllegalArgumentException("Invalid status value: " + dto.getStatus());
                }
            } else {
                existing.setStatus(null);
            }

            if (dto.getBusinessRole() != null && !dto.getBusinessRole().isBlank()) {
                UUID roleId;
                try {
                    roleId = UUID.fromString(dto.getBusinessRole());
                } catch (IllegalArgumentException ex) {
                    throw new IllegalArgumentException("Invalid Business Role format: must be a valid UUID string");
                }
                BusinessRole businessRole = businessRoleRepository.findById(roleId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "BusinessRole not found for id: " + dto.getBusinessRole()));
                existing.setBusinessRole(businessRole);
            }

            User saved = userRepository.save(existing);

            return UpdateUserProfileResponseDto.builder()
                    .firstName(saved.getFirstName())
                    .lastName(saved.getLastName())
                    .userId(saved.getUserId())
                    .username(saved.getUsername())
                    .phone(saved.getPhone())
                    .email(saved.getEmail())
                    .department(saved.getDepartment())
                    .timeZone(saved.getTimeZone())
                    .status(saved.getStatus())
                    .personalCountry(saved.getPersonalCountry())
                    .personalState(saved.getPersonalState())
                    .personalCity(saved.getPersonalCity())
                    .personalStreet(saved.getPersonalStreet())
                    .personalPostalCode(saved.getPersonalPostalCode())
                    .businessRoleId(
                            saved.getBusinessRole() != null ? saved.getBusinessRole().getId() : null)
                    .businessRoleName(
                            saved.getBusinessRole() != null ? saved.getBusinessRole().getBusinessRoleName() : null)
                    .createdAt(saved.getCreatedAt())
                    .updatedAt(saved.getUpdatedAt())
                    .build();
        });
    }

    @Transactional
    public Optional<UpdateUserSettingsResponseDto> updateUserSettings(UUID id, UpdateUserSettingsRequestDto dto) {
        System.out.println("=============Just got inside update user settings service");

        return userRepository.findById(id).map(existing -> {
            existing.setUsername(dto.getUsername());
            existing.setLanguage(dto.getLanguage());
            existing.setDateFormat(dto.getDateFormat());
            existing.setTimeFormat(dto.getTimeFormat());
            existing.setTimeZone(dto.getTimeZone());
            existing.setPersonalCountry(dto.getPersonalCountry());
            existing.setPersonalState(dto.getPersonalState());
            existing.setPersonalCity(dto.getPersonalCity());
            existing.setPersonalStreet(dto.getPersonalStreet());
            existing.setPersonalPostalCode(dto.getPersonalPostalCode());
            existing.setCompanyCountry(dto.getCompanyCountry());
            existing.setCompanyState(dto.getCompanyState());
            existing.setCompanyCity(dto.getCompanyCity());
            existing.setCompanyAddressLine1(dto.getCompanyAddressLine1());
            existing.setCompanyAddressLine2(dto.getCompanyAddressLine2());
            existing.setCompanyPostalCode(dto.getCompanyPostalCode());
            existing.setBusinessName(dto.getBusinessName());
            existing.setLegalEntityType(dto.getLegalEntityType());
            existing.setUpdatedAt(Instant.now());

            if (dto.getBusinessRole() != null) {
                BusinessRole businessRole = businessRoleRepository.findById(dto.getBusinessRole())
                        .orElseThrow(
                                () -> new RuntimeException("BusinessRole not found for id: " + dto.getBusinessRole()));
                existing.setBusinessRole(businessRole);
            }

            User saved = userRepository.save(existing);

            return UpdateUserSettingsResponseDto.builder()
                    .username(saved.getUsername())
                    .personalCountry(saved.getPersonalCountry())
                    .personalState(saved.getPersonalState())
                    .personalCity(saved.getPersonalCity())
                    .personalStreet(saved.getPersonalStreet())
                    .personalPostalCode(saved.getPersonalPostalCode())
                    .companyCountry(saved.getCompanyCountry())
                    .companyState(saved.getCompanyState())
                    .companyCity(saved.getCompanyCity())
                    .companyAddressLine1(saved.getCompanyAddressLine1())
                    .companyAddressLine2(saved.getCompanyAddressLine2())
                    .companyPostalCode(saved.getCompanyPostalCode())
                    .language(saved.getLanguage())
                    .timeZone(saved.getTimeZone())
                    .dateFormat(saved.getDateFormat())
                    .timeFormat(saved.getTimeFormat())
                    .businessName(saved.getBusinessName())
                    .legalEntityType(saved.getLegalEntityType())
                    .businessRole(saved.getBusinessRole() != null ? saved.getBusinessRole().getId() : null)
                    .createdAt(saved.getCreatedAt())
                    .updatedAt(saved.getUpdatedAt())
                    .build();
        });
    }

    @Transactional
    public boolean updateUserStatus(UUID id, String status) {
        return userRepository.findById(id).map(user -> {
            try {
                user.setStatus(User.UserStatus.valueOf(status.toUpperCase()));
                user.setUpdatedAt(Instant.now());
                userRepository.save(user);
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }).orElse(false);
    }

    @Transactional
    public void updateUsersStatus(List<UUID> ids, String status) {
        User.UserStatus newStatus;
        try {
            newStatus = User.UserStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        List<User> users = userRepository.findAllById(ids);
        users.forEach(u -> {
            u.setStatus(newStatus);
            u.setUpdatedAt(Instant.now());
        });
        userRepository.saveAll(users);
    }

    // ✅ FIXED: Corrected implementation
    @Transactional
    public void assignRoleToUsers(List<UUID> userIds, UUID roleId) {
        BusinessRole role = null;
        if (roleId != null) {
            role = businessRoleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Business Role not found"));
        }

        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            user.setBusinessRole(role); // Set role or null (unassign)
        }
        userRepository.saveAll(users);
    }

    @Transactional
    public boolean deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }
}