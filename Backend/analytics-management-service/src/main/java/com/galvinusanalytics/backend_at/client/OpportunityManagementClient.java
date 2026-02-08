package com.galvinusanalytics.backend_at.client;

import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.galvinusanalytics.backend_at.dto.module.OpportunityDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpportunityManagementClient {

    private final RestTemplate restTemplate;
    private static final String OPPORTUNITY_SERVICE_URL = "http://localhost:4002/api/opportunity";

    public List<OpportunityDataDTO> fetchAllOpportunities() {
        try {
            log.info("Fetching opportunities from: {}", OPPORTUNITY_SERVICE_URL);
            ResponseEntity<List<OpportunityDataDTO>> response = restTemplate.exchange(
                    OPPORTUNITY_SERVICE_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<OpportunityDataDTO>>() {
                    });

            List<OpportunityDataDTO> opportunities = response.getBody();
            log.info("Successfully fetched {} opportunities", opportunities != null ? opportunities.size() : 0);
            return opportunities != null ? opportunities : Collections.emptyList();

        } catch (Exception e) {
            log.error("Error fetching opportunities from Opportunity service", e);
            return Collections.emptyList();
        }
    }
}
