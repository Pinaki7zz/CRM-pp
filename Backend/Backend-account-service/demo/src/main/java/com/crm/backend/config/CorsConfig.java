package com.crm.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
	@Value("${app.frontend.url:}")
	private String frontendUrl;

	@SuppressWarnings("NullableProblems")
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		if (!frontendUrl.isBlank()) {
			registry.addMapping("/ac/api/**")
					.allowedOriginPatterns(frontendUrl)
					.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
					.allowedHeaders("*")
					.allowCredentials(true);
		}
	}
}