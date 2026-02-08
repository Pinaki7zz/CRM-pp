package com.galvinus.crm.user_management_backend.dtos.userDtos;

import java.util.List;

import lombok.Data;

@Data
public class GeneratePasswordsResponse {
	private List<GeneratePasswordResult> results;
}
