package com.galvinus.crm.user_management_backend.services;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.galvinus.crm.user_management_backend.dtos.authDtos.LoginRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.PasswordResetConfirmationRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.PasswordResetRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterResponseDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterResponseDto.BusinessRoleDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterResponseDto.UserResponseDto;
import com.galvinus.crm.user_management_backend.entities.User;
import com.galvinus.crm.user_management_backend.repositories.UserRepository;
import com.galvinus.crm.user_management_backend.utils.JwtUtil;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    private final UserRepository authRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository authRepository, JwtUtil jwtUtil, EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.authRepository = authRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean comparePassword(String plain, String hashed) {
        return encoder.matches(plain, hashed);
    }

    public String hashPassword(String plain) {
        return encoder.encode(plain);
    }

    // ✅ HELPER: Set Cookies for Registration
    public void setRegisterAuthCookies(HttpServletResponse resp, User user, boolean rememberMe) {
        Map<String, Object> claims = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "businessRoleId", user.getBusinessRole() != null ? user.getBusinessRole().getId() : null);

        String accessToken = jwtUtil.generateAccessToken(claims);

        long refreshExpiry = rememberMe ? 7L * 24 * 3600 * 1000 : 30 * 60 * 1000;
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), refreshExpiry);

        user.setRefreshToken(refreshToken);
        user.setRememberMe(rememberMe);
        authRepository.save(user);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // False for localhost
                .path("/")
                .sameSite("Lax")
                .maxAge(refreshExpiry / 1000)
                .build();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(5 * 60)
                .build();

        resp.addHeader("Set-Cookie", refreshCookie.toString());
        resp.addHeader("Set-Cookie", accessCookie.toString());
    }

    // ✅ HELPER: Set Cookies for Login
    private void setLoginAuthCookies(HttpServletResponse response, String accessToken, String refreshToken,
            boolean rememberMe) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false) // False for localhost
                .path("/")
                .sameSite("Lax")
                .maxAge(5 * 60)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(rememberMe ? 7L * 24 * 3600 : 30 * 60)
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    // ✅ HELPER: Set Cookies for Refresh Token
    public void setRefreshTokenAuthCookie(HttpServletResponse response, User user, String accessToken,
            String refreshToken) {
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(user.isRememberMe() ? 7 * 24 * 60 * 60 : 30 * 60)
                .build();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(5 * 60)
                .build();

        response.addHeader("Set-Cookie", refreshCookie.toString());
        response.addHeader("Set-Cookie", accessCookie.toString());
    }

    // ✅ HELPER: Clear Cookies
    private void clearAuthCookies(HttpServletResponse response) {
        Cookie clearRefresh = new Cookie("refreshToken", null);
        clearRefresh.setHttpOnly(true);
        clearRefresh.setPath("/");
        clearRefresh.setMaxAge(0);

        Cookie clearAccess = new Cookie("accessToken", null);
        clearAccess.setHttpOnly(true);
        clearAccess.setPath("/");
        clearAccess.setMaxAge(0);

        response.addCookie(clearRefresh);
        response.addCookie(clearAccess);
    }

    @Transactional
    public RegisterResponseDto registerUser(RegisterRequestDto dto, HttpServletResponse response) {
        User user = authRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getTempPassword() == null)
            throw new IllegalStateException("No temporary password set. Contact admin.");

        if (user.getTempPasswordExpires() != null && user.getTempPasswordExpires().isBefore(Instant.now()))
            throw new IllegalStateException("Temporary password expired. Contact admin to resend.");

        if (!comparePassword(dto.getTempPassword(), user.getTempPassword()))
            throw new IllegalArgumentException("Invalid temporary password.");

        String hashed = hashPassword(dto.getPassword());

        user.setPassword(hashed);
        user.setTermsAccepted(dto.isTermsAccepted());
        user.setMustChangePassword(false);
        user.setTempPassword(null);
        user.setTempPasswordExpires(null);
        user.setRememberMe(true);

        authRepository.save(user);

        setRegisterAuthCookies(response, user, true);

        Map<String, Object> claims = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "businessRoleId", user.getBusinessRole() != null ? user.getBusinessRole().getId() : null);
        String accessToken = jwtUtil.generateAccessToken(claims);

        // Build Response DTO manually
        UserResponseDto userDto = UserResponseDto.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .mustChangePassword(user.isMustChangePassword())
                .rememberMe(user.isRememberMe())
                .termsAccepted(user.isTermsAccepted())
                .language(user.getLanguage())
                .personalCountry(user.getPersonalCountry())
                .personalState(user.getPersonalState())
                .personalCity(user.getPersonalCity())
                .personalStreet(user.getPersonalStreet())
                .personalPostalCode(user.getPersonalPostalCode())
                .companyCountry(user.getCompanyCountry())
                .companyState(user.getCompanyState())
                .companyCity(user.getCompanyCity())
                .companyAddressLine1(user.getCompanyAddressLine1())
                .companyAddressLine2(user.getCompanyAddressLine2())
                .companyPostalCode(user.getCompanyPostalCode())
                .timeZone(user.getTimeZone())
                .timeFormat(user.getTimeFormat())
                .dateFormat(user.getDateFormat())
                .status(user.getStatus())
                .businessName(user.getBusinessName())
                .legalEntityType(user.getLegalEntityType())
                .department(user.getDepartment())
                .job(user.getJob())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .businessRole(user.getBusinessRole() != null ? new BusinessRoleDto(
                        user.getBusinessRole().getId(),
                        user.getBusinessRole().getBusinessRoleName(),
                        user.getBusinessRole().getPermissions()
                                .stream()
                                .map(p -> p.getWorkCenterView().getWorkCenterViewId())
                                .toList())
                        : null)
                .build();

        return RegisterResponseDto.builder()
                .user(userDto)
                .accessToken(accessToken)
                .build();
    }

    // ✅ FIXED: Login User (Bypassing AuthenticationManager to avoid bean conflict)
    @Transactional
    public RegisterResponseDto loginUser(LoginRequestDto dto, HttpServletResponse response) {
        System.out.println("============Just got inside login service");

        User user = authRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credentials"));

        System.out.println("============User found: " + user.getUsername());

        // 1. Check if password change is required
        if (user.isMustChangePassword()) {
            System.out.println("============Entered here (Must Change Password)");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Account requires password setup. Complete signup using the link sent to your email.");
        }

        // 2. Compare password manually
        if (!comparePassword(dto.getPassword(), user.getPassword())) {
            System.out.println("============Password not matched");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }

        System.out.println("============Password matched");

        // 3. Generate Tokens
        Map<String, Object> claims = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "businessRoleId", user.getBusinessRole() != null ? user.getBusinessRole().getId() : null);

        String accessToken = jwtUtil.generateAccessToken(claims);

        long refreshExpiry = dto.isRememberMe() ? 7L * 24 * 3600 * 1000 : 30 * 60 * 1000;
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), refreshExpiry);

        System.out.println("============Access and Refresh token generated");

        // 4. Update User
        user.setRefreshToken(refreshToken);
        user.setRememberMe(dto.isRememberMe());
        authRepository.save(user);

        // 5. Set Cookies
        setLoginAuthCookies(response, accessToken, refreshToken, dto.isRememberMe());
        System.out.println("==============Cookies got set");

        // 6. Build Response
        RegisterResponseDto.UserResponseDto userDto = RegisterResponseDto.UserResponseDto.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .mustChangePassword(user.isMustChangePassword())
                .rememberMe(user.isRememberMe())
                .termsAccepted(user.isTermsAccepted())
                .language(user.getLanguage())
                .personalCountry(user.getPersonalCountry())
                .personalState(user.getPersonalState())
                .personalCity(user.getPersonalCity())
                .personalStreet(user.getPersonalStreet())
                .personalPostalCode(user.getPersonalPostalCode())
                .companyCountry(user.getCompanyCountry())
                .companyState(user.getCompanyState())
                .companyCity(user.getCompanyCity())
                .companyAddressLine1(user.getCompanyAddressLine1())
                .companyAddressLine2(user.getCompanyAddressLine2())
                .companyPostalCode(user.getCompanyPostalCode())
                .timeZone(user.getTimeZone())
                .timeFormat(user.getTimeFormat())
                .dateFormat(user.getDateFormat())
                .status(user.getStatus())
                .businessName(user.getBusinessName())
                .legalEntityType(user.getLegalEntityType())
                .department(user.getDepartment())
                .job(user.getJob())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .businessRole(user.getBusinessRole() != null
                        ? new RegisterResponseDto.BusinessRoleDto(
                                user.getBusinessRole().getId(),
                                user.getBusinessRole().getBusinessRoleName(),
                                user.getBusinessRole().getPermissions()
                                        .stream()
                                        .map(p -> p.getWorkCenterView().getWorkCenterViewId())
                                        .toList())
                        : null)
                .build();

        return RegisterResponseDto.builder()
                .user(userDto)
                .accessToken(accessToken)
                .build();
    }

    @Transactional
    public ResponseEntity<?> refreshToken(String refreshToken, HttpServletResponse response) {
        try {
            UUID userId = jwtUtil.validateRefreshToken(refreshToken);
            if (userId == null) {
                return ResponseEntity.status(403).body("Invalid refresh token");
            }

            Optional<User> userOpt = authRepository.findById(userId);
            if (userOpt.isEmpty() || !refreshToken.equals(userOpt.get().getRefreshToken())) {
                return ResponseEntity.status(403).body("Invalid refresh token");
            }

            User user = userOpt.get();

            // Rotate refresh token
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), 0);
            Map<String, Object> claims = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "businessRoleId", user.getBusinessRole() != null ? user.getBusinessRole().getId() : null);
            String newAccessToken = jwtUtil.generateAccessToken(claims);

            user.setRefreshToken(newRefreshToken);
            authRepository.save(user);

            setRefreshTokenAuthCookie(response, user, newAccessToken, newRefreshToken);

            // Re-build user DTO
            RegisterResponseDto.UserResponseDto userDto = RegisterResponseDto.UserResponseDto.builder()
                    .id(user.getId())
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .mustChangePassword(user.isMustChangePassword())
                    .rememberMe(user.isRememberMe())
                    .termsAccepted(user.isTermsAccepted())
                    .language(user.getLanguage())
                    .personalCountry(user.getPersonalCountry())
                    .personalState(user.getPersonalState())
                    .personalCity(user.getPersonalCity())
                    .personalStreet(user.getPersonalStreet())
                    .personalPostalCode(user.getPersonalPostalCode())
                    .companyCountry(user.getCompanyCountry())
                    .companyState(user.getCompanyState())
                    .companyCity(user.getCompanyCity())
                    .companyAddressLine1(user.getCompanyAddressLine1())
                    .companyAddressLine2(user.getCompanyAddressLine2())
                    .companyPostalCode(user.getCompanyPostalCode())
                    .timeZone(user.getTimeZone())
                    .timeFormat(user.getTimeFormat())
                    .dateFormat(user.getDateFormat())
                    .status(user.getStatus())
                    .businessName(user.getBusinessName())
                    .legalEntityType(user.getLegalEntityType())
                    .department(user.getDepartment())
                    .job(user.getJob())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .businessRole(user.getBusinessRole() != null
                            ? new RegisterResponseDto.BusinessRoleDto(
                                    user.getBusinessRole().getId(),
                                    user.getBusinessRole().getBusinessRoleName(),
                                    user.getBusinessRole().getPermissions()
                                            .stream()
                                            .map(p -> p.getWorkCenterView().getWorkCenterViewId())
                                            .toList())
                            : null)
                    .build();

            return ResponseEntity.ok(RegisterResponseDto.builder()
                    .user(userDto)
                    .accessToken(newAccessToken)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Token expired or invalid: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> logoutUser(String refreshToken, HttpServletResponse response) {
        try {
            if (refreshToken == null || refreshToken.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "No refresh token provided"));
            }

            UUID userId = jwtUtil.validateRefreshToken(refreshToken);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Invalid or expired refresh token"));
            }

            Optional<User> userOpt = authRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setRefreshToken(null);
                user.setRememberMe(false);
                authRepository.save(user);
            }

            clearAuthCookies(response);

            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed", "details", e.getMessage()));
        }
    }

    @Transactional
    public ResponseEntity<?> requestPasswordReset(PasswordResetRequestDto requestDto) {
        try {
            System.out.println("============Just got inside request password reset service");
            String email = requestDto.getEmail();

            Optional<User> userOpt = authRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
            }

            User user = userOpt.get();
            System.out.println("============User found by email");

            String token = jwtUtil.generateResetToken(user.getId(), 10 * 60);
            System.out.println("============Reset token generated");

            emailService.sendResetPasswordEmail(user.getEmail(), token);
            System.out.println("============Reset email sent");

            return ResponseEntity.ok(Map.of("message", "Reset link sent to your email."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error sending reset link", "details", e.getMessage()));
        }
    }

    @Transactional
    public ResponseEntity<?> resetPassword(String token, PasswordResetConfirmationRequestDto dto) {
        try {
            System.out.println("============Just got inside reset password service");

            var claims = Jwts.parser()
                    .verifyWith(jwtUtil.getResetKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            System.out.println("============Token verified, claims extracted");

            String userIdStr = claims.getSubject();
            if (userIdStr == null || userIdStr.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid token payload"));
            }

            UUID userId = UUID.fromString(userIdStr);
            User user = authRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            System.out.println("============User found in database");

            String hashedPassword = passwordEncoder.encode(dto.getPassword());
            user.setPassword(hashedPassword);

            authRepository.save(user);
            System.out.println("============User password updated");

            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Reset token has expired"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired reset token", "details", e.getMessage()));
        }
    }
}