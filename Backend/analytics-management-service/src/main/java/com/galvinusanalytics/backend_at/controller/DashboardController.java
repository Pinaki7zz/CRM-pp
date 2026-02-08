package com.galvinusanalytics.backend_at.controller;

import com.galvinusanalytics.backend_at.dto.DashboardDTO;
import com.galvinusanalytics.backend_at.dto.APIResponse;
import com.galvinusanalytics.backend_at.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/anm/api/dashboards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    private String getUserId(String userId) {
        return (userId == null || userId.trim().isEmpty()) ? "default-user" : userId;
    }

    /**
     * Create a new dashboard
     */
    @PostMapping
    public ResponseEntity<?> createDashboard(
            @RequestBody DashboardDTO dashboardDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO createdDashboard = dashboardService.createDashboard(dashboardDTO, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new APIResponse<>(true, "Dashboard created successfully", createdDashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error creating dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error creating dashboard: " + e.getMessage(), null));
        }
    }

    /**
     * Get all dashboards
     */
    @GetMapping
    public ResponseEntity<?> getAllDashboards(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<DashboardDTO> dashboards = dashboardService.getAllDashboardsByUser(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboards retrieved successfully", dashboards));
        } catch (Exception e) {
            log.error("Error retrieving dashboards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving dashboards: " + e.getMessage(), null));
        }
    }

    /**
     * Get favorite dashboards
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavouriteDashboards(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<DashboardDTO> dashboards = dashboardService.getFavouriteDashboards(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Favorite dashboards retrieved successfully", dashboards));
        } catch (Exception e) {
            log.error("Error retrieving favorite dashboards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving favorite dashboards: " + e.getMessage(), null));
        }
    }

    /**
     * Get dashboards by visibility
     */
    @GetMapping("/visibility/{visibility}")
    public ResponseEntity<?> getDashboardsByVisibility(
            @PathVariable String visibility,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<DashboardDTO> dashboards = dashboardService.getDashboardsByVisibility(userId, visibility);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboards retrieved successfully", dashboards));
        } catch (Exception e) {
            log.error("Error retrieving dashboards by visibility", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving dashboards: " + e.getMessage(), null));
        }
    }

    /**
     * Get dashboards by folder
     */
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<?> getDashboardsByFolder(@PathVariable Long folderId) {
        try {
            List<DashboardDTO> dashboards = dashboardService.getDashboardsByFolder(folderId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboards retrieved successfully", dashboards));
        } catch (Exception e) {
            log.error("Error retrieving dashboards by folder", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving dashboards: " + e.getMessage(), null));
        }
    }

    /**
     * Get single dashboard
     */
    @GetMapping("/{dashboardId}")
    public ResponseEntity<?> getDashboardById(
            @PathVariable Long dashboardId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO dashboard = dashboardService.getDashboardById(dashboardId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard retrieved successfully", dashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error retrieving dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving dashboard: " + e.getMessage(), null));
        }
    }

    /**
     * Update dashboard
     */
    @PutMapping("/{dashboardId}")
    public ResponseEntity<?> updateDashboard(
            @PathVariable Long dashboardId,
            @RequestBody DashboardDTO dashboardDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO updatedDashboard = dashboardService.updateDashboard(dashboardId, dashboardDTO, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard updated successfully", updatedDashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error updating dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error updating dashboard: " + e.getMessage(), null));
        }
    }

    /**
     * Toggle favorite
     */
    @PutMapping("/{dashboardId}/toggle-favorite")
    public ResponseEntity<?> toggleFavourite(
            @PathVariable Long dashboardId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO updatedDashboard = dashboardService.toggleFavourite(dashboardId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard favorite status toggled successfully", updatedDashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error toggling favorite", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error toggling favorite: " + e.getMessage(), null));
        }
    }

    /**
     * Add to favorite
     */
    @PutMapping("/{dashboardId}/add-favorite")
    public ResponseEntity<?> addToFavourite(
            @PathVariable Long dashboardId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO updatedDashboard = dashboardService.addToFavourite(dashboardId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard added to favorites", updatedDashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error adding to favorites", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error adding to favorites: " + e.getMessage(), null));
        }
    }

    /**
     * Remove from favorite
     */
    @PutMapping("/{dashboardId}/remove-favorite")
    public ResponseEntity<?> removeFromFavourite(
            @PathVariable Long dashboardId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            DashboardDTO updatedDashboard = dashboardService.removeFromFavourite(dashboardId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard removed from favorites", updatedDashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error removing from favorites", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error removing from favorites: " + e.getMessage(), null));
        }
    }

    /**
     * Delete dashboard
     */
    @DeleteMapping("/{dashboardId}")
    public ResponseEntity<?> deleteDashboard(
            @PathVariable Long dashboardId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            dashboardService.deleteDashboard(dashboardId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Dashboard deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error deleting dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error deleting dashboard: " + e.getMessage(), null));
        }
    }
}
