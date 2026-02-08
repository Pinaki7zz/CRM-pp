// package crm.workflow.workflowservice.controller;

// import crm.workflow.workflowservice.exception.WorkflowException;
// import crm.workflow.workflowservice.exception.WorkflowNotFoundException;
// import jakarta.validation.ConstraintViolation;
// import jakarta.validation.ConstraintViolationException;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.MethodArgumentNotValidException;
// import org.springframework.web.bind.annotation.ExceptionHandler;
// import org.springframework.web.bind.annotation.RestControllerAdvice;

// import java.util.HashMap;
// import java.util.Map;

// @RestControllerAdvice
// public class GlobalExceptionHandler {

//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
//         Map<String, String> errors = new HashMap<>();
//         ex.getBindingResult().getFieldErrors().forEach(error ->
//                 errors.put(error.getField(), error.getDefaultMessage()));
//         return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
//     }

//     @ExceptionHandler(ConstraintViolationException.class)
//     public ResponseEntity<Map<String, String>> handleConstraintViolation(ConstraintViolationException ex) {
//         Map<String, String> errors = new HashMap<>();
//         for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
//             String field = violation.getPropertyPath().toString();
//             String message = violation.getMessage();
//             errors.put(field, message);
//         }
//         return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
//     }

//     @ExceptionHandler(WorkflowNotFoundException.class)
//     public ResponseEntity<Map<String, String>> handleWorkflowNotFound(WorkflowNotFoundException ex) {
//         Map<String, String> error = new HashMap<>();
//         error.put("error", ex.getMessage());
//         return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
//     }

//     @ExceptionHandler(WorkflowException.class)
//     public ResponseEntity<Map<String, String>> handleWorkflowException(WorkflowException ex) {
//         Map<String, String> error = new HashMap<>();
//         error.put("error", ex.getMessage());
//         return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
//     }

//     @ExceptionHandler(IllegalArgumentException.class)
//     public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
//         Map<String, String> error = new HashMap<>();
//         error.put("error", ex.getMessage());
//         return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
//     }

//     @ExceptionHandler(Exception.class)
//     public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
//         Map<String, String> error = new HashMap<>();
//         error.put("error", "An unexpected error occurred: " + ex.getMessage());
//         return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
// }




package crm.workflow.workflowservice.controller;

import crm.workflow.workflowservice.exception.WorkflowNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.persistence.PersistenceException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WorkflowNotFoundException.class)
    public ResponseEntity<String> handleWorkflowNotFoundException(WorkflowNotFoundException ex) {
        return new ResponseEntity<>("Workflow not found: " + ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PersistenceException.class)
    public ResponseEntity<String> handlePersistenceException(PersistenceException ex) {
        return new ResponseEntity<>("Database error: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        return new ResponseEntity<>("An error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}