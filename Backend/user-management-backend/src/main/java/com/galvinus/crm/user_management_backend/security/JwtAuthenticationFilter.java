package com.galvinus.crm.user_management_backend.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component; // ✅ Added Import
import org.springframework.web.filter.OncePerRequestFilter;

import com.galvinus.crm.user_management_backend.utils.JwtUtil;

import org.springframework.lang.NonNull;

// ✅ Added Annotation so Spring creates this Bean
@Component 
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
	private final UserDetailsService userDetailsService;

	public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
		this.jwtUtil = jwtUtil;
		this.userDetailsService = userDetailsService;
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain)
			throws ServletException, IOException {
		String token = extractToken(request);

		System.out.println("===========JWT Extracted from cookie/header: " + token);

		if (token != null) {
			String username = jwtUtil.extractUsername(token);
			System.out.println("===========Username from token: " + username);

			if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				try {
					UserDetails userDetails = userDetailsService.loadUserByUsername(username);
					System.out.println("===========Loaded UserDetails: username:" + userDetails.getUsername()
							+ " authorities: " + userDetails.getAuthorities());

					boolean valid = jwtUtil.isTokenValid(token, userDetails);
					System.out.println("===========isTokenValid => " + valid);

					if (valid) {
						UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
								userDetails, null, userDetails.getAuthorities());
						SecurityContextHolder.getContext().setAuthentication(authToken);
						System.out.println("===========Authentication set for user: " + username);
					} else {
						System.out.println("===========Token invalid - not setting Authentication");
					}
				} catch (Exception e) {
					System.out.println("===========Error while authenticating token: " + e.getMessage());
				}
			}
		}

		filterChain.doFilter(request, response);
	}

	private String extractToken(HttpServletRequest request) {
		System.out.println("===========Extracting token from request: " + request);

		// 1️⃣ Try from Authorization header
		String header = request.getHeader("Authorization");
		System.out.println("===========Authorization header: " + header);
		if (header != null && header.startsWith("Bearer ")) {
			return header.substring(7);
		}

		// 2️⃣ Try from accessToken cookie
		System.out.println("===========Trying to get token from cookies: " + request.getCookies());
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("accessToken".equals(cookie.getName())) {
					System.out.println(
							"===========Found accessToken cookie: " + cookie.getName() + " " + cookie.getValue());
					return cookie.getValue();
				}
			}
		}

		return null;
	}
}