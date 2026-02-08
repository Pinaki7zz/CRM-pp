package com.crm.backend.controller;

import com.crm.backend.dto.AccountCreateDTO;
import com.crm.backend.dto.AccountDTO;
import com.crm.backend.dto.AccountSummaryDTO;
import com.crm.backend.dto.AccountUpdateDTO;
import com.crm.backend.exception.AccountNotFoundException;
import com.crm.backend.exception.CannotDeleteException;
import com.crm.backend.exception.DuplicateAccountIdException;
import com.crm.backend.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/ac/api/account")
public class AccountController {

    // --- DEFINING UPLOAD DIR CONSTANT ---
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/accounts/";

    @Autowired
    private AccountService accountService;

    // POST /api/account/ (create)
    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody AccountCreateDTO dto) {
        try {
            AccountDTO created = accountService.createAccount(dto);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (DuplicateAccountIdException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /ac/api/account/by-name?name=Galvinus
    @GetMapping("/by-name")
    public ResponseEntity<AccountDTO> getAccountByName(@RequestParam String name) {
        try {
            AccountDTO account = accountService.getAccountByName(name);
            return ResponseEntity.ok(account);
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/account/ids-names (get summaries)
    @GetMapping("/ids-names")
    public ResponseEntity<List<AccountSummaryDTO>> getAllAccountIdsNames() {
        try {
            List<AccountSummaryDTO> summaries = accountService.getAllAccountIdsNames();
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/account/ (get all)
    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        try {
            List<AccountDTO> accounts = accountService.getAllAccounts();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/account/{accountId} (get by accountId)
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable String accountId) {
        try {
            AccountDTO account = accountService.getAccountById(accountId);
            return ResponseEntity.ok(account);
        } catch (AccountNotFoundException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/account/{accountId} (update)
    @PutMapping("/{accountId}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable String accountId, @RequestBody AccountUpdateDTO dto) {
        try {
            AccountDTO updated = accountService.updateAccount(accountId, dto);
            return ResponseEntity.ok(updated);
        } catch (AccountNotFoundException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /api/account/{accountId}
    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String accountId) {
        try {
            accountService.deleteAccount(accountId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (CannotDeleteException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (AccountNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- UPLOAD IMAGE ---
    @PostMapping(value = "/{accountId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAccountImage(@PathVariable String accountId, 
                                                @RequestParam("file") MultipartFile file) {
        try {
            // Verify account exists
            AccountDTO account = accountService.getAccountById(accountId); // Will throw if not found

            Path uploadPath = Paths.get(UPLOAD_DIR);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Using accountId (String) in filename
            String fileName = accountId + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            accountService.updateProfileImage(accountId, fileName);

            return ResponseEntity.ok("Image uploaded successfully: " + fileName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload image: " + e.getMessage());
        }
    }

    // --- SERVE IMAGE ---
    @GetMapping("/{accountId}/image")
    public ResponseEntity<Resource> getAccountImage(@PathVariable String accountId) {
        try {
            AccountDTO account = accountService.getAccountById(accountId);
            
            String fileName = account.getProfileImage();
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