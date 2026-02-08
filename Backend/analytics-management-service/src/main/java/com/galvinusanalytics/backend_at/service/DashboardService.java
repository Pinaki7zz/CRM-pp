package com.galvinusanalytics.backend_at.service;

import com.galvinusanalytics.backend_at.dto.DashboardDTO;
import com.galvinusanalytics.backend_at.dto.DashboardTileDTO;
import com.galvinusanalytics.backend_at.entity.Dashboard;
import com.galvinusanalytics.backend_at.entity.DashboardTile;
import com.galvinusanalytics.backend_at.entity.Folder;
import com.galvinusanalytics.backend_at.entity.Report;
import com.galvinusanalytics.backend_at.exception.ValidationException;
import com.galvinusanalytics.backend_at.repository.DashboardRepository;
import com.galvinusanalytics.backend_at.repository.DashboardTileRepository;
import com.galvinusanalytics.backend_at.repository.FolderRepository;
import com.galvinusanalytics.backend_at.repository.ReportRepository;
import com.galvinusanalytics.backend_at.validator.DashboardValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final DashboardRepository dashboardRepository;
    private final DashboardTileRepository dashboardTileRepository;
    private final DashboardValidator dashboardValidator;
    private final FolderRepository folderRepository;
    private final ReportRepository reportRepository;
    
    @Transactional
    public DashboardDTO createDashboard(DashboardDTO dashboardDTO, String userId) {
        List<String> errors = dashboardValidator.validateDashboardCreation(dashboardDTO);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("Dashboard validation failed", errors);
        }
        
        errors = dashboardValidator.validateUserId(userId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        Dashboard dashboard = new Dashboard();
        dashboard.setName(dashboardDTO.getName().trim());
        dashboard.setDescription(dashboardDTO.getDescription() != null ? dashboardDTO.getDescription().trim() : "");
        dashboard.setUserId(userId);
        dashboard.setFolderId(dashboardDTO.getFolderId());
        dashboard.setIsFavourite(false);
        dashboard.setVisibility("PRIVATE");
        
        Dashboard savedDashboard = dashboardRepository.save(dashboard);
        
        // Save tiles if provided
        if (dashboardDTO.getTiles() != null && !dashboardDTO.getTiles().isEmpty()) {
            int order = 0;
            for (DashboardTileDTO tileDTO : dashboardDTO.getTiles()) {
                DashboardTile tile = new DashboardTile();
                tile.setDashboardId(savedDashboard.getId());
                tile.setReportId(tileDTO.getReportId());
                tile.setFolderId(tileDTO.getFolderId());
                tile.setChartType(tileDTO.getChartType());
                tile.setYAxis(tileDTO.getYAxis());
                tile.setXAxis(tileDTO.getXAxis());
                tile.setXRangeMode(tileDTO.getXRangeMode());
                tile.setXMin(tileDTO.getXMin());
                tile.setXMax(tileDTO.getXMax());
                tile.setTileOrder(order++);
                dashboardTileRepository.save(tile);
            }
        }
        
        return convertToDTO(savedDashboard);
    }
    
    @Transactional(readOnly = true)
    public List<DashboardDTO> getAllDashboardsByUser(String userId) {
        List<String> errors = dashboardValidator.validateUserId(userId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return dashboardRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DashboardDTO> getFavouriteDashboards(String userId) {
        List<String> errors = dashboardValidator.validateUserId(userId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        return dashboardRepository.findFavouriteDashboardsByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DashboardDTO> getDashboardsByVisibility(String userId, String visibility) {
        List<String> errors = dashboardValidator.validateUserId(userId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("User validation failed", errors);
        }
        
        errors = dashboardValidator.validateVisibility(visibility);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("Visibility validation failed", errors);
        }
        
        return dashboardRepository.findByUserIdAndVisibility(userId, visibility.toUpperCase())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DashboardDTO> getDashboardsByFolder(Long folderId) {
        return dashboardRepository.findByFolderIdOrderByCreatedAtDesc(folderId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public DashboardDTO getDashboardById(Long dashboardId, String userId) {
        List<String> errors = dashboardValidator.validateDashboardId(dashboardId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("Dashboard ID validation failed", errors);
        }
        
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        return convertToDTO(dashboard);
    }
    
    @Transactional
    public DashboardDTO updateDashboard(Long dashboardId, DashboardDTO dashboardDTO, String userId) {
        List<String> errors = dashboardValidator.validateDashboardId(dashboardId);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("Dashboard ID validation failed", errors);
        }
        
        errors = dashboardValidator.validateDashboardUpdate(dashboardDTO);
        if (dashboardValidator.hasErrors(errors)) {
            throw new ValidationException("Dashboard validation failed", errors);
        }
        
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        dashboard.setName(dashboardDTO.getName().trim());
        dashboard.setDescription(dashboardDTO.getDescription() != null ? dashboardDTO.getDescription().trim() : "");
        dashboard.setFolderId(dashboardDTO.getFolderId());
        if (dashboardDTO.getVisibility() != null) {
            dashboard.setVisibility(dashboardDTO.getVisibility().toUpperCase());
        }
        
        Dashboard updatedDashboard = dashboardRepository.save(dashboard);
        
        // Update tiles if provided
        if (dashboardDTO.getTiles() != null) {
            // Delete existing tiles
            dashboardTileRepository.deleteByDashboardId(dashboardId);
            
            // Save new tiles
            int order = 0;
            for (DashboardTileDTO tileDTO : dashboardDTO.getTiles()) {
                DashboardTile tile = new DashboardTile();
                tile.setDashboardId(updatedDashboard.getId());
                tile.setReportId(tileDTO.getReportId());
                tile.setFolderId(tileDTO.getFolderId());
                tile.setChartType(tileDTO.getChartType());
                tile.setYAxis(tileDTO.getYAxis());
                tile.setXAxis(tileDTO.getXAxis());
                tile.setXRangeMode(tileDTO.getXRangeMode());
                tile.setXMin(tileDTO.getXMin());
                tile.setXMax(tileDTO.getXMax());
                tile.setTileOrder(order++);
                dashboardTileRepository.save(tile);
            }
        }
        
        return convertToDTO(updatedDashboard);
    }
    
    @Transactional
    public DashboardDTO toggleFavourite(Long dashboardId, String userId) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        dashboard.setIsFavourite(!dashboard.getIsFavourite());
        Dashboard updatedDashboard = dashboardRepository.save(dashboard);
        return convertToDTO(updatedDashboard);
    }
    
    @Transactional
    public DashboardDTO addToFavourite(Long dashboardId, String userId) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        dashboard.setIsFavourite(true);
        Dashboard updatedDashboard = dashboardRepository.save(dashboard);
        return convertToDTO(updatedDashboard);
    }
    
    @Transactional
    public DashboardDTO removeFromFavourite(Long dashboardId, String userId) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        dashboard.setIsFavourite(false);
        Dashboard updatedDashboard = dashboardRepository.save(dashboard);
        return convertToDTO(updatedDashboard);
    }
    
    @Transactional
    public void deleteDashboard(Long dashboardId, String userId) {
        Dashboard dashboard = dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new IllegalArgumentException("Dashboard not found"));
        
        if (!dashboard.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        
        // Delete associated tiles first
        dashboardTileRepository.deleteByDashboardId(dashboardId);
        
        dashboardRepository.delete(dashboard);
    }
    
    private DashboardDTO convertToDTO(Dashboard dashboard) {
        DashboardDTO dto = new DashboardDTO();
        dto.setId(dashboard.getId());
        dto.setName(dashboard.getName());
        dto.setDescription(dashboard.getDescription());
        dto.setFolderId(dashboard.getFolderId());
        
        // Lookup folder name with proper null handling
        if (dashboard.getFolderId() != null) {
            try {
                folderRepository.findById(dashboard.getFolderId())
                        .ifPresentOrElse(
                            folder -> {
                                dto.setFolderName(folder.getName());
                                log.debug("Dashboard ID {} mapped to folder: {}", dashboard.getId(), folder.getName());
                            },
                            () -> {
                                log.warn("Dashboard ID {} has folderId {} but folder not found", 
                                        dashboard.getId(), dashboard.getFolderId());
                                dto.setFolderName("");
                            }
                        );
            } catch (Exception e) {
                log.error("Error looking up folder for dashboard ID {}: {}", dashboard.getId(), e.getMessage());
                dto.setFolderName("");
            }
        } else {
            log.debug("Dashboard ID {} has no folder assigned", dashboard.getId());
            dto.setFolderName("");
        }
        
        dto.setVisibility(dashboard.getVisibility());
        dto.setIsFavourite(dashboard.getIsFavourite());
        dto.setCreatedAt(dashboard.getCreatedAt());
        dto.setUpdatedAt(dashboard.getUpdatedAt());
        dto.setCreatedBy(dashboard.getUserId());
        
        // Load tiles
        List<DashboardTile> tiles = dashboardTileRepository.findByDashboardIdOrderByTileOrder(dashboard.getId());
        List<DashboardTileDTO> tileDTOs = tiles.stream()
                .map(this::convertTileToDTO)
                .collect(Collectors.toList());
        dto.setTiles(tileDTOs);
        
        return dto;
    }
    
    private DashboardTileDTO convertTileToDTO(DashboardTile tile) {
        DashboardTileDTO dto = new DashboardTileDTO();
        dto.setId(tile.getId());
        dto.setDashboardId(tile.getDashboardId());
        dto.setReportId(tile.getReportId());
        dto.setFolderId(tile.getFolderId());
        dto.setChartType(tile.getChartType());
        dto.setYAxis(tile.getYAxis());
        dto.setXAxis(tile.getXAxis());
        dto.setXRangeMode(tile.getXRangeMode());
        dto.setXMin(tile.getXMin());
        dto.setXMax(tile.getXMax());
        dto.setTileOrder(tile.getTileOrder());
        
        // Lookup report name
        if (tile.getReportId() != null) {
            try {
                reportRepository.findById(tile.getReportId())
                        .ifPresent(report -> dto.setReportName(report.getReportName()));
            } catch (Exception e) {
                log.error("Error looking up report for tile ID {}: {}", tile.getId(), e.getMessage());
                dto.setReportName("");
            }
        }
        
        // Lookup folder name
        if (tile.getFolderId() != null) {
            try {
                folderRepository.findById(tile.getFolderId())
                        .ifPresent(folder -> dto.setFolderName(folder.getName()));
            } catch (Exception e) {
                log.error("Error looking up folder for tile ID {}: {}", tile.getId(), e.getMessage());
                dto.setFolderName("");
            }
        }
        
        return dto;
    }
}
