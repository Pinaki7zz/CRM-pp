package com.galvinusanalytics.backend_at.client;

import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.galvinusanalytics.backend_at.dto.module.SalesOrderDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SalesOrderManagementClient {

    private final RestTemplate restTemplate;
    private static final String SALES_ORDER_SERVICE_URL = "http://localhost:4002/api/sales-order";

    public List<SalesOrderDataDTO> fetchAllSalesOrders() {
        try {
            log.info("Fetching sales orders from: {}", SALES_ORDER_SERVICE_URL);
            ResponseEntity<List<SalesOrderDataDTO>> response = restTemplate.exchange(
                    SALES_ORDER_SERVICE_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<SalesOrderDataDTO>>() {
                    });

            List<SalesOrderDataDTO> orders = response.getBody();
            log.info("Successfully fetched {} sales orders", orders != null ? orders.size() : 0);
            return orders != null ? orders : Collections.emptyList();

        } catch (Exception e) {
            log.error("Error fetching sales orders from Sales Order service", e);
            return Collections.emptyList();
        }
    }
}
