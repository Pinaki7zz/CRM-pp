package com.galvinusanalytics.backend_at.repository;

import com.galvinusanalytics.backend_at.entity.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    
    List<Dashboard> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT d FROM Dashboard d WHERE d.userId = :userId AND d.isFavourite = true ORDER BY d.createdAt DESC")
    List<Dashboard> findFavouriteDashboardsByUserId(@Param("userId") String userId);
    
    @Query("SELECT d FROM Dashboard d WHERE d.userId = :userId AND d.visibility = :visibility ORDER BY d.createdAt DESC")
    List<Dashboard> findByUserIdAndVisibility(@Param("userId") String userId, @Param("visibility") String visibility);
    
    List<Dashboard> findByFolderIdOrderByCreatedAtDesc(Long folderId);
}
