import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	Plus,
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
	SquarePen // Added for Edit Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./CustomerContact.css";

const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

// --- Constants ---
const INITIAL_ADVANCED_STATE = {
	name: { value: "", operator: "include" },
	contactId: { value: "", operator: "include" },
	email: { value: "", operator: "include" },
	phone: { value: "", operator: "include" },
	accountName: { value: "", operator: "include" },
	city: { value: "", operator: "include" },
	status: { value: "", operator: "include" },
	role: { value: "", operator: "include" }
};

const ALL_COLUMNS = [
	{ key: "name", label: "Contact Name" },
	{ key: "contactId", label: "Contact ID" },
	{ key: "accountId", label: "Account ID" },
	{ key: "role", label: "Role" },
	{ key: "email", label: "Email" },
	{ key: "phone", label: "Phone" },
	{ key: "billingCountry", label: "Billing Country" },
	{ key: "status", label: "Status" }
];

const DEFAULT_VISIBLE_COLUMNS = ["name", "contactId", "role", "email", "phone", "status"];

const getRoleLabel = (role) => {
	const labels = {
		MANAGER: "Manager",
		DECISION_MAKER: "Decision Maker",
		STAKE_HOLDER: "Stake Holder",
		TECHNICAL_EVALUATOR: "Technical Evaluator",
		EXECUTIVE: "Executive",
		END_USER: "End User",
		OTHERS: "Others",
	};
	return labels[role] || role || "--";
};

const CustomerContact = () => {
	// --- State Management ---
	const [contacts, setContacts] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [contactToDelete, setContactToDelete] = useState(null); // Track single delete
	const [searchTerm, setSearchTerm] = useState("");
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [resetSpin, setResetSpin] = useState(false);

	// --- UI Controls ---
	const [showFilterPanel, setShowFilterPanel] = useState(false);
	const [showActionsDropdown, setShowActionsDropdown] = useState(false); // Actions Dropdown
	const [showSortModal, setShowSortModal] = useState(false);
	const [showColumnSettings, setShowColumnSettings] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);
	
	// View Management
	const [quickFilter, setQuickFilter] = useState("all_contacts");
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

	const fetchContacts = async () => {
		try {
			setRefreshSpin(true);
			const res = await fetch(`${BASE_URL_AC}/contact`);
			if (!res.ok) throw new Error("Fetch failed");
			const data = await res.json();
			setContacts(data);
			setTimeout(() => setRefreshSpin(false), 500);
		} catch (err) {
			console.error("Error fetching contacts:", err);
			toast.error("Error fetching contacts");
			setRefreshSpin(false);
		}
	};

	useEffect(() => {
		fetchContacts();
		const saved = localStorage.getItem("contactViews");
		if (saved) setSavedViews(JSON.parse(saved));
	}, []);

	// --- Stats Calculations ---
	const stats = useMemo(() => {
		const activeCount = contacts.filter(c => (c.contactStatus || "active").toLowerCase() === 'active').length;
		const inactiveCount = contacts.filter(c => (c.contactStatus || "").toLowerCase() === 'inactive').length;
		return { total: contacts.length, active: activeCount, inactive: inactiveCount };
	}, [contacts]);

	// --- Data Processing (Filter & Sort) ---
	const processedContacts = useMemo(() => {
		let result = [...contacts];

		// 1. Quick Filters / System Views
		if (quickFilter === "active_contacts") {
			result = result.filter(c => (c.contactStatus || "active").toLowerCase() === 'active');
		} else if (quickFilter === "inactive_contacts") {
			result = result.filter(c => (c.contactStatus || "").toLowerCase() === 'inactive');
		}

		// 2. Global Search
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(c => 
				(c.firstName + " " + c.lastName).toLowerCase().includes(term) ||
				(c.email || "").toLowerCase().includes(term) ||
				(c.accountId || "").toLowerCase().includes(term) ||
				(c.phone || "").toLowerCase().includes(term)
			);
		}

		// 3. Column Specific Search
		Object.keys(columnSearch).forEach(key => {
			const val = columnSearch[key]?.toLowerCase();
			if (val) {
				result = result.filter(item => {
					let cellVal = "";
					if (key === 'name') cellVal = item.firstName + " " + item.lastName;
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
				if (key === 'name') cellValue = item.firstName + " " + item.lastName;
				else if (key === 'accountName') cellValue = item.accountName || item.accountId || "";
				else if (key === 'status') cellValue = item.contactStatus || "";
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

				if (sortConfig.key === 'name') {
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
	}, [contacts, quickFilter, searchTerm, advancedFilters, sortConfig, columnSearch]);

	// --- Pagination Logic ---
	const indexOfLastRecord = currentPage * itemsPerPage;
	const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
	const currentRecords = processedContacts.slice(indexOfFirstRecord, indexOfLastRecord);
	const totalPages = Math.ceil(processedContacts.length / itemsPerPage);

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
		else setSelectedRows(currentRecords.map(c => c.contactId));
	};

	const handleDeleteConfirm = async () => {
		const idsToDelete = contactToDelete ? [contactToDelete] : selectedRows;
		try {
			await Promise.all(idsToDelete.map(id => fetch(`${BASE_URL_AC}/contact/${id}`, { method: "DELETE" })));
			toast.success("Contact(s) deleted successfully");
			setShowDeleteConfirm(false);
			setContactToDelete(null);
			setSelectedRows([]);
			fetchContacts();
		} catch (err) {
			toast.error("Error deleting contacts");
		}
	};

	const handleMassDeleteClick = () => {
		if (selectedRows.length === 0) {
			toast.warn("Please select contacts to delete");
			return;
		}
		setContactToDelete(null); // Ensure we are in mass delete mode
		setShowDeleteConfirm(true);
		setShowActionsDropdown(false);
	};

	const handleImportContacts = () => {
		toast.info("Import feature coming soon!");
		setShowActionsDropdown(false);
	};

	const handleEditClick = (e, contactId) => {
		e.stopPropagation();
		navigate(`/customers/contacts/details/${contactId}`, { state: { startInEditMode: true } });
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
		setQuickFilter("all_contacts");
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
			localStorage.setItem("contactViews", JSON.stringify(updatedViews));
			setQuickFilter(newView.id);
			setAdvancedFilters(tempFilters);
			toast.success(`View "${name}" saved!`);
		}
	};

	const handleDeleteView = (viewId) => {
		if(window.confirm("Are you sure you want to delete this view?")) {
			const updatedViews = savedViews.filter(v => v.id !== viewId);
			setSavedViews(updatedViews);
			localStorage.setItem("contactViews", JSON.stringify(updatedViews));
			if (quickFilter === viewId) {
				setQuickFilter("all_contacts");
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
						className="ccp-header-menu-btn"
					>
						<MoreVertical size={16} color="#666"/>
					</button>
				</div>
				{isPopupOpen && (
					<div ref={popupRef} className="ccp-header-popup-menu" onClick={e => e.stopPropagation()}>
						<button onClick={() => handleSort(colKey, 'asc')}>
							<ArrowUp size={14}/> Ascending
						</button>
						<button onClick={() => handleSort(colKey, 'desc')}>
							<ArrowDown size={14}/> Descending
						</button>
						<div className="ccp-header-search-box">
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

	const renderBodyCell = (contact, colKey) => {
		switch (colKey) {
			case "name": return <td>{`${contact.firstName} ${contact.lastName}`}</td>;
			case "contactId": return <td>{contact.contactId}</td>;
			case "accountId": return <td>{contact.accountId || "--"}</td>;
			case "role": return <td>{getRoleLabel(contact.role)}</td>;
			case "email": return <td>{contact.email || "--"}</td>;
			case "phone": return <td>{contact.phone || "--"}</td>;
			case "billingCountry": return <td>{contact.billingCountry || "--"}</td>;
			case "status":
				return (
					<td>
						<span style={{ 
							padding: '4px 8px', 
							borderRadius: '12px', 
							fontSize: '12px',
							backgroundColor: (contact.contactStatus || 'Active') === 'Active' ? '#e6f4ea' : '#fce8e6',
							color: (contact.contactStatus || 'Active') === 'Active' ? '#1e7e34' : '#d93025'
						}}>
							{contact.contactStatus || "Active"}
						</span>
					</td>
				);
			default: return <td>--</td>;
		}
	};

	const filterFields = [
		{ label: "Contact Name", key: "name" },
		{ label: "Contact ID", key: "contactId" },
		{ label: "Email", key: "email" },
		{ label: "Phone", key: "phone" },
		{ label: "Account Name", key: "accountName" },
		{ label: "City", key: "city" },
		{ label: "Status", key: "status", type: "select", options: ["Active", "Inactive"] },
		{ label: "Role", key: "role" }
	];

	return (
		<div className="ccp-contact-management-container">
			{/* Stats Section */}
			<div className="ccp-contact-stats">
				<div className="ccp-stat-item">
					<div className="ccp-stat-badge"><div className="ccp-stat-badge__inner">{stats.total}</div></div>
					<div className="ccp-stat-content"><div className="ccp-stat-value">Total Contacts</div></div>
				</div>
				<div className="ccp-stat-item">
					<div className="ccp-stat-badge"><div className="ccp-stat-badge__inner">{stats.active}</div></div>
					<div className="ccp-stat-content"><div className="ccp-stat-value">Active Contacts</div></div>
				</div>
				<div className="ccp-stat-item">
					<div className="ccp-stat-badge"><div className="ccp-stat-badge__inner">{stats.inactive}</div></div>
					<div className="ccp-stat-content"><div className="ccp-stat-value">Inactive Contacts</div></div>
				</div>
			</div>

			{/* Actions Header */}
			<div className="ccp-contact-actions">
				<div className="ccp-contact-dropdown-container">
					<select className="ccp-contact-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
						 <optgroup label="System Views">
							<option value="all_contacts">All Contacts ({stats.total})</option>
							<option value="active_contacts">Active Contacts ({stats.active})</option>
							<option value="inactive_contacts">Inactive Contacts ({stats.inactive})</option>
						</optgroup>
						{savedViews.length > 0 && (
							<optgroup label="My Custom Queries">
								{savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
							</optgroup>
						)}
					</select>
					<ChevronDown className="dropdown-arrow-icon" size={16} />
				</div>

				<div className="ccp-search-container">
					<input type="text" placeholder="Search contacts..." className="ccp-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
					<Search className="ccp-search-icon-small" size={20} />
				</div>

				<div className="ccp-action-icons">
					{/* Direct Create Button */}
					<button className="ccp-contact-create-btn" onClick={() => navigate("/customers/contacts/create")}>
						<Plus size={18} strokeWidth={2} /> New
					</button>

					<button className="ccp-icon-button-modern" onClick={fetchContacts} title="Refresh">
						<RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
					</button>

					<button className="ccp-icon-button-modern" onClick={() => setShowSortModal(true)} title="Sort">
						<ArrowUpDown size={30} strokeWidth={1} />
					</button>

					<button className={`ccp-icon-button-modern ${showFilterPanel ? 'active-filter' : ''}`} onClick={() => { if(!showFilterPanel) setTempFilters(advancedFilters); setShowFilterPanel(!showFilterPanel); }} title="Filter">
						<Filter size={30} strokeWidth={1} />
					</button>

					<button className="ccp-icon-button-modern" onClick={openColumnSettings} title="Settings">
						<Settings size={30} strokeWidth={1} />
					</button>

					<button className="ccp-icon-button-modern" onClick={handleGlobalReset} title="Reset">
						<RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
					</button>

					{/* Actions Dropdown */}
					<div className="ccp-add-button-container" ref={actionRef}>
						<button className="ccp-contact-dropdown-button" style={{position:'static', width:'100px', padding:'0 10px', backgroundColor:'#365486', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setShowActionsDropdown(!showActionsDropdown)}>
							Actions <ChevronDown size={16} style={{marginLeft:'5px'}} />
						</button>
						{showActionsDropdown && (
							<div className="ccp-contact-action-modal-container">
								<ul className="ccp-contact-action-modal-list">
									<li onClick={handleMassDeleteClick}>Mass Delete</li>
									<li onClick={handleImportContacts}>Import Contact</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Filter Panel */}
			{showFilterPanel && (
				<div className="ccp-filters-container">
					<div className="ccp-filters-header">
						<h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
						<button className="ccp-close-filters" onClick={() => setShowFilterPanel(false)}><X size={20}/></button>
					</div>
					<div className="ccp-filter-grid">
						{filterFields.map((field) => {
							const rule = tempFilters[field.key];
							return (
								<div key={field.key} className="ccp-filter-item">
									<label>{field.label}</label>
									<div className="ccp-input-group">
										{field.type === "select" ? (
											<select value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)}>
												<option value="">All</option>
												{field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
											</select>
										) : (
											<input type="text" value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)} placeholder={`Filter ${field.label}...`} />
										)}
										<button className={`ccp-operator-toggle ${rule.operator}`} onClick={() => toggleOperator(field.key)} title="Toggle Include/Exclude">
											{rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className="ccp-filter-footer">
						<div className="ccp-footer-left">
							<button className="ccp-reset-filters" onClick={handleRestoreFilters}><RotateCcw size={16} /> Restore</button>
							<button className="ccp-apply-btn" onClick={applyFilters}>Apply</button>
						</div>
						<div className="ccp-footer-right">
							 <button className="ccp-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
								<Copy size={16}/> Save Query As
							</button>
							<button className="ccp-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
								<Settings size={16}/> Organize Queries
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="ccp-contact-table-container">
				<table className="ccp-contact-table">
					<thead>
						<tr>
							<th className="checkbox-column">
								<input type="checkbox" className="ccp-custom-checkbox" checked={currentRecords.length > 0 && selectedRows.length === currentRecords.length} onChange={handleSelectAll} />
							</th>
							{visibleColumns.map(colKey => renderHeaderCell(colKey))}
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{currentRecords.length > 0 ? currentRecords.map((contact) => (
							<tr key={contact.contactId}>
								<td className="checkbox-column">
									<input type="checkbox" className="ccp-custom-checkbox" checked={selectedRows.includes(contact.contactId)} onChange={() => toggleRowSelection(contact.contactId)} />
								</td>
								{visibleColumns.map(colKey => renderBodyCell(contact, colKey))}
								<td>
									<div className="ccp-table-action-buttons">
										<button 
											className="ccp-view-btn" 
											onClick={() => navigate(`/customers/contacts/details/${contact.contactId}`)}
											title="View Details"
										>
											<Eye size={18} strokeWidth={1} />
										</button>
										<button 
											className="ccp-edit-btn" 
											onClick={(e) => handleEditClick(e, contact.contactId)}
											title="Edit"
										>
											<SquarePen size={18} strokeWidth={1} />
										</button>
										<button 
											className="ccp-delete-btn" 
											onClick={() => {
												setContactToDelete(contact.contactId);
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
							<tr><td colSpan={visibleColumns.length + 2} className="ccp-empty-state">No contacts found.</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="ccp-pagination">
				<div className="ccp-pagination-left">
					<span style={{ fontSize: "14px", fontWeight: "500", color: "#365486" }}>{selectedRows.length} Selected</span>
				</div>
				<div className="ccp-pagination-right">
					<span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}> Item Per Page </span>
					<select className="ccp-items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>

					<button className="ccp-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
					<button className="ccp-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>

					<div className="ccp-page-input-container">
						<input type="number" className="ccp-page-input" value={pageInput} min={1} max={totalPages || 1} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageInputCommit} onKeyDown={(e) => { if (e.key === 'Enter') { handlePageInputCommit(); e.target.blur(); } }} />
						<span className="ccp-page-numbers">of {totalPages || 1}</span>
					</div>

					<button className="ccp-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
					<button className="ccp-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="ccp-delete-confirm-overlay">
					<div className="ccp-delete-confirm-dialog">
						<div className="ccp-dialog-header">
							<h3>Confirm Delete</h3>
							<p>Are you sure you want to delete {contactToDelete ? "this contact" : `${selectedRows.length} contacts`}?</p>
						</div>
						<div className="ccp-dialog-buttons">
							<button className="ccp-yes-button" onClick={handleDeleteConfirm}>Yes</button>
							<button className="ccp-no-button" onClick={() => { setShowDeleteConfirm(false); setContactToDelete(null); }}>No</button>
						</div>
					</div>
				</div>
			)}

			{/* Sort Modal */}
			{showSortModal && (
				<div className="ccp-delete-confirm-overlay">
					<div className="ccp-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
						<div className="ccp-dialog-header"><h3>Sort</h3></div>
						<div className="ccp-sort-modal-body">
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
						<div className="ccp-dialog-buttons">
							<button className="ccp-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
							<button className="ccp-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
						</div>
					</div>
				</div>
			)}
			
			{/* Organize Queries Modal */}
			 {showOrganizeModal && (
				<div className="ccp-delete-confirm-overlay">
					<div className="ccp-delete-confirm-dialog" style={{ width: '400px' }}>
						<div className="ccp-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
							<button className="ccp-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
						</div>
					</div>
				</div>
			)}

			{/* Column Settings Modal (Dual List View) */}
			{showColumnSettings && (
				<div className="ccp-delete-confirm-overlay">
					<div className="ccp-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
						<div className="ccp-dialog-header" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
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
						<div className="ccp-dialog-buttons" style={{ marginTop: '20px' }}>
							<button className="ccp-no-button" onClick={() => setShowColumnSettings(false)}>Cancel</button>
							<button className="ccp-yes-button" onClick={saveColumnSettings}>Save</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomerContact;