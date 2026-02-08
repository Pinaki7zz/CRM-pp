package com.galvinus.crm.user_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "business_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BusinessRole {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "business_role_id", unique = true, nullable = false)
    private String businessRoleId; // e.g. "BR-001"

    @Column(name = "business_role_name", nullable = false)
    private String businessRoleName;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "is_obsolete", columnDefinition = "BOOLEAN DEFAULT FALSE", nullable = false)
    private boolean isObsolete;

    @CreationTimestamp // Automatically set when entity is created
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp // Automatically updated on every update
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // UPDATED: Added JsonIgnoreProperties to prevent infinite recursion
    @OneToMany(mappedBy = "businessRole")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("businessRole")
    private List<User> users;

    // UPDATED: Added JsonIgnoreProperties to prevent infinite recursion
    @OneToMany(mappedBy = "businessRole", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("businessRole")
    private List<Permission> permissions;

    public enum Status {
        ACTIVE,
        INACTIVE
    }
}