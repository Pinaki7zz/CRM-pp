package com.galvinusanalytics.backend_at.repository;

import com.galvinusanalytics.backend_at.entity.DashboardTile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DashboardTileRepository extends JpaRepository<DashboardTile, Long> {
    
    List<DashboardTile> findByDashboardIdOrderByTileOrder(Long dashboardId);
    
    void deleteByDashboardId(Long dashboardId);
}
