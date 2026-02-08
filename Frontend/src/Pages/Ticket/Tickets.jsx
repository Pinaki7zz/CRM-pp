import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback,
} from "react";
import {
	Plus,
	RefreshCcw,
	RotateCcw,
	Filter,
	Search,
	X,
	CircleUserRound,
	ChevronDown,
	SquarePen,
	Trash2,
	CircleArrowLeft,
	CircleArrowRight,
	Eye,
	Settings,
	ChevronsLeft,
	ChevronsRight,
	ArrowUp,
	ArrowDown,
	ArrowUpDown,
	CheckCircle2,
	Ban,
	Copy,
	MoreVertical,
	Mail,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./Tickets.css";

const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const SUPPORT_TEAMS = [
	"L1 Support",
	"L2 Technical Support",
	"Billing Department",
	"Customer Success",
	"Sales Handoff",
];

// --- CONSTANTS defined outside to ensure stability ---

// 1. Default Advanced Filters
const INITIAL_ADVANCED_STATE = {
	ticket_id: { value: "", operator: "include" },
	subject: { value: "", operator: "include" },
	priority: { value: "", operator: "include" },
	status: { value: "", operator: "include" },
	account_name: { value: "", operator: "include" },
	source: { value: "", operator: "include" },
	ticket_owner_name: { value: "", operator: "include" },
	created_at: { value: "", operator: "include" },
};

// 2. Default Visible Columns (For Reset)
const DEFAULT_VISIBLE_COLUMNS = {
	ticket_id: true,
	subject: true,
	status: true,
	priority: true,
	owner: true,
	account_name: true,
	contact: true,
	source: true,
	created_at: true,
	actions: true,
};

const Tickets = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const actionRef = useRef(null);
	const popupRef = useRef(null);
	const [pageInput, setPageInput] = useState(1); //pagination input state

	// --- State Management ---
	const [tickets, setTickets] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [users, setUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// --- Filter & Modal States ---
	const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [showColumnControl, setShowColumnControl] = useState(false);
	const [showSortModal, setShowSortModal] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);

	const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
	const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
	const [showMassEmailModal, setShowMassEmailModal] = useState(false);

	const [selectedAgent, setSelectedAgent] = useState("");
	const [selectedTeam, setSelectedTeam] = useState("");
	const [massEmailData, setMassEmailData] = useState({
		subject: "",
		body: "",
	});

	const [activePopupColumn, setActivePopupColumn] = useState(null);

	const [ticketToDelete, setTicketToDelete] = useState(null);
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [resetSpin, setResetSpin] = useState(false);
	const [loading, setLoading] = useState(false);

	// --- Column Definitions ---
	const allColumns = useMemo(
		() => [
			{ key: "ticket_id", label: "Ticket Id" },
			{ key: "subject", label: "Subject" },
			{ key: "status", label: "Status" },
			{ key: "priority", label: "Priority" },
			{ key: "owner", label: "Owner" },
			{ key: "account_name", label: "Account" },
			{
				key: "contact",
				label: "Contact",
				sortKey: "primary_contact_name",
			},
			{ key: "source", label: "Source" },
			{ key: "created_at", label: "Reported On" },
			{ key: "description", label: "Description" },
			{ key: "email", label: "Contact Email" },
			{ key: "phone", label: "Contact Phone" },
			{ key: "service_group", label: "Team / Group" },
			{ key: "channel", label: "Channel" },
			{ key: "received_at", label: "Received On" },
			{
				key: "initial_review_completed_at",
				label: "Review Completed At",
			},
		],
		[],
	);

	// Use the Constant for initial state
	const [visibleColumns, setVisibleColumns] = useState(
		DEFAULT_VISIBLE_COLUMNS,
	);

	const [tempVisibleKeys, setTempVisibleKeys] = useState([]);
	const [tempAvailableKeys, setTempAvailableKeys] = useState([]);
	const [selectedAvailable, setSelectedAvailable] = useState([]);
	const [selectedVisible, setSelectedVisible] = useState([]);

	// --- Search & Filter State ---
	const [searchTerm, setSearchTerm] = useState("");
	const [columnSearch, setColumnSearch] = useState({});

	const [tempSortConfig, setTempSortConfig] = useState({
		key: "created_at",
		direction: "desc",
	});

	// Initialize with a clean Deep Copy of the constant
	const [advancedFilters, setAdvancedFilters] = useState(
		JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)),
	);
	const [tempFilters, setTempFilters] = useState(
		JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)),
	);

	const [savedViews, setSavedViews] = useState([]);
	const [quickFilter, setQuickFilter] = useState("all_tickets");

	const [sortConfig, setSortConfig] = useState({
		key: "created_at",
		direction: "desc",
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// --- Helpers ---
	const getLoggedInUserName = () => {
		if (user) {
			return (
				[user.firstName, user.lastName].filter(Boolean).join(" ") ||
				user.name ||
				user.username ||
				"Current User"
			);
		}
		return "Current User";
	};

	const formatText = (text) => {
		if (!text) return "-";
		return String(text)
			.toLowerCase()
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const getLinkedContact = (idToFind) => {
		if (!idToFind || !contacts || contacts.length === 0) return null;
		const idStr = String(idToFind);
		return contacts.find(
			(c) => String(c.contactId) === idStr || String(c.id) === idStr,
		);
	};

	const getCellValue = (ticket, key) => {
		const contact = getLinkedContact(ticket.primary_contact_id);
		switch (key) {
			case "ticket_id":
				return String(ticket.ticket_id);
			case "subject":
				return ticket.subject || "-";
			case "status":
				const rawStatus = (ticket.status || "").toLowerCase();
				const rawPriority = (ticket.priority || "").toLowerCase();

				// Matches System View Logic: High Priority + Not Closed = Escalated
				if (rawStatus === "escalated") return "Escalated";
				if (rawPriority === "high" && rawStatus !== "closed")
					return "Escalated";

				return formatText(ticket.status);

			case "priority":
				return formatText(ticket.priority);
			case "owner":
				return ticket.ticket_owner_name || "Unassigned";
			case "account_name":
				return ticket.account_name || "-";
			case "contact":
				return contact
					? `${contact.firstName} ${contact.lastName}`
					: ticket.primary_contact_name || "-";
			case "source":
				return formatText(ticket.source);
			case "created_at":
				return ticket.created_at
					? new Date(ticket.created_at).toLocaleDateString()
					: "-";
			case "email":
				return ticket.email || (contact ? contact.email : "-");
			case "phone":
				return ticket.phone || (contact ? contact.phone : "-");
			case "description":
				return ticket.description
					? ticket.description.substring(0, 50) + "..."
					: "";
			default:
				return ticket[key] || "";
		}
	};

	// --- Data Fetching ---
	const fetchTickets = useCallback(async (queryParams = "") => {
		try {
			setLoading(true);
			const url = queryParams
				? `${BASE_URL_SER}/tickets?${queryParams}`
				: `${BASE_URL_SER}/tickets`;
			const response = await fetch(url, {
				headers: {
					Pragma: "no-cache",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
			});
			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			setTickets(Array.isArray(data) ? data : data.items || []);
			if (queryParams) setCurrentPage(1);
		} catch (error) {
			console.error("Failed to fetch tickets:", error);
			toast.error("Failed to fetch tickets");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const fetchContacts = async () => {
			try {
				const response = await fetch(`${BASE_URL_AC}/contact`);
				if (response.ok) setContacts((await response.json()) || []);
			} catch (error) {
				console.error("Error fetching contacts:", error);
			}
		};
		const fetchUsers = async () => {
			try {
				const response = await fetch(`${BASE_URL_UM}/users/s-info`);
				if (response.ok) setUsers((await response.json()) || []);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchTickets();
		fetchContacts();
		fetchUsers();
		const saved = localStorage.getItem("ticketViews");
		if (saved) setSavedViews(JSON.parse(saved));
	}, [fetchTickets]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (actionRef.current && !actionRef.current.contains(event.target))
				setShowActionsModal(false);
			if (popupRef.current && !popupRef.current.contains(event.target))
				setActivePopupColumn(null);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	//Pagination input sync
	useEffect(() => {
		setPageInput(currentPage);
	}, [currentPage]);

	// Handle page input commit (on Enter or blur)
	const handlePageInputCommit = () => {
		const val = parseInt(pageInput);
		if (!isNaN(val) && val >= 1 && val <= (totalPages || 1)) {
			setCurrentPage(val);
		} else {
			// If invalid or empty, revert to the current valid page
			setPageInput(currentPage);
		}
	};

	const handleToggleAdvancedFilter = () => {
		if (!showAdvancedFilter) setTempFilters(advancedFilters);
		setShowAdvancedFilter(!showAdvancedFilter);
	};

	const toggleRowSelection = (id) => {
		setSelectedRows((prev) =>
			prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
		);
	};

	const handleSelectAll = () => {
		setSelectedRows(
			selectedRows.length === processedTickets.length
				? []
				: processedTickets.map((t) => t.ticket_id),
		);
	};

	const openColumnControl = () => {
		const currentVisible = allColumns
			.filter((col) => visibleColumns[col.key])
			.map((col) => col.key);
		const currentAvailable = allColumns
			.filter((col) => !visibleColumns[col.key])
			.map((col) => col.key);
		setTempVisibleKeys(currentVisible);
		setTempAvailableKeys(currentAvailable);
		setSelectedAvailable([]);
		setSelectedVisible([]);
		setShowColumnControl(true);
	};

	const handleMoveToVisible = () => {
		setTempVisibleKeys([...tempVisibleKeys, ...selectedAvailable]);
		setTempAvailableKeys(
			tempAvailableKeys.filter((k) => !selectedAvailable.includes(k)),
		);
		setSelectedAvailable([]);
	};

	const handleMoveToAvailable = () => {
		setTempAvailableKeys([...tempAvailableKeys, ...selectedVisible]);
		setTempVisibleKeys(
			tempVisibleKeys.filter((k) => !selectedVisible.includes(k)),
		);
		setSelectedVisible([]);
	};

	const handleSaveColumns = () => {
		const newVisibleState = { actions: true };
		allColumns.forEach((col) => (newVisibleState[col.key] = false));
		tempVisibleKeys.forEach((key) => (newVisibleState[key] = true));
		setVisibleColumns(newVisibleState);
		setShowColumnControl(false);
		toast.success("List view updated!");
	};

	const handleViewClick = (id) => navigate(`/service/tickets/details/${id}`);
	const handleEditClick = (e, id) => {
		e.stopPropagation();
		navigate(`/service/tickets/details/${id}`, {
			state: { startInEditMode: true },
		});
	};

	const updateAdvancedFilter = (field, key, value) => {
		setTempFilters((prev) => ({
			...prev,
			[field]: { ...prev[field], [key]: value },
		}));
	};

	const toggleOperator = (field) => {
		setTempFilters((prev) => ({
			...prev,
			[field]: {
				...prev[field],
				operator:
					prev[field].operator === "include" ? "exclude" : "include",
			},
		}));
	};

	const handleApplyAdvancedFilter = () => {
		setAdvancedFilters(tempFilters);
		setCurrentPage(1);
		toast.success("Filters applied successfully");
	};

	const handleRestoreAdvancedFilter = () => {
		setResetSpin(true);
		// Clean reset from constant
		setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
		setTimeout(() => setResetSpin(false), 500);
	};

	const handleSaveChanges = () => {
		const systemViews = [
			"all_tickets",
			"my_tickets",
			"closed_tickets",
			"escalated_tickets",
			"todays_open_tickets",
			"completed_tickets",
			"last_7_days",
		];
		if (systemViews.includes(quickFilter)) {
			handleSaveQuery();
			return;
		}
		const updatedViews = savedViews.map((view) =>
			view.id === quickFilter ? { ...view, filters: tempFilters } : view,
		);
		setSavedViews(updatedViews);
		localStorage.setItem("ticketViews", JSON.stringify(updatedViews));
		setAdvancedFilters(tempFilters);
		toast.success("View updated successfully!");
	};

	const handleSaveQuery = () => {
		const name = prompt("Enter a name for this view:", "New Custom View");
		if (name) {
			const newView = {
				id: Date.now().toString(),
				name: name,
				filters: tempFilters,
			};
			const updatedViews = [...savedViews, newView];
			setSavedViews(updatedViews);
			localStorage.setItem("ticketViews", JSON.stringify(updatedViews));
			setQuickFilter(newView.id);
			setAdvancedFilters(tempFilters);
			toast.success(`View "${name}" saved!`);
		}
	};

	const handleDeleteView = (viewId) => {
		if (window.confirm("Are you sure you want to delete this view?")) {
			const updatedViews = savedViews.filter((v) => v.id !== viewId);
			setSavedViews(updatedViews);
			localStorage.setItem("ticketViews", JSON.stringify(updatedViews));
			if (quickFilter === viewId) {
				setQuickFilter("all_tickets");
				const fresh = JSON.parse(
					JSON.stringify(INITIAL_ADVANCED_STATE),
				);
				setAdvancedFilters(fresh);
				setTempFilters(fresh);
			}
			toast.success("View deleted.");
		}
	};

	const handleViewChange = (viewId) => {
		setQuickFilter(viewId);
		setCurrentPage(1);
		const selectedSavedView = savedViews.find((v) => v.id === viewId);
		if (selectedSavedView) {
			setAdvancedFilters(selectedSavedView.filters);
			setTempFilters(selectedSavedView.filters);
			setShowAdvancedFilter(true);
		} else {
			const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
			setAdvancedFilters(fresh);
			setTempFilters(fresh);
		}
	};

	// ✅ FIXED: Deep Reset Logic + Data Refresh + COLUMN RESET
	const handleGlobalReset = () => {
		setResetSpin(true);
		// 1. Clear simple filters
		setSearchTerm("");
		setColumnSearch({});
		setQuickFilter("all_tickets");

		// 2. Deep copy clean state to wipe complex filters
		const freshState = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
		setAdvancedFilters(freshState);
		setTempFilters(freshState);

		// 3. Reset Table UI & Columns
		setSortConfig({ key: "created_at", direction: "desc" });
		setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
		setCurrentPage(1);
		setSelectedRows([]);

		// 4. Refresh Data
		fetchTickets();

		setTimeout(() => setResetSpin(false), 500);
		toast.info("View reset to default");
	};

	// Real-time Counter Logic (Restored)
	const ticketCounts = useMemo(() => {
		const userName = getLoggedInUserName().toLowerCase();
		const now = new Date();
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(now.getDate() - 7);
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		return {
			all: tickets.length,
			my: tickets.filter((t) =>
				(t.ticket_owner_name || "").toLowerCase().includes(userName),
			).length,
			closed: tickets.filter(
				(t) => (t.status || "").toLowerCase() === "closed",
			).length,
			escalated: tickets.filter(
				(t) =>
					(t.status || "").toLowerCase() === "escalated" ||
					(t.priority || "").toLowerCase() === "high",
			).length,
			todayOpen: tickets.filter((t) => {
				const isToday = new Date(t.created_at) >= startOfToday;
				const isClosed = (t.status || "").toLowerCase() === "closed";
				return isToday || !isClosed;
			}).length,
			completed: tickets.filter(
				(t) =>
					(t.status || "").toLowerCase() === "completed" ||
					(t.status || "").toLowerCase() === "resolved",
			).length,
			recent: tickets.filter(
				(t) => new Date(t.created_at) >= sevenDaysAgo,
			).length,
		};
	}, [tickets, user]);

	// --- Bulk Action Handlers ---
	const handleConfirmAssignAgent = async () => {
		if (!selectedAgent) return toast.warn("Please select an agent.");
		try {
			await Promise.all(
				selectedRows.map((id) =>
					fetch(`${BASE_URL_SER}/tickets/${id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							ticket_owner_name: selectedAgent,
						}),
					}),
				),
			);
			toast.success(
				`Assigned ${selectedRows.length} tickets to ${selectedAgent}`,
			);
			setShowAssignAgentModal(false);
			setSelectedRows([]);
			fetchTickets();
		} catch (e) {
			toast.error("Failed to assign agent.");
		}
	};

	const handleConfirmAssignTeam = async () => {
		if (!selectedTeam) return toast.warn("Please select a team.");
		try {
			await Promise.all(
				selectedRows.map((id) =>
					fetch(`${BASE_URL_SER}/tickets/${id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ service_group: selectedTeam }),
					}),
				),
			);
			toast.success(
				`Assigned ${selectedRows.length} tickets to ${selectedTeam}`,
			);
			setShowAssignTeamModal(false);
			setSelectedRows([]);
			fetchTickets();
		} catch (e) {
			toast.error("Failed to assign team.");
		}
	};

	const handleConfirmMassEmail = async () => {
		if (!massEmailData.subject || !massEmailData.body)
			return toast.warn("Subject and Body are required.");
		const toastId = toast.loading("Sending mass emails...");
		let successCount = 0;
		for (const id of selectedRows) {
			const ticket = tickets.find((t) => t.ticket_id === id);
			if (!ticket) continue;
			const contact = getLinkedContact(ticket.primary_contact_id);
			const recipientEmail = contact?.email || ticket.email;
			if (recipientEmail) {
				try {
					await fetch(`${BASE_URL_SER}/tickets/${id}/emails`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							subject: massEmailData.subject,
							body: massEmailData.body,
							sender: "Current User",
							recipient: recipientEmail,
							type: "outbound",
						}),
					});
					successCount++;
				} catch (e) {
					console.error(`Failed to email ticket ${id}`, e);
				}
			}
		}
		toast.update(toastId, {
			render: `Sent ${successCount} emails successfully.`,
			type: "success",
			isLoading: false,
			autoClose: 3000,
		});
		setShowMassEmailModal(false);
		setSelectedRows([]);
	};

	const handleActionClick = (action) => {
		setShowActionsModal(false);
		if (selectedRows.length === 0 && action !== "export") {
			toast.warn("Select at least one ticket.");
			return;
		}
		switch (action) {
			case "assign_agent":
				setShowAssignAgentModal(true);
				break;
			case "assign_team":
				setShowAssignTeamModal(true);
				break;
			case "mass_email":
				setShowMassEmailModal(true);
				break;
			case "assign_me":
				const currentUser = getLoggedInUserName();
				if (
					window.confirm(
						`Assign ${selectedRows.length} tickets to ${currentUser}?`,
					)
				) {
					setTickets((prev) =>
						prev.map((t) =>
							selectedRows.includes(t.ticket_id)
								? { ...t, ticket_owner_name: currentUser }
								: t,
						),
					);
					selectedRows.forEach((id) =>
						fetch(`${BASE_URL_SER}/tickets/${id}`, {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								ticket_owner_name: currentUser,
							}),
						}),
					);
					setSelectedRows([]);
					toast.success("Assigned to you.");
				}
				break;
			case "delete":
				openBulkDeleteModal();
				break;
			case "export":
				handleExport();
				break;
			default:
				break;
		}
	};

	const handleExport = () => {
		const rows = tickets.filter((t) => selectedRows.includes(t.ticket_id));
		if (!rows.length) return;
		const csv = [
			"Ticket ID,Subject,Status,Priority,Owner,Created On",
			...rows.map(
				(r) =>
					`${r.ticket_id},"${r.subject || ""}",${r.status},${r.priority},"${r.ticket_owner_name || ""}",${r.created_at}`,
			),
		].join("\n");
		const link = document.createElement("a");
		link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
		link.download = "tickets.csv";
		link.click();
		toast.success("Exported!");
	};

	const processedTickets = useMemo(() => {
		let result = [...tickets];
		// 1. Global Search - UPDATED to Search ALL Columns
		if (searchTerm) {
			const lower = searchTerm.toLowerCase();
			result = result.filter((item) => {
				// Check if any visible column value matches the search term
				return allColumns.some((col) => {
					const cellValue = getCellValue(item, col.key);
					return String(cellValue).toLowerCase().includes(lower);
				});
			});
		}
		// 2. Column Search
		Object.keys(columnSearch).forEach((key) => {
			const val = columnSearch[key]?.toLowerCase();
			if (val)
				result = result.filter((item) =>
					getCellValue(item, key).toLowerCase().includes(val),
				);
		});

		// 3. System Views
		const user = getLoggedInUserName().toLowerCase();
		if (quickFilter === "my_tickets")
			result = result.filter((t) =>
				(t.ticket_owner_name || "").toLowerCase().includes(user),
			);
		if (quickFilter === "closed_tickets")
			result = result.filter(
				(t) => (t.status || "").toLowerCase() === "closed",
			);
		if (quickFilter === "escalated_tickets")
			result = result.filter(
				(t) =>
					(t.status || "").toLowerCase() === "escalated" ||
					(t.priority || "").toLowerCase() === "high",
			);
		if (quickFilter === "todays_open_tickets") {
			const startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0);
			result = result.filter(
				(t) =>
					(t.status || "").toLowerCase() !== "closed" ||
					new Date(t.created_at) >= startOfToday,
			);
		}
		if (quickFilter === "completed_tickets")
			result = result.filter(
				(t) =>
					(t.status || "").toLowerCase() === "completed" ||
					(t.status || "").toLowerCase() === "resolved",
			);
		if (quickFilter === "last_7_days") {
			const d = new Date();
			d.setDate(d.getDate() - 7);
			result = result.filter((t) => new Date(t.created_at) >= d);
		}

		// 4. Advanced Filters
		Object.keys(advancedFilters).forEach((key) => {
			const rule = advancedFilters[key];
			if (!rule.value) return;
			const filterVal = rule.value.toLowerCase();
			result = result.filter((item) => {
				let cellValue =
					key === "account_name"
						? item.account_name || ""
						: key === "ticket_owner_name"
							? item.ticket_owner_name || ""
							: getCellValue(item, key);
				const match = String(cellValue)
					.toLowerCase()
					.includes(filterVal);
				return rule.operator === "include" ? match : !match;
			});
		});

		// 5. Sort
		if (sortConfig.key) {
			result.sort((a, b) => {
				const valA = getCellValue(a, sortConfig.key).toLowerCase();
				const valB = getCellValue(b, sortConfig.key).toLowerCase();
				if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
				if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
				return 0;
			});
		}
		return result;
	}, [
		tickets,
		searchTerm,
		columnSearch,
		quickFilter,
		sortConfig,
		advancedFilters,
		user,
		contacts,
	]); // Added 'contacts' dependency

	const handleDeleteConfirm = async () => {
		const toDel = ticketToDelete ? [ticketToDelete] : selectedRows;
		try {
			await Promise.all(
				toDel.map((id) =>
					fetch(`${BASE_URL_SER}/tickets/${id}`, {
						method: "DELETE",
					}),
				),
			);
			setShowDeleteConfirm(false);
			setSelectedRows([]);
			setTicketToDelete(null);
			fetchTickets();
			toast.success("Deleted successfully");
		} catch (e) {
			toast.error("Error deleting");
		}
	};
	const openBulkDeleteModal = () => {
		if (!selectedRows.length) return toast.warn("Select tickets first");
		setTicketToDelete(null);
		setShowDeleteConfirm(true);
	};

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = processedTickets.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);
	const totalPages = Math.ceil(processedTickets.length / itemsPerPage);

	const handleSort = (key, direction) => {
		setSortConfig({ key, direction });
		setActivePopupColumn(null);
	};
	const renderSortIcon = (key) =>
		sortConfig.key === key ? (
			sortConfig.direction === "asc" ? (
				<ArrowUp size={14} className="sort-icon-active" />
			) : (
				<ArrowDown size={14} className="sort-icon-active" />
			)
		) : null;

	const renderHeaderCell = (col) => {
		if (!visibleColumns[col.key]) return null;
		const isPopupOpen = activePopupColumn === col.key;
		return (
			<th key={col.key} style={{ position: "relative" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div
						onClick={() =>
							handleSort(
								col.sortKey || col.key,
								sortConfig.direction === "asc" ? "desc" : "asc",
							)
						}
						style={{
							cursor: "pointer",
							display: "flex",
							gap: "5px",
							alignItems: "center",
						}}
					>
						{col.label} {renderSortIcon(col.sortKey || col.key)}
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							setActivePopupColumn(isPopupOpen ? null : col.key);
						}}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
						}}
					>
						<MoreVertical size={16} color="#666" />
					</button>
				</div>
				{isPopupOpen && (
					<div
						ref={popupRef}
						className="header-popup-menu"
						onClick={(e) => e.stopPropagation()}
						style={{
							position: "absolute",
							top: "100%",
							right: 0,
							zIndex: 100,
							background: "white",
							boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
							border: "1px solid #eee",
							borderRadius: "6px",
							padding: "10px",
							width: "200px",
						}}
					>
						<button
							onClick={() =>
								handleSort(col.sortKey || col.key, "asc")
							}
							style={{
								display: "flex",
								gap: "8px",
								width: "100%",
								padding: "6px",
								border: "none",
								background: "transparent",
								cursor: "pointer",
							}}
						>
							<ArrowUp size={14} /> Ascending
						</button>
						<button
							onClick={() =>
								handleSort(col.sortKey || col.key, "desc")
							}
							style={{
								display: "flex",
								gap: "8px",
								width: "100%",
								padding: "6px",
								border: "none",
								background: "transparent",
								cursor: "pointer",
							}}
						>
							<ArrowDown size={14} /> Descending
						</button>
						<div
							style={{
								borderTop: "1px solid #eee",
								marginTop: "5px",
								paddingTop: "5px",
							}}
						>
							<input
								type="text"
								value={columnSearch[col.key] || ""}
								onChange={(e) =>
									setColumnSearch({
										...columnSearch,
										[col.key]: e.target.value,
									})
								}
								placeholder={`Search ${col.label}...`}
								style={{
									width: "100%",
									padding: "5px",
									border: "1px solid #ccc",
									borderRadius: "4px",
								}}
								autoFocus
							/>
						</div>
					</div>
				)}
			</th>
		);
	};

	return (
		<div className="ticket-management-container">
			<div className="ticket-stats">
				<div className="ticket-stat-item ticket-stat-card--with-badge">
					<div className="ticket-stat-badge">
						<div className="ticket-stat-badge__inner">
							{tickets.length}
						</div>
					</div>
					<div className="ticket-stat-content">
						<div className="ticket-stat-value">Total Tickets</div>
					</div>
				</div>
			</div>

			<div className="ticket-actions">
				<div className="ticket-dropdown-container">
					<CircleUserRound
						size={20}
						className="user-round-icon"
						strokeWidth={1}
					/>
					<ChevronDown size={16} className="dropdown-arrow-icon" />
					<select
						className="ticket-dropdown-button"
						onChange={(e) => handleViewChange(e.target.value)}
						value={quickFilter}
					>
						{/* ✅ FIX: Added Counters to Options */}
						<optgroup label="System Views">
							<option value="all_tickets">
								All Tickets ({ticketCounts.all})
							</option>
							<option value="my_tickets">
								My Tickets ({ticketCounts.my})
							</option>
							<option value="closed_tickets">
								Closed Tickets ({ticketCounts.closed})
							</option>
							<option value="escalated_tickets">
								Escalated Tickets ({ticketCounts.escalated})
							</option>
							<option value="todays_open_tickets">
								Todays/Open Tickets ({ticketCounts.todayOpen})
							</option>
							<option value="completed_tickets">
								Completed Tickets ({ticketCounts.completed})
							</option>
							<option value="last_7_days">
								Last 7 days ({ticketCounts.recent})
							</option>
						</optgroup>
						{savedViews.length > 0 && (
							<optgroup label="My Custom Queries">
								{savedViews.map((view) => (
									<option key={view.id} value={view.id}>
										{view.name}
									</option>
								))}
							</optgroup>
						)}
					</select>
				</div>

				<div className="ticket-search-container">
					<input
						type="text"
						placeholder="Search Ticket..."
						className="ticket-search-input"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Search
						className="search-icon-small"
						size={20}
						color="#0f1035"
						strokeWidth={1}
					/>
				</div>

				<div className="ticket-action-icons">
					<button
						className="ticket-create-btn"
						title="Create New Ticket"
						onClick={() => navigate("/service/tickets/create")}
					>
						<Plus size={18} strokeWidth={2} /> New
					</button>

					<button
						className="ticket-icon-button-modern"
						title="Refresh List"
						onClick={() => {
							setRefreshSpin(true);
							fetchTickets();
							setTimeout(() => setRefreshSpin(false), 500);
						}}
					>
						<RefreshCcw
							className={refreshSpin ? "rotate-once" : ""}
							size={30}
							color="#0f1035"
							strokeWidth={1}
						/>
					</button>

					<button
						className="ticket-icon-button-modern"
						title="Sort Columns"
						onClick={() => setShowSortModal(true)}
					>
						<ArrowUpDown
							size={30}
							color="#0f1035"
							strokeWidth={1}
						/>
					</button>

					<button
						className={`ticket-icon-button-modern ${showAdvancedFilter ? "active-filter" : ""}`}
						title="Advanced Filters"
						onClick={handleToggleAdvancedFilter}
						style={{
							backgroundColor: showAdvancedFilter
								? "#dcf2f1"
								: "transparent",
						}}
					>
						<Filter size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<button
						className="ticket-icon-button-modern"
						title="Manage Columns"
						onClick={openColumnControl}
					>
						<Settings size={30} color="#0f1035" strokeWidth={1} />
					</button>

					{/* ✅ FIX: Reset Button correctly placed BEFORE Action Dropdown */}
					<button
						type="button"
						className="ticket-icon-button-modern"
						title="Reset All Filters"
						onClick={handleGlobalReset}
					>
						<RotateCcw
							className={resetSpin ? "rotate-once" : ""}
							size={30}
							color="#0f1035"
							strokeWidth={1}
						/>
					</button>

					<div
						className="ticket-action-button-container"
						ref={actionRef}
					>
						<button
							className="ticket-action-button"
							title="Bulk Actions"
							onClick={() =>
								setShowActionsModal(!showActionsModal)
							}
						>
							Actions{" "}
							<ChevronDown
								size={20}
								color="#dcf2f1"
								strokeWidth={2}
							/>
						</button>
						{showActionsModal && (
							<div className="ticket-action-modal-container">
								<ul className="ticket-action-modal-list">
									<li
										onClick={() =>
											handleActionClick("assign_agent")
										}
									>
										Assign to Agent
									</li>
									<li
										onClick={() =>
											handleActionClick("assign_team")
										}
									>
										Assign to Team
									</li>
									<li
										onClick={() =>
											handleActionClick("assign_me")
										}
									>
										Assign to Me
									</li>
									<li
										onClick={() =>
											handleActionClick("mass_email")
										}
									>
										Mass E-Mail
									</li>
									<li
										onClick={() =>
											handleActionClick("export")
										}
									>
										Export Case
									</li>
									<li
										onClick={() =>
											handleActionClick("delete")
										}
									>
										Mass Delete
									</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Advanced Filter Panel */}
			{showAdvancedFilter && (
				<div
					className="ticket-filters-container"
					style={{ border: "1px solid #365486", background: "#fff" }}
				>
					<div
						className="ticket-filters-header"
						style={{
							borderBottom: "1px solid #eee",
							paddingBottom: "10px",
						}}
					>
						<h3>
							<Filter size={18} style={{ marginRight: "8px" }} />{" "}
							Filter
						</h3>
						<button
							className="ticket-close-filters"
							onClick={() => setShowAdvancedFilter(false)}
						>
							<X size={24} strokeWidth={1.5} />
						</button>
					</div>
					<div
						className="advanced-filter-grid"
						style={{
							display: "grid",
							gridTemplateColumns:
								"repeat(auto-fill, minmax(250px, 1fr))",
							gap: "15px",
							padding: "15px",
						}}
					>
						{Object.keys(tempFilters).map((key) => {
							const label =
								allColumns.find((c) => c.key === key)?.label ||
								formatText(key);
							const rule = tempFilters[key];
							return (
								<div
									key={key}
									className="advanced-filter-item"
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "5px",
									}}
								>
									<label
										style={{
											fontSize: "13px",
											fontWeight: "bold",
											color: "#555",
										}}
									>
										{label}
									</label>
									<div
										className="advanced-input-group"
										style={{
											display: "flex",
											alignItems: "center",
											gap: "5px",
										}}
									>
										<input
											type={
												key === "created_at"
													? "date"
													: "text"
											}
											value={rule.value}
											placeholder={`Filter ${label}...`}
											onChange={(e) =>
												updateAdvancedFilter(
													key,
													"value",
													e.target.value,
												)
											}
											style={{
												flex: 1,
												padding: "8px",
												border: "1px solid #ccc",
												borderRadius: "4px",
											}}
										/>
										<button
											className={`operator-toggle ${rule.operator}`}
											onClick={() => toggleOperator(key)}
											title="Toggle Include/Exclude"
											style={{
												background:
													rule.operator === "include"
														? "#dcf2f1"
														: "transparent",
												border: "1px solid #ccc",
												borderRadius: "4px",
												padding: "5px",
												cursor: "pointer",
												color:
													rule.operator === "include"
														? "green"
														: "red",
											}}
										>
											{rule.operator === "include" ? (
												<CheckCircle2 size={18} />
											) : (
												<Ban size={18} />
											)}
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div
						className="advanced-filter-footer"
						style={{
							padding: "10px 15px",
							borderTop: "1px solid #eee",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div
							className="footer-left"
							style={{ display: "flex", gap: "10px" }}
						>
							<button
								className="ticket-reset-filters"
								onClick={handleRestoreAdvancedFilter}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									background: "none",
									border: "none",
									color: "#365486",
									cursor: "pointer",
								}}
							>
								<RotateCcw
									className={resetSpin ? "rotate-once" : ""}
									size={16}
								/>{" "}
								Restore
							</button>
							<button
								className="ticket-apply-btn"
								onClick={handleApplyAdvancedFilter}
								style={{ padding: "8px 20px" }}
							>
								Apply
							</button>
						</div>
						<div
							className="footer-right"
							style={{ display: "flex", gap: "15px" }}
						>
							<button
								className="ticket-no-button"
								onClick={handleSaveQuery}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									border: "none",
									background: "none",
									cursor: "pointer",
									color: "#365486",
								}}
							>
								<Copy size={16} /> Save Query As
							</button>
							<button
								className="ticket-no-button"
								onClick={() => setShowOrganizeModal(true)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									border: "none",
									background: "none",
									cursor: "pointer",
									color: "#365486",
								}}
							>
								<Settings size={16} /> Organize Queries
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modals */}
			{showAssignAgentModal && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{ width: "400px" }}
					>
						<div className="dialog-header">
							<h3>Assign to Agent</h3>
						</div>
						<div style={{ padding: "15px 0" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
								}}
							>
								Select Agent:
							</label>
							<select
								value={selectedAgent}
								onChange={(e) =>
									setSelectedAgent(e.target.value)
								}
								style={{
									width: "100%",
									padding: "10px",
									borderRadius: "4px",
									border: "1px solid #ccc",
								}}
							>
								<option value="">-- Select --</option>
								{users.map((u) => {
									const name =
										u.name ||
										`${u.firstName || ""} ${u.lastName || ""}`.trim() ||
										u.username;
									return (
										<option key={u.id} value={name}>
											{name}
										</option>
									);
								})}
							</select>
						</div>
						<div className="ticket-dialog-buttons">
							<button
								className="ticket-yes-button"
								onClick={handleConfirmAssignAgent}
							>
								Assign
							</button>
							<button
								className="ticket-no-button"
								onClick={() => setShowAssignAgentModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showAssignTeamModal && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{ width: "400px" }}
					>
						<div className="dialog-header">
							<h3>Assign to Team</h3>
						</div>
						<div style={{ padding: "15px 0" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
								}}
							>
								Select Team / Queue:
							</label>
							<select
								value={selectedTeam}
								onChange={(e) =>
									setSelectedTeam(e.target.value)
								}
								style={{
									width: "100%",
									padding: "10px",
									borderRadius: "4px",
									border: "1px solid #ccc",
								}}
							>
								<option value="">-- Select --</option>
								{SUPPORT_TEAMS.map((team) => (
									<option key={team} value={team}>
										{team}
									</option>
								))}
							</select>
						</div>
						<div className="ticket-dialog-buttons">
							<button
								className="ticket-yes-button"
								onClick={handleConfirmAssignTeam}
							>
								Assign
							</button>
							<button
								className="ticket-no-button"
								onClick={() => setShowAssignTeamModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showMassEmailModal && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{ width: "600px", maxWidth: "95vw" }}
					>
						<div className="dialog-header">
							<h3>Mass E-Mail</h3>
							<p style={{ fontSize: "12px", color: "#666" }}>
								Sending to {selectedRows.length} selected
								contacts.
							</p>
						</div>
						<div
							style={{
								padding: "15px 0",
								display: "flex",
								flexDirection: "column",
								gap: "15px",
							}}
						>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "5px",
										fontWeight: "500",
									}}
								>
									Subject
								</label>
								<input
									type="text"
									value={massEmailData.subject}
									onChange={(e) =>
										setMassEmailData({
											...massEmailData,
											subject: e.target.value,
										})
									}
									style={{
										width: "100%",
										padding: "10px",
										border: "1px solid #ccc",
										borderRadius: "4px",
									}}
									placeholder="Email Subject..."
								/>
							</div>
							<div>
								<label
									style={{
										display: "block",
										marginBottom: "5px",
										fontWeight: "500",
									}}
								>
									Message Body
								</label>
								<textarea
									rows={6}
									value={massEmailData.body}
									onChange={(e) =>
										setMassEmailData({
											...massEmailData,
											body: e.target.value,
										})
									}
									style={{
										width: "100%",
										padding: "10px",
										border: "1px solid #ccc",
										borderRadius: "4px",
										resize: "vertical",
									}}
									placeholder="Type your message..."
								/>
							</div>
						</div>
						<div className="ticket-dialog-buttons">
							<button
								className="ticket-yes-button"
								onClick={handleConfirmMassEmail}
							>
								<Mail
									size={16}
									style={{ marginRight: "5px" }}
								/>{" "}
								Send Emails
							</button>
							<button
								className="ticket-no-button"
								onClick={() => setShowMassEmailModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showOrganizeModal && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{ width: "400px" }}
					>
						<div
							className="dialog-header"
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "15px",
							}}
						>
							<h3>Manage Custom Queries</h3>
							<button
								onClick={() => setShowOrganizeModal(false)}
								style={{
									border: "none",
									background: "none",
									cursor: "pointer",
								}}
							>
								<X size={20} />
							</button>
						</div>
						<div style={{ maxHeight: "300px", overflowY: "auto" }}>
							{savedViews.length === 0 ? (
								<p
									style={{
										color: "#666",
										fontStyle: "italic",
										textAlign: "center",
									}}
								>
									No custom views saved.
								</p>
							) : (
								savedViews.map((view) => (
									<div
										key={view.id}
										style={{
											display: "flex",
											justifyContent: "space-between",
											padding: "10px",
											borderBottom: "1px solid #eee",
										}}
									>
										<span>{view.name}</span>
										<button
											onClick={() =>
												handleDeleteView(view.id)
											}
											style={{
												border: "none",
												background: "none",
												cursor: "pointer",
												color: "red",
											}}
											title="Delete View"
										>
											<Trash2 size={16} />
										</button>
									</div>
								))
							)}
						</div>
						<div style={{ marginTop: "15px", textAlign: "right" }}>
							<button
								className="ticket-no-button"
								onClick={() => setShowOrganizeModal(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* List View Control */}
			{showColumnControl && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{
							width: "600px",
							maxWidth: "95vw",
							padding: "20px",
						}}
					>
						<div
							className="dialog-header"
							style={{
								marginBottom: "15px",
								borderBottom: "1px solid #eee",
								paddingBottom: "10px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<h3 style={{ margin: 0, color: "#0f1035" }}>
								Select Fields to Display
							</h3>
							<button
								onClick={() => setShowColumnControl(false)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								<X size={20} color="#666" />
							</button>
						</div>
						<div
							style={{
								display: "flex",
								gap: "15px",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<div
								style={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
								}}
							>
								<label
									style={{
										marginBottom: "5px",
										fontWeight: "bold",
										fontSize: "14px",
										color: "#365486",
									}}
								>
									Available
								</label>
								<div
									style={{
										border: "1px solid #ccc",
										borderRadius: "4px",
										height: "250px",
										overflowY: "auto",
										background: "#f9f9f9",
										padding: "5px",
									}}
								>
									{tempAvailableKeys.map((key) => (
										<div
											key={key}
											onClick={() =>
												setSelectedAvailable((prev) =>
													prev.includes(key)
														? prev.filter(
																(k) =>
																	k !== key,
															)
														: [...prev, key],
												)
											}
											style={{
												padding: "8px",
												cursor: "pointer",
												borderRadius: "3px",
												fontSize: "14px",
												backgroundColor:
													selectedAvailable.includes(
														key,
													)
														? "#dcf2f1"
														: "transparent",
												color: selectedAvailable.includes(
													key,
												)
													? "#0f1035"
													: "#333",
											}}
										>
											{allColumns.find(
												(c) => c.key === key,
											)?.label || key}
										</div>
									))}
								</div>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								<button
									onClick={handleMoveToVisible}
									disabled={selectedAvailable.length === 0}
									style={{
										padding: "8px",
										borderRadius: "4px",
										border: "1px solid #ccc",
										cursor: "pointer",
										background:
											selectedAvailable.length > 0
												? "#365486"
												: "#eee",
										color:
											selectedAvailable.length > 0
												? "#fff"
												: "#999",
									}}
								>
									<ChevronRight size={20} />
								</button>
								<button
									onClick={handleMoveToAvailable}
									disabled={selectedVisible.length === 0}
									style={{
										padding: "8px",
										borderRadius: "4px",
										border: "1px solid #ccc",
										cursor: "pointer",
										background:
											selectedVisible.length > 0
												? "#365486"
												: "#eee",
										color:
											selectedVisible.length > 0
												? "#fff"
												: "#999",
									}}
								>
									<ChevronLeft size={20} />
								</button>
							</div>
							<div
								style={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
								}}
							>
								<label
									style={{
										marginBottom: "5px",
										fontWeight: "bold",
										fontSize: "14px",
										color: "#365486",
									}}
								>
									Visible
								</label>
								<div
									style={{
										border: "1px solid #ccc",
										borderRadius: "4px",
										height: "250px",
										overflowY: "auto",
										background: "#fff",
										padding: "5px",
									}}
								>
									{tempVisibleKeys.map((key) => (
										<div
											key={key}
											onClick={() =>
												setSelectedVisible((prev) =>
													prev.includes(key)
														? prev.filter(
																(k) =>
																	k !== key,
															)
														: [...prev, key],
												)
											}
											style={{
												padding: "8px",
												cursor: "pointer",
												borderRadius: "3px",
												fontSize: "14px",
												backgroundColor:
													selectedVisible.includes(
														key,
													)
														? "#dcf2f1"
														: "transparent",
												color: selectedVisible.includes(
													key,
												)
													? "#0f1035"
													: "#333",
											}}
										>
											{allColumns.find(
												(c) => c.key === key,
											)?.label || key}
										</div>
									))}
								</div>
							</div>
						</div>
						<div
							style={{
								marginTop: "20px",
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
							}}
						>
							<button
								className="ticket-no-button"
								onClick={() => setShowColumnControl(false)}
							>
								Cancel
							</button>
							<button
								className="ticket-yes-button"
								onClick={handleSaveColumns}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Sort Modal */}
			{showSortModal && (
				<div className="ticket-delete-confirm-overlay">
					<div
						className="ticket-delete-confirm-dialog"
						style={{ width: "300px", textAlign: "left" }}
					>
						<div
							className="dialog-header"
							style={{
								borderBottom: "1px solid #eee",
								paddingBottom: "10px",
								marginBottom: "15px",
							}}
						>
							<h3
								style={{
									margin: 0,
									fontSize: "18px",
									color: "#0f1035",
								}}
							>
								Sort
							</h3>
						</div>
						<div className="sort-modal-body">
							<div style={{ marginBottom: "20px" }}>
								<h4
									style={{
										fontSize: "14px",
										color: "#365486",
										marginBottom: "10px",
									}}
								>
									Sort Order
								</h4>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "8px",
									}}
								>
									<label
										style={{
											display: "flex",
											alignItems: "center",
											cursor: "pointer",
											fontSize: "14px",
										}}
									>
										<input
											type="radio"
											name="sortOrder"
											checked={
												tempSortConfig.direction ===
												"asc"
											}
											onChange={() =>
												setTempSortConfig((prev) => ({
													...prev,
													direction: "asc",
												}))
											}
											style={{ marginRight: "10px" }}
										/>{" "}
										Ascending
									</label>
									<label
										style={{
											display: "flex",
											alignItems: "center",
											cursor: "pointer",
											fontSize: "14px",
										}}
									>
										<input
											type="radio"
											name="sortOrder"
											checked={
												tempSortConfig.direction ===
												"desc"
											}
											onChange={() =>
												setTempSortConfig((prev) => ({
													...prev,
													direction: "desc",
												}))
											}
											style={{ marginRight: "10px" }}
										/>{" "}
										Descending
									</label>
								</div>
							</div>
							<div>
								<h4
									style={{
										fontSize: "14px",
										color: "#365486",
										marginBottom: "10px",
									}}
								>
									Sort By
								</h4>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "8px",
										maxHeight: "200px",
										overflowY: "auto",
									}}
								>
									{allColumns.map((col) => (
										<label
											key={col.key}
											style={{
												display: "flex",
												alignItems: "center",
												cursor: "pointer",
												fontSize: "14px",
											}}
										>
											<input
												type="radio"
												name="sortBy"
												checked={
													tempSortConfig.key ===
													(col.sortKey || col.key)
												}
												onChange={() =>
													setTempSortConfig(
														(prev) => ({
															...prev,
															key:
																col.sortKey ||
																col.key,
														}),
													)
												}
												style={{ marginRight: "10px" }}
											/>{" "}
											{col.label}
										</label>
									))}
								</div>
							</div>
						</div>
						<div
							className="ticket-dialog-buttons"
							style={{
								marginTop: "20px",
								justifyContent: "flex-end",
								gap: "10px",
								display: "flex",
							}}
						>
							<button
								className="ticket-no-button"
								onClick={() => setShowSortModal(false)}
							>
								Cancel
							</button>
							<button
								className="ticket-yes-button"
								onClick={() => {
									setSortConfig(tempSortConfig);
									setShowSortModal(false);
								}}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Scrollable Table Container */}
			<div
				className="ticket-table-container"
				style={{ overflowX: "auto", border: "1px solid #eee" }}
			>
				<table className="ticket-table" style={{ minWidth: "1200px" }}>
					<thead>
						<tr>
							<th className="checkbox-column">
								<input
									type="checkbox"
									className="ticket-custom-checkbox"
									checked={
										processedTickets.length > 0 &&
										selectedRows.length ===
											processedTickets.length
									}
									onChange={handleSelectAll}
								/>
							</th>
							{allColumns.map((col) => renderHeaderCell(col))}
							{visibleColumns.actions && <th>Actions</th>}
						</tr>
					</thead>
					<tbody>
						{currentItems.length === 0 ? (
							<tr>
								<td
									colSpan="100%"
									style={{
										textAlign: "center",
										padding: "20px",
										fontStyle: "italic",
										color: "#365486",
									}}
								>
									No tickets found.
								</td>
							</tr>
						) : (
							currentItems.map((ticket) => (
								<tr
									key={ticket.ticket_id}
									className={
										selectedRows.includes(ticket.ticket_id)
											? "selected-row"
											: ""
									}
								>
									<td className="checkbox-column">
										<input
											type="checkbox"
											className="ticket-custom-checkbox"
											checked={selectedRows.includes(
												ticket.ticket_id,
											)}
											onChange={() =>
												toggleRowSelection(
													ticket.ticket_id,
												)
											}
										/>
									</td>
									{allColumns.map(
										(col) =>
											visibleColumns[col.key] && (
												<td key={col.key}>
													{getCellValue(
														ticket,
														col.key,
													)}
												</td>
											),
									)}
									{visibleColumns.actions && (
										<td>
											<div className="ticket-table-action-buttons">
												<button
													className="ticket-view-btn"
													onClick={(e) => {
														e.stopPropagation();
														handleViewClick(
															ticket.ticket_id,
														);
													}}
												>
													<Eye
														size={18}
														strokeWidth={1}
													/>
												</button>
												<button
													className="ticket-edit-btn"
													onClick={(e) =>
														handleEditClick(
															e,
															ticket.ticket_id,
														)
													}
												>
													<SquarePen
														size={18}
														strokeWidth={1}
													/>
												</button>
												<button
													className="ticket-delete-btn"
													onClick={() => {
														setTicketToDelete(
															ticket.ticket_id,
														);
														setShowDeleteConfirm(
															true,
														);
													}}
												>
													<Trash2
														size={18}
														strokeWidth={1}
													/>
												</button>
											</div>
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination & Footer */}
			<div className="ticket-pagination">
				<div className="ticket-pagination-left">
					<span
						style={{
							fontSize: "14px",
							fontWeight: "500",
							color: "#365486",
						}}
					>
						{selectedRows.length} Selected
					</span>
				</div>
				<div className="ticket-pagination-right">
					<span
						style={{
							fontSize: "14px",
							fontWeight: "500",
							color: "#365486",
						}}
					>
						{" "}
						Item Per Page{" "}
					</span>
					{/* 1. Items Per Page (Moved to First Position) */}
					<select
						className="ticket-items-per-page"
						value={itemsPerPage}
						onChange={(e) => {
							setItemsPerPage(Number(e.target.value));
							setCurrentPage(1);
						}}
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>

					{/* 2. Previous Buttons */}
					<button
						className="ticket-page-btn"
						onClick={() => setCurrentPage(1)}
						disabled={currentPage === 1}
					>
						<ChevronsLeft
							size={24}
							strokeWidth={1.5}
							color="#dcf2f1"
						/>
					</button>
					<button
						className="ticket-page-btn"
						onClick={() =>
							setCurrentPage((p) => Math.max(1, p - 1))
						}
						disabled={currentPage === 1}
					>
						<CircleArrowLeft
							size={28}
							strokeWidth={1.5}
							color="#dcf2f1"
						/>
					</button>

					{/* 3. Editable Page Number Input */}
					<div className="ticket-page-input-container">
						<input
							type="number"
							className="ticket-page-input"
							value={pageInput}
							min={1}
							max={totalPages || 1}
							onChange={(e) => setPageInput(e.target.value)}
							onBlur={handlePageInputCommit}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handlePageInputCommit();
									e.target.blur(); // Remove focus after pressing Enter
								}
							}}
						/>
						<span className="ticket-page-numbers">
							of {totalPages || 1}
						</span>
					</div>

					{/* 4. Next Buttons */}
					<button
						className="ticket-page-btn"
						onClick={() =>
							setCurrentPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={currentPage === totalPages}
					>
						<CircleArrowRight
							size={28}
							strokeWidth={1.5}
							color="#dcf2f1"
						/>
					</button>
					<button
						className="ticket-page-btn"
						onClick={() => setCurrentPage(totalPages)}
						disabled={currentPage === totalPages}
					>
						<ChevronsRight
							size={24}
							strokeWidth={1.5}
							color="#dcf2f1"
						/>
					</button>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="ticket-delete-confirm-overlay">
					<div className="ticket-delete-confirm-dialog">
						<div className="dialog-header">
							<h3>Confirm Delete</h3>
							<p>
								Are you sure you want to delete{" "}
								{ticketToDelete
									? "this ticket"
									: `these ${selectedRows.length} tickets`}
								?
							</p>
						</div>
						<div className="ticket-dialog-buttons">
							<button
								className="ticket-yes-button"
								onClick={handleDeleteConfirm}
							>
								Yes
							</button>
							<button
								className="ticket-no-button"
								onClick={() => {
									setShowDeleteConfirm(false);
									setTicketToDelete(null);
								}}
							>
								No
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Tickets;
