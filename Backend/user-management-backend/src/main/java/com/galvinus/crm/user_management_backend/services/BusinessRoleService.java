package com.galvinus.crm.user_management_backend.services;

import com.galvinus.crm.user_management_backend.dtos.userDtos.BusinessRoleListResponseDto;
import com.galvinus.crm.user_management_backend.entities.BusinessRole;
import com.galvinus.crm.user_management_backend.repositories.BusinessRoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BusinessRoleService {
	private final BusinessRoleRepository businessRoleRepository;

	public BusinessRoleService(BusinessRoleRepository businessRoleRepository) {
		this.businessRoleRepository = businessRoleRepository;
	}

	public BusinessRole createBusinessRole(BusinessRole businessRole) {
		return businessRoleRepository.save(businessRole);
	}

	public List<BusinessRoleListResponseDto> getAllBusinessRoles() {
		System.out.println("============Just got inside getAllBusinessRoles service");
		return businessRoleRepository.findAll().stream()
				.map(role -> BusinessRoleListResponseDto.builder()
						.id(role.getId())
						.businessRoleId(role.getBusinessRoleId())
						.businessRoleName(role.getBusinessRoleName())
						.status(role.getStatus())
						.isObsolete(role.isObsolete())
						.createdAt(role.getCreatedAt())
						.build())
				.collect(Collectors.toList());
	}

	public Optional<BusinessRole> getBusinessRoleById(UUID id) {
		return businessRoleRepository.findById(id);
	}

	public Optional<BusinessRole> updateBusinessRole(UUID id, BusinessRole updated) {
		return businessRoleRepository.findById(id).map(existing -> {
			existing.setBusinessRoleName(updated.getBusinessRoleName());
			existing.setDescription(updated.getDescription());
			existing.setUpdatedAt(updated.getUpdatedAt());
			return businessRoleRepository.save(existing);
		});
	}

	public void deleteBusinessRole(UUID id) {
		businessRoleRepository.deleteById(id);
	}
}
