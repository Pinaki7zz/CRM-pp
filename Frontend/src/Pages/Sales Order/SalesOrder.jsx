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
import "./SalesOrder.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "use-debounce";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const SalesOrder = () => {
	const [selectedRows, setSelectedRows] = useState([]);
	const [areAllSelected, setAreAllSelected] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [opportunities, setOpportunities] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
	const [orders, setOrders] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteSalesOrderId, setDeleteSalesOrderId] = useState(null);
	const [resetSpin, setResetSpin] = useState(false);
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [filters, setFilters] = useState({
		status: "",
		opportunityName: "",
		accountId: "",
		primaryContactId: "",
		totalPrice: "",
		orderOwner: "",
		createdAt: "",
	});
	const [viewType, setViewType] = useState("ALL");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [columnSearch, setColumnSearch] = useState({
		orderId: "",
		name: "",
		status: "",
		opportunity: "",
		accountName: "",
		contactName: "",
		totalPrice: "",
		orderOwner: "",
		createdAt: "",
	});
	const [visibleColumns, setVisibleColumns] = useState({
		orderId: true,
		name: true,
		status: true,
		opportunity: true,
		accountName: true,
		contactName: true,
		totalPrice: true,
		orderOwner: true,
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
	const [debouncedTotalPrice] = useDebounce(filters.totalPrice, 400);
	const [debouncedColumnSearch] = useDebounce(columnSearch, 400);
	const allColumns = useMemo(
		() => [
			{ key: "orderId", label: "Order ID" },
			{ key: "name", label: "Order Name" },
			{ key: "status", label: "Status" },
			{ key: "opportunity", label: "Opp. Name" },
			{ key: "accountName", label: "Account" },
			{ key: "contactName", label: "Contact" },
			{ key: "totalPrice", label: "Total Price" },
			{ key: "orderOwner", label: "Owner" },
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

	const statusLabels = {
		PENDING: "Pending",
		IN_PROGRESS: "In Progress",
		CONFIRMED: "Confirmed",
		SHIPPED: "Shipped",
		DELIVERED: "Delivered",
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

	// Fetch all sales orders from backend
	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true);
			const query = new URLSearchParams({
				page,
				limit,
				search: debouncedSearch.trim(),
				sortKey: sortConfig.key,
				sortDirection: sortConfig.direction,
				opportunityName: filters.opportunityName,
				accountId: filters.accountId,
				primaryContactId: filters.primaryContactId,
				status: filters.status,
				totalPrice: debouncedTotalPrice.trim(),
				orderOwner: filters.orderOwner,
				createdAt: filters.createdAt,
				viewType,
				orderOwnerId: user?.id,

				// NEW — ADD COLUMN SEARCH
				col_orderId: debouncedColumnSearch.orderId,
				col_name: debouncedColumnSearch.name,
				col_status: debouncedColumnSearch.status,
				col_opportunity: debouncedColumnSearch.opportunity,
				col_accountName: debouncedColumnSearch.accountName,
				col_contactName: debouncedColumnSearch.contactName,
				col_totalPrice: debouncedColumnSearch.totalPrice,
				col_orderOwner: debouncedColumnSearch.orderOwner,
				col_createdAt: debouncedColumnSearch.createdAt,
			}).toString();
			const res = await fetch(
				`${BASE_URL_SM}/sales-order/paginate?${query}`,
			);
			if (!res.ok) {
				toast.error("Failed to fetch sales orders");
				return;
			}
			const data = await res.json();
			console.log(data);
			setOrders(data.items || []);
			setTotalPages(data.totalPages || 1);
			setTotal(data.total);
		} catch (err) {
			console.error("Error fetching sales orders:", err);
			toast.error("Error fetching sales orders");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		limit,
		viewType,
		user,
		filters.opportunityId,
		filters.accountId,
		filters.primaryContactId,
		filters.status,
		filters.orderOwner,
		filters.createdAt,
		debouncedTotalPrice,
		debouncedSearch,

		// 🔥 FIX COLUMN SEARCH
		debouncedColumnSearch.orderId,
		debouncedColumnSearch.name,
		debouncedColumnSearch.status,
		debouncedColumnSearch.opportunity,
		debouncedColumnSearch.accountName,
		debouncedColumnSearch.contactName,
		debouncedColumnSearch.totalPrice,
		debouncedColumnSearch.orderOwner,
		debouncedColumnSearch.createdAt,
	]);

	const fetchAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				toast.error("Unable to fetch accounts");
				return;
			}
			const data = await res.json();
			setAccounts(data);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			toast.error("Failed to fetch accounts");
		}
	};

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Unable to fetch users");
				return;
			}
			const data = await res.json();
			setUsers(data);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			toast.error("Failed to fetch accounts");
		}
	};

	const fetchOpportunities = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity`);
			if (!res.ok) {
				toast.error("Failed to fetch opportunities");
				return;
			}
			const data = await res.json();
			setOpportunities(data);
		} catch (err) {
			console.error("Error fetching opportunities:", err);
			toast.error("Error fetching opportunities");
		}
	};

	useEffect(() => {
		fetchUsers();
		fetchAccounts();
		fetchOpportunities();
	}, []);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

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
		setDeleteSalesOrderId(id);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		let idsToDelete = [];

		// Case 1: Single delete from row button
		if (deleteSalesOrderId) {
			idsToDelete = [deleteSalesOrderId];
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
				await fetch(`${BASE_URL_SM}/sales-order/${id}`, {
					method: "DELETE",
				});
			}

			toast.success("Selected sales orders deleted successfully");
			await fetchOrders(); // refresh UI
			setSelectedRows([]); // clear selection
		} catch (err) {
			console.error(err);
			toast.error("Failed to delete selected sales orders");
		}

		setDeleteSalesOrderId(null);
		setShowDeleteConfirm(false);
	};

	const handleMassDelete = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select at least one sales order to delete");
			return;
		}

		setShowActionsModal(false); // close dropdown
		setShowDeleteConfirm(true); // open confirmation modal
	};

	const toggleFilters = () => setShowFilters((prev) => !prev);

	const handleReset = () => {
		setFilters({
			status: "",
			opportunityName: "",
			accountId: "",
			primaryContactId: "",
			totalPrice: "",
			orderOwner: "",
			createdAt: "",
		});
		setAvailableContacts([]);
		setResetSpin(true);
		setTimeout(() => setResetSpin(false), 200);
	};

	const handleFilterChange = (e) => {
		const { id, value } = e.target;

		// === Opportunity selected ===
		if (id === "oppName" || id === "opportunityName") {
			const selectedOpp = opportunities.find((o) => o.id === value);
			const relatedAccount = selectedOpp
				? accounts.find(
						(acc) => acc.accountId === selectedOpp.accountId,
					)
				: null;

			const primaryContact = relatedAccount?.contacts?.find(
				(c) => c.isPrimary === true,
			);

			setFilters((prev) => ({
				...prev,
				opportunityName: value || "",
				accountId: relatedAccount?.accountId || "", // set related account
				primaryContactId: primaryContact?.contactId || "", // set related primary contact
			}));

			setAvailableContacts(relatedAccount?.contacts || []);
			return;
		}

		// === Account changed by user ===
		if (id === "accountId") {
			// user cleared account
			if (!value) {
				setFilters((prev) => ({
					...prev,
					accountId: "",
					primaryContactId: "",
				}));
				setAvailableContacts([]);
				return;
			}

			// user selected some account — don't change opportunity
			const selectedAccount = accounts.find((a) => a.accountId === value);
			const primaryContact = selectedAccount?.contacts?.find(
				(c) => c.isPrimary,
			);

			setFilters((prev) => ({
				...prev,
				accountId: value,
				// choose primary contact of new account (user can override)
				primaryContactId: primaryContact?.contactId || "",
			}));
			setAvailableContacts(selectedAccount?.contacts || []);
			return;
		}

		// === Contact changed by user ===
		if (id === "primaryContactId") {
			setFilters((prev) => ({
				...prev,
				primaryContactId: value,
			}));
			return;
		}

		// fallback for other filter fields
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
		filters.opportunityName,
		filters.accountId,
		filters.primaryContactId,
		filters.status,
		filters.orderOwner,
		filters.createdAt,
		debouncedTotalPrice,
		debouncedSearch,
	]);

	const handleExport = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/sales-order/export`, {
				method: "GET",
				credentials: "include",
			});

			if (!res.ok) {
				toast.error("Failed to export sales orders");
				return;
			}

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "sales-orders.csv";
			a.click();

			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Error exporting sales orders", err);
			toast.error("Error exporting sales orders");
		}
	};

	const renderHeaderCell = (column) => {
		if (!visibleColumns[column.key]) return null;

		const isPopupOpen = activePopupColumn === column.key;
		const sortKey = column.sortKey || column.key;

		return (
			<th key={column.key} style={{ position: "relative" }}>
				<div className="so-header-cell-content">
					<div
						onClick={() =>
							handleSort(
								sortKey,
								sortConfig.direction === "asc" ? "desc" : "asc",
							)
						}
						className="so-header-title"
					>
						{column.label}
						{renderSortIcon(sortKey)}
					</div>

					<button
						className="so-header-menu-btn"
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

	const renderCell = (key, order) => {
		switch (key) {
			case "status":
				return statusLabels[order.status] || order.status || "--";
			case "opportunity":
				return order.opportunity?.name || "--";
			case "accountName":
				return (
					accounts.find((a) => a.accountId === order.accountId)
						?.name || "--"
				);
			case "contactName":
				const account = accounts.find(
					(a) => a.accountId === order.accountId,
				);
				const contact = account?.contacts?.find(
					(c) => c.contactId === order.primaryContactId,
				);
				return contact
					? `${contact.firstName} ${contact.lastName}`
					: "--";
			case "totalPrice":
				return order.totalPrice || "--";
			case "orderOwner":
				const owner = users.find((u) => u.id === order.orderOwnerId);
				return owner ? `${owner.firstName} ${owner.lastName}` : "--";
			case "createdAt":
				return new Date(order.createdAt).toLocaleDateString("en-GB");
			default:
				return order[key] ?? "--";
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
				className={isAsc ? "so-sort-icon asc" : "so-sort-icon desc"}
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
		setSelectedRows(orders.map((o) => o.id));
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
			status: "",
			opportunityId: "",
			accountId: "",
			primaryContactId: "",
			totalPrice: "",
			orderOwner: "",
			createdAt: "",
		});

		// Reset column search
		setColumnSearch({
			orderId: "",
			name: "",
			status: "",
			opportunity: "",
			accountName: "",
			contactName: "",
			totalPrice: "",
			orderOwner: "",
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
		fetchOrders();
	};

	return (
		<>
			<div className="so-management-container">
				{/* Sales Order Stats */}
				<div className="so-stats">
					<div className="so-stat-item stat-card--with-badge">
						<div className="so-stat-badge" aria-hidden="true">
							<div className="so-stat-badge__inner">{total}</div>
						</div>

						<div className="so-stat-content">
							<div className="so-stat-value">
								Total Sales Orders
							</div>
						</div>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="so-actions">
					<div className="so-dropdown-container">
						<CircleUserRound
							size={20}
							strokeWidth={1}
							className="user-round-icon"
						/>
						<select
							className="so-dropdown-button"
							value={viewType}
							onChange={(e) => setViewType(e.target.value)}
						>
							<option value="ALL">All Sales Orders</option>
							<option value="MINE">My Sales Orders (All)</option>
							<option value="PENDING">
								Pending Sales Orders
							</option>
							<option value="DELIVERED">
								Delivered Sales Orders
							</option>
						</select>
					</div>
					<div className="so-search-container">
						<input
							type="text"
							placeholder="Search Sales Orders..."
							className="so-search-input"
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
						className="so-modern-button"
						onClick={() => navigate("/sales/sales-order/create")}
					>
						<Plus size={18} color="#dcf2f1" strokeWidth={2} />
						New
					</button>
					<button
						className="so-icon-button-modern"
						title="Refresh Sales Orders"
						onClick={() => {
							setRefreshSpin(true);
							fetchOrders();
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
						className="so-icon-button-modern"
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
						className="so-icon-button-modern"
						title="Filter Sales Orders"
						onClick={toggleFilters}
					>
						<Filter size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="so-icon-button-modern"
						title="Customize Columns"
						onClick={() => setShowColumnControl(true)}
					>
						<Settings size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="so-icon-button-modern"
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
					<div className="so-action-button-container" ref={actionRef}>
						<button
							className="so-action-button"
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
							<div className="so-action-modal-container">
								<ul className="so-action-modal-list">
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
					<div className="so-filters-container">
						<div className="so-filters-header">
							<h3>Filter Sales Orders</h3>
							<div className="so-filters-header-buttons-right">
								<button
									className="so-reset-filters"
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
									className="so-close-filters"
									title="Close Filters Tab"
									onClick={toggleFilters}
								>
									<X size={22} strokeWidth={1} />
								</button>
							</div>
						</div>
						<div className="so-filter-row">
							<div className="so-filter-col">
								<label>Status</label>
								<select
									className="so-filter-select"
									value={filters.status}
									onChange={(e) =>
										setFilters({
											...filters,
											status: e.target.value,
										})
									}
								>
									<option value="">Select Status</option>
									<option value="PENDING">Pending</option>
									<option value="IN_PROGRESS">
										In Progress
									</option>
									<option value="CONFIRMED">Confirmed</option>
									<option value="SHIPPED">Shipped</option>
									<option value="DELIVERED">Delivered</option>
									<option value="CANCELLED">Cancelled</option>
								</select>
							</div>
							<div className="so-filter-col">
								<label>Opp. Name</label>
								<select
									className="so-filter-select"
									id="oppName"
									value={filters.opportunityName}
									onChange={handleFilterChange}
								>
									<option value="">Select Opp. Name</option>
									{opportunities.map((opp) => (
										<option key={opp.id} value={opp.id}>
											{opp.name}
										</option>
									))}
								</select>
							</div>
							<div className="so-filter-col">
								<label>Order Owner</label>
								<select
									className="opp-filter-select"
									id="orderOwner"
									value={filters.orderOwner}
									onChange={(e) =>
										setFilters({
											...filters,
											orderOwner: e.target.value,
										})
									}
								>
									<option value="">Select Quote Owner</option>
									{users.map((user) => (
										<option key={user.id} value={user.id}>
											{user.firstName} {user.lastName}
										</option>
									))}
								</select>
							</div>
							<div className="so-filter-col">
								<label>Created At</label>
								<input
									className="so-filter-select"
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
						{/* <div className="so-filter-row">
							<div className="so-filter-col">
								<label>Account Name</label>
								<select
									className="so-filter-select"
									id="accountId" // <-- important
									value={filters.accountId}
									onChange={handleFilterChange}
								>
									<option value="">
										Select Account Name
									</option>
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
							<div className="so-filter-col">
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
							<div className="so-filter-col">
								<label>Grand Total</label>
								<input
									className="opp-filter-select"
									type="number"
									step="0.01"
									value={filters.totalPrice}
									onChange={(e) =>
										setFilters({
											...filters,
											totalPrice: e.target.value,
										})
									}
									placeholder="Enter Grand Total"
								/>
							</div>
						</div> */}
					</div>
				)}

				{/* Sales Order Table */}
				<div className="so-table-container">
					<table className="so-table">
						<thead>
							<tr>
								<th className="checkbox-column">
									<input
										type="checkbox"
										className="so-custom-checkbox"
										checked={
											selectedRows.length ===
												orders.length &&
											orders.length > 0
										}
										onChange={toggleSelectAll}
									/>
								</th>

								{allColumns.map((col) => renderHeaderCell(col))}

								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{orders.length === 0 ? (
								<tr>
									<td
										colSpan="100"
										className="so-empty-state"
									>
										<p>No Orders Found</p>
									</td>
								</tr>
							) : (
								orders.map((order) => {
									// const matchedContact = accounts
									// 	.flatMap((acc) => acc.contacts)
									// 	.find(
									// 		(c) =>
									// 			c.contactId ===
									// 			order.primaryContactId,
									// 	);

									return (
										<tr
											key={order.id}
											className={
												selectedRows.includes(order.id)
													? "selected-row"
													: ""
											}
										>
											<td className="checkbox-column">
												<input
													type="checkbox"
													className="so-custom-checkbox"
													checked={selectedRows.includes(
														order.id,
													)}
													onChange={() =>
														toggleRowSelection(
															order.id,
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
															order,
														)}
													</td>
												);
											})}
											<td>
												<div className="so-table-action-buttons">
													<button
														className="so-edit-btn"
														title="Edit"
														onClick={() =>
															navigate(
																`/sales/sales-order/details/${order.id}`,
															)
														}
													>
														<SquarePen
															size={18}
															strokeWidth={1}
														/>
													</button>
													<button
														className="so-delete-btn"
														title="Delete"
														onClick={() =>
															handleDeleteClick(
																order.id,
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
					<div className="so-delete-confirm-overlay">
						<div className="so-delete-confirm-dialog">
							<div className="so-dialog-header">
								<h3>Confirm Delete?</h3>
							</div>
							<div className="so-dialog-buttons">
								<button
									className="so-yes-button"
									onClick={handleDeleteConfirm}
								>
									Yes
								</button>
								<button
									className="so-no-button"
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
					<div className="so-control-modal-overlay">
						<div className="so-control-modal-dialog">
							{/* Header */}
							<div className="so-control-modal-header">
								<h3>Select Fields to Display</h3>
								<button
									className="so-control-close-btn"
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
							<div className="so-control-modal-body">
								{/* Available Fields */}
								<div className="so-control-column">
									<label className="so-control-label">
										Available Fields
									</label>

									<div className="so-control-list so-control-list-available">
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
														"so-control-list-item " +
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
								<div className="so-control-move-buttons">
									<button
										className={
											"so-control-move-btn " +
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
											"so-control-move-btn " +
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
								<div className="so-control-column">
									<label className="so-control-label">
										Visible Fields
									</label>

									<div className="so-control-list so-control-list-visible">
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
														"so-control-list-item " +
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
							<div className="so-control-modal-footer">
								<button
									className="so-control-cancel-btn"
									onClick={() => setShowColumnControl(false)}
								>
									Cancel
								</button>

								<button
									className="so-control-save-btn"
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
							className="so-header-popup-menu"
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

							<div className="so-popup-divider" />

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
					<div className="so-sort-modal-overlay">
						<div className="so-sort-modal-dialog">
							{/* Header */}
							<div className="so-sort-modal-dialog-header">
								<h3>Sort</h3>
							</div>

							{/* Body */}
							<div className="so-sort-modal-body">
								{/* Sort Order */}
								<div>
									<h4 className="so-sort-section-title">
										Sort Order
									</h4>
									<div className="so-sort-options">
										<label className="so-radio">
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
											<span className="so-radio-mark"></span>
											Ascending
										</label>
										<label className="so-radio">
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
											<span className="so-radio-mark"></span>
											Descending
										</label>
									</div>
								</div>

								{/* Sort By */}
								<div>
									<h4 className="so-sort-section-title">
										Sort By
									</h4>

									<div className="so-sort-radio-list">
										{allColumns.map((col) => (
											<label
												key={col.key}
												className="so-radio"
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
												<span className="so-radio-mark"></span>
												{col.label}
											</label>
										))}
									</div>
								</div>
							</div>

							{/* Buttons */}
							<div className="so-sort-modal-dialog-buttons">
								<button
									className="so-sort-modal-no-button"
									onClick={() => setShowSortModal(false)}
								>
									Cancel
								</button>

								<button
									className="so-sort-modal-yes-button"
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
			<div className="so-pagination-bar">
				<div className="so-pagination-left">
					<p className="so-total-selected-quotes">
						{areAllSelected
							? total - excludedIds.current.size
							: selectedRows.length}{" "}
						Selected
					</p>
				</div>
				<div className="so-pagination-right">
					<label htmlFor="itemsPerPage">Items Per Page:</label>
					<select
						className="so-items-per-page"
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
						className="so-page-btn"
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
						className="so-page-btn"
						disabled={loading || page === 1}
						onClick={() => setPage(page - 1)}
					>
						<ChevronLeft
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>

					<div className="so-page-numbers">
						Page {page} of {totalPages}
					</div>

					<button
						className="so-page-btn"
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
						className="so-page-btn"
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

export default SalesOrder;
