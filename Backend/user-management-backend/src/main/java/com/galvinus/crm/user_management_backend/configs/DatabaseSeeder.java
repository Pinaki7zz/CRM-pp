package com.galvinus.crm.user_management_backend.configs;

import java.time.Instant;
import java.util.List;
// import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.galvinus.crm.user_management_backend.repositories.*;
import com.galvinus.crm.user_management_backend.entities.*;
import com.galvinus.crm.user_management_backend.entities.BusinessRole.Status;

import jakarta.transaction.Transactional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

	private final WorkCenterRepository workCenterRepository;
	private final WorkCenterViewRepository workCenterViewRepository;
	private final UserRepository userRepository;
	private final BusinessRoleRepository businessRoleRepository;
	private final PermissionRepository permissionRepository;

	public DatabaseSeeder(
			WorkCenterRepository workCenterRepository,
			WorkCenterViewRepository workCenterViewRepository,
			UserRepository userRepository,
			BusinessRoleRepository businessRoleRepository,
			PermissionRepository permissionRepository) {
		this.workCenterRepository = workCenterRepository;
		this.workCenterViewRepository = workCenterViewRepository;
		this.userRepository = userRepository;
		this.businessRoleRepository = businessRoleRepository;
		this.permissionRepository = permissionRepository;
	}

	private void seedWorkCenters() {
		List<WorkCenter> workCenters = List.of(
				new WorkCenter("CRM_HOMEPAGE", "Home Page", Instant.now(), Instant.now()),
				new WorkCenter("CRM_BUSINESS_STRUCTURE", "Business Structure", Instant.now(), Instant.now()),
				new WorkCenter("CRM_SALES", "Sales", Instant.now(), Instant.now()),
				new WorkCenter("CRM_PRODUCT", "Product", Instant.now(), Instant.now()),
				new WorkCenter("CRM_CUSTOMERS", "Customers", Instant.now(), Instant.now()),
				new WorkCenter("CRM_CHANNELS", "Channels", Instant.now(), Instant.now()),
				new WorkCenter("CRM_ACTIVITY_MANAGEMENT", "Activity Management", Instant.now(), Instant.now()),
				new WorkCenter("CRM_ANALYTICS", "Analytics", Instant.now(), Instant.now()),
				new WorkCenter("CRM_ADMINISTRATOR", "Administrator", Instant.now(), Instant.now()),
				new WorkCenter("CRM_SERVICE", "Service", Instant.now(), Instant.now()));

		for (WorkCenter wc : workCenters) {
			workCenterRepository.findByWorkCenterId(wc.getWorkCenterId())
					.ifPresentOrElse(
							existing -> {
								existing.setWorkCenterName(wc.getWorkCenterName());
								existing.setUpdatedAt(Instant.now());
								workCenterRepository.save(existing);
							},
							() -> workCenterRepository.save(wc));
		}
	}

	private void seedWorkCenterViews() {
		List<WorkCenterView> views = List.of(
				new WorkCenterView("CRM_BSTRUCTVIEW_ORG_HUB", "Org Hub",
						workCenterRepository.getReferenceById("CRM_BUSINESS_STRUCTURE"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_BSTRUCTVIEW_DIVISIONS", "Divisions",
						workCenterRepository.getReferenceById("CRM_BUSINESS_STRUCTURE"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_SALESVIEW_LEADS", "Leads",
						workCenterRepository.getReferenceById("CRM_SALES"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SALESVIEW_OPPORTUNITIES", "Opportunities",
						workCenterRepository.getReferenceById("CRM_SALES"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SALESVIEW_SALES_QUOTES", "Sales Quotes",
						workCenterRepository.getReferenceById("CRM_SALES"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SALESVIEW_SALES_ORDER", "Sales Order",
						workCenterRepository.getReferenceById("CRM_SALES"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_PRODVIEW_PRODUCT", "Product",
						workCenterRepository.getReferenceById("CRM_PRODUCT"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_PRODVIEW_PRODUCT_CATEGORY", "Product Category",
						workCenterRepository.getReferenceById("CRM_PRODUCT"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_CUSTVIEW_ACCOUNTS", "Accounts",
						workCenterRepository.getReferenceById("CRM_CUSTOMERS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_CUSTVIEW_CONTACTS", "Contacts",
						workCenterRepository.getReferenceById("CRM_CUSTOMERS"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_CHANNVIEW_EMAIL", "Email",
						workCenterRepository.getReferenceById("CRM_CHANNELS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_CHANNVIEW_LIVE_TALK", "Live Talk",
						workCenterRepository.getReferenceById("CRM_CHANNELS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_CHANNVIEW_LINKEDIN", "LinkedIn",
						workCenterRepository.getReferenceById("CRM_CHANNELS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_CHANNVIEW_TELEPHONE", "Telephone",
						workCenterRepository.getReferenceById("CRM_CHANNELS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_CHANNVIEW_WEB_FORMS", "Web Forms",
						workCenterRepository.getReferenceById("CRM_CHANNELS"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_ACTMANVIEW_TASKS", "Tasks",
						workCenterRepository.getReferenceById("CRM_ACTIVITY_MANAGEMENT"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ACTMANVIEW_PHONE_CALLS", "Phone Calls",
						workCenterRepository.getReferenceById("CRM_ACTIVITY_MANAGEMENT"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ACTMANVIEW_EMAILS", "Emails",
						workCenterRepository.getReferenceById("CRM_ACTIVITY_MANAGEMENT"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ACTMANVIEW_MEETINGS", "Meetings",
						workCenterRepository.getReferenceById("CRM_ACTIVITY_MANAGEMENT"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_ANALYTICSVIEW_REPORTS", "Reports",
						workCenterRepository.getReferenceById("CRM_ANALYTICS"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ANALYTICSVIEW_DASHBOARDS", "Dashboards",
						workCenterRepository.getReferenceById("CRM_ANALYTICS"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_ADMINVIEW_GENERAL_SETTINGS", "General Settings",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ADMINVIEW_USER_PROFILES", "User Profiles",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ADMINVIEW_ACCESS_MANAGEMENT", "Access Management",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ADMINVIEW_WORK_FLOWS", "Work Flows",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_ADMINVIEW_EMAIL_CONFIG", "Email Configurations",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),
				
				// ✅ ADDED THIS: Employees View
				new WorkCenterView("CRM_ADMINVIEW_EMPLOYEES", "Employees",
						workCenterRepository.getReferenceById("CRM_ADMINISTRATOR"), Instant.now(), Instant.now()),

				new WorkCenterView("CRM_SERVICEVIEW_TICKETS", "Tickets",
						workCenterRepository.getReferenceById("CRM_SERVICE"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SERVICEVIEW_TEMPLATES_SIGNATURES", "Templates & Signatures",
						workCenterRepository.getReferenceById("CRM_SERVICE"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SERVICEVIEW_AGENT_DESKTOP", "Agent Desktop",
						workCenterRepository.getReferenceById("CRM_SERVICE"), Instant.now(), Instant.now()),
				new WorkCenterView("CRM_SERVICEVIEW_KNOWLEDGE_BASE", "Knowledge Base",
						workCenterRepository.getReferenceById("CRM_SERVICE"), Instant.now(), Instant.now()));

		for (WorkCenterView wcv : views) {
			workCenterViewRepository.findByWorkCenterViewId(wcv.getWorkCenterViewId())
					.ifPresentOrElse(
							existing -> {
								existing.setWorkCenterViewName(wcv.getWorkCenterViewName());
								existing.setUpdatedAt(Instant.now());
								workCenterViewRepository.save(existing);
							},
							() -> workCenterViewRepository.save(wcv));
		}
	}

	private void seedBusinessRoles() {
		List<BusinessRole> roles = List.of(
				BusinessRole.builder()
						.businessRoleId("CRM_ADMIN")
						.businessRoleName("Admin")
						.description("Admin will be able to access all the features of the CRM System")
						.status(Status.ACTIVE)
						.isObsolete(false)
						.createdAt(Instant.now())
						.updatedAt(Instant.now())
						.build());

		for (BusinessRole role : roles) {
			businessRoleRepository.findByBusinessRoleId(role.getBusinessRoleId())
					.ifPresentOrElse(
							existing -> {
								existing.setBusinessRoleName(role.getBusinessRoleName());
								existing.setDescription(role.getDescription());
								existing.setUpdatedAt(Instant.now());
								businessRoleRepository.save(existing);
							},
							() -> businessRoleRepository.save(role));
		}
	}

	private void seedPermissions() {
		// ✅ Step 1: Get the CRM_ADMIN business role
		BusinessRole adminRole = businessRoleRepository.findByBusinessRoleId("CRM_ADMIN")
				.orElseThrow(() -> new RuntimeException("Business role CRM_ADMIN not found"));

		// ✅ Step 2: Define your permissions
		List<String> workCenterViewIds = List.of(
				"CRM_ACTMANVIEW_TASKS",
				"CRM_CHANNVIEW_LIVE_TALK",
				"CRM_SALESVIEW_SALES_ORDER",
				"CRM_SERVICEVIEW_AGENT_DESKTOP",
				"CRM_ACTMANVIEW_PHONE_CALLS",
				"CRM_CHANNVIEW_TELEPHONE",
				"CRM_SERVICEVIEW_TEMPLATES_SIGNATURES",
				"CRM_ADMINVIEW_GENERAL_SETTINGS",
				"CRM_SERVICEVIEW_TICKETS",
				"CRM_ADMINVIEW_WORK_FLOWS",
				"CRM_SERVICEVIEW_KNOWLEDGE_BASE",
				"CRM_SALESVIEW_LEADS",
				"CRM_PRODVIEW_PRODUCT",
				"CRM_PRODVIEW_PRODUCT_CATEGORY",
				"CRM_ADMINVIEW_USER_PROFILES",
				"CRM_CHANNVIEW_EMAIL",
				"CRM_ADMINVIEW_ACCESS_MANAGEMENT",
				"CRM_CHANNVIEW_WEB_FORMS",
				"CRM_ACTMANVIEW_MEETINGS",
				"CRM_BSTRUCTVIEW_DIVISIONS",
				"CRM_CHANNVIEW_LINKEDIN",
				"CRM_ANALYTICSVIEW_REPORTS",
				"CRM_SALESVIEW_OPPORTUNITIES",
				"CRM_CUSTVIEW_ACCOUNTS",
				"CRM_CUSTVIEW_CONTACTS",
				"CRM_SALESVIEW_SALES_QUOTES",
				"CRM_ACTMANVIEW_EMAILS",
				"CRM_BSTRUCTVIEW_ORG_HUB",
				// ✅ ADDED THIS: Give Admin permission to view employees
				"CRM_ADMINVIEW_EMPLOYEES");

		// ✅ Step 3: For each WorkCenterView, create Permission
		for (String viewId : workCenterViewIds) {
			WorkCenterView workCenterView = workCenterViewRepository.findByWorkCenterViewId(viewId)
					.orElseThrow(() -> new RuntimeException("WorkCenterView not found: " + viewId));

			permissionRepository.findByBusinessRoleAndWorkCenterView(adminRole, workCenterView)
					.ifPresentOrElse(
							existing -> {
								existing.setUpdatedAt(Instant.now());
								existing.setReadAccess(false);
								existing.setWriteAccess(false);
								existing.setUpdateAccess(false);
								existing.setDeleteAccess(false);
								permissionRepository.save(existing);
							},
							() -> {
								Permission newPermission = Permission.builder()
										.businessRole(adminRole)
										.workCenterView(workCenterView)
										.readAccess(false)
										.writeAccess(false)
										.updateAccess(false)
										.deleteAccess(false)
										.build();
								permissionRepository.save(newPermission);
							});
		}

		System.out.println("✅ All CRM_ADMIN permissions seeded successfully!");
	}

	private void seedUsers() {
		BusinessRole adminRole = businessRoleRepository.findByBusinessRoleId("CRM_ADMIN")
				.orElseThrow(() -> new RuntimeException("CRM_ADMIN role not found"));

		User user = User.builder()
				// .id(UUID.fromString("db63ee62-cb13-44f8-a75c-0d406112450d"))
				.userId("U-001")
				.password("$2b$10$DAkSzpPOunaha0yyLYFzbO0x6/vx1pGXc.0D3RMZfXpHvx7WRGkKG")
				.refreshToken(null)
				.mustChangePassword(false)
				.termsAccepted(true)
				.rememberMe(true)
				.firstName("Rohan")
				.lastName("Roy")
				.username("royrohan001")
				.email("rohan.roy@galvinus.in")
				.phone("6000105569")
				.language(User.Language.ENGLISH)
				.personalCountry("India")
				.personalState("Assam")
				.personalCity("Silchar")
				.personalStreet("K.C. Road (East), N.S. Avenue")
				.personalPostalCode("788005")
				.timeZone(User.TimeZone.IST)
				.dateFormat(User.DateFormat.DD_MM_YYYY)
				.timeFormat(User.TimeFormat.TWELVE_HOUR)
				.status(User.UserStatus.ACTIVE)
				.businessRole(adminRole)
				.businessName("Galvinus")
				.createdAt(Instant.now())
				.updatedAt(Instant.now())
				.build();

		userRepository.findByUserId(user.getUserId())
				.ifPresentOrElse(
						existing -> {
							// ✅ FORCE UPDATE critical fields to fix broken accounts
							existing.setUpdatedAt(Instant.now());
							existing.setMustChangePassword(false); // Fixes 403 Forbidden
							existing.setStatus(User.UserStatus.ACTIVE);
							existing.setPassword(user.getPassword()); // Resets password to known value
							existing.setBusinessRole(adminRole); // Ensures role is Admin
							userRepository.save(existing);
						},
						() -> userRepository.save(user));
	}

	@Override
	@Transactional
	public void run(String... args) {
		seedWorkCenters();
		seedWorkCenterViews();
		seedBusinessRoles();
		seedPermissions();
		seedUsers();
		System.out.println("✅ Database fully seeded: Work Centers, Views, Roles, Permissions, Users");
	}
}