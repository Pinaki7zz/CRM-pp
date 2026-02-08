package com.galvinusanalytics.backend_at.controller;

import com.galvinusanalytics.backend_at.dto.FolderDTO;
import com.galvinusanalytics.backend_at.dto.APIResponse;
import com.galvinusanalytics.backend_at.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/anm/api/folders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FolderController {

    private final FolderService folderService;

    private String getUserId(String userId) {
        return (userId == null || userId.trim().isEmpty()) ? "default-user" : userId;
    }

    /**
     * Create a new folder
     */
    @PostMapping
    public ResponseEntity<?> createFolder(
            @RequestBody FolderDTO folderDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO createdFolder = folderService.createFolder(folderDTO, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new APIResponse<>(true, "Folder created successfully", createdFolder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error creating folder: " + e.getMessage(), null));
        }
    }

    /**
     * Get all folders
     */
    @GetMapping
    public ResponseEntity<?> getAllFolders(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<FolderDTO> folders = folderService.getAllFoldersByUser(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folders retrieved successfully", folders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving folders: " + e.getMessage(), null));
        }
    }

    /**
     * Get favorite folders
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavouriteFolders(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<FolderDTO> folders = folderService.getFavouriteFolders(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Favorite folders retrieved successfully", folders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving favorite folders: " + e.getMessage(), null));
        }
    }

    /**
     * Get folders by visibility
     */
    @GetMapping("/visibility/{visibility}")
    public ResponseEntity<?> getFoldersByVisibility(
            @PathVariable String visibility,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<FolderDTO> folders = folderService.getFoldersByVisibility(userId, visibility);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folders retrieved successfully", folders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving folders: " + e.getMessage(), null));
        }
    }

    /**
     * Get single folder
     */
    @GetMapping("/{folderId}")
    public ResponseEntity<?> getFolderById(
            @PathVariable Long folderId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO folder = folderService.getFolderById(folderId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder retrieved successfully", folder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving folder: " + e.getMessage(), null));
        }
    }

    /**
     * Update folder
     */
    @PutMapping("/{folderId}")
    public ResponseEntity<?> updateFolder(
            @PathVariable Long folderId,
            @RequestBody FolderDTO folderDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO updatedFolder = folderService.updateFolder(folderId, folderDTO, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder updated successfully", updatedFolder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error updating folder: " + e.getMessage(), null));
        }
    }

    /**
     * Toggle favorite
     */
    @PutMapping("/{folderId}/toggle-favorite")
    public ResponseEntity<?> toggleFavourite(
            @PathVariable Long folderId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO updatedFolder = folderService.toggleFavourite(folderId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder favorite status toggled successfully", updatedFolder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error toggling favorite: " + e.getMessage(), null));
        }
    }

    /**
     * Add to favorite
     */
    @PutMapping("/{folderId}/add-favorite")
    public ResponseEntity<?> addToFavourite(
            @PathVariable Long folderId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO updatedFolder = folderService.addToFavourite(folderId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder added to favorites", updatedFolder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error adding to favorites: " + e.getMessage(), null));
        }
    }

    /**
     * 
     * Remove from favorite
     */
    @PutMapping("/{folderId}/remove-favorite")
    public ResponseEntity<?> removeFromFavourite(
            @PathVariable Long folderId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            FolderDTO updatedFolder = folderService.removeFromFavourite(folderId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder removed from favorites", updatedFolder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error removing from favorites: " + e.getMessage(), null));
        }
    }

    /**
     * Delete folder
     */
    @DeleteMapping("/{folderId}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable Long folderId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            folderService.deleteFolder(folderId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Folder deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error deleting folder: " + e.getMessage(), null));
        }
    }
}
