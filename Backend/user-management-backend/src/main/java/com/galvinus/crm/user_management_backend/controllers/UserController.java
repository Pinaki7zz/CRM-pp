package com.galvinus.crm.user_management_backend.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.galvinus.crm.user_management_backend.dtos.FieldLevelValidation;
import com.galvinus.crm.user_management_backend.dtos.userDtos.AssignRoleRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.CreateUserRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.CreateUserResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.EmployeeListResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.GeneratePasswordResult;
import com.galvinus.crm.user_management_backend.dtos.userDtos.GeneratePasswordsRequest;
import com.galvinus.crm.user_management_backend.dtos.userDtos.GeneratePasswordsResponse;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserProfileRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserProfileResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserSettingsRequestDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UpdateUserSettingsResponseDto;
import com.galvinus.crm.user_management_backend.dtos.userDtos.UserListResponseDto;
import com.galvinus.crm.user_management_backend.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/um/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Create User
    @PostMapping
    public ResponseEntity<CreateUserResponseDto> createUser(
            @Validated(FieldLevelValidation.class) @RequestBody CreateUserRequestDto userCreateRequestDto) {
        System.out.println("==========Just got inside createUser controller");
        CreateUserResponseDto createdUser = userService.createUser(userCreateRequestDto);
        System.out.println("==========Came back from createUser service");
        return ResponseEntity.ok(createdUser);
    }

    @PostMapping("/generate-password")
    public ResponseEntity<GeneratePasswordsResponse> generatePasswords(
            @Valid @RequestBody GeneratePasswordsRequest req) {
        System.out.println("==========Just got inside generatePasswords controller");
        List<GeneratePasswordResult> results = userService.generateAndSendTempPasswords(req.getUserIds());
        System.out.println("==========Came back to generatePasswords controller");
        GeneratePasswordsResponse resp = new GeneratePasswordsResponse();
        resp.setResults(results);
        return ResponseEntity.ok(resp);
    }

    // Get All Users (safe)
    @GetMapping("/s-info")
    public ResponseEntity<List<UserListResponseDto>> getAllUsers() {
        System.out.println("===========Just got inside getAllUsers controller");
        List<UserListResponseDto> getAllUsers = userService.getAllUsers();
        System.out.println("===========Came back from getAllUser service");
        return ResponseEntity.ok(getAllUsers);
    }

    // Get All Employees (safe)
    @GetMapping("/emp/s-info")
    public ResponseEntity<List<EmployeeListResponseDto>> getAllEmployees() {
        System.out.println("===========Just got inside getAllEmployees controller");
        List<EmployeeListResponseDto> getAllEmployees = userService.getAllEmployees();
        System.out.println("===========Came back from getAllEmployees service");
        return ResponseEntity.ok(getAllEmployees);
    }

    // Get User by Id
    @GetMapping("/{id}")
    public ResponseEntity<CreateUserResponseDto> getUserById(@PathVariable UUID id) {
        CreateUserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Get Next UserId
    @GetMapping("/next-userid")
    public ResponseEntity<Map<String, String>> getNextUserId() {
        String nextId = userService.getNextUserId();
        Map<String, String> response = new HashMap<>();
        response.put("userId", nextId);
        return ResponseEntity.ok(response);
    }

    // Update User Profile
    @PatchMapping("/user-profile/{id}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable UUID id,
            @Validated(FieldLevelValidation.class) @RequestBody UpdateUserProfileRequestDto userUpdateRequestDto) {

        System.out.println("=============Just got inside update user profile controller");

        Optional<UpdateUserProfileResponseDto> updatedUser = userService.updateUserProfile(id, userUpdateRequestDto);

        return updatedUser
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found for ID: " + id)));
    }

    // Update User Settings
    @PatchMapping("/settings/{id}")
    public ResponseEntity<?> updateUserSettings(@PathVariable UUID id,
            @Validated(FieldLevelValidation.class) @RequestBody UpdateUserSettingsRequestDto userUpdateRequestDto) {
        System.out.println("=============Just got inside update user settings controller");
        try {
            Optional<UpdateUserSettingsResponseDto> updatedUser = userService.updateUserSettings(id,
                    userUpdateRequestDto);

            if (updatedUser.isPresent()) {
                return ResponseEntity.ok(updatedUser.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found for ID: " + id));
            }
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred", "details", ex.getMessage()));
        }
    }
    
    // Update Users Status (Bulk)
    @PatchMapping("/status-update")
    public ResponseEntity<Void> updateUsersStatus(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<String> idStrings = (List<String>) payload.get("ids");
            String status = (String) payload.get("status");
            
            List<UUID> ids = idStrings.stream().map(UUID::fromString).toList();
            userService.updateUsersStatus(ids, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ FIXED: Bulk Assign Role Endpoint with Error Handling
    @PatchMapping("/assign-role")
    public ResponseEntity<?> assignRoleToUsers(@RequestBody AssignRoleRequestDto request) {
        System.out.println("Received Assign Role Request: " + request); 

        // 1. Validate IDs exist
        if (request.getIds() == null || request.getIds().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: No User IDs provided.");
        }

        try {
            // 2. Convert Strings to UUIDs (Safe Parsing)
            List<UUID> userUuids = request.getIds().stream()
                .map(id -> {
                    try { return UUID.fromString(id); }
                    catch (IllegalArgumentException e) { throw new RuntimeException("Invalid User UUID format: " + id); }
                })
                .collect(Collectors.toList());

            // 3. Handle Role UUID (allow null for unassigning)
            UUID roleUuid = null;
            if (request.getRoleId() != null && !request.getRoleId().isBlank()) {
                try {
                    roleUuid = UUID.fromString(request.getRoleId());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Error: Invalid Role UUID format: " + request.getRoleId());
                }
            }

            // 4. Call Service
            userService.assignRoleToUsers(userUuids, roleUuid);
            return ResponseEntity.ok().body(Map.of("message", "Roles updated successfully"));
        
        } catch (RuntimeException e) {
            e.printStackTrace(); // Check your console for this error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Logic Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server Error: " + e.getMessage());
        }
    }

    // ✅ ADDED: Exception Handler for JSON Parse Errors
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleJsonErrors(HttpMessageNotReadableException ex) {
        System.err.println("JSON Parse Error: " + ex.getMessage());
        return ResponseEntity.badRequest().body("Invalid JSON Format: " + ex.getMessage());
    }

    // Delete User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        boolean deleted = userService.deleteUser(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}