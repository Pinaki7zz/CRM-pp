package com.galvinusanalytics.backend_at.service;

import com.galvinusanalytics.backend_at.dto.FolderDTO;
import com.galvinusanalytics.backend_at.entity.Folder;
import com.galvinusanalytics.backend_at.exception.ValidationException;
import com.galvinusanalytics.backend_at.repository.FolderRepository;
import com.galvinusanalytics.backend_at.validator.FolderValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {
    
    private final FolderRepository folderRepository;
    private final FolderValidator folderValidator;
    
    @Transactional
    public FolderDTO createFolder(FolderDTO folderDTO, String userId) {
        List<String> errors = folderValidator.validateFolderCreation(folderDTO);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("Folder validation failed", errors);
        }
        
        errors = folderValidator.validateUserId(userId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        Folder folder = new Folder();
        folder.setName(folderDTO.getName().trim());
        folder.setDescription(folderDTO.getDescription() != null ? folderDTO.getDescription().trim() : "");
        folder.setUserId(userId);
        folder.setIsFavourite(false);
        folder.setVisibility("PRIVATE");
        
        Folder savedFolder = folderRepository.save(folder);
        return convertToDTO(savedFolder);
    }
    
    @Transactional(readOnly = true)
    public List<FolderDTO> getAllFoldersByUser(String userId) {
        List<String> errors = folderValidator.validateUserId(userId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return folderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FolderDTO> getFavouriteFolders(String userId) {
        List<String> errors = folderValidator.validateUserId(userId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return folderRepository.findFavouriteFoldersByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FolderDTO> getFoldersByVisibility(String userId, String visibility) {
        List<String> errors = folderValidator.validateUserId(userId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        errors = folderValidator.validateVisibility(visibility);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("Visibility validation failed", errors);
        }
        
        return folderRepository.findByUserIdAndVisibility(userId, visibility.toUpperCase())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public FolderDTO getFolderById(Long folderId, String userId) {
        List<String> errors = folderValidator.validateFolderId(folderId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("Folder ID validation failed", errors);
        }
        
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        return convertToDTO(folder);
    }
    
    @Transactional
    public FolderDTO updateFolder(Long folderId, FolderDTO folderDTO, String userId) {
        List<String> errors = folderValidator.validateFolderId(folderId);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("Folder ID validation failed", errors);
        }
        
        errors = folderValidator.validateFolderUpdate(folderDTO);
        if (folderValidator.hasErrors(errors)) {
            throw new ValidationException("Folder validation failed", errors);
        }
        
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        folder.setName(folderDTO.getName().trim());
        folder.setDescription(folderDTO.getDescription() != null ? folderDTO.getDescription().trim() : "");
        if (folderDTO.getVisibility() != null) {
            folder.setVisibility(folderDTO.getVisibility().toUpperCase());
        }
        
        Folder updatedFolder = folderRepository.save(folder);
        return convertToDTO(updatedFolder);
    }
    
    @Transactional
    public FolderDTO toggleFavourite(Long folderId, String userId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        folder.setIsFavourite(!folder.getIsFavourite());
        Folder updatedFolder = folderRepository.save(folder);
        return convertToDTO(updatedFolder);
    }
    
    @Transactional
    public FolderDTO addToFavourite(Long folderId, String userId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        folder.setIsFavourite(true);
        Folder updatedFolder = folderRepository.save(folder);
        return convertToDTO(updatedFolder);
    }
    
    @Transactional
    public FolderDTO removeFromFavourite(Long folderId, String userId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        folder.setIsFavourite(false);
        Folder updatedFolder = folderRepository.save(folder);
        return convertToDTO(updatedFolder);
    }
    
    @Transactional
    public void deleteFolder(Long folderId, String userId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        
        if (!folder.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        folderRepository.delete(folder);
    }
    
    private FolderDTO convertToDTO(Folder folder) {
        return new FolderDTO(
                folder.getId(),
                folder.getName(),
                folder.getDescription(),
                folder.getIsFavourite(),
                folder.getVisibility(),
                folder.getCreatedAt(),
                folder.getUpdatedAt()
        );
    }
}
