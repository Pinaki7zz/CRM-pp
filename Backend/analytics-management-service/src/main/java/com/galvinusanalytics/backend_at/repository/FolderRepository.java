package com.galvinusanalytics.backend_at.repository;

import com.galvinusanalytics.backend_at.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    
    List<Folder> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT f FROM Folder f WHERE f.userId = :userId AND f.isFavourite = true ORDER BY f.createdAt DESC")
    List<Folder> findFavouriteFoldersByUserId(@Param("userId") String userId);
    
    @Query("SELECT f FROM Folder f WHERE f.userId = :userId AND f.visibility = :visibility ORDER BY f.createdAt DESC")
    List<Folder> findByUserIdAndVisibility(@Param("userId") String userId, @Param("visibility") String visibility);
}
