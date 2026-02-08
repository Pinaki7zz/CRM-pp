package com.galvinusanalytics.backend_at.repository;

import com.galvinusanalytics.backend_at.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Find all reports by user ID
    List<Report> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find all favorite reports by user ID
    @Query("SELECT r FROM Report r WHERE r.userId = :userId AND r.isFavourite = true ORDER BY r.createdAt DESC")
    List<Report> findFavouriteReportsByUserId(@Param("userId") String userId);
    
    // Find reports by folder ID
    List<Report> findByFolderIdOrderByCreatedAtDesc(Long folderId);
    
    // Find reports by module
    List<Report> findByUserIdAndModuleOrderByCreatedAtDesc(String userId, String module);
    
    // Find reports by visibility
    @Query("SELECT r FROM Report r WHERE r.userId = :userId AND r.visibility = :visibility ORDER BY r.createdAt DESC")
    List<Report> findByUserIdAndVisibility(@Param("userId") String userId, @Param("visibility") String visibility);
    
    // Find private reports
    @Query("SELECT r FROM Report r WHERE r.userId = :userId AND r.visibility = 'PRIVATE' ORDER BY r.createdAt DESC")
    List<Report> findPrivateReportsByUserId(@Param("userId") String userId);
    
    // Find public reports
    @Query("SELECT r FROM Report r WHERE r.visibility = 'PUBLIC' ORDER BY r.createdAt DESC")
    List<Report> findPublicReports();
    
    // Search reports by name
    @Query("SELECT r FROM Report r WHERE r.userId = :userId AND LOWER(r.reportName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY r.createdAt DESC")
    List<Report> searchReportsByName(@Param("userId") String userId, @Param("searchTerm") String searchTerm);
}
