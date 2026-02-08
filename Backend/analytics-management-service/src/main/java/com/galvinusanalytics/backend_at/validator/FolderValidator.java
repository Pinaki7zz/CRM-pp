package com.galvinusanalytics.backend_at.validator;

import com.galvinusanalytics.backend_at.dto.FolderDTO;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class FolderValidator {
    
    private static final int MIN_NAME_LENGTH = 1;
    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;
    private static final List<String> VALID_VISIBILITIES = List.of("PRIVATE", "SHARED", "PUBLIC");
    
    public List<String> validateFolderCreation(FolderDTO folderDTO) {
        List<String> errors = new ArrayList<>();
        
        if (folderDTO == null) {
            errors.add("Folder data cannot be null");
            return errors;
        }
        
        errors.addAll(validateName(folderDTO.getName()));
        errors.addAll(validateDescription(folderDTO.getDescription()));
        
        return errors;
    }
    
    public List<String> validateFolderUpdate(FolderDTO folderDTO) {
        List<String> errors = new ArrayList<>();
        
        if (folderDTO == null) {
            errors.add("Folder data cannot be null");
            return errors;
        }
        
        errors.addAll(validateName(folderDTO.getName()));
        errors.addAll(validateDescription(folderDTO.getDescription()));
        
        if (folderDTO.getVisibility() != null) {
            errors.addAll(validateVisibility(folderDTO.getVisibility()));
        }
        
        return errors;
    }
    
    public List<String> validateName(String name) {
        List<String> errors = new ArrayList<>();
        
        if (name == null || name.trim().isEmpty()) {
            errors.add("Folder name cannot be empty");
            return errors;
        }
        
        if (name.length() < MIN_NAME_LENGTH) {
            errors.add("Folder name must be at least " + MIN_NAME_LENGTH + " character");
        }
        
        if (name.length() > MAX_NAME_LENGTH) {
            errors.add("Folder name cannot exceed " + MAX_NAME_LENGTH + " characters");
        }
        
        return errors;
    }
    
    public List<String> validateDescription(String description) {
        List<String> errors = new ArrayList<>();
        
        if (description != null && description.length() > MAX_DESCRIPTION_LENGTH) {
            errors.add("Folder description cannot exceed " + MAX_DESCRIPTION_LENGTH + " characters");
        }
        
        return errors;
    }
    
    public List<String> validateVisibility(String visibility) {
        List<String> errors = new ArrayList<>();
        
        if (visibility == null || visibility.trim().isEmpty()) {
            errors.add("Folder visibility cannot be empty");
            return errors;
        }
        
        if (!VALID_VISIBILITIES.contains(visibility.toUpperCase())) {
            errors.add("Folder visibility must be one of: " + String.join(", ", VALID_VISIBILITIES));
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
    
    public List<String> validateFolderId(Long folderId) {
        List<String> errors = new ArrayList<>();
        
        if (folderId == null) {
            errors.add("Folder ID cannot be null");
            return errors;
        }
        
        if (folderId <= 0) {
            errors.add("Folder ID must be a positive number");
        }
        
        return errors;
    }
    
    public boolean hasErrors(List<String> errors) {
        return errors != null && !errors.isEmpty();
    }
}


