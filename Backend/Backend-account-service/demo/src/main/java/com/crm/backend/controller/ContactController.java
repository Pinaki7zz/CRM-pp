package com.crm.backend.controller;

import com.crm.backend.dto.ContactDTO;
import com.crm.backend.dto.ContactIdNameDTO;
import com.crm.backend.dto.ContactResponseDTO;
import com.crm.backend.model.Contact;
import com.crm.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.BindingResult;
import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ac/api/contact")
public class ContactController {
    
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/contacts/";

    @Autowired
    private ContactService contactService;

    // --- CREATE ---
    @PostMapping
    public ResponseEntity<?> createContact(@Valid @RequestBody ContactDTO dto) {
        try {
            System.out.println("Received Create Request: " + dto);
            Contact contact = contactService.createContact(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ContactResponseDTO.fromEntity(contact));
        } catch (DataIntegrityViolationException e) {
            // This catches the Duplicate Email error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Email already exists. Please use a different email.");
        } catch (Exception e) {
            // This catches all other errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // --- GET ALL (Fixed Mapping) ---
    // This maps both /ac/api/contact and /ac/api/contact/
    @GetMapping(value = {"", "/"})
    public ResponseEntity<List<ContactResponseDTO>> getAllContacts() {
        System.out.println("Fetching all contacts...");
        List<Contact> contacts = contactService.getAllContacts();
        List<ContactResponseDTO> responses = contacts.stream()
                .map(ContactResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // --- DROPDOWN HELPERS ---
    @GetMapping("/ids-names")
    public ResponseEntity<List<ContactIdNameDTO>> getAllContactIdsNames() {
        return ResponseEntity.ok(contactService.getAllContactIdsNames());
    }

    // --- GET BY ID ---
    @GetMapping("/{contactId}")
    public ResponseEntity<ContactResponseDTO> getContactById(@PathVariable Long contactId) {
        return contactService.getContactById(contactId)
                .map(contact -> ResponseEntity.ok(ContactResponseDTO.fromEntity(contact)))
                .orElse(ResponseEntity.notFound().build());
    }

    // --- UPDATE ---
    @PatchMapping("/{contactId}")
    public ResponseEntity<?> updateContact(
            @PathVariable Long contactId,
            @Valid @RequestBody ContactDTO dto,
            BindingResult bindingResult) { // <--- 1. Add BindingResult

        // 2. LOG VALIDATION ERRORS
        if (bindingResult.hasErrors()) {
            StringBuilder errorMsg = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> 
                errorMsg.append(error.getDefaultMessage()).append("; ")
            );
            System.out.println("Validation Error: " + errorMsg.toString());
            return ResponseEntity.badRequest().body("Validation failed: " + errorMsg.toString());
        }

        try {
            Contact updatedContact = contactService.updateContact(contactId, dto);
            return ResponseEntity.ok(ContactResponseDTO.fromEntity(updatedContact));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: Email already exists.");
        } catch (Exception e) {
            e.printStackTrace(); // Print full error to console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // --- DELETE ---
    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long contactId) {
        contactService.deleteContact(contactId);
        return ResponseEntity.noContent().build();
    }

    // --- UPLOAD IMAGE ---
    @PostMapping(value = "/{contactId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContactImage(@PathVariable Long contactId, 
                                                @RequestParam("file") MultipartFile file) {
        try {
            Contact contact = contactService.getContactById(contactId)
                    .orElseThrow(() -> new RuntimeException("Contact not found"));

            Path uploadPath = Paths.get(UPLOAD_DIR);
            
            System.out.println("Saving image to: " + uploadPath.toAbsolutePath());

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = contactId + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            contactService.updateProfileImage(contactId, fileName);

            return ResponseEntity.ok("Image uploaded successfully: " + fileName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload image: " + e.getMessage());
        }
    }

    // --- SERVE IMAGE ---
    @GetMapping("/{contactId}/image")
    public ResponseEntity<Resource> getContactImage(@PathVariable Long contactId) {
        try {
            Contact contact = contactService.getContactById(contactId)
                    .orElseThrow(() -> new RuntimeException("Contact not found"));
            
            String fileName = contact.getProfileImage();
            if (fileName == null || fileName.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = Files.probeContentType(filePath);
                if(contentType == null) contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}