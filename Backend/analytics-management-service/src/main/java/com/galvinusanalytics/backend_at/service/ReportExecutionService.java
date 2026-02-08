package com.galvinusanalytics.backend_at.service;

import com.galvinusanalytics.backend_at.client.LeadManagementClient;
import com.galvinusanalytics.backend_at.client.AccountManagementClient;
import com.galvinusanalytics.backend_at.client.ContactManagementClient;
import com.galvinusanalytics.backend_at.client.OpportunityManagementClient;
import com.galvinusanalytics.backend_at.client.SalesQuoteManagementClient;
import com.galvinusanalytics.backend_at.client.SalesOrderManagementClient;
import com.galvinusanalytics.backend_at.dto.ReportExecutionDTO;
import com.galvinusanalytics.backend_at.dto.ReportResultDTO;
import com.galvinusanalytics.backend_at.dto.module.LeadDataDTO;
import com.galvinusanalytics.backend_at.dto.module.AccountDataDTO;
import com.galvinusanalytics.backend_at.dto.module.ContactDataDTO;
import com.galvinusanalytics.backend_at.dto.module.OpportunityDataDTO;
import com.galvinusanalytics.backend_at.dto.module.SalesQuoteDataDTO;
import com.galvinusanalytics.backend_at.dto.module.SalesOrderDataDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportExecutionService {

    private final LeadManagementClient leadManagementClient;
    private final AccountManagementClient accountManagementClient;
    private final ContactManagementClient contactManagementClient;
    private final OpportunityManagementClient opportunityManagementClient;
    private final SalesQuoteManagementClient salesQuoteManagementClient;
    private final SalesOrderManagementClient salesOrderManagementClient;

    public ReportResultDTO executeReport(ReportExecutionDTO executionDTO, String userId) {
        log.info("Executing report for module: {}, user: {}", executionDTO.getModule(), userId);

        String module = executionDTO.getModule();
        if (module == null) {
            throw new IllegalArgumentException("Module is required");
        }

        switch (module.toUpperCase()) {
            case "LEAD":
                return executeLeadReport(executionDTO, userId);
            case "ACCOUNT":
                return executeAccountReport(executionDTO, userId);
            case "CONTACT":
                return executeContactReport(executionDTO, userId);
            case "OPPORTUNITY":
                return executeOpportunityReport(executionDTO, userId);
            case "SALES QUOTES":
                return executeSalesQuoteReport(executionDTO, userId);
            case "SALES ORDER":
                return executeSalesOrderReport(executionDTO, userId);
            default:
                throw new IllegalArgumentException("Unsupported module: " + executionDTO.getModule());
        }
    }

    /* ===================== LEAD ===================== */

    private ReportResultDTO executeLeadReport(ReportExecutionDTO executionDTO, String userId) {
        List<LeadDataDTO> allLeads = leadManagementClient.fetchAllLeads();
        log.info("Fetched {} leads from Lead Management Service", allLeads.size());

        List<LeadDataDTO> filteredLeads = applyLeadFilters(allLeads, executionDTO.getFilters(), userId);
        log.info("After filtering: {} leads", filteredLeads.size());

        List<Map<String, Object>> rows = filteredLeads.stream()
                .map(lead -> transformLeadData(lead, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<LeadDataDTO> applyLeadFilters(List<LeadDataDTO> leads,
                                               Map<String, Object> filters,
                                               String userId) {
        if (filters == null || filters.isEmpty()) {
            return leads;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return leads.stream()
                .filter(lead -> {
                    if (filters.containsKey("show")) {
                        String showFilter = String.valueOf(filters.get("show"));
                        if ("MY_LEADS".equalsIgnoreCase(showFilter) || showFilter.toUpperCase().contains("MY")) {
                            if (lead.getLeadOwner() == null || !lead.getLeadOwner().equals(userId)) {
                                return false;
                            }
                        }
                    }

                    LocalDate created = lead.getCreatedDate() != null
                            ? lead.getCreatedDate().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    if (filters.containsKey("leadStatus")) {
                        String status = (String) filters.get("leadStatus");
                        if (status != null && !status.isEmpty()) {
                            if (lead.getLeadStatus() == null || !lead.getLeadStatus().equalsIgnoreCase(status)) {
                                return false;
                            }
                        }
                    }

                    if (filters.containsKey("leadSource")) {
                        String source = (String) filters.get("leadSource");
                        if (source != null && !source.isEmpty()) {
                            if (lead.getLeadSource() == null || !lead.getLeadSource().equalsIgnoreCase(source)) {
                                return false;
                            }
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformLeadData(LeadDataDTO lead, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Lead ID" -> lead.getLeadId();
                case "First Name" -> lead.getFirstName();
                case "Last Name" -> lead.getLastName();
                case "Lead Name" -> ((lead.getFirstName() != null ? lead.getFirstName() : "") + " " +
                        (lead.getLastName() != null ? lead.getLastName() : "")).trim();
                case "Email" -> lead.getEmail();
                case "Phone" -> lead.getPhoneNumber();
                case "Title" -> lead.getTitle();
                case "Company/Account" -> lead.getCompany();
                case "Lead Source" -> lead.getLeadSource();
                case "Status" -> lead.getLeadStatus();
                case "Stage" -> lead.getInterestLevel();
                case "Interest Level" -> lead.getInterestLevel();
                case "Budget" -> lead.getBudget();
                case "Potential Revenue" -> lead.getPotentialRevenue();
                case "City" -> lead.getCity();
                case "State" -> lead.getState();
                case "Country" -> lead.getCountry();
                case "Created By" -> lead.getCreatedBy();
                case "Created Date" -> lead.getCreatedDate();
                case "Last Interaction" -> lead.getLastInteractionDate();
                default -> null;
            };
            row.put(column, value);
        }

        return row;
    }

    /* ===================== ACCOUNT ===================== */

    private ReportResultDTO executeAccountReport(ReportExecutionDTO executionDTO, String userId) {
        List<AccountDataDTO> allAccounts = accountManagementClient.fetchAllAccounts();
        log.info("Fetched {} accounts from Account service", allAccounts.size());

        List<AccountDataDTO> filtered = applyAccountFilters(allAccounts, executionDTO.getFilters(), userId);
        log.info("After filtering accounts: {}", filtered.size());

        List<Map<String, Object>> rows = filtered.stream()
                .map(acc -> transformAccountData(acc, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<AccountDataDTO> applyAccountFilters(List<AccountDataDTO> accounts,
                                                     Map<String, Object> filters,
                                                     String userId) {
        if (filters == null || filters.isEmpty()) {
            return accounts;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return accounts.stream()
                .filter(acc -> {
                    if (filters.containsKey("show")) {
                        String show = String.valueOf(filters.get("show"));
                        if (show != null && show.toUpperCase().contains("MY")) {
                            if (acc.getOwnerId() == null || !acc.getOwnerId().equals(userId)) {
                                return false;
                            }
                        }
                    }

                    LocalDate created = acc.getCreatedAt() != null
                            ? acc.getCreatedAt().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformAccountData(AccountDataDTO acc, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Account ID" -> acc.getAccountId();
                case "Account Name" -> acc.getName();
                case "Account Owner" -> acc.getOwnerId();
                case "Account Type" -> acc.getType();
                case "Industry" -> acc.getIndustry();
                case "Website" -> acc.getWebsite();
                case "Note" -> acc.getNote();
                case "Parent Account" -> acc.getParentAccountId();

                case "Billing Country" -> acc.getBillingCountry();
                case "Billing State" -> acc.getBillingState();
                case "Billing City" -> acc.getBillingCity();
                case "Billing ZIP Code" -> acc.getBillingZipCode();
                case "Billing Address Line 1" -> acc.getBillingAddressLine1();
                case "Billing Address Line 2" -> acc.getBillingAddressLine2();

                case "Shipping Country" -> acc.getShippingCountry();
                case "Shipping State" -> acc.getShippingState();
                case "Shipping City" -> acc.getShippingCity();
                case "Shipping ZIP Code" -> acc.getShippingZipCode();
                case "Shipping Address Line 1" -> acc.getShippingAddressLine1();
                case "Shipping Address Line 2" -> acc.getShippingAddressLine2();

                case "Created Date" -> acc.getCreatedAt();
                case "Last Modified Date" -> acc.getUpdatedAt();

                default -> null;
            };

            row.put(column, value);
        }

        return row;
    }

    /* ===================== CONTACT ===================== */

    private ReportResultDTO executeContactReport(ReportExecutionDTO executionDTO, String userId) {
        List<ContactDataDTO> allContacts = contactManagementClient.fetchAllContacts();
        log.info("Fetched {} contacts from Contact service", allContacts.size());

        List<ContactDataDTO> filtered = applyContactFilters(allContacts, executionDTO.getFilters(), userId);
        log.info("After filtering contacts: {}", filtered.size());

        List<Map<String, Object>> rows = filtered.stream()
                .map(contact -> transformContactData(contact, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<ContactDataDTO> applyContactFilters(List<ContactDataDTO> contacts,
                                                      Map<String, Object> filters,
                                                      String userId) {
        if (filters == null || filters.isEmpty()) {
            return contacts;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return contacts.stream()
                .filter(contact -> {
                    if (filters.containsKey("show")) {
                        String show = String.valueOf(filters.get("show"));
                        if (show != null && show.toUpperCase().contains("MY")) {
                            // Add owner filtering if your Contact model has ownerId field
                            // For now, we'll show all contacts
                        }
                    }

                    LocalDate created = contact.getCreatedAt() != null
                            ? contact.getCreatedAt().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformContactData(ContactDataDTO contact, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Contact Name" -> ((contact.getFirstName() != null ? contact.getFirstName() : "") + " " +
                        (contact.getLastName() != null ? contact.getLastName() : "")).trim();
                case "Contact ID" -> contact.getContactId();
                case "First Name" -> contact.getFirstName();
                case "Last Name" -> contact.getLastName();
                case "Email" -> contact.getEmail();
                case "Phone" -> contact.getPhone();
                case "Account Name" -> contact.getAccount() != null ? contact.getAccount().getName() : null;
                case "Account Type" -> contact.getAccount() != null ? contact.getAccount().getType() : null;
                case "Department" -> contact.getDepartment();
                case "Role" -> contact.getRole();
                case "Website" -> contact.getAccount() != null ? contact.getAccount().getWebsite() : null;
                case "Address Line 1" -> contact.getBillingAddressLine1();
                case "Country" -> contact.getBillingCountry();
                case "Created At" -> contact.getCreatedAt();
                default -> null;
            };
            row.put(column, value);
        }

        return row;
    }

    /* ===================== OPPORTUNITY ===================== */

    private ReportResultDTO executeOpportunityReport(ReportExecutionDTO executionDTO, String userId) {
        List<OpportunityDataDTO> allOpportunities = opportunityManagementClient.fetchAllOpportunities();
        log.info("Fetched {} opportunities from Opportunity service", allOpportunities.size());

        List<OpportunityDataDTO> filtered = applyOpportunityFilters(allOpportunities, executionDTO.getFilters(), userId);
        log.info("After filtering opportunities: {}", filtered.size());

        List<Map<String, Object>> rows = filtered.stream()
                .map(opp -> transformOpportunityData(opp, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<OpportunityDataDTO> applyOpportunityFilters(List<OpportunityDataDTO> opportunities,
                                                              Map<String, Object> filters,
                                                              String userId) {
        if (filters == null || filters.isEmpty()) {
            return opportunities;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return opportunities.stream()
                .filter(opp -> {
                    if (filters.containsKey("show")) {
                        String show = String.valueOf(filters.get("show"));
                        if (show != null && show.toUpperCase().contains("MY")) {
                            if (opp.getOwnerId() == null || !opp.getOwnerId().equals(userId)) {
                                return false;
                            }
                        }
                    }

                    LocalDate created = opp.getCreatedAt() != null
                            ? opp.getCreatedAt().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformOpportunityData(OpportunityDataDTO opp, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Account Id" -> opp.getAccountId();
                case "Opportunities Name" -> opp.getName();
                case "Opportunities Owner" -> opp.getOwnerId();
                case "Account Type" -> opp.getType();
                case "Status" -> opp.getStatus();
                case "Probability" -> opp.getProbability();
                case "Stage" -> opp.getStage();
                case "Amount" -> opp.getAmount();
                case "Lead Sources" -> opp.getLeadSource();
                case "Created At" -> opp.getCreatedAt();
                default -> null;
            };
            row.put(column, value);
        }

        return row;
    }

    /* ===================== SALES QUOTE ===================== */

    private ReportResultDTO executeSalesQuoteReport(ReportExecutionDTO executionDTO, String userId) {
        List<SalesQuoteDataDTO> allQuotes = salesQuoteManagementClient.fetchAllSalesQuotes();
        log.info("Fetched {} sales quotes from Sales Quote service", allQuotes.size());

        List<SalesQuoteDataDTO> filtered = applySalesQuoteFilters(allQuotes, executionDTO.getFilters(), userId);
        log.info("After filtering sales quotes: {}", filtered.size());

        List<Map<String, Object>> rows = filtered.stream()
                .map(quote -> transformSalesQuoteData(quote, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<SalesQuoteDataDTO> applySalesQuoteFilters(List<SalesQuoteDataDTO> quotes,
                                                            Map<String, Object> filters,
                                                            String userId) {
        if (filters == null || filters.isEmpty()) {
            return quotes;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return quotes.stream()
                .filter(quote -> {
                    if (filters.containsKey("show")) {
                        String show = String.valueOf(filters.get("show"));
                        if (show != null && show.toUpperCase().contains("MY")) {
                            if (quote.getQuoteOwnerId() == null || !quote.getQuoteOwnerId().equals(userId)) {
                                return false;
                            }
                        }
                    }

                    LocalDate created = quote.getCreatedAt() != null
                            ? quote.getCreatedAt().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformSalesQuoteData(SalesQuoteDataDTO quote, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Sales Quotes Name" -> quote.getSubject();
                case "Sales Quotes ID" -> quote.getQuoteId();
                case "Sales Quotes Owner" -> quote.getQuoteOwnerId();
                case "Opportunities Name" -> quote.getOpportunity() != null ? quote.getOpportunity().getName() : null;
                case "Created At" -> quote.getCreatedAt();
                case "Status" -> quote.getStatus();
                case "Amount" -> quote.getAmount();
                case "Success Rate" -> quote.getSuccessRate();
                case "Due Date" -> quote.getDueDate();
                default -> null;
            };
            row.put(column, value);
        }

        return row;
    }

    /* ===================== SALES ORDER ===================== */

    private ReportResultDTO executeSalesOrderReport(ReportExecutionDTO executionDTO, String userId) {
        List<SalesOrderDataDTO> allOrders = salesOrderManagementClient.fetchAllSalesOrders();
        log.info("Fetched {} sales orders from Sales Order service", allOrders.size());

        List<SalesOrderDataDTO> filtered = applySalesOrderFilters(allOrders, executionDTO.getFilters(), userId);
        log.info("After filtering sales orders: {}", filtered.size());

        List<Map<String, Object>> rows = filtered.stream()
                .map(order -> transformSalesOrderData(order, executionDTO.getColumns()))
                .collect(Collectors.toList());

        ReportResultDTO result = new ReportResultDTO();
        result.setColumns(executionDTO.getColumns());
        result.setRows(rows);
        result.setTotalRecords(rows.size());
        result.setExecutedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return result;
    }

    private List<SalesOrderDataDTO> applySalesOrderFilters(List<SalesOrderDataDTO> orders,
                                                            Map<String, Object> filters,
                                                            String userId) {
        if (filters == null || filters.isEmpty()) {
            return orders;
        }

        LocalDate fromDate = parseLocalDate(filters.get("createdDateFrom"));
        LocalDate toDate = parseLocalDate(filters.get("createdDateTo"));

        return orders.stream()
                .filter(order -> {
                    if (filters.containsKey("show")) {
                        String show = String.valueOf(filters.get("show"));
                        if (show != null && show.toUpperCase().contains("MY")) {
                            if (order.getOwnerId() == null || !order.getOwnerId().equals(userId)) {
                                return false;
                            }
                        }
                    }

                    LocalDate created = order.getCreatedAt() != null
                            ? order.getCreatedAt().toLocalDate()
                            : null;

                    if (fromDate != null && created != null && created.isBefore(fromDate)) {
                        return false;
                    }
                    if (toDate != null && created != null && created.isAfter(toDate)) {
                        return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> transformSalesOrderData(SalesOrderDataDTO order, List<String> columns) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (String column : columns) {
            Object value = switch (column) {
                case "Sales Order Name" -> order.getSubject();
                case "Sales Order ID" -> order.getOrderId();
                case "Sales Order Owner" -> order.getOwnerId();
                case "Opportunities Name" -> order.getOpportunity() != null ? order.getOpportunity().getName() : null;
                case "Created At" -> order.getCreatedAt();
                case "Status" -> order.getStatus();
                case "Amount" -> order.getAmount();
                case "Purchase Order" -> order.getPurchaseOrder();
                case "Due Date" -> order.getDueDate();
                case "Commission" -> order.getCommission();
                case "Budget" -> order.getBudget();
                default -> null;
            };
            row.put(column, value);
        }

        return row;
    }

    /* ===================== COMMON ===================== */

    private LocalDate parseLocalDate(Object dateObj) {
        if (dateObj == null) return null;
        try {
            return LocalDate.parse(dateObj.toString());
        } catch (Exception e) {
            log.warn("Failed to parse LocalDate from: {}", dateObj);
            return null;
        }
    }
}
