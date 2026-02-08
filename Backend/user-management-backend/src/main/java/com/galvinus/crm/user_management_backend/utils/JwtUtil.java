package com.galvinus.crm.user_management_backend.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import com.galvinus.crm.user_management_backend.entities.User;

@Component
public class JwtUtil {

	@Value("${jwt.access.secret}")
	private String accessSecret;

	@Value("${jwt.refresh.secret}")
	private String refreshSecret;

	@Value("${jwt.access.expiration}")
	private long accessTokenExpirationMs;

	@Value("${jwt.refresh.expiration}")
	private long refreshTokenExpirationMs;

	@Value("${jwt.reset.secret}")
	private String resetSecret;

	private SecretKey accessKey;
	private SecretKey refreshKey;

	private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

	@PostConstruct
	public void init() {
		// If secrets are plain strings (not Base64), use .getBytes()
		accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
		refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
	}

	// ✅ Equivalent to Node's generateAccessToken
	public String generateAccessToken(Map<String, Object> claims) {
		return Jwts.builder()
				.claims(claims)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
				.signWith(accessKey, Jwts.SIG.HS256) // SecretKey + MacAlgorithm ✅
				.compact();
	}

	// ✅ Equivalent to Node's generateRefreshToken
	public String generateRefreshToken(UUID userId, long expiryOverrideMs) {
		long expiry = expiryOverrideMs > 0 ? expiryOverrideMs : refreshTokenExpirationMs;

		return Jwts.builder()
				.subject(userId.toString())
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiry))
				.signWith(refreshKey, Jwts.SIG.HS256)
				.compact();
	}

	// ✅ Validate Refresh Token and return userId
	public UUID validateRefreshToken(String token) {
		try {
			var claims = Jwts.parser()
					.verifyWith(refreshKey)
					.build()
					.parseSignedClaims(token)
					.getPayload();

			String userIdStr = claims.getSubject();
			return userIdStr != null ? UUID.fromString(userIdStr) : null;
		} catch (Exception e) {
			return null; // Invalid or expired token
		}
	}

	// ✅ Overloaded generateAccessToken(User user)
	public String generateAccessToken(User user) {
		Map<String, Object> claims = Map.of(
				"id", user.getId(),
				"username", user.getUsername(),
				"businessRoleId", user.getBusinessRole() != null ? user.getBusinessRole().getId() : null);
		return Jwts.builder()
				.claims(claims)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
				.signWith(accessKey, Jwts.SIG.HS256)
				.compact();
	}

	// ✅ Overloaded generateRefreshToken(User user)
	public String generateRefreshToken(User user) {
		long expiry = user.isRememberMe() ? 7L * 24 * 3600 * 1000 : 30 * 60 * 1000;
		return Jwts.builder()
				.subject(user.getId().toString())
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiry))
				.signWith(refreshKey, Jwts.SIG.HS256)
				.compact();
	}

	// ✅ Extract username or any claim if needed (utility)
	public String extractUsername(String token) {
		try {
			return (String) Jwts.parser()
					.verifyWith(accessKey)
					.build()
					.parseSignedClaims(token)
					.getPayload()
					.get("username");
		} catch (Exception e) {
			return null;
		}
	}

	// ✅ Extract and validate claims
	public Map<String, Object> extractAllClaims(String token, boolean isAccessToken) {
		SecretKey key = isAccessToken ? accessKey : refreshKey;

		return Jwts.parser()
				.verifyWith(key) // ✅ works now, since key is SecretKey
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public String generateResetToken(UUID userId, long expirySeconds) {
		Instant now = Instant.now();
		Instant expiry = now.plusSeconds(expirySeconds);

		Map<String, Object> claims = Map.of("id", userId.toString());

		return Jwts.builder()
				.claims(claims)
				.subject(userId.toString())
				.issuedAt(Date.from(now))
				.expiration(Date.from(expiry))
				// ✅ Correct new signWith() call
				.signWith(getResetKey(), Jwts.SIG.HS256)
				.compact();
	}

	public SecretKey getResetKey() {
		if (resetSecret == null || resetSecret.isBlank()) {
			throw new IllegalStateException("jwt.reset.secret property is not set");
		}
		return Keys.hmacShaKeyFor(resetSecret.getBytes(StandardCharsets.UTF_8));
	}

	// public boolean isTokenValid(String token, UserDetails userDetails) {
	// try {
	// var claims = Jwts.parser()
	// .verifyWith(accessKey)
	// .build()
	// .parseSignedClaims(token)
	// .getPayload();

	// String username = (String) claims.get("username");
	// Date expiration = claims.getExpiration();

	// return username != null
	// && username.equals(userDetails.getUsername())
	// && expiration.after(new Date());
	// } catch (Exception e) {
	// return false;
	// }
	// }

	public boolean isTokenValid(String token, UserDetails userDetails) {
		try {
			var jwt = Jwts.parser()
					.verifyWith(accessKey)
					.build()
					.parseSignedClaims(token);
			var claims = jwt.getPayload();

			Object uObj = claims.get("username");
			String usernameClaim = uObj != null ? uObj.toString() : null;
			Date expiration = claims.getExpiration();

			log.debug("Validating JWT: usernameClaim='{}', userDetails.username='{}', exp='{}'",
					usernameClaim, userDetails == null ? null : userDetails.getUsername(), expiration);

			if (usernameClaim == null || userDetails == null) {
				return false;
			}

			boolean notExpired = expiration != null && expiration.after(new Date());
			boolean usernameMatches = usernameClaim.equals(userDetails.getUsername());

			log.debug("Token validation result -> usernameMatches: {}, notExpired: {}", usernameMatches, notExpired);

			return usernameMatches && notExpired;
		} catch (Exception e) {
			log.warn("JWT validation failed: " + e.getMessage(), e);
			return false;
		}
	}
}
