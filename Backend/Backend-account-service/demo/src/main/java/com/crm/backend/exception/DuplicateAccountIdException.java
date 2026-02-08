package com.crm.backend.exception;

// Custom exception for duplicate accountId
public class DuplicateAccountIdException extends RuntimeException {
    public DuplicateAccountIdException(String message) {
        super(message);
    }
}