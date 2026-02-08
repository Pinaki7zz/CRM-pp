package com.galvinusanalytics.backend_at.validator;

import com.galvinusanalytics.backend_at.dto.ReportDTO;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class ReportValidator {
    
    private static final int MIN_NAME_LENGTH = 1;
    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;
    private static final List<String> VALID_MODULES = List.of("Lead", "Account", "Opportunity", "Contact", "Sales Quotes", "Sales Order");
    private static final List<String> VALID_VISIBILITIES = List.of("PRIVATE", "SHARED", "PUBLIC");
    
    public List<String> validateReportCreation(ReportDTO reportDTO) {
        List<String> errors = new ArrayList<>();
        
        if (reportDTO == null) {
            errors.add("Report data cannot be null");
            return errors;
        }
        
        errors.addAll(validateReportName(reportDTO.getReportName()));
        errors.addAll(validateDescription(reportDTO.getDescription()));
        errors.addAll(validateModule(reportDTO.getModule()));
        
        return errors;
    }
    
    public List<String> validateReportUpdate(ReportDTO reportDTO) {
        List<String> errors = new ArrayList<>();
        
        if (reportDTO == null) {
            errors.add("Report data cannot be null");
            return errors;
        }
        
        errors.addAll(validateReportName(reportDTO.getReportName()));
        errors.addAll(validateDescription(reportDTO.getDescription()));
        
        if (reportDTO.getVisibility() != null) {
            errors.addAll(validateVisibility(reportDTO.getVisibility()));
        }
        
        return errors;
    }
    
    public List<String> validateReportName(String reportName) {
        List<String> errors = new ArrayList<>();
        
        if (reportName == null || reportName.trim().isEmpty()) {
            errors.add("Report name cannot be empty");
            return errors;
        }
        
        if (reportName.length() < MIN_NAME_LENGTH) {
            errors.add("Report name must be at least " + MIN_NAME_LENGTH + " character");
        }
        
        if (reportName.length() > MAX_NAME_LENGTH) {
            errors.add("Report name cannot exceed " + MAX_NAME_LENGTH + " characters");
        }
        
        return errors;
    }
    
    public List<String> validateDescription(String description) {
        List<String> errors = new ArrayList<>();
        
        if (description != null && description.length() > MAX_DESCRIPTION_LENGTH) {
            errors.add("Report description cannot exceed " + MAX_DESCRIPTION_LENGTH + " characters");
        }
        
        return errors;
    }
    
    public List<String> validateModule(String module) {
        List<String> errors = new ArrayList<>();
        
        if (module == null || module.trim().isEmpty()) {
            errors.add("Module cannot be empty");
            return errors;
        }
        
        if (!VALID_MODULES.contains(module)) {
            errors.add("Module must be one of: " + String.join(", ", VALID_MODULES));
        }
        
        return errors;
    }
    
    public List<String> validateVisibility(String visibility) {
        List<String> errors = new ArrayList<>();
        
        if (visibility == null || visibility.trim().isEmpty()) {
            errors.add("Visibility cannot be empty");
            return errors;
        }
        
        if (!VALID_VISIBILITIES.contains(visibility.toUpperCase())) {
            errors.add("Visibility must be one of: " + String.join(", ", VALID_VISIBILITIES));
        }
        
        return errors;
    }
    
    public List<String> validateUserId(String userId) {
        List<String> errors = new ArrayList<>();
        
        if (userId == null || userId.trim().isEmpty()) {
            errors.add("User ID cannot be empty");
            return errors;
        }
        
        if (userId.length() > 255) {
            errors.add("User ID cannot exceed 255 characters");
        }
        
        return errors;
    }
    
    public List<String> validateReportId(Long reportId) {
        List<String> errors = new ArrayList<>();
        
        if (reportId == null) {
            errors.add("Report ID cannot be null");
            return errors;
        }
        
        if (reportId <= 0) {
            errors.add("Report ID must be a positive number");
        }
        
        return errors;
    }
    
    public boolean hasErrors(List<String> errors) {
        return errors != null && !errors.isEmpty();
    }
}
