package com.galvinus.crm.user_management_backend.controllers;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.galvinus.crm.user_management_backend.dtos.ValidationGroups;
import com.galvinus.crm.user_management_backend.dtos.authDtos.LoginRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.PasswordResetConfirmationRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.PasswordResetRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RefreshTokenRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterRequestDto;
import com.galvinus.crm.user_management_backend.dtos.authDtos.RegisterResponseDto;
import com.galvinus.crm.user_management_backend.services.AuthService;
import com.galvinus.crm.user_management_backend.services.UserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/um/api/auth")
public class AuthController {
	private final AuthService authService;
	private final UserService userService;
	private final jakarta.validation.Validator beanValidator;

	public AuthController(AuthService authService, UserService userService,
			jakarta.validation.Validator beanValidator) {
		this.authService = authService;
		this.userService = userService;
		this.beanValidator = beanValidator;
	}

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(
			@Validated({ ValidationGroups.BasicChecks.class }) @RequestBody RegisterRequestDto requestDto,
			HttpServletResponse response) {
		try {
			System.out.println("============Just got inside register controller");

			// Run advanced-group validation only if basic validations (handled by
			// @Validated) passed.
			Set<ConstraintViolation<RegisterRequestDto>> violations = beanValidator.validate(requestDto,
					ValidationGroups.AdvancedChecks.class);

			if (!violations.isEmpty()) {
				List<Map<String, String>> errorsList = violations.stream()
						.map(v -> Map.of("msg", v.getMessage()))
						.toList();
				return ResponseEntity.badRequest().body(Map.of("errors", errorsList));
			}

			RegisterResponseDto result = authService.registerUser(requestDto, response);
			System.out.println("============Back to controller after register service");
			return ResponseEntity.ok(result);
		} catch (IllegalArgumentException | IllegalStateException ex) {
			return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
					.body(Map.of("error", "Registration failed", "details", e.getMessage()));
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginUser(
			@Validated({ ValidationGroups.BasicChecks.class }) @RequestBody LoginRequestDto requestDto,
			HttpServletResponse response) {
		System.out.println("============Just got inside login controller");

		// Run advanced-group validation only if basic validations (handled by
		// @Validated) passed.
		Set<ConstraintViolation<LoginRequestDto>> violations = beanValidator.validate(requestDto,
				ValidationGroups.AdvancedChecks.class);

		if (!violations.isEmpty()) {
			List<Map<String, String>> errorsList = violations.stream()
					.map(v -> Map.of("msg", v.getMessage()))
					.toList();
			return ResponseEntity.badRequest().body(Map.of("errors", errorsList));
		}

		// Delegate to AuthService (handles business logic)
		RegisterResponseDto result = authService.loginUser(requestDto, response);
		System.out.println("============Back to controller after login service");
		return ResponseEntity.ok(result);
	}

	@PostMapping("/refresh-token")
	public ResponseEntity<?> refreshToken(
			@CookieValue(value = "refreshToken", required = false) String cookieToken,
			@Valid @RequestBody(required = false) RefreshTokenRequestDto bodyToken,
			HttpServletResponse response) {
		// Priority: cookie > request body
		String token = cookieToken != null ? cookieToken : (bodyToken != null ? bodyToken.getRefreshToken() : null);
		if (token == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", "Refresh token missing"));
		}
		return authService.refreshToken(token, response);
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logoutUser(
			@CookieValue(required = false) String refreshToken,
			HttpServletResponse response) {
		authService.logoutUser(refreshToken, response);
		return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
	}

	@PostMapping("/request-reset")
	public ResponseEntity<?> requestPasswordReset(
			@Validated({ ValidationGroups.BasicChecks.class }) @RequestBody PasswordResetRequestDto requestDto) {
		System.out.println("============Just got inside request password reset controller");

		// Run advanced-group validation only if basic validations (handled by
		// @Validated) passed.
		Set<ConstraintViolation<PasswordResetRequestDto>> violations = beanValidator.validate(requestDto,
				ValidationGroups.AdvancedChecks.class);

		if (!violations.isEmpty()) {
			List<Map<String, String>> errorsList = violations.stream()
					.map(v -> Map.of("msg", v.getMessage()))
					.toList();
			return ResponseEntity.badRequest().body(Map.of("errors", errorsList));
		}

		return authService.requestPasswordReset(requestDto);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@Validated({
			ValidationGroups.BasicChecks.class }) @RequestBody PasswordResetConfirmationRequestDto requestDto) {
		System.out.println("============Just got inside reset password controller");

		// Run advanced-group validation only if basic validations (handled by
		// @Validated) passed.
		Set<ConstraintViolation<PasswordResetConfirmationRequestDto>> violations = beanValidator.validate(requestDto,
				ValidationGroups.AdvancedChecks.class);

		if (!violations.isEmpty()) {
			List<Map<String, String>> errorsList = violations.stream()
					.map(v -> Map.of("msg", v.getMessage()))
					.toList();
			return ResponseEntity.badRequest().body(Map.of("errors", errorsList));
		}

		return authService.resetPassword(requestDto.getToken(), requestDto);
	}
}
