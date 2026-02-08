package com.galvinus.crm.user_management_backend.dtos.userDtos;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class GeneratePasswordsRequest {
	private List<UUID> userIds;
}
