
package com.crm.backend.service;

import com.crm.backend.dto.AccountCreateDTO;
import com.crm.backend.dto.AccountDTO;
import com.crm.backend.dto.AccountSummaryDTO;
import com.crm.backend.dto.AccountUpdateDTO;
import com.crm.backend.exception.AccountNotFoundException;
import com.crm.backend.exception.CannotDeleteException;
import com.crm.backend.exception.DuplicateAccountIdException;
import com.crm.backend.model.Account;
import com.crm.backend.repository.AccountRepository;
import com.crm.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.crm.backend.dto.AccountCreateDTO;
import com.crm.backend.dto.AccountDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private ContactRepository contactRepository;

	public AccountDTO createAccount(AccountCreateDTO dto) {
		Account account = new Account();
		// Auto-generate accountId like "ACC-100001"
		String generatedAccountId = "ACC-" + (accountRepository.count() + 1);
		account.setAccountId(generatedAccountId);

		account.setName(dto.getName());
		account.setType(dto.getType());
		account.setOwnerId(dto.getOwnerId());
		account.setWebsite(dto.getWebsite());
		account.setIndustry(dto.getIndustry());
		account.setNote(dto.getNote());
		account.setAccountStatus(dto.getAccountStatus());
		// Billing
		account.setBillingCountry(dto.getBillingCountry());
		account.setBillingState(dto.getBillingState());
		account.setBillingCity(dto.getBillingCity());
		account.setBillingZipCode(dto.getBillingZipCode());
		account.setBillingAddressLine1(dto.getBillingAddressLine1());
		account.setBillingAddressLine2(dto.getBillingAddressLine2());
		// Shipping
		account.setShippingCountry(dto.getShippingCountry());
		account.setShippingState(dto.getShippingState());
		account.setShippingCity(dto.getShippingCity());
		account.setShippingZipCode(dto.getShippingZipCode());
		account.setShippingAddressLine1(dto.getShippingAddressLine1());
		account.setShippingAddressLine2(dto.getShippingAddressLine2());

		// Handle parent relation if provided
		if (dto.getParentAccountId() != null) {
			Account parent = accountRepository.findByAccountId(dto.getParentAccountId())
					.orElseThrow(() -> new AccountNotFoundException("Parent account not found"));
			account.setParentAccount(parent);
		}

		// Save (timestamps auto-set)
		try {
			Account saved = accountRepository.save(account);
			return mapToDTO(saved);
		} catch (DataIntegrityViolationException e) {
			if (e.getMessage().contains("account_account_id_key")) {
				throw new DuplicateAccountIdException("This accountId already exists, please provide a new id.");
			}
			throw e;
		}
	}

	public AccountDTO getAccountByName(String name) {
		System.out.println("============Just got inside getAccountByName");
		Account account = accountRepository.findFirstByNameIgnoreCase(name)
				.orElseThrow(() -> new AccountNotFoundException("Account not found with name: " + name));

		System.out.println("============About to send the result of account found or not");
		return mapToDTO(account);
	}

	public List<AccountSummaryDTO> getAllAccountIdsNames() {
		List<Account> accounts = accountRepository.findAll();
		return accounts.stream().map(account -> {
			AccountSummaryDTO summary = new AccountSummaryDTO();
			summary.setAccountId(account.getAccountId());
			summary.setName(account.getName());
			summary.setBillingCountry(account.getBillingCountry());
			summary.setBillingState(account.getBillingState());
			summary.setBillingCity(account.getBillingCity());
			summary.setBillingZipCode(account.getBillingZipCode());
			summary.setBillingAddressLine1(account.getBillingAddressLine1());
			summary.setShippingCountry(account.getShippingCountry());
			summary.setShippingState(account.getShippingState());
			summary.setShippingCity(account.getShippingCity());
			summary.setShippingZipCode(account.getShippingZipCode());
			summary.setShippingAddressLine1(account.getShippingAddressLine1());

			// Map contacts to summary
			List<AccountSummaryDTO.ContactSummaryDTO> contactSummaries = account.getContacts().stream().map(contact -> {
				AccountSummaryDTO.ContactSummaryDTO cs = new AccountSummaryDTO.ContactSummaryDTO();
				cs.setContactId(contact.getContactId().toString()); // Assuming Contact has a UUID id
				// contact.getContactId();

				cs.setFirstName(contact.getFirstName());
				cs.setLastName(contact.getLastName());
				cs.setEmail(contact.getEmail());
				cs.setPhone(contact.getPhone());
				cs.setIsPrimary(contact.getIsPrimary());
				return cs;
			}).collect(Collectors.toList());
			summary.setContacts(contactSummaries);

			return summary;
		}).collect(Collectors.toList());
	}

	public List<AccountDTO> getAllAccounts() {
		return accountRepository.findAll().stream()
				.map(this::mapToDTO)
				.collect(Collectors.toList());
	}

	public AccountDTO getAccountById(String accountId) {
		Account account = accountRepository.findByAccountId(accountId)
				.orElseThrow(() -> new AccountNotFoundException("Account not found with accountId: " + accountId));
		return mapToDTO(account);
	}

	public AccountDTO updateAccount(String accountId, AccountUpdateDTO dto) {
		Account account = accountRepository.findByAccountId(accountId)
				.orElseThrow(() -> new AccountNotFoundException("Account not found with accountId: " + accountId));

		// Update fields if provided (partial update)
		if (dto.getName() != null)
			account.setName(dto.getName());
		if (dto.getType() != null)
			account.setType(dto.getType());
		if (dto.getOwnerId() != null)
			account.setOwnerId(dto.getOwnerId());
		if (dto.getWebsite() != null)
			account.setWebsite(dto.getWebsite());
		if (dto.getIndustry() != null)
			account.setIndustry(dto.getIndustry());
		if (dto.getNote() != null)
			account.setNote(dto.getNote());
		if (dto.getAccountStatus() != null)
			account.setAccountStatus(dto.getAccountStatus());
		// Billing
		if (dto.getBillingCountry() != null)
			account.setBillingCountry(dto.getBillingCountry());
		if (dto.getBillingState() != null)
			account.setBillingState(dto.getBillingState());
		if (dto.getBillingCity() != null)
			account.setBillingCity(dto.getBillingCity());
		if (dto.getBillingZipCode() != null)
			account.setBillingZipCode(dto.getBillingZipCode());
		if (dto.getBillingAddressLine1() != null)
			account.setBillingAddressLine1(dto.getBillingAddressLine1());
		if (dto.getBillingAddressLine2() != null)
			account.setBillingAddressLine2(dto.getBillingAddressLine2());
		// Shipping
		if (dto.getShippingCountry() != null)
			account.setShippingCountry(dto.getShippingCountry());
		if (dto.getShippingState() != null)
			account.setShippingState(dto.getShippingState());
		if (dto.getShippingCity() != null)
			account.setShippingCity(dto.getShippingCity());
		if (dto.getShippingZipCode() != null)
			account.setShippingZipCode(dto.getShippingZipCode());
		if (dto.getShippingAddressLine1() != null)
			account.setShippingAddressLine1(dto.getShippingAddressLine1());
		if (dto.getShippingAddressLine2() != null)
			account.setShippingAddressLine2(dto.getShippingAddressLine2());

		// Handle parent relation
		if (dto.getParentAccountId() != null) {
			Account parent = accountRepository.findByAccountId(dto.getParentAccountId())
					.orElseThrow(() -> new AccountNotFoundException("Parent account not found"));
			account.setParentAccount(parent);
		} else {
			account.setParentAccount(null);
		}

		// Save (updatedAt auto-updates)
		Account updated = accountRepository.save(account);
		return mapToDTO(updated);
	}

	public void deleteAccount(String accountId) {
		Account account = accountRepository.findByAccountId(accountId)
				.orElseThrow(() -> new AccountNotFoundException("Account not found with accountId: " + accountId));

		// Check for linked contacts
		long contactCount = contactRepository.countByAccount_AccountId(account.getAccountId());
		if (contactCount > 0) {
			throw new CannotDeleteException("Cannot delete: Contacts exist in this account.");
		}

		// Delete using accountId
		accountRepository.deleteByAccountId(accountId);
	}

	private AccountDTO mapToDTO(Account account) {
		AccountDTO dto = new AccountDTO();
		dto.setId(account.getId());
		dto.setAccountId(account.getAccountId());
		dto.setName(account.getName());
		dto.setType(account.getType());
		dto.setOwnerId(account.getOwnerId());
		dto.setWebsite(account.getWebsite());
		dto.setProfileImage(account.getProfileImage());
		dto.setIndustry(account.getIndustry());
		dto.setParentAccountId(account.getParentAccount() != null ? account.getParentAccount().getAccountId() : null);
		dto.setNote(account.getNote());
		dto.setAccountStatus(account.getAccountStatus());
		// Billing
		dto.setBillingCountry(account.getBillingCountry());
		dto.setBillingState(account.getBillingState());
		dto.setBillingCity(account.getBillingCity());
		dto.setBillingZipCode(account.getBillingZipCode());
		dto.setBillingAddressLine1(account.getBillingAddressLine1());
		dto.setBillingAddressLine2(account.getBillingAddressLine2());
		// Shipping
		dto.setShippingCountry(account.getShippingCountry());
		dto.setShippingState(account.getShippingState());
		dto.setShippingCity(account.getShippingCity());
		dto.setShippingZipCode(account.getShippingZipCode());
		dto.setShippingAddressLine1(account.getShippingAddressLine1());
		dto.setShippingAddressLine2(account.getShippingAddressLine2());
		dto.setCreatedAt(account.getCreatedAt());
		dto.setUpdatedAt(account.getUpdatedAt());
		return dto;
	}
	// ADD THIS METHOD
    public void updateProfileImage(String accountId, String fileName) {
        Account account = accountRepository.findByAccountId(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with accountId: " + accountId));
        account.setProfileImage(fileName);
        accountRepository.save(account);
    }
}