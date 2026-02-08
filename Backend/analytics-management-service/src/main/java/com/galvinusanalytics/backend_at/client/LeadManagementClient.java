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

import com.galvinusanalytics.backend_at.dto.module.LeadDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeadManagementClient {

    private final RestTemplate restTemplate;

    @Value("${lead.management.service.url:http://localhost:4004}")
    private String leadManagementServiceUrl;

    /**
     * Fetch all leads from Lead Management Service
     */
    public List<LeadDataDTO> fetchAllLeads() {
        try {
            String url = leadManagementServiceUrl + "/api/leads";

            log.info("Fetching leads from: {}", url);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    Map.class);

            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("data")) {
                List<Map<String, Object>> leadsData = (List<Map<String, Object>>) responseBody.get("data");
                return leadsData.stream()
                        .map(this::mapToLeadDataDTO)
                        .collect(Collectors.toList());
            }

            return List.of();

        } catch (Exception e) {
            log.error("Error fetching leads from Lead Management Service", e);
            throw new RuntimeException("Failed to fetch leads: " + e.getMessage(), e);
        }
    }

    /**
     * Map raw lead data to LeadDataDTO
     */
    private LeadDataDTO mapToLeadDataDTO(Map<String, Object> leadMap) {
        LeadDataDTO dto = new LeadDataDTO();

        // Basic fields
        dto.setLeadId(getString(leadMap, "leadId"));
        dto.setFirstName(getString(leadMap, "firstName"));
        dto.setLastName(getString(leadMap, "lastName"));
        dto.setEmail(getString(leadMap, "email"));
        dto.setPhoneNumber(getString(leadMap, "phoneNumber"));
        dto.setSecondaryEmail(getString(leadMap, "secondaryEmail"));
        dto.setFax(getString(leadMap, "fax"));
        dto.setWebsite(getString(leadMap, "website"));
        dto.setCompany(getString(leadMap, "company"));
        dto.setTitle(getString(leadMap, "title"));
        dto.setNotes(getString(leadMap, "notes"));

        // Lead qualification
        dto.setLeadSource(getString(leadMap, "leadSource"));
        dto.setLeadStatus(getString(leadMap, "leadStatus"));
        dto.setInterestLevel(getString(leadMap, "interestLevel"));
        dto.setStage(getString(leadMap, "interestLevel"));

        // Budget fields
        dto.setBudget(getDouble(leadMap, "budget"));
        dto.setPotentialRevenue(getDouble(leadMap, "potentialRevenue"));

        // Address fields
        dto.setAddressLine1(getString(leadMap, "addressLine1"));
        dto.setAddressLine2(getString(leadMap, "addressLine2"));
        dto.setZipcode(getString(leadMap, "zipcode"));

        // Location (nested objects)
        if (leadMap.containsKey("city") && leadMap.get("city") != null) {
            Map<String, Object> cityMap = (Map<String, Object>) leadMap.get("city");
            dto.setCity(getString(cityMap, "name"));
        }

        if (leadMap.containsKey("state") && leadMap.get("state") != null) {
            Map<String, Object> stateMap = (Map<String, Object>) leadMap.get("state");
            dto.setState(getString(stateMap, "name"));
        }

        if (leadMap.containsKey("country") && leadMap.get("country") != null) {
            Map<String, Object> countryMap = (Map<String, Object>) leadMap.get("country");
            dto.setCountry(getString(countryMap, "name"));
        }

        // Owner and timestamps
        dto.setLeadOwner(getString(leadMap, "leadOwner"));
        dto.setCreatedBy(getString(leadMap, "leadOwner"));
        dto.setLastModifiedBy(getString(leadMap, "leadOwner"));

        // Parse timestamps
        dto.setCreatedDate(parseTimestamp(getString(leadMap, "createdAt")));
        dto.setModifiedDate(parseTimestamp(getString(leadMap, "updatedAt")));
        dto.setLastInteractionDate(parseTimestamp(getString(leadMap, "interactionDate")));

        // Interaction tracking
        dto.setInteractionType(getString(leadMap, "interactionType"));
        dto.setInteractionOutcome(getString(leadMap, "interactionOutcome"));
        dto.setInteractionNote(getString(leadMap, "interactionNote"));

        // Additional IDs
        dto.setAccountId(getString(leadMap, "accountId"));
        dto.setContactId(getString(leadMap, "contactId"));

        return dto;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null)
            return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(
                    timestamp.substring(0, 19),
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            log.warn("Failed to parse timestamp: {}", timestamp);
            return null;
        }
    }
}
