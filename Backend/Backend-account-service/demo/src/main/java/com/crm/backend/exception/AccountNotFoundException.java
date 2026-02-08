package com.crm.backend.exception;

// Custom exception for not found (can be caught globally if needed).
public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String message) {
        super(message);
    }
}