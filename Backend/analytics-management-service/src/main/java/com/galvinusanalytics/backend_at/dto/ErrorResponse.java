package com.galvinusanalytics.backend_at.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    private Boolean success;
    private String message;
    private List<String> errors;
    private LocalDateTime timestamp;
}
