package com.galvinusanalytics.backend_at.client;

import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.galvinusanalytics.backend_at.dto.module.SalesQuoteDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SalesQuoteManagementClient {

    private final RestTemplate restTemplate;
    private static final String SALES_QUOTE_SERVICE_URL = "http://localhost:4002/api/sales-quote";

    public List<SalesQuoteDataDTO> fetchAllSalesQuotes() {
        try {
            log.info("Fetching sales quotes from: {}", SALES_QUOTE_SERVICE_URL);
            ResponseEntity<List<SalesQuoteDataDTO>> response = restTemplate.exchange(
                    SALES_QUOTE_SERVICE_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<SalesQuoteDataDTO>>() {
                    });

            List<SalesQuoteDataDTO> quotes = response.getBody();
            log.info("Successfully fetched {} sales quotes", quotes != null ? quotes.size() : 0);
            return quotes != null ? quotes : Collections.emptyList();

        } catch (Exception e) {
            log.error("Error fetching sales quotes from Sales Quote service", e);
            return Collections.emptyList();
        }
    }
}
