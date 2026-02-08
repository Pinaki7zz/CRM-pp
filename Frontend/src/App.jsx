import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import RequirePermission from "./components/RequirePermission";
import Layout from "./components/Layout";
import Homepage from "./Pages/Homepage/Homepage";

import Leads from "./Pages/Lead Management/Leads";
import CreateNewLead from "./Pages/Lead Management/CreateNewLead";
import DetailedLeads from "./Pages/Lead Management/DetailedLeads";
import CustomerAccount from "./Pages/Customer Account/CustomerAccount";
import CreateNewAccount from "./Pages/Customer Account/CreateNewAccount";
import DetailedCustomerAccount from "./Pages/Customer Account/DetailedCustomerAccount";
import CustomerContact from "./Pages/Customer Contact/CustomerContact";
import CreateNewContact from "./Pages/Customer Contact/CreateNewContact";
import DetailedCustomerContact from "./Pages/Customer Contact/DetailedCustomerContact";
import Products from "./Pages/Product/Products";
import CreateNewProduct from "./Pages/Product/CreateNewProduct";
import DetailedProducts from "./Pages/Product/DetailedProducts";
import ProductCategory from "./Pages/Product Category/ProductCategory";
import CreateNewCategory from "./Pages/Product Category/CreateNewCategory";
import DetailedProductCategory from "./Pages/Product Category/DetailedProductCategory";
import SalesQuotes from "./Pages/Sales Quotes/SalesQuotes";
import CreateNewQuote from "./Pages/Sales Quotes/CreateSalesQuote";
import SalesQuotePrintPreview from "./Pages/Sales Quotes/SalesQuotePrintPreview";
import DetailedSalesQuotes from "./Pages/Sales Quotes/DetailedSalesQuotes";
import Tasks from "./Pages/Tasks/Tasks";
import CreateNewTask from "./Pages/Tasks/CreateNewTask";
import DetailedTasks from "./Pages/Tasks/DetailedTasks";
import PhoneCalls from "./Pages/Phone/PhoneCalls";
import CreateNewCall from "./Pages/Phone/CreateNewCall";
import DetailedPhoneCalls from "./Pages/Phone/DetailedPhoneCalls";
import Meetings from "./Pages/Meetings/Meetings";
import CreateMeetings from "./Pages/Meetings/CreateMeetings";
import DisplayMeeting from "./Pages/Meetings/DisplayMeeting";
import Tickets from "./Pages/Ticket/Tickets";
import CreateTicket from "./Pages/Ticket/CreateTicket";
import DisplayTicket from "./Pages/Ticket/DisplayTicket";
import Opportunities from "./Pages/Opportunity Management/Opportunities";
import CreateOpportunity from "./Pages/Opportunity Management/CreateOpportunity";
import DetailedOpportunity from "./Pages/Opportunity Management/DetailedOpportunity";

// Templates and Signatures
import Templates from "./Pages/Templates&signatures/Templates";
import CreateTemplate from "./Pages/Templates&signatures/CreateTemplate";
import DisplayTemplate from "./Pages/Templates&signatures/DisplayTemplate";

// Sales Order
import SalesOrder from "./Pages/Sales Order/SalesOrder";
import CreateSalesOrder from "./Pages/Sales Order/CreateSalesOrder";
import DetailedSalesOrder from "./Pages/Sales Order/DetailedSalesOrder";

// Business Structure
import Division from "./Pages/Business Structure/Division";
import OrganizationPage from "./Pages/OrgStructure/Org/OrganizationPage";
import CreateBusinessEntityForm from "./Pages/OrgStructure/BusinessEntity/CreateBusinessEntity/CreateBusinessEntityForm";
import EditBusinessEntityPage from "./Pages/OrgStructure/BusinessEntity/EditBusinessEntity/EditBusinessEntityPage";
import DisplayBusinessEntityPage from "./Pages/OrgStructure/BusinessEntity/DisplayBusinessEntity/DisplayBusinessEntityPage";
import BusinessUnitPage from "./Pages/OrgStructure/BusinessUnit/BusinessUnitPage";
import CreateBusinessUnitForm from "./Pages/OrgStructure/BusinessUnit/CreateBusinessUnit/CreateBusinessUnitForm";
import EditBusinessUnitPage from "./Pages/OrgStructure/BusinessUnit/EditBusinessUnit/EditBusinessUnitPage";
import DisplayBusinessUnitPage from "./Pages/OrgStructure/BusinessUnit/DisplayBusinessUnit/DisplayBusinessUnitPage";
import CreateSalesChannelForm from "./Pages/OrgStructure/SalesChannel/CreateSalesChannel/CreateSalesChannelForm";
import EditSalesChannelPage from "./Pages/OrgStructure/SalesChannel/EditSalesChannel/EditSalesChannelPage";
import DisplaySalesChannelPage from "./Pages/OrgStructure/SalesChannel/DisplaySalesChannel/DisplaySalesChannelPage";
import CreateSalesOfficeForm from "./Pages/OrgStructure/SalesOffice/CreateSalesOffice/CreateSalesOfficeForm";
import EditSalesOfficePage from "./Pages/OrgStructure/SalesOffice/EditSalesOffice/EditSalesOfficePage";
import DisplaySalesOfficePage from "./Pages/OrgStructure/SalesOffice/DisplaySalesOffice/DisplaySalesOfficePage";
import CreateSalesTeamForm from "./Pages/OrgStructure/SalesTeam/CreateSalesTeam/CreateSalesTeamForm";
import EditSalesTeamForm from "./Pages/OrgStructure/SalesTeam/EditSalesTeam/EditSalesTeamForm";
import DisplaySalesTeamPage from "./Pages/OrgStructure/SalesTeam/DisplaySalesTeam/DisplaySalesTeamPage";
import CreateServiceTeamForm from "./Pages/OrgStructure/ServiceTeam/CreateServiceTeam/CreateServiceTeamForm";
import EditServiceTeamForm from "./Pages/OrgStructure/ServiceTeam/EditServiceTeam/EditServiceTeamForm";
import DisplayServiceTeamForm from "./Pages/OrgStructure/ServiceTeam/DisplayServiceTeam/DisplayServiceTeamPage";
import CreateServiceOfficeForm from "./Pages/OrgStructure/ServiceOffice/CreateServiceOffice/CreateServiceOfficeForm";
import EditServiceOfficeForm from "./Pages/OrgStructure/ServiceOffice/EditServiceOffice/EditServiceOfficeForm";
import DisplayServiceOfficePage from "./Pages/OrgStructure/ServiceOffice/DisplayServiceOffice/DisplayServiceOfficePage";
import CreateServiceChannelForm from "./Pages/OrgStructure/ServiceChannel/CreateServiceChannel/CreateServiceChannelForm";
import EditServiceChannelPage from "./Pages/OrgStructure/ServiceChannel/EditServiceChannel/EditServiceChannelPage";
import DisplayServiceChannelPage from "./Pages/OrgStructure/ServiceChannel/DisplayServiceChannel/DisplayServiceChannelPage";
import CreateMarketingOfficeForm from "./Pages/OrgStructure/MarketingOffice/CreateMarketingOffice/CreateMarketingOfficeForm";
import EditMarketingOfficeForm from "./Pages/OrgStructure/MarketingOffice/EditMarketingOffice/EditMarketingOfficeForm";
import DisplayMarketingOfficePage from "./Pages/OrgStructure/MarketingOffice/DisplayServiceOffice/DisplayMarketingOfficePage";
import CreateMarketingTeamForm from "./Pages/OrgStructure/MarketingTeam/CreateMarketingTeam/CreateMarketingTeamForm";
import EditMarketingTeamForm from "./Pages/OrgStructure/MarketingTeam/EditMarketingTeam/EditMarketingTeamForm";
import DisplayMarketingTeamPage from "./Pages/OrgStructure/MarketingTeam/DisplayMarketingTeam/DisplayMarketingTeamPage";
import CreateMarketingChannelForm from "./Pages/OrgStructure/MarketingChannel/CreateMarketingChannel/CreateMarketingChannelForm";
import EditMarketingChannelForm from "./Pages/OrgStructure/MarketingChannel/EditMarketingChannel/EditMarketingChannelPage";
import DisplayMarketingChannelPage from "./Pages/OrgStructure/MarketingChannel/DisplayMarketingChannel/DisplayMarketingChannelPage";
import AgentSupport from "./Pages/Agent Support/AgentSupport";
import KnowledgeBase from "./Pages/Knowledge Base/KnowledgeBase";
import GeneralSettings from "./Pages/General Settings/GeneralSettings";
import EmailConfig from "./Pages/Email Configurations/EmailConfigurations";
import SocialSetups from "./Pages/Socials/SocialSetups";
import OAuth2Page from "./Pages/Linkedin/OAuth2Page";
import OAuthIntegration from "./Pages/Linkedin/Create OAuth2/OAuthIntegration";
import CreateCredintialSetup from "./Pages/Linkedin/Create OAuth2/CredentialSetup/CreateCredentialSetupPage";
import NewIdentityProvider from "./Pages/Linkedin/Create OAuth2/CredentialSetup/NewIdentityProviderPopPup";
import UseCredentials from "./Pages/Linkedin/Create OAuth2/CredentialSetup/UseCredentials";
import ExternalCredentialManagementInterface from "./Pages/Linkedin/Create OAuth2/CredentialSetup/ExternalCredentialManagementInterface";
import LinkedInAccountsManager from "./Pages/Linkedin/Create OAuth2/Linkdin Channel/LinkedInAccountsManager";

import LiveTalkSetup from "./Pages/LiveTalk/LiveTalkSetup";
import AccessManagement from "./Pages/Access Management/AccessManagement";
import CreateNewBusinessRole from "./Pages/Access Management/CreateNewBusinessRole";
import DetailedAccessManagement from "./Pages/Access Management/DetailedAccessManagement"; // Import new component
import Workflow from "./Pages/Workflow/Workflow";
import CreateOrEditWorkflow from "./Pages/Workflow/CreateOrEditWorkflow";
import EditAndViewWorkflowPage from "./Pages/Workflow/EditAndViewWorkflowPage";
import UserProfile from "./Pages/User Profile/UserProfile";
import CreateUserProfile from "./Pages/User Profile/CreateUserProfile";
import DetailedUserProfile from "./Pages/User Profile/DetailedUserProfile";
import Emails from "./Pages/Emails/Emails";
import DisplayEmail from "./Pages/Emails/DisplayEmail";
import EmailChannels from "./Pages/Email Channels/EmailChannels";
import CreateEmailChannels from "./Pages/Email Channels/CreateEmailChannels";
import EditEmailChannelForm from "./Pages/Email Channels/EditEmailChannelForm";
import Webforms from "./Pages/Webforms/Webforms";
import TelephoneConnect from "./Pages/Telephone Channels/TelephoneConnect";
import AirtelConnect from "./Pages/Telephone Channels/AirtelConnect";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Login/Signup";
import ResetPassword from "./Pages/Login/ResetPassword";

import PrivateRoute from "./components/PrivateRoute";
import PublishedForm from "./Pages/Webforms/PublishedForm";
import EmailAddressGrid from "./Pages/Email Channels/EmailAddressGrid";
import CreateEmailChannelForm from "./Pages/Email Channels/CreateEmailChannelForm";
import EmailVerificationSuccess from "./Pages/Email Channels/EmailVerficationSuccess";
import LiveTalkDashboard from "./Pages/Channels/LiveTalkDashboard";
import LiveTalkList from "./Pages/LiveTalk/LiveTalkList";
import CallCenterSetup from "./Pages/Telephone/CallCenterSetup";
import CallCenterDisplay from "./Pages/Telephone/CallCenterDisplay";

//Reports
import Reports from "./Pages/Reports/Reports";
import NewReport from "./Pages/Reports/NewReport";
import Employees from "./Pages/Employees/Employees";
import DetailedEmployees from "./Pages/Employees/DetailedEmployees";
import ReportResults from "./Pages/Reports/ReportResults";
import ViewReport from "./Pages/Reports/ViewReport";

//Dashboards
import Dashboards from "./Pages/Dashboards/Dashboard";

// --- PLACEHOLDER FOR NEW PAGES ---
const PageUnderConstruction = ({ title }) => (
  <div
    style={{
      padding: "40px",
      textAlign: "center",
      color: "#555",
      marginTop: "50px",
    }}
  >
    <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>{title}</h2>
    <p style={{ fontSize: "1.2rem" }}>
      This module is currently under development.
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Homepage />} />
            <Route path="dashboard" element={<Homepage />} />

            {/* --- NEW SIDEBAR ROUTES (Placeholders for undeveloped pages) --- */}
            
            {/* Sales Cockpit */}
            <Route
              path="/customer-desktop/sales"
              element={<PageUnderConstruction title="Sales Cockpit" />}
            />
            {/* Task Allocations */}
            <Route
              path="/task-management/taskAllocations"
              element={<PageUnderConstruction title="Task Allocations" />}
            />

            {/* Resolution Types */}
            <Route
              path="/resolution-category/types"
              element={<PageUnderConstruction title="Resolution Types" />}
            />
            
            {/* Subtickets (Service) */}
            <Route
              path="/service/subtickets"
              element={<PageUnderConstruction title="Subtickets" />}
            />
            
            {/* Ticket Categories (Service) */}
            <Route
              path="/service/ticket-categories"
              element={<PageUnderConstruction title="Ticket Categories" />}
            />

            {/* --- EXISTING MAPPED ROUTES --- */}

            {/* Sales (Leads, Deals, Quotes, Orders) */}
            <Route
              path="sales/leads"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_LEADS">
                  <Leads />
                </RequirePermission>
              }
            />
            <Route
              path="sales/leads/create"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_LEADS">
                  <CreateNewLead />
                </RequirePermission>
              }
            />
            <Route
              path="sales/leads/details/:id"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_LEADS">
                  <DetailedLeads />
                </RequirePermission>
              }
            />
            <Route
              path="sales/opportunities"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_OPPORTUNITIES">
                  <Opportunities />
                </RequirePermission>
              }
            />
            <Route
              path="sales/opportunities/create"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_OPPORTUNITIES">
                  <CreateOpportunity />
                </RequirePermission>
              }
            />
            <Route
              path="sales/opportunities/details/:id"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_OPPORTUNITIES">
                  <DetailedOpportunity />
                </RequirePermission>
              }
            />
            <Route
              path="sales/sales-quote"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_QUOTES">
                  <SalesQuotes />
                </RequirePermission>
              }
            />
            <Route
              path="sales/sales-quote/create"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_QUOTES">
                  <CreateNewQuote />
                </RequirePermission>
              }
            />
            <Route
              path="/sales/sales-quote/:id/preview"
              element={<SalesQuotePrintPreview />}
            />
            <Route
              path="sales/sales-quote/details/:id"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_QUOTES">
                  <DetailedSalesQuotes />
                </RequirePermission>
              }
            />
            <Route
              path="sales/sales-order"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_ORDER">
                  <SalesOrder />
                </RequirePermission>
              }
            />
            <Route
              path="sales/sales-order/create"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_ORDER">
                  <CreateSalesOrder />
                </RequirePermission>
              }
            />
            <Route
              path="sales/sales-order/details/:id"
              element={
                <RequirePermission viewId="CRM_SALESVIEW_SALES_ORDER">
                  <DetailedSalesOrder />
                </RequirePermission>
              }
            />

            {/* Customers (Accounts, Contacts) */}
            <Route
              path="customers/accounts"
              element={
                // <RequirePermission viewId="CRM_CUSTVIEW_ACCOUNTS">
                <CustomerAccount />
                // </RequirePermission>
              }
            />
            <Route
              path="customers/accounts/create"
              element={
                // <RequirePermission viewId="CRM_CUSTVIEW_ACCOUNTS">
                <CreateNewAccount />
                // </RequirePermission>
              }
            />
            <Route
              path="customers/accounts/details/:accountId?"
              element={
                // <RequirePermission viewId="CRM_CUSTVIEW_ACCOUNTS">
                <DetailedCustomerAccount />
                // </RequirePermission>
              }
            />
            <Route
              path="customers/contacts"
              element={
                <RequirePermission viewId="CRM_CUSTVIEW_CONTACTS">
                  <CustomerContact />
                </RequirePermission>
              }
            />
            <Route
              path="customers/contacts/create"
              element={
                <RequirePermission viewId="CRM_CUSTVIEW_CONTACTS">
                  <CreateNewContact />
                </RequirePermission>
              }
            />
            <Route
              path="customers/contacts/details/:id"
              element={
                <RequirePermission viewId="CRM_CUSTVIEW_CONTACTS">
                  <DetailedCustomerContact />
                </RequirePermission>
              }
            />

            {/* Products */}
            <Route
              path="products/products"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT">
                  <Products />
                </RequirePermission>
              }
            />
            <Route
              path="products/products/create"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT">
                  <CreateNewProduct />
                </RequirePermission>
              }
            />
            <Route
              path="products/products/details/:id"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT">
                  <DetailedProducts />
                </RequirePermission>
              }
            />
            <Route
              path="products/productcategories"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT_CATEGORY">
                  <ProductCategory />
                </RequirePermission>
              }
            />
            <Route
              path="products/productcategories/create"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT_CATEGORY">
                  <CreateNewCategory />
                </RequirePermission>
              }
            />
            <Route
              path="products/productcategories/details/:id"
              element={
                <RequirePermission viewId="CRM_PRODVIEW_PRODUCT_CATEGORY">
                  <DetailedProductCategory />
                </RequirePermission>
              }
            />

            {/* Tasks, Calls, Emails, Meetings */}
            <Route
              path="activitymanagement/tasks"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_TASKS">
                  <Tasks />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/tasks/create"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_TASKS">
                  <CreateNewTask />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/tasks/details/:id"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_TASKS">
                  <DetailedTasks />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/phonecalls"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_PHONE_CALLS">
                  <PhoneCalls />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/phonecalls/create"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_PHONE_CALLS">
                  <CreateNewCall />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/phonecalls/details/:id"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_PHONE_CALLS">
                  <DetailedPhoneCalls />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/emails"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_EMAILS">
                  <Emails />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/emails/view"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_EMAILS">
                  <DisplayEmail />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/meetings"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_MEETINGS">
                  <Meetings />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/meetings/create"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_MEETINGS">
                  <CreateMeetings />
                </RequirePermission>
              }
            />
            <Route
              path="activitymanagement/meetings/details/:id"
              element={
                <RequirePermission viewId="CRM_ACTMANVIEW_MEETINGS">
                  <DisplayMeeting />
                </RequirePermission>
              }
            />

            {/* Business Structure */}
            <Route
              path="business-structure/org-hub"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <OrganizationPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-business-entity"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateBusinessEntityForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-business-entity/:businessEntityCode"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditBusinessEntityPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-business-entity"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayBusinessEntityPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/business-unit"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <BusinessUnitPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-business-unit"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateBusinessUnitForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-business-unit"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditBusinessUnitPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-business-unit"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayBusinessUnitPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-sales-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateSalesChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-sales-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditSalesChannelPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-sales-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplaySalesChannelPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-sales-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateSalesOfficeForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-sales-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditSalesOfficePage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-sales-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplaySalesOfficePage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-sales-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateSalesTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-sales-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditSalesTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-sales-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplaySalesTeamPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-service-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateServiceTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-service-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditServiceTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-service-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayServiceTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-service-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateServiceOfficeForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-service-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditServiceOfficeForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-service-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayServiceOfficePage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-service-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateServiceChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-service-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditServiceChannelPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-service-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayServiceChannelPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-marketing-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateMarketingOfficeForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-marketing-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditMarketingOfficeForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-marketing-office"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayMarketingOfficePage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-marketing-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateMarketingTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-marketing-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditMarketingTeamForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-marketing-team"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayMarketingTeamPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/create-marketing-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <CreateMarketingChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/edit-marketing-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <EditMarketingChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/display-marketing-channel"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_ORG_HUB">
                  <DisplayMarketingChannelPage />
                </RequirePermission>
              }
            />
            <Route
              path="business-structure/division"
              element={
                <RequirePermission viewId="CRM_BSTRUCTVIEW_DIVISIONS">
                  <Division />
                </RequirePermission>
              }
            />

            {/* Analytics */}
            <Route
              path="analytics/reports"
              element={
                <RequirePermission viewId="CRM_ANALYTICSVIEW_REPORTS">
                  <Reports />
                </RequirePermission>
              }
            />
            <Route
              path="analytics/reports/new-report"
              element={
                <RequirePermission viewId="CRM_ANALYTICSVIEW_REPORTS">
                  <NewReport />
                </RequirePermission>
              }
            />

            {/* Tickets & Support */}
            <Route
              path="service/tickets"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_TICKETS">
                  <Tickets />
                </RequirePermission>
              }
            />
            <Route
              path="service/tickets/create"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_TICKETS">
                  <CreateTicket />
                </RequirePermission>
              }
            />
            <Route
              path="service/tickets/details/:ticketId"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_TICKETS">
                  <DisplayTicket />
                </RequirePermission>
              }
            />
            <Route
              path="service/templates"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_TEMPLATES_SIGNATURES">
                  <Templates />
                </RequirePermission>
              }
            />
            <Route
              path="service/templates/create"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_TEMPLATES_SIGNATURES">
                  <CreateTemplate />
                </RequirePermission>
              }
            />
            <Route
              path="service/templates/display"
              element={<DisplayTemplate />}
            />
            <Route
              path="service/agentdesktop"
              element={
                // <RequirePermission viewId="CRM_SERVICEVIEW_AGENT_SUPPORT">
                <AgentSupport />
                // {/* </RequirePermission> */}
              }
            />
            <Route
              path="service/knowledgebase"
              element={
                <RequirePermission viewId="CRM_SERVICEVIEW_KNOWLEDGE_BASE">
                  <KnowledgeBase />
                </RequirePermission>
              }
            />

            {/* Admin */}
            {/* <Route path="settings" element={<Settings />} /> */}
            <Route
              path="admin/general-settings"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_GENERAL_SETTINGS">
                  <GeneralSettings />
                </RequirePermission>
              }
            />
            <Route
              path="admin/accessmanagement"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_ACCESS_MANAGEMENT">
                  <AccessManagement />
                </RequirePermission>
              }
            />
            <Route
              path="admin/accessmanagement/create"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_ACCESS_MANAGEMENT">
                  <CreateNewBusinessRole />
                </RequirePermission>
              }
            />
            {/* NEW ROUTE */}
            <Route
              path="admin/accessmanagement/details/:id"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_ACCESS_MANAGEMENT">
                  <DetailedAccessManagement />
                </RequirePermission>
              }
            />
          
            <Route
              path="admin/workflows"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_WORK_FLOWS">
                  <Workflow />
                </RequirePermission>
              }
            />
            <Route
              path="admin/workflows/create"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_WORK_FLOWS">
                  <CreateOrEditWorkflow />
                </RequirePermission>
              }
            />
            <Route
              path="admin/workflows/edit/:id?"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_WORK_FLOWS">
                  <EditAndViewWorkflowPage />
                </RequirePermission>
              }
            />
            <Route
              path="admin/userprofiles"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_USER_PROFILES">
                  <UserProfile />
                </RequirePermission>
              }
            />
            <Route
              path="admin/userprofiles/create"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_USER_PROFILES">
                  <CreateUserProfile />
                </RequirePermission>
              }
            />
            <Route
              path="admin/userprofiles/details/:id"
              element={
                <RequirePermission viewId="CRM_ADMINVIEW_USER_PROFILES">
                  <DetailedUserProfile />
                </RequirePermission>
              }
            />
            <Route
              path="admin/employees"
              element={
              // ✅ REMOVED PERMISSION CHECK SO PAGE OPENS (Add back after seeding)
              // <RequirePermission viewId="CRM_ADMINVIEW_EMPLOYEES">
                <Employees />
              // </RequirePermission>
              }
            />
            
            <Route
              path="admin/employees/create"
              element={
                // ✅ REMOVED PERMISSION CHECK
                // <RequirePermission viewId="CRM_ADMINVIEW_EMPLOYEES">
                  <CreateUserProfile />
                // </RequirePermission>
              }
            />
            
            <Route
              path="admin/employees/details/:id"
              element={
                // ✅ REMOVED PERMISSION CHECK
                // <RequirePermission viewId="CRM_ADMINVIEW_EMPLOYEES">
                  <DetailedEmployees />
                // </RequirePermission>
              }
            />
            <Route
              path="admin/emailconfigurations"
              element={
                // <RequirePermission viewId="CRM_ADMINVIEW_EMAIL_CONFIG">
                <EmailConfig />
                // </RequirePermission>
              }
            />
            <Route
              path="admin/socialsetups"
              element={
                // <RequirePermission viewId="CRM_ADMINVIEW_EMAIL_CONFIG">
                <SocialSetups />
                // </RequirePermission>
              }
            />
            <Route
              path="admin/socialsetups/livetalk"
              element={
                // <RequirePermission viewId="CRM_CHANNVIEW_LIVETALK">
                <LiveTalkList />
                // </RequirePermission>
              }
            />

            <Route
              path="admin/socialsetups/livetalk/create"
              element={
                // <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                <LiveTalkSetup />
                // </RequirePermission>
              }
            />

            <Route
              path="admin/socialsetups/telephone/call-center"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                  <CallCenterSetup />
                </RequirePermission>
              }
            />

            <Route
              path="admin/socialsetups/telephone/call-center/display/:adapterId"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                  <CallCenterDisplay />
                </RequirePermission>
              }
            />

            {/* Channels */}
            <Route
              path="channels/emails"
              element={
                // <RequirePermission viewId="CRM_CHANNVIEW_EMAIL">
                <EmailAddressGrid />
                // </RequirePermission>
              }
            />
            <Route
              path="channels/emails/create"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_EMAIL">
                  <CreateEmailChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="channels/emails/edit/:id"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_EMAIL">
                  <EditEmailChannelForm />
                </RequirePermission>
              }
            />
            <Route
              path="channels/webforms"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_WEB_FORMS">
                  <Webforms />
                </RequirePermission>
              }
            />
            <Route
              path="channels/live-talk/dashboard"
              element={<LiveTalkDashboard />}
            />
            <Route
              path="/forms/:url"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_WEB_FORMS">
                  <PublishedForm />
                </RequirePermission>
              }
            />

            <Route
              path="channels/telephone/airtel"
              element={
                // <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                <AirtelConnect />
                // {/* </RequirePermission> */}
              }
            />

            {/* Analytics */}

            {/* Reports */}
            <Route
              path="analytics/reports"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                  <Reports />
                </RequirePermission>
              }
            />

            <Route
              path="analytics/reports/new-report"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                  <NewReport />
                </RequirePermission>
              }
            />

            <Route
              path="/analytics/reports/results"
              element={
                <RequirePermission viewId="CRM_CHANNVIEW_TELEPHONE">
                  <ReportResults />
                </RequirePermission>
              }
            />

            <Route
              path="/analytics/reports/:reportId/view"
              element={<ViewReport />}
            />

            <Route
              path="/analytics/reports/:reportId/edit"
              element={<NewReport />}
            />

            {/* Dashboards */}
            <Route
              path="/analytics/dashboards"
              element={<Dashboards />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;