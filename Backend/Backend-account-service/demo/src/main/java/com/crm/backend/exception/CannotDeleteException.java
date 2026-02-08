package com.crm.backend.exception;

// Custom exception for delete with linked contacts.
public class CannotDeleteException extends RuntimeException {
    public CannotDeleteException(String message) {
        super(message);
    }
}