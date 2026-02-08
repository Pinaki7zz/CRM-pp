package com.galvinus.crm.user_management_backend.controllers;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.galvinus.crm.user_management_backend.dtos.userDtos.BusinessRoleListResponseDto;
import com.galvinus.crm.user_management_backend.entities.BusinessRole;
import com.galvinus.crm.user_management_backend.services.BusinessRoleService;

@RestController
@RequestMapping("/um/api/business-role")
public class BusinessRoleController {

    @Autowired
    private BusinessRoleService businessRoleService;

    // ✅ Create Business Role (POST)
    @PostMapping
    public ResponseEntity<BusinessRole> createBusinessRole(@RequestBody BusinessRole businessRole) {
        businessRole.setCreatedAt(Instant.now());
        businessRole.setUpdatedAt(Instant.now());
        BusinessRole created = businessRoleService.createBusinessRole(businessRole);
        return ResponseEntity.status(201).body(created);
    }

    // ✅ Get All Business Roles (GET)
    @GetMapping("/s-info")
    public ResponseEntity<List<BusinessRoleListResponseDto>> getAllBusinessRoles() {
        List<BusinessRoleListResponseDto> roles = businessRoleService.getAllBusinessRoles();
        return ResponseEntity.ok(roles);
    }

    // ✅ Get Business Role by ID (GET)
    @GetMapping("/{id}")
    public ResponseEntity<?> getBusinessRoleById(@PathVariable UUID id) {
        Optional<BusinessRole> roleOpt = businessRoleService.getBusinessRoleById(id);
        
        if (roleOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Business Role not found");
        }

        BusinessRole role = roleOpt.get();

        // 1. Map Basic Fields
        Map<String, Object> response = new HashMap<>();
        response.put("id", role.getId());
        response.put("businessRoleId", role.getBusinessRoleId());
        response.put("businessRoleName", role.getBusinessRoleName());
        response.put("description", role.getDescription());
        response.put("status", role.getStatus());
        response.put("createdAt", role.getCreatedAt());
        response.put("updatedAt", role.getUpdatedAt());

        // 2. Map Users Safely (Break recursion)
        if (role.getUsers() != null) {
            List<Map<String, Object>> userList = role.getUsers().stream().map(u -> {
                Map<String, Object> uMap = new HashMap<>();
                uMap.put("id", u.getId());
                uMap.put("userId", u.getUserId());
                uMap.put("username", u.getUsername());
                uMap.put("firstName", u.getFirstName());
                uMap.put("lastName", u.getLastName());
                uMap.put("email", u.getEmail());
                uMap.put("status", u.getStatus());
                return uMap;
            }).collect(Collectors.toList());
            response.put("users", userList);
        }

        // 3. Map Permissions Safely
        if (role.getPermissions() != null) {
            List<Map<String, Object>> permList = role.getPermissions().stream().map(p -> {
                Map<String, Object> pMap = new HashMap<>();
                pMap.put("id", p.getId());
                pMap.put("readAccess", p.isReadAccess());
                pMap.put("writeAccess", p.isWriteAccess());
                pMap.put("updateAccess", p.isUpdateAccess());
                pMap.put("deleteAccess", p.isDeleteAccess());
                pMap.put("accessContent", p.getAccessContent());
                
                // Include Work Center View Details
                if (p.getWorkCenterView() != null) {
                    pMap.put("workCenterViewId", p.getWorkCenterView().getWorkCenterViewId());
                    pMap.put("workCenterViewName", p.getWorkCenterView().getWorkCenterViewName());
                }
                return pMap;
            }).collect(Collectors.toList());
            response.put("permissions", permList);
        }

        return ResponseEntity.ok(response);
    }

    // ✅ Update Business Role (PUT)
    // CHANGED: @PatchMapping -> @PutMapping to match Frontend request
    @PutMapping("/{id}")
    public ResponseEntity<BusinessRole> updateBusinessRole(@PathVariable UUID id, @RequestBody BusinessRole updated) {
        return businessRoleService.updateBusinessRole(id, updated)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete Business Role (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBusinessRole(@PathVariable UUID id) {
        businessRoleService.deleteBusinessRole(id);
        return ResponseEntity.noContent().build();
    }
}