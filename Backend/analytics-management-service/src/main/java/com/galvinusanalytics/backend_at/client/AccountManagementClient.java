package com.galvinusanalytics.backend_at.client;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.galvinusanalytics.backend_at.dto.module.AccountDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountManagementClient {

    private final RestTemplate restTemplate;

    @Value("${account.management.service.url:http://localhost:4003}")
    private String accountServiceUrl;

    @SuppressWarnings("unchecked")
    public List<AccountDataDTO> fetchAllAccounts() {
        try {
            String url = accountServiceUrl + "/api/account";

            log.info("Fetching accounts from: {}", url);

            ResponseEntity<List> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    List.class);

            List<Map<String, Object>> body = response.getBody();
            if (body == null) {
                return List.of();
            }

            return body.stream()
                    .map(this::mapToAccountDataDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error fetching accounts from Account service", e);
            throw new RuntimeException("Failed to fetch accounts: " + e.getMessage(), e);
        }
    }

    private AccountDataDTO mapToAccountDataDTO(Map<String, Object> m) {
        AccountDataDTO dto = new AccountDataDTO();

        dto.setAccountId(str(m, "accountId"));
        dto.setName(str(m, "name"));
        dto.setType(str(m, "type"));
        dto.setOwnerId(str(m, "ownerId"));
        dto.setWebsite(str(m, "website"));
        dto.setIndustry(str(m, "industry"));
        dto.setParentAccountId(str(m, "parentAccountId"));
        dto.setNote(str(m, "note"));

        dto.setBillingCountry(str(m, "billingCountry"));
        dto.setBillingState(str(m, "billingState"));
        dto.setBillingCity(str(m, "billingCity"));
        dto.setBillingZipCode(str(m, "billingZipCode"));
        dto.setBillingAddressLine1(str(m, "billingAddressLine1"));
        dto.setBillingAddressLine2(str(m, "billingAddressLine2"));

        dto.setShippingCountry(str(m, "shippingCountry"));
        dto.setShippingState(str(m, "shippingState"));
        dto.setShippingCity(str(m, "shippingCity"));
        dto.setShippingZipCode(str(m, "shippingZipCode"));
        dto.setShippingAddressLine1(str(m, "shippingAddressLine1"));
        dto.setShippingAddressLine2(str(m, "shippingAddressLine2"));

        dto.setCreatedAt(ts(str(m, "createdAt")));
        dto.setUpdatedAt(ts(str(m, "updatedAt")));

        return dto;
    }

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private LocalDateTime ts(String s) {
        if (s == null || s.isBlank())
            return null;
        try {
            String base = s.length() >= 19 ? s.substring(0, 19) : s;
            return LocalDateTime.parse(base, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            log.warn("Failed to parse timestamp: {}", s);
            return null;
        }
    }
}
