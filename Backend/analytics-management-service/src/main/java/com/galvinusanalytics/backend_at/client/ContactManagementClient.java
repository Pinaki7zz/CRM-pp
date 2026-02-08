package com.galvinusanalytics.backend_at.client;

import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.galvinusanalytics.backend_at.dto.module.ContactDataDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContactManagementClient {

    private final RestTemplate restTemplate;
    private static final String CONTACT_SERVICE_URL = "http://localhost:4003/api/contact";

    public List<ContactDataDTO> fetchAllContacts() {
        try {
            log.info("Fetching contacts from: {}", CONTACT_SERVICE_URL);
            ResponseEntity<List<ContactDataDTO>> response = restTemplate.exchange(
                    CONTACT_SERVICE_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<ContactDataDTO>>() {
                    });

            List<ContactDataDTO> contacts = response.getBody();
            log.info("Successfully fetched {} contacts", contacts != null ? contacts.size() : 0);
            return contacts != null ? contacts : Collections.emptyList();

        } catch (Exception e) {
            log.error("Error fetching contacts from Contact service", e);
            return Collections.emptyList();
        }
    }
}
