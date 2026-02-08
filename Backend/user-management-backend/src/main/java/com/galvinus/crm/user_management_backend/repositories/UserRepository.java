package com.galvinus.crm.user_management_backend.repositories;

import com.galvinus.crm.user_management_backend.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
	Optional<User> findByUserId(String userId);

	Optional<User> findByUsername(String username);

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByUserId(String userId);

	Optional<User> findByUsernameOrEmail(String username, String email);

	@Query(value = "SELECT u.user_id FROM users u WHERE u.user_id IS NOT NULL ORDER BY u.user_id DESC LIMIT 1", nativeQuery = true)
	String findLatestUserId();
}