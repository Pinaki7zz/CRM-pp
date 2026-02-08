package com.galvinusanalytics.backend_at.controller;

import com.galvinusanalytics.backend_at.dto.ReportDTO;
import com.galvinusanalytics.backend_at.dto.ReportExecutionDTO;
import com.galvinusanalytics.backend_at.dto.ReportResultDTO;
import com.galvinusanalytics.backend_at.dto.APIResponse;
import com.galvinusanalytics.backend_at.service.ReportExecutionService;
import com.galvinusanalytics.backend_at.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/anm/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;
    private final ReportExecutionService reportExecutionService;

    private String getUserId(String userId) {
        return (userId == null || userId.trim().isEmpty()) ? "default-user" : userId;
    }

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody ReportDTO reportDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportDTO createdReport = reportService.createReport(reportDTO, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new APIResponse<>(true, "Report created successfully", createdReport));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error creating report: " + e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<ReportDTO> reports = reportService.getAllReportsByUser(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Reports retrieved successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving reports: " + e.getMessage(), null));
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavouriteReports(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<ReportDTO> reports = reportService.getFavouriteReports(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Favorite reports retrieved successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving favorite reports: " + e.getMessage(), null));
        }
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<?> getReportsByFolder(@PathVariable Long folderId) {
        try {
            List<ReportDTO> reports = reportService.getReportsByFolder(folderId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Reports retrieved successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving reports: " + e.getMessage(), null));
        }
    }

    @GetMapping("/private")
    public ResponseEntity<?> getPrivateReports(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<ReportDTO> reports = reportService.getPrivateReports(userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Private reports retrieved successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving private reports: " + e.getMessage(), null));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicReports() {
        try {
            List<ReportDTO> reports = reportService.getPublicReports();
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Public reports retrieved successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving public reports: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportById(
            @PathVariable Long reportId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportDTO report = reportService.getReportById(reportId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report retrieved successfully", report));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error retrieving report: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<?> updateReport(
            @PathVariable Long reportId,
            @RequestBody ReportDTO reportDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportDTO updatedReport = reportService.updateReport(reportId, reportDTO, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report updated successfully", updatedReport));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new APIResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error updating report: " + e.getMessage(), null));
        }
    }

    @PostMapping("/{reportId}/run")
    public ResponseEntity<?> runReport(
            @PathVariable Long reportId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportDTO report = reportService.runReport(reportId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report executed successfully", report));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error running report: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{reportId}/toggle-favorite")
    public ResponseEntity<?> toggleFavourite(
            @PathVariable Long reportId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportDTO updatedReport = reportService.toggleFavourite(reportId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report favorite status toggled successfully", updatedReport));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error toggling favorite: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(
            @PathVariable Long reportId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            reportService.deleteReport(reportId, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error deleting report: " + e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchReports(
            @RequestParam String query,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            List<ReportDTO> reports = reportService.searchReports(userId, query);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Reports search completed successfully", reports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error searching reports: " + e.getMessage(), null));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<?> executeReport(
            @RequestBody ReportExecutionDTO executionDTO,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            userId = getUserId(userId);
            ReportResultDTO result = reportExecutionService.executeReport(executionDTO, userId);
            return ResponseEntity.ok(
                    new APIResponse<>(true, "Report executed successfully", result));
        } catch (Exception e) {
            log.error("Error executing report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>(false, "Error executing report: " + e.getMessage(), null));
        }
    }
}
