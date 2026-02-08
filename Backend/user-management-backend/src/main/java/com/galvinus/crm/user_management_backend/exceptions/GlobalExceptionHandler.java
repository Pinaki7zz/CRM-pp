package com.galvinus.crm.user_management_backend.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.galvinus.crm.user_management_backend.dtos.FieldLevelValidation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

		// Case 1: check if controller method uses
		// @Validated(FieldLevelValidation.class)
		boolean isFieldLevel = false;

		var param = ex.getParameter(); // might be null depending on the context
		if (param != null) {
			Validated validated = param.getParameterAnnotation(Validated.class);
			if (validated != null) {
				for (Class<?> group : validated.value()) {
					if (group == FieldLevelValidation.class) {
						isFieldLevel = true;
						break;
					}
				}
			}
		}

		// Case A: user-profile, settings → field-level error response
		if (isFieldLevel) {
			List<Map<String, String>> errors = new ArrayList<>();

			ex.getBindingResult().getFieldErrors().forEach(err -> errors.add(Map.of(
					"path", err.getField(),
					"msg", err.getDefaultMessage())));

			return ResponseEntity
					.badRequest()
					.body(Map.of("errors", errors));
		}

		// Case B: login, registration → old error structure
		List<Map<String, String>> errorsList = new ArrayList<>();

		ex.getBindingResult().getFieldErrors().forEach(err -> errorsList.add(Map.of("msg", err.getDefaultMessage())));

		return ResponseEntity
				.badRequest()
				.body(Map.of("errors", errorsList));
	}
}
