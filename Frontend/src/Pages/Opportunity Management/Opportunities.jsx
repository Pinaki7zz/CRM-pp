import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
	Plus,
	RefreshCcw,
	RotateCcw,
	Filter,
	Search,
	ChevronDown,
	CircleUserRound,
	SquarePen,
	Trash2,
	X,
	ChevronRight,
	ChevronLeft,
	ArrowUp,
	ArrowDown,
	Settings,
	EllipsisVertical,
	ChevronsRight,
	ChevronsLeft,
	ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Opportunities.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "use-debounce";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const Opportunities = () => {
	const [selectedRows, setSelectedRows] = useState([]);
	const [areAllSelected, setAreAllSelected] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [opportunities, setOpportunities] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [users, setUsers] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
	const [deleteOpportunityId, setDeleteOpportunityId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [resetSpin, setResetSpin] = useState(false);
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [filters, setFilters] = useState({
		accountId: "",
		primaryContactId: "",
		stage: "",
		status: "",
		amount: "",
		probability: "",
		opportuntiyOwner: "",
		createdAt: "",
	});
	const [viewType, setViewType] = useState("ALL");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [columnSearch, setColumnSearch] = useState({
		name: "",
		accountName: "",
		contactName: "",
		stage: "",
		status: "",
		amount: "",
		probability: "",
		opportunityOwner: "",
		createdAt: "",
	});
	const [visibleColumns, setVisibleColumns] = useState({
		name: true,
		accountName: true,
		contactName: true,
		stage: true,
		status: true,
		amount: true,
		probability: true,
		opportunityOwner: true,
		createdAt: true,
	});
	const [sortConfig, setSortConfig] = useState({
		key: "createdAt",
		direction: "desc",
	});
	const [activePopupColumn, setActivePopupColumn] = useState(null);
	const [showColumnControl, setShowColumnControl] = useState(false);
	const [selectedVisible, setSelectedVisible] = useState([]);
	const [selectedAvailable, setSelectedAvailable] = useState([]);
	const [popupConfig, setPopupConfig] = useState({
		column: null,
		x: 0,
		y: 0,
	});
	const [showSortModal, setShowSortModal] = useState(false);
	const [tempSortConfig, setTempSortConfig] = useState(sortConfig);

	const navigate = useNavigate();
	const actionRef = useRef(null);
	const { user } = useAuth(); // if provider exposes loading
	const [debouncedSearch] = useDebounce(searchTerm, 400);
	const [debouncedAmount] = useDebounce(filters.amount, 400);
	const [debouncedProbability] = useDebounce(filters.probability, 400);
	const [debouncedColumnSearch] = useDebounce(columnSearch, 400);
	const allColumns = useMemo(
		() => [
			{ key: "name", label: "Opp. Name" },
			{ key: "accountName", label: "Account" },
			{ key: "contactName", label: "Contact" },
			{ key: "stage", label: "Stage" },
			{ key: "status", label: "Status" },
			{ key: "amount", label: "Amount" },
			{ key: "probability", label: "Probability" },
			{ key: "opportunityOwner", label: "Owner" },
			{ key: "createdAt", label: "Created At" },
		],
		[],
	);
	const popupRef = useRef(null);
	const excludedIds = useRef(new Set());

	const sortByColumnOrder = useCallback(
		(keys) =>
			keys.sort(
				(a, b) =>
					allColumns.findIndex((c) => c.key === a) -
					allColumns.findIndex((c) => c.key === b),
			),
		[allColumns],
	);
	const [tempVisibleKeys, setTempVisibleKeys] = useState(() =>
		sortByColumnOrder(
			Object.keys(visibleColumns).filter((k) => visibleColumns[k]),
		),
	);
	const [tempAvailableKeys, setTempAvailableKeys] = useState(() =>
		sortByColumnOrder(
			Object.keys(visibleColumns).filter((k) => !visibleColumns[k]),
		),
	);

	const stageLabels = {
		QUALIFICATION: "Qualification",
		NEEDS_ANALYSIS: "Needs Analysis",
		VALUE_PROPORTION: "Value Proportion",
		PRICE_QUOTE: "Price Quote",
		NEGOTIATION: "Negotiation",
		CLOSED_WON: "Closed Won",
		CLOSED_LOST: "Closed Lost",
	};

	const statusLabels = {
		OPEN: "Open",
		IN_PROGRESS: "In Progress",
		COMPLETED: "Completed",
		CANCELLED: "Cancelled",
	};

	const openPopup = (colKey, event) => {
		const rect = event.currentTarget.getBoundingClientRect();

		setPopupConfig({
			column: colKey,
			x: rect.right + 5, // place popup to the right
			y: rect.bottom + 5, // place popup below
		});
	};

	const closePopup = () => setPopupConfig({ column: null, x: 0, y: 0 });

	useEffect(() => {
		const handler = (e) => {
			if (!popupRef.current?.contains(e.target)) {
				closePopup();
			}
		};

		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const fetchOpportunities = useCallback(async () => {
		try {
			setLoading(true);
			const query = new URLSearchParams({
				page,
				limit,
				search: debouncedSearch.trim(),
				sortKey: sortConfig.key,
				sortDirection: sortConfig.direction,
				accountId: filters.accountId,
				primaryContactId: filters.primaryContactId,
				stage: filters.stage,
				status: filters.status,
				amount: debouncedAmount.trim(),
				probability: debouncedProbability.trim(),
				opportunityOwner: filters.opportunityOwner,
				createdAt: filters.createdAt,
				viewType,
				opportunityOwnerId: user?.id,

				// NEW — ADD COLUMN SEARCH
				col_name: debouncedColumnSearch.name,
				col_accountName: debouncedColumnSearch.accountName,
				col_contactName: debouncedColumnSearch.contactName,
				col_stage: debouncedColumnSearch.stage,
				col_status: debouncedColumnSearch.status,
				col_amount: debouncedColumnSearch.amount,
				col_probability: debouncedColumnSearch.probability,
				col_opportunityOwner: debouncedColumnSearch.opportunityOwner,
				col_createdAt: debouncedColumnSearch.createdAt,
			}).toString();
			const res = await fetch(
				`${BASE_URL_SM}/opportunity/paginate?${query}`,
			);
			if (!res.ok) {
				toast.error("Failed to fetch opportunities");
				return;
			}
			const data = await res.json();
			console.log(data);
			setOpportunities(data.items || []);
			setTotalPages(data.totalPages || 1);
			setTotal(data.total);
		} catch (err) {
			console.error("Error fetching opportunities:", err);
			toast.error("Error fetching opportunities");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		limit,
		viewType,
		user,
		filters.accountId,
		filters.primaryContactId,
		filters.stage,
		filters.status,
		filters.opportunityOwner,
		filters.createdAt,
		debouncedAmount,
		debouncedProbability,
		debouncedSearch,

		// 🔥 FIX COLUMN SEARCH
		debouncedColumnSearch.name,
		debouncedColumnSearch.accountName,
		debouncedColumnSearch.contactName,
		debouncedColumnSearch.stage,
		debouncedColumnSearch.status,
		debouncedColumnSearch.amount,
		debouncedColumnSearch.probability,
		debouncedColumnSearch.opportunityOwner,
		debouncedColumnSearch.createdAt,
	]);

	const fetchAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				toast.error("Failed to fetch accounts");
				return;
			}
			const data = await res.json();
			console.log(data);
			setAccounts(data);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			toast.error("Error fetching accounts");
		}
	};

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`);
			if (!res.ok) {
				toast.error("Failed to fetch users");
				return;
			}
			const data = await res.json();
			console.log(data);
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Error fetching users");
		}
	};

	useEffect(() => {
		fetchAccounts();
		fetchUsers();
	}, []);

	useEffect(() => {
		fetchOpportunities();
	}, [fetchOpportunities]);

	const toggleRowSelection = (id) => {
		if (!areAllSelected) {
			// normal mode
			setSelectedRows((prev) =>
				prev.includes(id)
					? prev.filter((x) => x !== id)
					: [...prev, id],
			);
		} else {
			// ALL selected mode → treat unchecking as exclusion
			if (excludedIds.current.has(id)) {
				excludedIds.current.delete(id);
			} else {
				excludedIds.current.add(id);
			}
		}
	};

	const handleDeleteClick = (id) => {
		setDeleteOpportunityId(id);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		let idsToDelete = [];

		// Case 1: Single delete from row button
		if (deleteOpportunityId) {
			idsToDelete = [deleteOpportunityId];
		}

		// Case 2: Bulk delete
		if (selectedRows.length > 0) {
			idsToDelete = selectedRows;
		}

		if (idsToDelete.length === 0) {
			setShowDeleteConfirm(false);
			return;
		}

		try {
			// Delete one by one OR via backend batch API
			for (const id of idsToDelete) {
				const res = await fetch(`${BASE_URL_SM}/opportunity/${id}`, {
					method: "DELETE",
				});

				if (!res.ok) {
					throw new Error(`Failed to delete opportunity ${id}`);
				}
			}

			toast.success("Selected opportunities deleted successfully");
			await fetchOpportunities(); // refresh UI
			setSelectedRows([]); // clear selection
		} catch (err) {
			console.error(err);
			toast.error("Failed to delete selected opportunities");
		}

		setDeleteOpportunityId(null);
		setShowDeleteConfirm(false);
	};

	const handleMassDelete = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select at least one opportunity to delete");
			return;
		}

		setShowActionsModal(false); // close dropdown
		setShowDeleteConfirm(true); // open confirmation modal
	};

	const toggleFilters = () => setShowFilters((prev) => !prev);

	const handleReset = () => {
		setFilters({
			accountId: "",
			primaryContactId: "",
			stage: "",
			status: "",
			amount: "",
			probability: "",
			createdAt: "",
		});
		setResetSpin(true);
		setTimeout(() => setResetSpin(false), 200);
	};

	const handleFilterChange = (e) => {
		const { id, value } = e.target;

		// === Account changed by user ===
		if (id === "accountId") {
			// user cleared account (empty string)
			if (!value) {
				setFilters((prev) => ({
					...prev,
					accountId: "",
					primaryContactId: "", // explicitly clear contact
				}));
				setAvailableContacts([]); // remove contact options
				return;
			}

			// user selected an account — set related primary contact if available
			const selectedAccount = accounts.find((a) => a.accountId === value);

			const primaryContact = selectedAccount?.contacts?.find(
				(c) => c.isPrimary,
			);

			setFilters((prev) => ({
				...prev,
				accountId: value,
				primaryContactId: primaryContact?.contactId || "", // explicit default
			}));
			setAvailableContacts(selectedAccount?.contacts || []);
			return;
		}

		// === Contact changed by user ===
		if (id === "primaryContactId") {
			setFilters((prev) => ({
				...prev,
				primaryContactId: value || "", // normalize empty -> ""
			}));
			return;
		}

		// fallback for other fields
		setFilters((prev) => ({ ...prev, [id]: value }));
	};

	useEffect(() => {
		function handleClickOutside(event) {
			// If clicked outside the modal + button
			if (
				actionRef.current &&
				!actionRef.current.contains(event.target)
			) {
				setShowActionsModal(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		setPage(1);
	}, [
		viewType,
		filters.accountId,
		filters.primaryContactId,
		filters.stage,
		filters.status,
		filters.createdAt,
		debouncedAmount,
		debouncedProbability,
		debouncedSearch,
	]);

	const handleExport = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity/export`, {
				method: "GET",
				credentials: "include",
			});

			if (!res.ok) {
				toast.error("Failed to export opportunities");
				return;
			}

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "opportunities.csv";
			a.click();

			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Error exporting opportunities:", err);
			toast.error("Error exporting opportunities");
		}
	};

	const renderHeaderCell = (column) => {
		if (!visibleColumns[column.key]) return null;

		const isPopupOpen = activePopupColumn === column.key;
		const sortKey = column.sortKey || column.key;

		return (
			<th key={column.key} style={{ position: "relative" }}>
				<div className="opp-header-cell-content">
					<div
						onClick={() =>
							handleSort(
								sortKey,
								sortConfig.direction === "asc" ? "desc" : "asc",
							)
						}
						className="opp-header-title"
					>
						{column.label}
						{renderSortIcon(sortKey)}
					</div>

					<button
						className="opp-header-menu-btn"
						onClick={(e) => openPopup(column.key, e)}
					>
						<EllipsisVertical
							size={15}
							strokeWidth={2}
							color="#0f1035"
						/>
					</button>
				</div>
			</th>
		);
	};

	const renderCell = (key, opp) => {
		switch (key) {
			case "accountName":
				return (
					accounts.find((a) => a.accountId === opp.accountId)?.name ||
					"--"
				);
			case "contactName":
				const account = accounts.find(
					(a) => a.accountId === opp.accountId,
				);
				const contact = account?.contacts?.find(
					(c) => c.contactId === opp.primaryContactId,
				);
				return contact
					? `${contact.firstName} ${contact.lastName}`
					: "--";
			case "stage":
				return stageLabels[opp.stage] || opp.stage || "--";
			case "status":
				return statusLabels[opp.status] || opp.status || "--";
			case "amount":
				return opp.amount || "--";
			case "probability":
				return opp.probability || "--";
			case "opportunityOwner":
				const owner = users.find(
					(u) => u.id === opp.opportunityOwnerId,
				);
				return owner ? `${owner.firstName} ${owner.lastName}` : "--";
			case "createdAt":
				return new Date(opp.createdAt).toLocaleDateString("en-GB");
			default:
				return opp[key] ?? "--";
		}
	};

	const handleSort = (key, direction) => {
		setSortConfig({ key, direction });
	};

	const renderSortIcon = (key) => {
		if (sortConfig.key !== key) return null;

		const isAsc = sortConfig.direction === "asc";

		return (
			<ChevronDown
				size={15}
				strokeWidth={2}
				color="#0f1035"
				className={isAsc ? "opp-sort-icon asc" : "opp-sort-icon desc"}
			/>
		);
	};

	const toggleSelectAll = () => {
		if (areAllSelected) {
			// user unchecked Select All → clear everything
			setAreAllSelected(false);
			setSelectedRows([]);
			return;
		}

		// user selected the header checkbox
		setAreAllSelected(true);

		// store only IDs of CURRENT PAGE as exceptions (optional)
		setSelectedRows(opportunities.map((o) => o.id));
	};

	const handleMoveToVisible = () => {
		setTempVisibleKeys((prev) =>
			sortByColumnOrder([...prev, ...selectedAvailable]),
		);
		setTempAvailableKeys((prev) =>
			sortByColumnOrder(
				prev.filter((key) => !selectedAvailable.includes(key)),
			),
		);
		setSelectedAvailable([]);
	};

	const handleMoveToAvailable = () => {
		setTempAvailableKeys((prev) =>
			sortByColumnOrder([...prev, ...selectedVisible]),
		);
		setTempVisibleKeys((prev) =>
			sortByColumnOrder(
				prev.filter((key) => !selectedVisible.includes(key)),
			),
		);
		setSelectedVisible([]);
	};

	useEffect(() => {
		if (showColumnControl) {
			setTempVisibleKeys(
				sortByColumnOrder(
					Object.keys(visibleColumns).filter(
						(k) => visibleColumns[k],
					),
				),
			);
			setTempAvailableKeys(
				sortByColumnOrder(
					Object.keys(visibleColumns).filter(
						(k) => !visibleColumns[k],
					),
				),
			);
			setSelectedVisible([]);
			setSelectedAvailable([]);
		}
	}, [showColumnControl, visibleColumns, sortByColumnOrder]);

	const handleSaveColumns = () => {
		const updated = {};
		sortByColumnOrder(tempVisibleKeys).forEach((key) => {
			updated[key] = true;
		});
		sortByColumnOrder(tempAvailableKeys).forEach((key) => {
			updated[key] = false;
		});
		setVisibleColumns(updated);
		setShowColumnControl(false);
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (popupRef.current && !popupRef.current.contains(e.target)) {
				setActivePopupColumn(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleFullReset = () => {
		// Reset filters (main)
		setFilters({
			accountId: "",
			primaryContactId: "",
			stage: "",
			status: "",
			amount: "",
			probability: "",
			createdAt: "",
		});

		// Reset column search
		setColumnSearch({
			name: "",
			accountName: "",
			contactName: "",
			stage: "",
			status: "",
			amount: "",
			probability: "",
			opportunityOwner: "",
			createdAt: "",
		});

		// Reset global search
		setSearchTerm("");

		// Reset related contacts
		setAvailableContacts([]);

		// Reset pagination
		setPage(1);
		setLimit(10);

		// Reset view type
		setViewType("ALL");

		// Reset sorting
		setSortConfig({
			key: "createdAt",
			direction: "desc",
		});

		// Reset selected rows
		setSelectedRows([]);
		setAreAllSelected(false);
		excludedIds.current.clear();

		// Trigger refresh animation
		setResetSpin(true);
		setTimeout(() => setResetSpin(false), 200);

		// Re-fetch quotes
		fetchOpportunities();
	};

	return (
		<>
			<div className="opp-management-container">
				{/* Opportunity Stats */}
				<div className="opp-stats">
					<div className="opp-stat-item stat-card--with-badge">
						<div className="opp-stat-badge" aria-hidden="true">
							<div className="opp-stat-badge__inner">{total}</div>
						</div>

						<div className="opp-stat-content">
							<div className="opp-stat-value">
								Total Opportunities
							</div>
						</div>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="opp-actions">
					<div className="opp-dropdown-container">
						<CircleUserRound
							size={20}
							strokeWidth={1}
							className="user-round-icon"
						/>
						<select
							className="opp-dropdown-button"
							value={viewType}
							onChange={(e) => setViewType(e.target.value)}
						>
							<option value="ALL">All Opportunities</option>
							<option value="MINE">My Opportunities (All)</option>
							<option value="OPEN">Open Opportunities</option>
							<option value="COMPLETED">
								Completed Opportunities
							</option>
							<option value="CANCELLED">
								Cancelled Opportunities
							</option>
						</select>
					</div>
					<div className="opp-search-container">
						<input
							type="text"
							placeholder="Search Opportunities..."
							className="opp-search-input"
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
					<button
						className="opp-modern-button"
						onClick={() => navigate("/sales/opportunities/create")}
					>
						<Plus size={18} color="#dcf2f1" strokeWidth={2} />
						New
					</button>
					<button
						className="opp-icon-button-modern"
						title="Refresh Opportunities"
						onClick={() => {
							setRefreshSpin(true);
							fetchOpportunities();
						}}
					>
						<RefreshCcw
							className={refreshSpin ? "rotate-once" : ""}
							size={30}
							color="#0f1035"
							strokeWidth={1}
							onAnimationEnd={() => setRefreshSpin(false)}
						/>
					</button>
					<button
						className="opp-icon-button-modern"
						title="Sort Columns"
						onClick={() => {
							setTempSortConfig(sortConfig);
							setShowSortModal(true);
						}}
					>
						<ArrowUpDown
							size={30}
							color="#0f1035"
							strokeWidth={1}
						/>
					</button>
					<button
						className="opp-icon-button-modern"
						title="Filter Opportunities"
						onClick={toggleFilters}
					>
						<Filter size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="opp-icon-button-modern"
						title="Customize Columns"
						onClick={() => setShowColumnControl(true)}
					>
						<Settings size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="opp-icon-button-modern"
						title="Reset Filters"
						onClick={handleFullReset}
					>
						<RotateCcw
							size={30}
							color="#0f1035"
							strokeWidth={1}
							className={resetSpin ? "rotate-once" : ""}
							onAnimationEnd={() => setResetSpin(false)}
						/>
					</button>
					<div
						className="opp-action-button-container"
						ref={actionRef}
					>
						<button
							className="opp-action-button"
							onClick={() => setShowActionsModal((prev) => !prev)}
						>
							Actions
							<ChevronDown
								size={20}
								color="#dcf2f1"
								strokeWidth={2}
							/>
						</button>
						{/* Actions Modal */}
						{showActionsModal && (
							<div className="opp-action-modal-container">
								<ul className="opp-action-modal-list">
									<li onClick={handleMassDelete}>
										Mass Delete
									</li>
									<li onClick={handleExport}>Export</li>
									<li>Print View</li>
								</ul>
							</div>
						)}
					</div>
				</div>

				{/* Filters Section */}
				{showFilters && (
					<div className="opp-filters-container">
						<div className="opp-filters-header">
							<h3>Filter Opportunities</h3>
							<div className="opp-filters-header-buttons-right">
								<button
									className="opp-reset-filters"
									title="Reset Filters"
									onClick={handleReset}
								>
									<RotateCcw
										className={
											resetSpin ? "rotate-once" : ""
										}
										size={18}
										strokeWidth={1}
										onAnimationEnd={() =>
											setResetSpin(false)
										}
									/>
								</button>
								<button
									className="opp-close-filters"
									title="Close Filters Tab"
									onClick={toggleFilters}
								>
									<X size={22} strokeWidth={1} />
								</button>
							</div>
						</div>
						<div className="opp-filter-row">
							<div className="opp-filter-col">
								<label>Account</label>
								<select
									className="so-filter-select"
									id="accountId" // <-- important
									value={filters.accountId}
									onChange={handleFilterChange}
								>
									<option value="">Select Account</option>
									{accounts.map((acc) => (
										<option
											key={acc.accountId}
											value={acc.accountId}
										>
											{acc.name}
										</option>
									))}
								</select>
							</div>
							<div className="opp-filter-col">
								<label>Contact</label>
								<select
									className="so-filter-select"
									id="primaryContactId" // <-- important
									value={filters.primaryContactId}
									onChange={handleFilterChange}
									disabled={availableContacts.length === 0}
								>
									<option value="">Select Contact</option>
									{availableContacts.map((contact) => (
										<option
											key={contact.contactId}
											value={contact.contactId}
										>
											{contact.firstName}{" "}
											{contact.lastName}
											{contact.isPrimary
												? " (Primary)"
												: ""}
										</option>
									))}
								</select>
							</div>
							<div className="opp-filter-col">
								<label>Stage</label>
								<select
									className="opp-filter-select"
									value={filters.stage}
									onChange={(e) =>
										setFilters({
											...filters,
											stage: e.target.value,
										})
									}
								>
									<option value="">Select Stage</option>
									<option value="QUALIFICATION">
										Qualification
									</option>
									<option value="NEEDS_ANALYSIS">
										Needs Analysis
									</option>
									<option value="VALUE_PROPORTION">
										Value Proportion
									</option>
									<option value="PRICE_QUOTE">
										Price Quote
									</option>
									<option value="NEGOTIATION">
										Negotiation
									</option>
									<option value="CLOSED_WON">
										Closed Won
									</option>
									<option value="CLOSED_LOST">
										Closed Lost
									</option>
								</select>
							</div>
							<div className="opp-filter-col">
								<label>Created At</label>
								<input
									className="opp-filter-select"
									type="date"
									value={filters.createdAt}
									onChange={(e) =>
										setFilters({
											...filters,
											createdAt: e.target.value,
										})
									}
								/>
							</div>
						</div>
						{/* <div className="opp-filter-row">
						<div className="opp-filter-col">
							<label>Amount</label>
							<input
								className="opp-filter-select"
								type="number"
								value={filters.amount}
								onChange={(e) =>
									setFilters({
										...filters,
										amount: e.target.value,
									})
								}
								placeholder="Enter Amount"
								min={0}
							/>
						</div>
						<div className="opp-filter-col">
							<label>Probability</label>
							<input
								className="opp-filter-select"
								type="number"
								value={filters.probability}
								onChange={(e) =>
									setFilters({
										...filters,
										probability: e.target.value,
									})
								}
								min={0}
								max={100}
								placeholder="Enter Probability"
							/>
						</div>
						<div className="opp-filter-col">
							<label>Status</label>
							<select
								className="opp-filter-select"
								value={filters.status}
								onChange={(e) =>
									setFilters({
										...filters,
										status: e.target.value,
									})
								}
							>
								<option value="">Select Status</option>
								<option value="OPEN">Open</option>
								<option value="IN_PROGRESS">In Progress</option>
								<option value="COMPLETED">Completed</option>
								<option value="CANCELLED">Cancelled</option>
							</select>
						</div>
					</div> */}
					</div>
				)}

				{/* Opportunity Table */}
				<div className="opp-table-container">
					<table className="opp-table">
						<thead>
							<tr>
								<th className="checkbox-column">
									<input
										type="checkbox"
										className="opp-custom-checkbox"
										checked={
											selectedRows.length ===
												opportunities.length &&
											opportunities.length > 0
										}
										onChange={toggleSelectAll}
									/>
								</th>

								{allColumns.map((col) => renderHeaderCell(col))}

								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{opportunities.length === 0 ? (
								<tr>
									<td
										colSpan="100"
										className="opp-empty-state"
									>
										<p>No Opportunities Found</p>
									</td>
								</tr>
							) : (
								opportunities.map((opp) => {
									// const matchedContact = accounts
									// 	.flatMap((acc) => acc.contacts)
									// 	.find(
									// 		(c) =>
									// 			c.contactId ===
									// 			opp.primaryContactId,
									// 	);

									return (
										<tr
											key={opp.id}
											className={
												selectedRows.includes(opp.id)
													? "selected-row"
													: ""
											}
										>
											<td className="checkbox-column">
												<input
													type="checkbox"
													className="opp-custom-checkbox"
													checked={selectedRows.includes(
														opp.id,
													)}
													onChange={() =>
														toggleRowSelection(
															opp.id,
														)
													}
												/>
											</td>
											{allColumns.map((col) => {
												if (!visibleColumns[col.key])
													return null;
												return (
													<td key={col.key}>
														{renderCell(
															col.key,
															opp,
														)}
													</td>
												);
											})}
											<td>
												<div className="opp-table-action-buttons">
													<button
														className="opp-edit-btn"
														title="Edit"
														onClick={() =>
															navigate(
																`/sales/opportunities/details/${opp.id}`,
															)
														}
													>
														<SquarePen
															size={18}
															strokeWidth={1}
														/>
													</button>
													<button
														className="opp-delete-btn"
														title="Delete"
														onClick={() =>
															handleDeleteClick(
																opp.id,
															)
														}
													>
														<Trash2
															size={18}
															strokeWidth={1}
														/>
													</button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<div className="opp-delete-confirm-overlay">
						<div className="opp-delete-confirm-dialog">
							<div className="opp-dialog-header">
								<h3>Confirm Delete?</h3>
							</div>
							<div className="opp-dialog-buttons">
								<button
									className="opp-yes-button"
									onClick={handleDeleteConfirm}
								>
									Yes
								</button>
								<button
									className="opp-no-button"
									onClick={() => setShowDeleteConfirm(false)}
								>
									No
								</button>
							</div>
						</div>
					</div>
				)}

				{/* List View Control Modal */}
				{showColumnControl && (
					<div className="opp-control-modal-overlay">
						<div className="opp-control-modal-dialog">
							{/* Header */}
							<div className="opp-control-modal-header">
								<h3>Select Fields to Display</h3>
								<button
									className="opp-control-close-btn"
									onClick={() => setShowColumnControl(false)}
								>
									<X
										size={20}
										strokeWidth={2}
										color="#0f1035"
									/>
								</button>
							</div>

							{/* Body */}
							<div className="opp-control-modal-body">
								{/* Available Fields */}
								<div className="opp-control-column">
									<label className="opp-control-label">
										Available Fields
									</label>

									<div className="opp-control-list opp-control-list-available">
										{tempAvailableKeys.map((key) => {
											const col = allColumns.find(
												(c) => c.key === key,
											);
											const isSelected =
												selectedAvailable.includes(key);

											return (
												<div
													key={key}
													className={
														"opp-control-list-item " +
														(isSelected
															? "selected"
															: "")
													}
													onClick={() =>
														setSelectedAvailable(
															(prev) =>
																prev.includes(
																	key,
																)
																	? prev.filter(
																			(
																				k,
																			) =>
																				k !==
																				key,
																		)
																	: [
																			...prev,
																			key,
																		],
														)
													}
												>
													{col?.label || key}
												</div>
											);
										})}
									</div>
								</div>

								{/* Center Buttons */}
								<div className="opp-control-move-buttons">
									<button
										className={
											"opp-control-move-btn " +
											(selectedAvailable.length > 0
												? "active"
												: "")
										}
										onClick={handleMoveToVisible}
										disabled={
											selectedAvailable.length === 0
										}
									>
										<ChevronRight size={20} />
									</button>

									<button
										className={
											"opp-control-move-btn " +
											(selectedVisible.length > 0
												? "active"
												: "")
										}
										onClick={handleMoveToAvailable}
										disabled={selectedVisible.length === 0}
									>
										<ChevronLeft size={20} />
									</button>
								</div>

								{/* Visible Fields */}
								<div className="opp-control-column">
									<label className="opp-control-label">
										Visible Fields
									</label>

									<div className="opp-control-list opp-control-list-visible">
										{tempVisibleKeys.map((key) => {
											const col = allColumns.find(
												(c) => c.key === key,
											);
											const isSelected =
												selectedVisible.includes(key);

											return (
												<div
													key={key}
													className={
														"opp-control-list-item " +
														(isSelected
															? "selected"
															: "")
													}
													onClick={() =>
														setSelectedVisible(
															(prev) =>
																prev.includes(
																	key,
																)
																	? prev.filter(
																			(
																				k,
																			) =>
																				k !==
																				key,
																		)
																	: [
																			...prev,
																			key,
																		],
														)
													}
												>
													{col?.label || key}
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Footer */}
							<div className="opp-control-modal-footer">
								<button
									className="opp-control-cancel-btn"
									onClick={() => setShowColumnControl(false)}
								>
									Cancel
								</button>

								<button
									className="opp-control-save-btn"
									onClick={handleSaveColumns}
								>
									Save
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Header Cell Popup Menu */}
				{popupConfig.column &&
					createPortal(
						<div
							ref={popupRef}
							className="opp-header-popup-menu"
							style={{
								top: popupConfig.y,
								left: popupConfig.x,
							}}
						>
							<button
								onClick={() =>
									handleSort(popupConfig.column, "asc")
								}
							>
								<ArrowUp size={14} /> Sort Ascending
							</button>

							<button
								onClick={() =>
									handleSort(popupConfig.column, "desc")
								}
							>
								<ArrowDown size={14} /> Sort Descending
							</button>

							<div className="opp-popup-divider" />

							<input
								type="text"
								placeholder="Filter..."
								value={columnSearch[popupConfig.column] || ""}
								onChange={(e) =>
									setColumnSearch({
										...columnSearch,
										[popupConfig.column]: e.target.value,
									})
								}
							/>
						</div>,
						document.body,
					)}

				{/* Sort Modal */}
				{showSortModal && (
					<div className="opp-sort-modal-overlay">
						<div className="opp-sort-modal-dialog">
							{/* Header */}
							<div className="opp-sort-modal-dialog-header">
								<h3>Sort</h3>
							</div>

							{/* Body */}
							<div className="opp-sort-modal-body">
								{/* Sort Order */}
								<div>
									<h4 className="opp-sort-section-title">
										Sort Order
									</h4>
									<div className="opp-sort-options">
										<label className="opp-radio">
											<input
												type="radio"
												name="sortOrder"
												checked={
													tempSortConfig.direction ===
													"asc"
												}
												onChange={() =>
													setTempSortConfig(
														(prev) => ({
															...prev,
															direction: "asc",
														}),
													)
												}
											/>
											<span className="opp-radio-mark"></span>
											Ascending
										</label>
										<label className="opp-radio">
											<input
												type="radio"
												name="sortOrder"
												checked={
													tempSortConfig.direction ===
													"desc"
												}
												onChange={() =>
													setTempSortConfig(
														(prev) => ({
															...prev,
															direction: "desc",
														}),
													)
												}
											/>
											<span className="opp-radio-mark"></span>
											Descending
										</label>
									</div>
								</div>

								{/* Sort By */}
								<div>
									<h4 className="opp-sort-section-title">
										Sort By
									</h4>

									<div className="opp-sort-radio-list">
										{allColumns.map((col) => (
											<label
												key={col.key}
												className="opp-radio"
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
												/>
												<span className="opp-radio-mark"></span>
												{col.label}
											</label>
										))}
									</div>
								</div>
							</div>

							{/* Buttons */}
							<div className="opp-sort-modal-dialog-buttons">
								<button
									className="opp-sort-modal-no-button"
									onClick={() => setShowSortModal(false)}
								>
									Cancel
								</button>

								<button
									className="opp-sort-modal-yes-button"
									onClick={() => {
										setSortConfig(tempSortConfig);
										setShowSortModal(false);
									}}
								>
									Apply
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Pagination */}
			<div className="opp-pagination-bar">
				<div className="opp-pagination-left">
					<p className="opp-total-selected-quotes">
						{areAllSelected
							? total - excludedIds.current.size
							: selectedRows.length}{" "}
						Selected
					</p>
				</div>
				<div className="opp-pagination-right">
					<label htmlFor="itemsPerPage">Items Per Page:</label>
					<select
						className="opp-items-per-page"
						id="itemsPerPage"
						value={limit}
						onChange={(e) => {
							setPage(1);
							setLimit(Number(e.target.value));
						}}
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>

					<button
						className="opp-page-btn"
						disabled={loading || page === 1}
						// onClick={() => setPage(page - 1)}
					>
						<ChevronsLeft
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>
					<button
						className="opp-page-btn"
						disabled={loading || page === 1}
						onClick={() => setPage(page - 1)}
					>
						<ChevronLeft
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>

					<div className="opp-page-numbers">
						Page {page} of {totalPages}
					</div>

					<button
						className="opp-page-btn"
						disabled={loading || page === totalPages}
						onClick={() => setPage(page + 1)}
					>
						<ChevronRight
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>
					<button
						className="opp-page-btn"
						disabled={loading || page === totalPages}
						// onClick={() => setPage(page + 1)}
					>
						<ChevronsRight
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>
				</div>
			</div>
		</>
	);
};

export default Opportunities;
