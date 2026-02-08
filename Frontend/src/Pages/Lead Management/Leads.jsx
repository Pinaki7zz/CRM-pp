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
import "./Leads.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "use-debounce";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;

const Leads = () => {
	const [selectedRows, setSelectedRows] = useState([]);
	const [areAllSelected, setAreAllSelected] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [leads, setLeads] = useState([]);
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteLeadId, setDeleteLeadId] = useState(null);
	const [resetSpin, setResetSpin] = useState(false);
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [filters, setFilters] = useState({
		leadStatus: "",
		company: "",
		leadOwnerId: "",
		email: "",
		createdAt: "",
	});
	const [viewType, setViewType] = useState("ALL");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState(0);
	const [columnSearch, setColumnSearch] = useState({
		leadId: "",
		name: "",
		leadStatus: "",
		company: "",
		email: "",
		leadOwner: "",
		createdAt: "",
	});
	const [visibleColumns, setVisibleColumns] = useState({
		leadId: true,
		name: true,
		leadStatus: true,
		company: true,
		email: true,
		leadOwner: true,
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
	const [debouncedCompany] = useDebounce(filters.company, 400);
	const [debouncedEmail] = useDebounce(filters.email, 400);
	const [debouncedColumnSearch] = useDebounce(columnSearch, 400);
	const allColumns = useMemo(
		() => [
			{ key: "leadId", label: "Lead ID" },
			{ key: "name", label: "Lead Name" },
			{ key: "leadStatus", label: "Status" },
			{ key: "company", label: "Company" },
			{ key: "email", label: "Email" },
			{ key: "leadOwnerId", label: "Owner" },
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
		OPEN: "Open",
		IN_PROGRESS: "In Progress",
		CONVERTED: "Converted",
		LOST: "Lost",
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

	// Fetch all leads from backend
	const fetchLeads = useCallback(async () => {
		try {
			setLoading(true);
			const query = new URLSearchParams({
				page,
				limit,
				search: debouncedSearch.trim(),
				sortKey: sortConfig.key,
				sortDirection: sortConfig.direction,
				company: debouncedCompany.trim(),
				email: debouncedEmail.trim(),
				leadStatus: filters.leadStatus,
				createdAt: filters.createdAt,
				viewType,
				leadOwnerId: user?.id,

				// NEW — ADD COLUMN SEARCH
				col_leadId: debouncedColumnSearch.leadId,
				col_name: debouncedColumnSearch.name,
				col_leadStatus: debouncedColumnSearch.leadStatus,
				col_company: debouncedColumnSearch.company,
				col_email: debouncedColumnSearch.email,
				col_leadOwner: debouncedColumnSearch.leadOwner,
				col_createdAt: debouncedColumnSearch.createdAt,
			}).toString();
			const res = await fetch(`${BASE_URL_LM}/leads/paginate?${query}`);
			if (!res.ok) {
				toast.error("Failed to fetch leads");
				return;
			}
			const data = await res.json();
			console.log(data);
			setLeads(data.items || []);
			setTotalPages(data.totalPages || 1);
			setStats(data.stats || {});
		} catch (err) {
			console.error("Error fetching leads:", err);
			toast.error("Error fetching leads");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		limit,
		viewType,
		user,
		filters.leadStatus,
		filters.leadOwnerId,
		filters.createdAt,
		debouncedCompany,
		debouncedEmail,
		debouncedSearch,

		// 🔥 FIX COLUMN SEARCH
		debouncedColumnSearch.leadId,
		debouncedColumnSearch.name,
		debouncedColumnSearch.leadStatus,
		debouncedColumnSearch.company,
		debouncedColumnSearch.email,
		debouncedColumnSearch.leadOwner,
		debouncedColumnSearch.createdAt,
	]);

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Failed to fetch users");
				return;
			}
			const data = await res.json();
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Error fetching users");
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		fetchLeads();
	}, [fetchLeads]);

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
		setDeleteLeadId(id);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		let idsToDelete = [];

		// Case 1: Single delete from row button
		if (deleteLeadId) {
			idsToDelete = [deleteLeadId];
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
				const res = await fetch(`${BASE_URL_LM}/leads/${id}`, {
					method: "DELETE",
				});

				if (!res.ok) {
					throw new Error(`Failed to delete lead ${id}`);
				}
			}

			toast.success("Selected leads deleted successfully");
			await fetchLeads(); // refresh UI
			setSelectedRows([]); // clear selection
		} catch (err) {
			console.error("Error deleting leads:", err);
			toast.error("Error deleting leads");
		}

		setDeleteLeadId(null);
		setShowDeleteConfirm(false);
	};

	const handleMassDelete = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select at least one lead to delete");
			return;
		}

		setShowActionsModal(false); // close dropdown
		setShowDeleteConfirm(true); // open confirmation modal
	};

	const toggleFilters = () => setShowFilters((prev) => !prev);

	const handleReset = () => {
		setFilters({
			leadStatus: "",
			company: "",
			leadOwnerId: "",
			email: "",
			createdAt: "",
		});
		setResetSpin(true);
		setTimeout(() => setResetSpin(false), 200); // match duration
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
		filters.leadStatus,
		filters.leadOwnerId,
		filters.createdAt,
		debouncedCompany,
		debouncedEmail,
		debouncedSearch,
	]);

	const handleExport = async () => {
		try {
			const res = await fetch(`${BASE_URL_LM}/leads/export`, {
				method: "GET",
				credentials: "include",
			});

			if (!res.ok) {
				toast.error("Failed to export leads");
				return;
			}

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "leads.csv";
			a.click();

			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Error exporting leads:", err);
			toast.error("Error exporting leads");
		}
	};

	const renderHeaderCell = (column) => {
		if (!visibleColumns[column.key]) return null;

		const isPopupOpen = activePopupColumn === column.key;
		const sortKey = column.sortKey || column.key;

		return (
			<th key={column.key} style={{ position: "relative" }}>
				<div className="lead-header-cell-content">
					<div
						onClick={() =>
							handleSort(
								sortKey,
								sortConfig.direction === "asc" ? "desc" : "asc",
							)
						}
						className="lead-header-title"
					>
						{column.label}
						{renderSortIcon(sortKey)}
					</div>

					<button
						className="lead-header-menu-btn"
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

	const renderCell = (key, lead) => {
		switch (key) {
			case "name":
				return (
					`${lead.firstName || ""} ${lead.lastName || ""}`.trim() ||
					"--"
				);
			case "leadStatus":
				return statusLabels[lead.leadStatus] || lead.leadStatus || "--";
			case "totalPrice":
				return lead.totalPrice || "--";
			case "successRate":
				return lead.successRate || "--";
			case "leadOwnerId":
				const owner = users.find((u) => u.id === lead.leadOwnerId);
				return owner ? `${owner.firstName} ${owner.lastName}` : "--";
			case "createdAt":
				return new Date(lead.createdAt).toLocaleDateString("en-GB");
			default:
				return lead[key] ?? "--";
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
				className={isAsc ? "lead-sort-icon asc" : "lead-sort-icon desc"}
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
		setSelectedRows(leads.map((l) => l.id));
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
			leadStatus: "",
			company: "",
			leadOwnerId: "",
			email: "",
			createdAt: "",
		});

		// Reset column search
		setColumnSearch({
			leadId: "",
			name: "",
			leadStatus: "",
			company: "",
			email: "",
			leadOwner: "",
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

		// Re-fetch leads
		fetchLeads();
	};

	return (
		<>
			<div className="lead-management-container">
				{/* Lead Stats */}
				<div className="lead-stats">
					<div className="lead-stat-item stat-card--with-badge dcf2f1-bg">
						<div className="lead-stat-badge" aria-hidden="true">
							<div className="lead-stat-badge__inner dcf2f1-bg">
								{stats?.totalLeads}
							</div>
						</div>

						<div className="lead-stat-content">
							<div className="lead-stat-value">Total Leads</div>
						</div>
					</div>
					<div className="lead-stat-item stat-card--with-badge d1f4c9-bg">
						<div className="lead-stat-badge" aria-hidden="true">
							<div className="lead-stat-badge__inner d1f4c9-bg">
								{stats?.converted}
							</div>
						</div>

						<div className="lead-stat-content">
							<div className="lead-stat-value">
								Total Converted
							</div>
						</div>
					</div>
					<div className="lead-stat-item stat-card--with-badge c5baff-bg">
						<div className="lead-stat-badge" aria-hidden="true">
							<div className="lead-stat-badge__inner c5baff-bg">
								{stats?.open}
							</div>
						</div>

						<div className="lead-stat-content">
							<div className="lead-stat-value">Total Open</div>
						</div>
					</div>
					<div className="lead-stat-item stat-card--with-badge ffd6a5-bg">
						<div className="lead-stat-badge" aria-hidden="true">
							<div className="lead-stat-badge__inner ffd6a5-bg">
								{stats?.lost}
							</div>
						</div>

						<div className="lead-stat-content">
							<div className="lead-stat-value">Total Lost</div>
						</div>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="lead-actions">
					<div className="lead-dropdown-container">
						<CircleUserRound
							size={20}
							strokeWidth={1}
							className="user-round-icon"
						/>
						<select
							className="lead-dropdown-button"
							value={viewType}
							onChange={(e) => setViewType(e.target.value)}
						>
							<option value="ALL">All Leads</option>
							<option value="MINE">My Leads (All)</option>
							<option value="CONVERTED">Converted Leads</option>
							<option value="OPEN">Open Leads</option>
							<option value="LOST">Lost Leads</option>
						</select>
					</div>
					<div className="lead-search-container">
						<input
							type="text"
							placeholder="Search Leads..."
							className="lead-search-input"
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
						className="lead-modern-button"
						onClick={() => navigate("/sales/leads/create")}
					>
						<Plus size={18} color="#dcf2f1" strokeWidth={2} />
						New
					</button>
					<button
						className="lead-icon-button-modern"
						title="Refresh Leads"
						onClick={() => {
							setRefreshSpin(true);
							fetchLeads();
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
						className="lead-icon-button-modern"
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
						className="lead-icon-button-modern"
						title="Filter Leads"
						onClick={toggleFilters}
					>
						<Filter size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="lead-icon-button-modern"
						title="Customize Columns"
						onClick={() => setShowColumnControl(true)}
					>
						<Settings size={30} color="#0f1035" strokeWidth={1} />
					</button>
					<button
						className="lead-icon-button-modern"
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
						className="lead-action-button-container"
						ref={actionRef}
					>
						<button
							className="lead-action-button"
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
							<div className="lead-action-modal-container">
								<ul className="lead-action-modal-list">
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
					<div className="lead-filters-container">
						<div className="lead-filters-header">
							<h3>Filter Leads</h3>
							<div className="lead-filters-header-buttons-right">
								<button
									className="lead-reset-filters"
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
									className="lead-close-filters"
									title="Close Filters Tab"
									onClick={toggleFilters}
								>
									<X size={22} strokeWidth={1} />
								</button>
							</div>
						</div>
						<div className="lead-filter-row">
							<div className="lead-filter-col">
								<label>Status</label>
								<select
									className="lead-filter-select"
									id="leadStatus"
									value={filters.leadStatus}
									onChange={(e) =>
										setFilters({
											...filters,
											leadStatus: e.target.value,
										})
									}
								>
									<option value="">Select Status</option>
									<option value="OPEN">Open</option>
									<option value="IN_PROGRESS">
										In Progress
									</option>
									<option value="CONVERTED">Converted</option>
									<option value="LOST">Lost</option>
								</select>
							</div>
							<div className="lead-filter-col">
								<label>Company</label>
								<input
									className="lead-filter-select"
									type="text"
									value={filters.company}
									onChange={(e) =>
										setFilters({
											...filters,
											company: e.target.value,
										})
									}
									placeholder="Enter Company"
								/>
							</div>
							<div className="lead-filter-col">
								<label>Lead Owner</label>
								<select
									className="lead-filter-select"
									id="leadOwnerId"
									value={filters.leadOwnerId}
									onChange={(e) =>
										setFilters({
											...filters,
											leadOwnerId: e.target.value,
										})
									}
								>
									<option value="">Select Lead Owner</option>
									{users.map((user) => (
										<option key={user.id} value={user.id}>
											{user.firstName} {user.lastName}
										</option>
									))}
								</select>
							</div>
							<div className="lead-filter-col">
								<label>Email</label>
								<input
									className="lead-filter-select"
									type="email"
									value={filters.email}
									onChange={(e) =>
										setFilters({
											...filters,
											email: e.target.value,
										})
									}
									placeholder="Enter Email"
								/>
							</div>
							<div className="lead-filter-col">
								<label>Created At</label>
								<input
									className="lead-filter-select"
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
					</div>
				)}

				{/* Leads Table */}
				<div className="lead-table-container">
					<table className="lead-table">
						<thead>
							<tr>
								<th className="checkbox-column">
									<input
										type="checkbox"
										className="lead-custom-checkbox"
										checked={
											selectedRows.length ===
												leads.length && leads.length > 0
										}
										onChange={toggleSelectAll}
									/>
								</th>

								{allColumns.map((col) => renderHeaderCell(col))}

								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{leads.length === 0 ? (
								<tr>
									<td
										colSpan="100"
										className="lead-empty-state"
									>
										<p>No Leads Found</p>
									</td>
								</tr>
							) : (
								leads.map((lead) => (
									<tr
										key={lead.id}
										className={
											selectedRows.includes(lead.id)
												? "selected-row"
												: ""
										}
									>
										<td className="checkbox-column">
											<input
												type="checkbox"
												className="lead-custom-checkbox"
												checked={selectedRows.includes(
													lead.id,
												)}
												onChange={() =>
													toggleRowSelection(lead.id)
												}
											/>
										</td>
										{allColumns.map((col) => {
											if (!visibleColumns[col.key])
												return null;
											return (
												<td key={col.key}>
													{renderCell(col.key, lead)}
												</td>
											);
										})}
										<td>
											<div className="lead-table-action-buttons">
												<button
													className="lead-edit-btn"
													title="Edit"
													onClick={() =>
														navigate(
															`/sales/leads/details/${lead.id}`,
														)
													}
												>
													<SquarePen
														size={18}
														strokeWidth={1}
													/>
												</button>
												<button
													className="lead-delete-btn"
													title="Delete"
													onClick={() =>
														handleDeleteClick(
															lead.id,
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
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<div className="lead-delete-confirm-overlay">
						<div className="lead-delete-confirm-dialog">
							<div className="lead-dialog-header">
								<h3>Confirm Delete?</h3>
							</div>
							<div className="lead-dialog-buttons">
								<button
									className="lead-yes-button"
									onClick={handleDeleteConfirm}
								>
									Yes
								</button>
								<button
									className="lead-no-button"
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
					<div className="lead-control-modal-overlay">
						<div className="lead-control-modal-dialog">
							{/* Header */}
							<div className="lead-control-modal-header">
								<h3>Select Fields to Display</h3>
								<button
									className="lead-control-close-btn"
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
							<div className="lead-control-modal-body">
								{/* Available Fields */}
								<div className="lead-control-column">
									<label className="lead-control-label">
										Available Fields
									</label>

									<div className="lead-control-list lead-control-list-available">
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
														"lead-control-list-item " +
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
								<div className="lead-control-move-buttons">
									<button
										className={
											"lead-control-move-btn " +
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
											"lead-control-move-btn " +
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
								<div className="lead-control-column">
									<label className="lead-control-label">
										Visible Fields
									</label>

									<div className="lead-control-list lead-control-list-visible">
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
														"lead-control-list-item " +
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
							<div className="lead-control-modal-footer">
								<button
									className="lead-control-cancel-btn"
									onClick={() => setShowColumnControl(false)}
								>
									Cancel
								</button>

								<button
									className="lead-control-save-btn"
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
							className="lead-header-popup-menu"
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

							<div className="lead-popup-divider" />

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
					<div className="lead-sort-modal-overlay">
						<div className="lead-sort-modal-dialog">
							{/* Header */}
							<div className="lead-sort-modal-dialog-header">
								<h3>Sort</h3>
							</div>

							{/* Body */}
							<div className="lead-sort-modal-body">
								{/* Sort Order */}
								<div>
									<h4 className="lead-sort-section-title">
										Sort Order
									</h4>
									<div className="lead-sort-options">
										<label className="lead-radio">
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
											<span className="lead-radio-mark"></span>
											Ascending
										</label>
										<label className="lead-radio">
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
											<span className="lead-radio-mark"></span>
											Descending
										</label>
									</div>
								</div>

								{/* Sort By */}
								<div>
									<h4 className="lead-sort-section-title">
										Sort By
									</h4>

									<div className="lead-sort-radio-list">
										{allColumns.map((col) => (
											<label
												key={col.key}
												className="lead-radio"
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
												<span className="lead-radio-mark"></span>
												{col.label}
											</label>
										))}
									</div>
								</div>
							</div>

							{/* Buttons */}
							<div className="lead-sort-modal-dialog-buttons">
								<button
									className="lead-sort-modal-no-button"
									onClick={() => setShowSortModal(false)}
								>
									Cancel
								</button>

								<button
									className="lead-sort-modal-yes-button"
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
			<div className="lead-pagination-bar">
				<div className="lead-pagination-left">
					<p className="lead-total-selected-quotes">
						{areAllSelected
							? total - excludedIds.current.size
							: selectedRows.length}{" "}
						Selected
					</p>
				</div>
				<div className="lead-pagination-right">
					<label htmlFor="itemsPerPage">Items Per Page:</label>
					<select
						className="lead-items-per-page"
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
						className="lead-page-btn"
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
						className="lead-page-btn"
						disabled={loading || page === 1}
						onClick={() => setPage(page - 1)}
					>
						<ChevronLeft
							size={28}
							strokeWidth={2}
							color="#dcf2f1"
						/>
					</button>

					<div className="lead-page-numbers">
						Page {page} of {totalPages}
					</div>

					<button
						className="lead-page-btn"
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
						className="lead-page-btn"
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

export default Leads;
