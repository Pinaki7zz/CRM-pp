import { useState } from "react";
import "./Sidebar.css";
import {
  BarChart3,
  Building,
  Users,
  ShoppingBag,
  Briefcase,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  Layers,
  FileText,
  Settings,
  Shield,
  Activity,
  ChevronDown,
  FileSignature,
  Settings2,
  // --- NEW ICONS ADDED BELOW ---
  Network,
  Monitor,
  HeartHandshake,
  TrendingUp,
  LayoutTemplate,
  MessageCircle,
  Share,
  Package,
  CheckSquare,
  History,
  Lock,
  LifeBuoy,
  Book,
  ListChecks,
  UserCog,
  Route
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import gal_logo from "../../assets/gal_logo.png";

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [openDropdown, setOpenDropdown] = useState({});

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const navigation = [
    // 1) Home Page
    { name: "Home Page", icon: BarChart3, path: "/" },

    // 2) Customer Desktop
    {
      name: "User Cockpit",
      icon: Monitor,
      path: "/customer-desktop",
      subMenu: [
        {
          name: "Sales Cockpit",
          path: "/customer-desktop/sales", // NEW PAGE
          icon: Monitor,
          // No permission set yet for new page
        },
        {
          name: "Service Cockpit",
          path: "/service/agentdesktop", // Existing
          icon: LifeBuoy,
          requiredPermission: "CRM_SERVICEVIEW_AGENT_DESKTOP",
        },
      ],
    },

    // 3) Relationships (Customer)
    {
      name: "Business Partners",
      icon: HeartHandshake,
      path: "/customers",
      subMenu: [
        {
          name: "Customers",
          path: "/customers/accounts", // Existing
          icon: Building,
          requiredPermission: "CRM_CUSTVIEW_ACCOUNTS",
        },
        {
          name: "Contacts",
          path: "/customers/contacts", // Existing
          icon: Users,
          requiredPermission: "CRM_CUSTVIEW_CONTACTS",
        },
      ],
    },

    // 4) Business Structure
    {
      name: "Business Structure",
      icon: Building,
      path: "/business-structure",
      subMenu: [
        {
          name: "Org Hub",
          path: "/business-structure/org-hub", // Existing
          icon: Network,
          requiredPermission: "CRM_BSTRUCTVIEW_ORG_HUB",
        },
      ],
    },

    // 5) Sale Dashboard (Sales)
    {
      name: "Sales",
      icon: TrendingUp,
      path: "/sales",
      subMenu: [
        {
          name: "Leads", // Was Leads
          path: "/sales/leads", // Existing
          icon: Users,
          requiredPermission: "CRM_SALESVIEW_LEADS",
        },
        {
          name: "Deals", // Was Opportunities
          path: "/sales/opportunities", // Existing
          icon: ShoppingBag,
          requiredPermission: "CRM_SALESVIEW_OPPORTUNITIES",
        },
        {
          name: "Quotes", // Was Sales Quotes
          path: "/sales/sales-quote", // Existing
          icon: FileText,
          requiredPermission: "CRM_SALESVIEW_SALES_QUOTES",
        },
        {
          name: "Orders", // Was Sales Order
          path: "/sales/sales-order", // Existing
          icon: FileText,
          requiredPermission: "CRM_SALESVIEW_SALES_ORDER",
        },
      ],
    },

    // 6) Templates and Signature
    {
      name: "Templates & Signature",
      icon: LayoutTemplate,
      path: "/service/templates", // Moved from Service
      requiredPermission: "CRM_SERVICEVIEW_TEMPLATES_SIGNATURES",
    },

    // 7) Communication (Channels)
    {
      name: "Communication",
      icon: MessageCircle,
      path: "/channels",
      subMenu: [
        {
          name: "Email",
          path: "/channels/emails", // Existing
          icon: Mail,
          requiredPermission: "CRM_CHANNVIEW_EMAIL",
        },
        {
          name: "Voice", // Was Telephone
          path: "/channels/telephone", // Existing
          icon: Phone,
          requiredPermission: "CRM_CHANNVIEW_TELEPHONE",
        },
        {
          name: "Form", // Was Web Forms
          path: "/channels/webforms", // Existing
          icon: FileText,
          requiredPermission: "CRM_CHANNVIEW_WEB_FORMS",
        },
        {
          name: "LinkedIn", // Was LinkedIn
          path: "/admin/socialsetups/linkedinoauth/accounts", // Existing
          icon: Share,
          requiredPermission: "CRM_CHANNVIEW_LINKEDIN",
        },
        {
          name: "Chat", // Was Live Talk
          path: "/channels/live-talk/dashboard", // Existing
          icon: MessageSquare,
          requiredPermission: "CRM_CHANNVIEW_LIVE_TALK",
        },
      ],
    },

    // 8) Product Catalog (Product)
    {
      name: "Product Catalog",
      icon: Package,
      path: "/products",
      subMenu: [
        {
          name: "Items", // Was Product
          path: "/products/products", // Existing
          icon: Package,
          requiredPermission: "CRM_PRODVIEW_PRODUCT",
        },
        {
          name: "Categories", // Was Product Category
          path: "/products/productcategories", // Existing
          icon: Layers,
          requiredPermission: "CRM_PRODVIEW_PRODUCT_CATEGORY",
        },
      ],
    },

    // 9) Task Management
    {
      name: "Task Management",
      icon: CheckSquare,
      path: "/task-management",
      subMenu: [
        {
          name: "Task Type", // Was Task from Activity Management
          path: "/activitymanagement/tasks", // Existing
          icon: CheckSquare,
          requiredPermission: "CRM_ACTMANVIEW_TASKS",
        },
        {
          name: "Task Allocations", // New Page
          path: "/task-management/TaskAllocations",
          icon: Route,
          // No permission set yet
        }
        
      ],
    },

    {
			name: "Resolution Category",
			icon: ListChecks,
			path: "/resolution-category",
			subMenu: [
				{
					name: "Resolution Types", // New Page
					path: "/resolution-category/types",
					icon: ListChecks,
					// No permission set yet
				},
			],
		},

    // 10) Interaction (Activity Management)
    {
      name: "Interaction",
      icon: History,
      path: "/activity-management",
      subMenu: [
        {
          name: "Phone", // Was Phone Calls
          path: "/activitymanagement/phonecalls", // Existing
          icon: Phone,
          requiredPermission: "CRM_ACTMANVIEW_PHONE_CALLS",
        },
        {
          name: "E-mail", // Was Emails
          path: "/activitymanagement/emails", // Existing
          icon: Mail,
          requiredPermission: "CRM_ACTMANVIEW_EMAILS",
        },
        {
          name: "Meetings",
          path: "/activitymanagement/meetings", // Existing
          icon: Users,
          requiredPermission: "CRM_ACTMANVIEW_MEETINGS",
        },
      ],
    },

    // 11) Access Control
    {
      name: "Access Control",
      icon: Lock,
      path: "/access-control",
      subMenu: [
        {
          name: "User", // Was User Profiles
          path: "/admin/userprofiles", // Existing
          icon: Users,
          requiredPermission: "CRM_ADMINVIEW_USER_PROFILES",
        },
        {
					name: "Employees", // New Page
					path: "/admin/employees",
					icon: UserCog,
					// No permission set yet
				},
        {
          name: "Roles and Permission", // Was Access Management
          path: "/admin/accessmanagement", // Existing
          icon: Shield,
          requiredPermission: "CRM_ADMINVIEW_ACCESS_MANAGEMENT",
        },
      ],
    },

    // 12) Analytics
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      subMenu: [
        {
          name: "Reports",
          path: "/analytics/reports", // Existing
          icon: FileText,
          requiredPermission: "CRM_ANALYTICSVIEW_REPORTS",
        },
        {
          name: "Insight", // Was Dashboards
          path: "/analytics/dashboards", // Existing
          icon: Activity,
          requiredPermission: "CRM_ANALYTICSVIEW_DASHBOARDS",
        },
      ],
    },

    // 13) System settings
    {
      name: "System Settings",
      icon: Settings,
      path: "/admin",
      subMenu: [
        {
          name: "General", // Was General Settings
          path: "/admin/general-settings", // Existing
          icon: Settings,
          requiredPermission: "CRM_ADMINVIEW_GENERAL_SETTINGS",
        },
        {
          name: "Social Setups",
          path: "/admin/socialsetups", // Existing
          icon: Settings2,
          requiredPermission: "CRM_ADMINVIEW_SOCIAL_SETUPS",
        },
        {
          name: "Email Configuration",
          path: "/admin/emailconfigurations", // Existing
          icon: Mail,
          requiredPermission: "CRM_ADMINVIEW_MAIL_CONFIGURATIONS",
        },
        {
          name: "Workflows",
          path: "/admin/workflows", // Existing
          icon: Network,
          requiredPermission: "CRM_ADMINVIEW_WORK_FLOWS",
        },
      ],
    },

    // 14) Service Dashboard (Service)
    {
			name: "Service Dashboard",
			icon: LifeBuoy,
			path: "/service",
			subMenu: [
				{
					name: "Tickets",
					path: "/service/tickets",
					icon: FileText,
					requiredPermission: "CRM_SERVICEVIEW_TICKETS",
				},
				{
					name: "Subtickets", // New Page
					path: "/service/subtickets",
					icon: FileText,
					// No permission set yet
				},
				{
					name: "Ticket Categories", // New Page
					path: "/service/ticket-categories",
					icon: Layers,
					// No permission set yet
				},
			],
		},

    // 15) Knowledge Base
    {
      name: "Knowledge Base",
      icon: Book,
      path: "/service/knowledgebase", // Existing
      requiredPermission: "CRM_SERVICEVIEW_KNOWLEDGE_BASE",
    },
  ];

	return (
		<div className="main-sidebar-container">
			<div className="main-sidebar-header">
				<img src={gal_logo} className="unique-sidebar-logo" />
				<span className="unique-sidebar-title">GEMS CRM</span>
			</div>
			<nav className="main-sidebar-nav">
				{navigation.map((item) => {
					// Case 1: has subMenu
					if (item.subMenu) {
						const allowedSubs = item.subMenu.filter((sub) => {
							return (
								!sub.requiredPermission ||
								hasPermission(sub.requiredPermission)
							);
						});

						if (allowedSubs.length === 0) return null; // hide parent if no children allowed

						return (
							<div key={item.path}>
								{item.subMenu ? (
									<>
										<div
											className={`main-sidebar-item ${
												activeTab.startsWith(item.path)
													? "active"
													: ""
											}`}
											onClick={() =>
												toggleDropdown(item.name)
											}
										>
											<item.icon className="main-sidebar-icon" />
											<span className="main-sidebar-link">
												{item.name}
											</span>
											<ChevronDown
												className={`dropdown-icon ${
													openDropdown[item.name]
														? "open"
														: ""
												}`}
											/>
										</div>
										{openDropdown[item.name] && (
											<div className="submenu">
												{item.subMenu.map((sub) => (
													<Link
														key={sub.path}
														to={sub.path}
														className={`submenu-item ${
															activeTab ===
															sub.path
																? "active"
																: ""
														}`}
														onClick={() =>
															setActiveTab(
																sub.path,
															)
														}
													>
														<sub.icon className="submenu-icon" />
														<span>{sub.name}</span>
													</Link>
												))}
											</div>
										)}
									</>
								) : (
									<Link
										to={item.path}
										onClick={() => setActiveTab(item.path)}
										className={`main-sidebar-item ${
											activeTab === item.path
												? "active"
												: ""
										}`}
									>
										<item.icon className="main-sidebar-icon" />
										{item.name}
									</Link>
								)}
							</div>
						);
					}

					// Case 2: single item
					if (
						item.requiredPermission &&
						!hasPermission(item.requiredPermission)
					)
						return null;

					return (
						<Link
							key={item.path}
							to={item.path}
							onClick={() => setActiveTab(item.path)}
							className={`main-sidebar-item ${
								activeTab === item.path ? "active" : ""
							}`}
						>
							<item.icon className="main-sidebar-icon" />
							{item.name}
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export default Sidebar;