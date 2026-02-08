import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	RefreshCcw,
	Search,
	ChevronDown,
	Eye,
	Trash2,
	ChevronsLeft,
	ChevronsRight,
	CircleArrowLeft,
	CircleArrowRight,
	Filter,
	ArrowUp,
	ArrowDown,
	ArrowUpDown,
	X,
	RotateCcw,
	Settings,
	ChevronLeft,
	ChevronRight,
	CheckCircle2,
	Ban,
	MoreVertical,
	Copy,
	Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UserProfile.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

// --- Constants ---
const INITIAL_ADVANCED_STATE = {
	userId: { value: "", operator: "include" },
	username: { value: "", operator: "include" },
	fullName: { value: "", operator: "include" },
	email: { value: "", operator: "include" },
	phone: { value: "", operator: "include" },
	businessRoleName: { value: "", operator: "include" },
	status: { value: "", operator: "include" }
};

const ALL_COLUMNS = [
	{ key: "userId", label: "User ID" },
	{ key: "username", label: "Username" },
	{ key: "fullName", label: "Name" },
	{ key: "businessRoleName", label: "Role" },
	{ key: "email", label: "Email" },
	{ key: "phone", label: "Phone" },
	{ key: "status", label: "Status" },
	{ key: "createdAt", label: "Created At" }
];

const DEFAULT_VISIBLE_COLUMNS = ["userId", "username", "fullName", "businessRoleName", "email", "status", "createdAt"];

const UserProfile = () => {
	// --- State Management ---
	const [users, setUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null); // Track single delete
	const [searchTerm, setSearchTerm] = useState("");
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [resetSpin, setResetSpin] = useState(false);

	// --- UI Controls ---
	const [showFilterPanel, setShowFilterPanel] = useState(false);
	const [showActionsDropdown, setShowActionsDropdown] = useState(false); // Actions Dropdown
	const [showSortModal, setShowSortModal] = useState(false);
	const [showColumnSettings, setShowColumnSettings] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);
	const [showStatusModal, setShowStatusModal] = useState(false); 
	
	// --- ROLE ASSIGNMENT STATE ---
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [availableRoles, setAvailableRoles] = useState([]);
	const [roleSearchTerm, setRoleSearchTerm] = useState(""); // Role Search
	const [selectedRoleToAssign, setSelectedRoleToAssign] = useState(null); // Single ID or null

	const [statusToApply, setStatusToApply] = useState("ACTIVE");
	
	// View Management
	const [quickFilter, setQuickFilter] = useState("all_users");
	const [savedViews, setSavedViews] = useState([]);
	const [activePopupColumn, setActivePopupColumn] = useState(null);

	// Column Management
	const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
	const [tempVisibleColumns, setTempVisibleColumns] = useState([]);
	const [tempAvailableColumns, setTempAvailableColumns] = useState([]);
	const [selectedAvailable, setSelectedAvailable] = useState([]);
	const [selectedVisible, setSelectedVisible] = useState([]);

	// --- Pagination ---
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [pageInput, setPageInput] = useState(1);

	// --- Sorting & Filtering ---
	const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
	const [tempSortConfig, setTempSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
	const [columnSearch, setColumnSearch] = useState({});
	
	const [advancedFilters, setAdvancedFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));

	const navigate = useNavigate();
	const actionRef = useRef(null);
	const popupRef = useRef(null);

	// Close Dropdowns on outside click
	useEffect(() => {
		function handleClickOutside(event) {
			if (actionRef.current && !actionRef.current.contains(event.target)) setShowActionsDropdown(false);
			if (popupRef.current && !popupRef.current.contains(event.target)) setActivePopupColumn(null);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const fetchUsers = async () => {
		try {
			setRefreshSpin(true);
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, { method: "GET", credentials: "include" });
			if (!res.ok) throw new Error("Fetch failed");
			const data = await res.json();
			// Sort by ID numeric part
			const sorted = data.sort((a, b) => {
				const numA = parseInt(a.userId?.split("-")[1] || 0, 10);
				const numB = parseInt(b.userId?.split("-")[1] || 0, 10);
				return numA - numB;
			});
			setUsers(sorted);
			setTimeout(() => setRefreshSpin(false), 500);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Error fetching users");
			setRefreshSpin(false);
		}
	};

	useEffect(() => {
		fetchUsers();
		const saved = localStorage.getItem("userViews");
		if (saved) setSavedViews(JSON.parse(saved));
	}, []);

	// --- Stats Calculations ---
	const stats = useMemo(() => {
		const activeCount = users.filter(c => (c.status || "ACTIVE").toUpperCase() === 'ACTIVE').length;
		const inactiveCount = users.filter(c => (c.status || "").toUpperCase() === 'INACTIVE').length;
		return { total: users.length, active: activeCount, inactive: inactiveCount };
	}, [users]);

	// --- Data Processing (Filter & Sort) ---
	const processedUsers = useMemo(() => {
		let result = [...users];

		// 1. Quick Filters / System Views
		if (quickFilter === "active_users") {
			result = result.filter(c => (c.status || "ACTIVE").toUpperCase() === 'ACTIVE');
		} else if (quickFilter === "inactive_users") {
			result = result.filter(c => (c.status || "").toUpperCase() === 'INACTIVE');
		}

		// 2. Global Search
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(c => 
				(c.firstName + " " + c.lastName).toLowerCase().includes(term) ||
				(c.username || "").toLowerCase().includes(term) ||
				(c.userId || "").toLowerCase().includes(term) ||
				(c.email || "").toLowerCase().includes(term)
			);
		}

		// 3. Column Specific Search
		Object.keys(columnSearch).forEach(key => {
			const val = columnSearch[key]?.toLowerCase();
			if (val) {
				result = result.filter(item => {
					let cellVal = "";
					if (key === 'fullName') cellVal = item.firstName + " " + item.lastName;
					else cellVal = String(item[key] || "");
					return cellVal.toLowerCase().includes(val);
				});
			}
		});

		// 4. Advanced Filters
		Object.keys(advancedFilters).forEach(key => {
			const rule = advancedFilters[key];
			if (!rule.value) return;
			const filterVal = rule.value.toLowerCase();

			result = result.filter(item => {
				let cellValue = "";
				if (key === 'fullName') cellValue = item.firstName + " " + item.lastName;
				else cellValue = String(item[key] || "");

				const match = cellValue.toLowerCase().includes(filterVal);
				return rule.operator === 'include' ? match : !match;
			});
		});

		// 5. Sorting
		if (sortConfig.key) {
			result.sort((a, b) => {
				let valA = a[sortConfig.key];
				let valB = b[sortConfig.key];

				if (sortConfig.key === 'fullName') {
					valA = (a.firstName + " " + a.lastName).toLowerCase();
					valB = (b.firstName + " " + b.lastName).toLowerCase();
				} else if (typeof valA === 'string') {
					valA = valA.toLowerCase();
					valB = (valB || "").toLowerCase();
				}

				if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
				if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [users, quickFilter, searchTerm, advancedFilters, sortConfig, columnSearch]);

	// --- Pagination Logic ---
	const indexOfLastRecord = currentPage * itemsPerPage;
	const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
	const currentRecords = processedUsers.slice(indexOfFirstRecord, indexOfLastRecord);
	const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

	useEffect(() => { setPageInput(currentPage); }, [currentPage]);

	const handlePageInputCommit = () => {
		const val = parseInt(pageInput);
		if (!isNaN(val) && val >= 1 && val <= (totalPages || 1)) {
			setCurrentPage(val);
		} else {
			setPageInput(currentPage);
		}
	};

	// --- Selection & Action Logic ---
	const toggleRowSelection = (id) => {
		setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
	};

	const handleSelectAll = () => {
		if (selectedRows.length === currentRecords.length) setSelectedRows([]);
		else setSelectedRows(currentRecords.map(c => c.id));
	};

	const handleDeleteConfirm = async () => {
		const idsToDelete = userToDelete ? [userToDelete] : selectedRows;
		try {
			await Promise.all(idsToDelete.map(id => fetch(`${BASE_URL_UM}/users/${id}`, { method: "DELETE" })));
			toast.success("User(s) deleted successfully");
			setShowDeleteConfirm(false);
			setUserToDelete(null);
			setSelectedRows([]);
			fetchUsers(); // Refetch
		} catch (err) {
			toast.error("Error deleting users");
		}
	};

	const handleMassDeleteClick = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select users to delete");
			return;
		}
		setUserToDelete(null); // Ensure we are in mass delete mode
		setShowDeleteConfirm(true);
		setShowActionsDropdown(false);
	};

	const handleChangeStatusClick = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select users to update");
			return;
		}
		setShowStatusModal(true);
		setShowActionsDropdown(false);
	};

	const confirmStatusChange = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/status-update`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ ids: selectedRows, status: statusToApply })
			});
			if(res.ok) {
				toast.success("Status updated successfully");
				fetchUsers();
				setSelectedRows([]);
				setShowStatusModal(false);
			} else {
				toast.error("Failed to update status");
			}
		} catch (err) {
			toast.error("Error updating status");
		}
	};

	// --- ASSIGN ROLE LOGIC (Search + Checkbox) ---
	const handleAssignRoleClick = async () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select users to assign role");
			return;
		}
		// Fetch Roles
		try {
			const res = await fetch(`${BASE_URL_UM}/business-role/s-info`, { credentials: "include" });
			if (res.ok) {
				const data = await res.json();
				setAvailableRoles(data);
				setRoleSearchTerm("");
				setSelectedRoleToAssign(null); // Reset selection
				setShowRoleModal(true);
				setShowActionsDropdown(false);
			} else {
				toast.error("Failed to load roles");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error loading roles");
		}
	};

	const handleRoleSearchChange = (e) => {
		setRoleSearchTerm(e.target.value);
	};

	const toggleRoleSelection = (roleId) => {
		// Enforce Single Selection Logic
		if (selectedRoleToAssign === roleId) {
			setSelectedRoleToAssign(null); // Deselect -> Unassign
		} else {
			setSelectedRoleToAssign(roleId); // Select new
		}
	};

	const filteredRoles = availableRoles.filter(role => 
		role.businessRoleName.toLowerCase().includes(roleSearchTerm.toLowerCase()) || 
		role.businessRoleId.toLowerCase().includes(roleSearchTerm.toLowerCase())
	);

	const confirmRoleAssignment = async () => {
		if (!selectedRows || selectedRows.length === 0) {
			toast.warn("No users selected.");
			return;
		}

		// Debugging Logs
		console.log("Attempting Assignment...");
		console.log("Selected User IDs:", selectedRows);
		console.log("Selected Role ID:", selectedRoleToAssign);

		try {
			const payload = { 
				ids: selectedRows, 
				// Force null if undefined/empty string to ensure backend sees it as "unassign"
				roleId: selectedRoleToAssign ? selectedRoleToAssign : null 
			};

			const res = await fetch(`${BASE_URL_UM}/users/assign-role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				toast.success(selectedRoleToAssign ? "Role assigned successfully" : "Role unassigned successfully");
				fetchUsers();
				setSelectedRows([]);
				setShowRoleModal(false);
			} else {
				// Read the text error response from our updated Controller
				const errorText = await res.text();
				console.error("Assign Role Failed:", errorText);
				toast.error(`Failed: ${errorText}`);
			}
		} catch (err) {
			console.error(err);
			toast.error("Error assigning role");
		}
	};

	const handleGeneratePasswords = async () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select users to generate passwords for");
			return;
		}
		if (!window.confirm(`Are you sure you want to generate new passwords for ${selectedRows.length} users? This will send emails to them.`)) {
			return;
		}
		try {
			const res = await fetch(`${BASE_URL_UM}/users/generate-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ userIds: selectedRows })
			});
			if (res.ok) {
				toast.success("Passwords generated and emails sent successfully");
				setShowActionsDropdown(false);
				setSelectedRows([]); 
			} else {
				toast.error("Failed to generate passwords");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error generating passwords");
		}
	};

	// --- Column Settings Handlers ---
	const openColumnSettings = () => {
		setTempVisibleColumns([...visibleColumns]);
		const available = ALL_COLUMNS.filter(col => !visibleColumns.includes(col.key)).map(c => c.key);
		setTempAvailableColumns(available);
		setSelectedAvailable([]);
		setSelectedVisible([]);
		setShowColumnSettings(true);
	};

	const handleMoveToVisible = () => {
		setTempVisibleColumns([...tempVisibleColumns, ...selectedAvailable]);
		setTempAvailableColumns(tempAvailableColumns.filter(k => !selectedAvailable.includes(k)));
		setSelectedAvailable([]);
	};

	const handleMoveToAvailable = () => {
		setTempAvailableColumns([...tempAvailableColumns, ...selectedVisible]);
		setTempVisibleColumns(tempVisibleColumns.filter(k => !selectedVisible.includes(k)));
		setSelectedVisible([]);
	};

	const saveColumnSettings = () => {
		setVisibleColumns(tempVisibleColumns);
		setShowColumnSettings(false);
		toast.success("Columns updated");
	};

	// --- Filter Logic ---
	const updateAdvancedFilter = (key, field, value) => {
		setTempFilters(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
	};

	const toggleOperator = (key) => {
		setTempFilters(prev => ({ ...prev, [key]: { ...prev[key], operator: prev[key].operator === 'include' ? 'exclude' : 'include' } }));
	};

	const applyFilters = () => {
		setAdvancedFilters(tempFilters);
		setShowFilterPanel(false);
		setCurrentPage(1);
		toast.success("Filters Applied");
	};

	const handleRestoreFilters = () => {
		const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
		setTempFilters(fresh);
	};

	const handleGlobalReset = () => {
		setResetSpin(true);
		setSearchTerm("");
		setColumnSearch({});
		setQuickFilter("all_users");
		const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
		setAdvancedFilters(fresh);
		setTempFilters(fresh);
		setSortConfig({ key: 'createdAt', direction: 'desc' });
		setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
		setCurrentPage(1);
		setSelectedRows([]);
		setTimeout(() => {
			setResetSpin(false);
			toast.info("View reset to default");
		}, 500);
	};

	// --- View Management ---
	const handleSaveQuery = () => {
		const name = prompt("Enter a name for this view:", "New Custom View");
		if (name) {
			const newView = { id: Date.now().toString(), name: name, filters: tempFilters };
			const updatedViews = [...savedViews, newView];
			setSavedViews(updatedViews);
			localStorage.setItem("userViews", JSON.stringify(updatedViews));
			setQuickFilter(newView.id);
			setAdvancedFilters(tempFilters);
			toast.success(`View "${name}" saved!`);
		}
	};

	const handleDeleteView = (viewId) => {
		if(window.confirm("Are you sure you want to delete this view?")) {
			const updatedViews = savedViews.filter(v => v.id !== viewId);
			setSavedViews(updatedViews);
			localStorage.setItem("userViews", JSON.stringify(updatedViews));
			if (quickFilter === viewId) {
				setQuickFilter("all_users");
				handleRestoreFilters();
				setAdvancedFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
			}
			toast.success("View deleted.");
		}
	};

	const handleViewChange = (viewId) => {
		setQuickFilter(viewId);
		setCurrentPage(1);
		const selectedSavedView = savedViews.find(v => v.id === viewId);
		if (selectedSavedView) {
			setAdvancedFilters(selectedSavedView.filters);
			setTempFilters(selectedSavedView.filters);
			setShowFilterPanel(true);
		} else {
			// It's a system view, reset advanced filters
			const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
			setAdvancedFilters(fresh);
			setTempFilters(fresh);
		}
	};

	// --- Header Rendering ---
	const handleSort = (key, direction) => {
		setSortConfig({ key, direction });
		setActivePopupColumn(null);
	};

	const renderHeaderCell = (colKey) => {
		const colDef = ALL_COLUMNS.find(c => c.key === colKey);
		if (!colDef) return null;

		const isPopupOpen = activePopupColumn === colKey;

		return (
			<th key={colKey} style={{ position: 'relative' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div 
						onClick={() => handleSort(colKey, sortConfig.direction === 'asc' ? 'desc' : 'asc')} 
						style={{ cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}
					>
						{colDef.label} 
						{sortConfig.key === colKey && (
							sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon-active"/> : <ArrowDown size={14} className="sort-icon-active"/>
						)}
					</div>
					<button 
						onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : colKey); }} 
						className="userprof-header-menu-btn"
					>
						<MoreVertical size={16} color="#666"/>
					</button>
				</div>
				{isPopupOpen && (
					<div ref={popupRef} className="userprof-header-popup-menu" onClick={e => e.stopPropagation()}>
						<button onClick={() => handleSort(colKey, 'asc')}>
							<ArrowUp size={14}/> Ascending
						</button>
						<button onClick={() => handleSort(colKey, 'desc')}>
							<ArrowDown size={14}/> Descending
						</button>
						<div className="userprof-header-search-box">
							<input 
								type="text" 
								value={columnSearch[colKey] || ''} 
								onChange={e => setColumnSearch({ ...columnSearch, [colKey]: e.target.value })} 
								placeholder={`Search ${colDef.label}...`} 
								autoFocus
							/>
						</div>
					</div>
				)}
			</th>
		);
	};

	// ✅ FIXED: renderBodyCell is defined BEFORE return
	const renderBodyCell = (user, colKey) => {
		switch (colKey) {
			case "userId": return <td>{user.userId}</td>;
			case "username": return <td>{user.username}</td>;
			case "fullName": return <td>{`${user.firstName} ${user.lastName}`}</td>;
			case "businessRoleName": return <td>{user.businessRoleName || "#"}</td>;
			case "email": return <td>{user.email || "--"}</td>;
			case "phone": return <td>{user.phone || "--"}</td>;
			case "createdAt": return <td>{new Date(user.createdAt).toLocaleDateString("en-GB")}</td>;
			case "status":
				return (
					<td>
						<span style={{ 
							padding: '4px 8px', 
							borderRadius: '12px', 
							fontSize: '12px',
							backgroundColor: (user.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#e6f4ea' : '#fce8e6',
							color: (user.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#1e7e34' : '#d93025'
						}}>
							{user.status || "ACTIVE"}
						</span>
					</td>
				);
			default: return <td>--</td>;
		}
	};

	const filterFields = [
		{ label: "User ID", key: "userId" },
		{ label: "Username", key: "username" },
		{ label: "Name", key: "fullName" },
		{ label: "Email", key: "email" },
		{ label: "Phone", key: "phone" },
		{ label: "Role", key: "businessRoleName" },
		{ label: "Status", key: "status", type: "select", options: ["ACTIVE", "INACTIVE"] }
	];

	return (
		<div className="userprof-management-container">
			{/* Stats Section */}
			<div className="userprof-stats">
				<div className="userprof-stat-item">
					<div className="userprof-stat-badge"><div className="userprof-stat-badge__inner">{stats.total}</div></div>
					<div className="userprof-stat-content"><div className="userprof-stat-value">Total Users</div></div>
				</div>
				<div className="userprof-stat-item">
					<div className="userprof-stat-badge"><div className="userprof-stat-badge__inner">{stats.active}</div></div>
					<div className="userprof-stat-content"><div className="userprof-stat-value">Active Users</div></div>
				</div>
				<div className="userprof-stat-item">
					<div className="userprof-stat-badge"><div className="userprof-stat-badge__inner">{stats.inactive}</div></div>
					<div className="userprof-stat-content"><div className="userprof-stat-value">Inactive Users</div></div>
				</div>
			</div>

			{/* Actions Header */}
			<div className="userprof-actions">
				<div className="userprof-dropdown-container">
					<select className="userprof-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
						 <optgroup label="System Views">
							<option value="all_users">All Users ({stats.total})</option>
							<option value="active_users">Active Users ({stats.active})</option>
							<option value="inactive_users">Inactive Users ({stats.inactive})</option>
						</optgroup>
						{savedViews.length > 0 && (
							<optgroup label="My Custom Queries">
								{savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
							</optgroup>
						)}
					</select>
					<ChevronDown className="dropdown-arrow-icon" size={16} />
				</div>

				<div className="userprof-search-container">
					<input type="text" placeholder="Search users..." className="userprof-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
					<Search className="search-icon-small" size={20} />
				</div>

				<div className="userprof-action-icons">
					<button className="userprof-icon-button-modern" onClick={fetchUsers} title="Refresh">
						<RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
					</button>

					<button className="userprof-icon-button-modern" onClick={() => setShowSortModal(true)} title="Sort">
						<ArrowUpDown size={30} strokeWidth={1} />
					</button>

					<button className={`userprof-icon-button-modern ${showFilterPanel ? 'active-filter' : ''}`} onClick={() => { if(!showFilterPanel) setTempFilters(advancedFilters); setShowFilterPanel(!showFilterPanel); }} title="Filter">
						<Filter size={30} strokeWidth={1} />
					</button>

					<button className="userprof-icon-button-modern" onClick={openColumnSettings} title="Settings">
						<Settings size={30} strokeWidth={1} />
					</button>

					<button className="userprof-icon-button-modern" onClick={handleGlobalReset} title="Reset">
						<RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
					</button>

					{/* Actions Dropdown */}
					<div className="userprof-add-button-container" ref={actionRef}>
						<button className="userprof-dropdown-button" style={{position:'static', width:'100px', padding:'0 10px', backgroundColor:'#365486', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setShowActionsDropdown(!showActionsDropdown)}>
							Actions <ChevronDown size={16} style={{marginLeft:'5px'}} />
						</button>
						{showActionsDropdown && (
							<div className="userprof-action-modal-container">
								<ul className="userprof-action-modal-list">
									<li onClick={handleMassDeleteClick}>Mass Delete</li>
									<li onClick={handleChangeStatusClick}>Change Status</li>
									<li onClick={handleAssignRoleClick}>Assign Role</li>
									<li onClick={handleGeneratePasswords}>Generate Password</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Filter Panel */}
			{showFilterPanel && (
				<div className="userprof-filters-container">
					<div className="userprof-filters-header">
						<h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
						<button className="userprof-close-filters" onClick={() => setShowFilterPanel(false)}><X size={20}/></button>
					</div>
					<div className="userprof-filter-grid">
						{filterFields.map((field) => {
							const rule = tempFilters[field.key];
							return (
								<div key={field.key} className="userprof-filter-item">
									<label>{field.label}</label>
									<div className="userprof-input-group">
										{field.type === "select" ? (
											<select value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)}>
												<option value="">All</option>
												{field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
											</select>
										) : (
											<input type="text" value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)} placeholder={`Filter ${field.label}...`} />
										)}
										<button className={`userprof-operator-toggle ${rule.operator}`} onClick={() => toggleOperator(field.key)} title="Toggle Include/Exclude">
											{rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className="userprof-filter-footer">
						<div className="userprof-footer-left">
							<button className="userprof-reset-filters" onClick={handleRestoreFilters}><RotateCcw size={16} /> Restore</button>
							<button className="userprof-apply-btn" onClick={applyFilters}>Apply</button>
						</div>
						<div className="userprof-footer-right">
							 <button className="userprof-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
								<Copy size={16}/> Save Query As
							</button>
							<button className="userprof-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
								<Settings size={16}/> Organize Queries
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="userprof-table-container">
				<table className="userprof-table">
					<thead>
						<tr>
							<th className="checkbox-column">
								<input type="checkbox" className="userprof-custom-checkbox" checked={currentRecords.length > 0 && selectedRows.length === currentRecords.length} onChange={handleSelectAll} />
							</th>
							{visibleColumns.map(colKey => renderHeaderCell(colKey))}
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{currentRecords.length > 0 ? currentRecords.map((user) => (
							<tr key={user.id}>
								<td className="checkbox-column">
									<input type="checkbox" className="userprof-custom-checkbox" checked={selectedRows.includes(user.id)} onChange={() => toggleRowSelection(user.id)} />
								</td>
								{visibleColumns.map(colKey => (
									<React.Fragment key={colKey}>
										{renderBodyCell(user, colKey)}
									</React.Fragment>
								))}
								<td>
									<div className="userprof-table-action-buttons">
										<button 
											className="userprof-view-btn" 
											onClick={() => navigate(`/admin/userprofiles/details/${user.id}`)}
											title="View Details"
										>
											<Eye size={18} strokeWidth={1} />
										</button>
										<button 
											className="userprof-delete-btn" 
											onClick={() => {
												setUserToDelete(user.id);
												setShowDeleteConfirm(true);
											}}
											title="Delete"
										>
											<Trash2 size={18} strokeWidth={1} />
										</button>
									</div>
								</td>
							</tr>
						)) : (
							<tr><td colSpan={visibleColumns.length + 2} className="userprof-empty-state">No users found.</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="userprof-pagination">
				<div className="userprof-pagination-left">
					<span style={{ fontSize: "14px", fontWeight: "500", color: "#365486" }}>{selectedRows.length} Selected</span>
				</div>
				<div className="userprof-pagination-right">
					<span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}> Item Per Page </span>
					<select className="userprof-items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>

					<button className="userprof-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
					<button className="userprof-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>

					<div className="userprof-page-input-container">
						<input type="number" className="userprof-page-input" value={pageInput} min={1} max={totalPages || 1} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageInputCommit} onKeyDown={(e) => { if (e.key === 'Enter') { handlePageInputCommit(); e.target.blur(); } }} />
						<span className="userprof-page-numbers">of {totalPages || 1}</span>
					</div>

					<button className="userprof-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
					<button className="userprof-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog">
						<div className="userprof-dialog-header">
							<h3>Confirm Delete</h3>
							<p>Are you sure you want to delete {userToDelete ? "this user" : `${selectedRows.length} users`}?</p>
						</div>
						<div className="userprof-dialog-buttons">
							<button className="userprof-yes-button" onClick={handleDeleteConfirm}>Yes</button>
							<button className="userprof-no-button" onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}>No</button>
						</div>
					</div>
				</div>
			)}

			 {/* Change Status Modal */}
			 {showStatusModal && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog">
						<div className="userprof-dialog-header">
							<h3>Change Status</h3>
							<p>Set status for {selectedRows.length} selected users:</p>
						</div>
						<div style={{ margin: '20px 0' }}>
							<div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
								<label style={{ cursor: 'pointer', fontWeight: statusToApply === 'ACTIVE' ? 'bold' : 'normal' }}>
									<input type="radio" name="statusToApply" value="ACTIVE" checked={statusToApply === 'ACTIVE'} onChange={() => setStatusToApply("ACTIVE")} style={{ marginRight: '5px' }}/> Active
								</label>
								<label style={{ cursor: 'pointer', fontWeight: statusToApply === 'INACTIVE' ? 'bold' : 'normal' }}>
									<input type="radio" name="statusToApply" value="INACTIVE" checked={statusToApply === 'INACTIVE'} onChange={() => setStatusToApply("INACTIVE")} style={{ marginRight: '5px' }}/> Inactive
								</label>
							</div>
						</div>
						<div className="userprof-dialog-buttons">
							<button className="userprof-yes-button" onClick={confirmStatusChange}>Apply</button>
							<button className="userprof-no-button" onClick={() => setShowStatusModal(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			{/* UPDATED: Assign Role Modal with Checkbox List */}
			{showRoleModal && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog" style={{ width: 500 }}>
						<div className="userprof-dialog-header">
							<h3>Assign Role</h3>
							{/*<button className="userprof-close-assign" onClick={() => setShowRoleModal(false)}><X size={15} strokeWidth={2} style={{verticalAlign: 'middle', backgroundColor: 'transparent'}}/>Close</button> */}
						</div>
						<p style={{marginBottom:10, fontSize:14, color:'#666'}}>Select a role to assign to {selectedRows.length} users (deselect to unassign):</p>
						
						{/* Search Bar */}
						<div style={{marginBottom: 15, position: 'relative'}}>
							<input 
								type="text" 
								placeholder="Search roles..." 
								value={roleSearchTerm} 
								onChange={handleRoleSearchChange}
								style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
							/>
							<Search size={16} style={{position: 'absolute', right: 10, top: 10, color: '#888'}}/>
						</div>

						{/* Checkbox List */}
						<div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
							{filteredRoles.length === 0 ? (
								<p style={{padding:15, textAlign:'center', color:'#999'}}>No roles found.</p>
							) : (
								filteredRoles.map(role => (
									<div 
										key={role.id} 
										onClick={() => toggleRoleSelection(role.id)}
										style={{ 
											padding: '10px', 
											borderBottom: '1px solid #f0f0f0', 
											display: 'flex', 
											alignItems: 'center', 
											gap: '10px',
											cursor: 'pointer',
											backgroundColor: selectedRoleToAssign === role.id ? '#f0f9ff' : 'transparent'
										}}
									>
										<input 
											type="checkbox" 
											checked={selectedRoleToAssign === role.id} 
											onChange={() => {}} // Handle click in div
											style={{ width: 16, height: 16, cursor: 'pointer' }}
										/>
										<div>
											<div style={{fontWeight: 600, color: '#333'}}>{role.businessRoleName}</div>
											<div style={{fontSize: 12, color: '#888'}}>{role.businessRoleId}</div>
										</div>
									</div>
								))
							)}
						</div>

						<div className="userprof-dialog-buttons" style={{marginTop: 20}}>
							<button className="userprof-yes-button" onClick={confirmRoleAssignment}>
								{selectedRoleToAssign ? "Assign" : "Unassign"}
							</button>
							<button className="userprof-no-button" onClick={() => setShowRoleModal(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			{/* Sort Modal */}
			{showSortModal && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
						<div className="userprof-dialog-header"><h3>Sort</h3></div>
						<div className="userprof-sort-modal-body">
							<div style={{ marginBottom: 20 }}>
								<h4>Sort Order</h4>
								<div>
									<label style={{ display: 'block', margin: '5px 0' }}><input type="radio" name="sortOrder" checked={tempSortConfig.direction === 'asc'} onChange={() => setTempSortConfig(prev => ({ ...prev, direction: 'asc' }))} /> Ascending</label>
									<label style={{ display: 'block', margin: '5px 0' }}><input type="radio" name="sortOrder" checked={tempSortConfig.direction === 'desc'} onChange={() => setTempSortConfig(prev => ({ ...prev, direction: 'desc' }))} /> Descending</label>
								</div>
							</div>
							<div>
								<h4>Sort By</h4>
								<div>
									{ALL_COLUMNS.map((opt) => (
										<label key={opt.key} style={{ display: 'block', margin: '5px 0' }}>
											<input type="radio" name="sortBy" checked={tempSortConfig.key === opt.key} onChange={() => setTempSortConfig(prev => ({ ...prev, key: opt.key }))} /> {opt.label}
										</label>
									))}
								</div>
							</div>
						</div>
						<div className="userprof-dialog-buttons">
							<button className="userprof-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
							<button className="userprof-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
						</div>
					</div>
				</div>
			)}
			
			{/* Organize Queries Modal */}
			 {showOrganizeModal && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog" style={{ width: '400px' }}>
						<div className="userprof-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
							<h3>Manage Custom Queries</h3>
							<button onClick={() => setShowOrganizeModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
						</div>
						<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
							{savedViews.length === 0 ? (
								<p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No custom views saved.</p>
							) : (
								savedViews.map(view => (
									<div key={view.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
										<span>{view.name}</span>
										<button onClick={() => handleDeleteView(view.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }} title="Delete View">
											<Trash2 size={16} />
										</button>
									</div>
								))
							)}
						</div>
						<div style={{ marginTop: '15px', textAlign: 'right' }}>
							<button className="userprof-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
						</div>
					</div>
				</div>
			)}

			{/* Column Settings Modal (Dual List View) */}
			{showColumnSettings && (
				<div className="userprof-delete-confirm-overlay">
					<div className="userprof-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
						<div className="userprof-dialog-header" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
							<h3 style={{ margin: 0, color: '#0f1035' }}>Select Fields to Display</h3>
							<button onClick={() => setShowColumnSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
						</div>
						<div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
							<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
								<label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Available</label>
								<div style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#f9f9f9', padding: '5px' }}>
									{tempAvailableColumns.map(key => (
										<div key={key} onClick={() => setSelectedAvailable(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedAvailable.includes(key) ? '#dcf2f1' : 'transparent', color: selectedAvailable.includes(key) ? '#0f1035' : '#333' }}>
											{ALL_COLUMNS.find(c => c.key === key)?.label || key}
										</div>
									))}
								</div>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								<button onClick={handleMoveToVisible} disabled={selectedAvailable.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedAvailable.length > 0 ? '#365486' : '#eee', color: selectedAvailable.length > 0 ? '#fff' : '#999' }}><ChevronRight size={20} /></button>
								<button onClick={handleMoveToAvailable} disabled={selectedVisible.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedVisible.length > 0 ? '#365486' : '#eee', color: selectedVisible.length > 0 ? '#fff' : '#999' }}><ChevronLeft size={20} /></button>
							</div>
							<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
								<label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Visible</label>
								<div style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#fff', padding: '5px' }}>
									{tempVisibleColumns.map(key => (
										 <div key={key} onClick={() => setSelectedVisible(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedVisible.includes(key) ? '#dcf2f1' : 'transparent', color: selectedVisible.includes(key) ? '#0f1035' : '#333' }}>
											{ALL_COLUMNS.find(c => c.key === key)?.label || key}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="userprof-dialog-buttons" style={{ marginTop: '20px' }}>
							<button className="userprof-no-button" onClick={() => setShowColumnSettings(false)}>Cancel</button>
							<button className="userprof-yes-button" onClick={saveColumnSettings}>Save</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserProfile;