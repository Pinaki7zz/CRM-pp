package com.galvinus.crm.user_management_backend.dtos.userDtos;

import java.util.UUID;

import lombok.Data;

@Data
public class GeneratePasswordResult {
	private UUID id;
	private boolean success;
	private String message;

	public static GeneratePasswordResult ok(UUID id) {
		GeneratePasswordResult r = new GeneratePasswordResult();
		r.id = id;
		r.success = true;
		r.message = null;
		return r;
	}

	public static GeneratePasswordResult fail(UUID id, String message) {
		GeneratePasswordResult r = new GeneratePasswordResult();
		r.id = id;
		r.success = false;
		r.message = message;
		return r;
	}
}
