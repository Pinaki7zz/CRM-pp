import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
	Plus, RefreshCcw, RotateCcw, Filter, Search, ChevronDown, CircleUserRound,
	SquarePen, Trash2, X, CircleArrowLeft, CircleArrowRight,
	Eye, Settings, MoreVertical, ArrowUp, ArrowDown, ArrowUpDown,
	CheckCircle2, Ban, ChevronRight, ChevronLeft, Copy, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProductCategory.css";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

// --- CONSTANTS ---
const INITIAL_ADVANCED_STATE = {
	categoryId: { value: "", operator: "include" },
	name: { value: "", operator: "include" },
	parentCategory: { value: "", operator: "include" },
	status: { value: "", operator: "include" },
	createdAt: { value: "", operator: "include" }
};

// 1. Expanded Column Definitions to include Create/Edit fields
const ALL_COLUMNS = [
	{ key: 'categoryId', label: 'Category ID' },
	{ key: 'name', label: 'Category Name' },
	{ key: 'parentCategory', label: 'Parent Category' },
	{ key: 'status', label: 'Status' },
	{ key: 'productAssignmentAllowed', label: 'Assignment Allowed' },
	{ key: 'createdAt', label: 'Created At' },
	{ key: 'updatedAt', label: 'Updated At' }
];

// 2. Default Visible Columns (Standard View)
const DEFAULT_VISIBLE_COLUMNS = ["categoryId", "name", "parentCategory", "status", "createdAt", "actions"];

const ProductCategory = () => {
	const navigate = useNavigate();
	const actionRef = useRef(null);
	const popupRef = useRef(null);
	const [pageInput, setPageInput] = useState(1);

	// --- Data State ---
	const [allCategories, setAllCategories] = useState([]);
	
	// --- Selection & Modals ---
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [showActionsModal, setShowActionsModal] = useState(false);

	// --- Feature Modals ---
	const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
	const [showColumnControl, setShowColumnControl] = useState(false);
	const [showSortModal, setShowSortModal] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);

	// --- View State ---
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [resetSpin, setResetSpin] = useState(false);
	const [loading, setLoading] = useState(false);

	// --- Columns ---
	const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
	const [tempVisibleKeys, setTempVisibleKeys] = useState([]);
	const [tempAvailableKeys, setTempAvailableKeys] = useState([]);
	const [selectedAvailable, setSelectedAvailable] = useState([]);
	const [selectedVisible, setSelectedVisible] = useState([]);
	const [activePopupColumn, setActivePopupColumn] = useState(null);

	// --- Filtering & Searching ---
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch] = useDebounce(searchTerm, 400);
	const [columnSearch, setColumnSearch] = useState({});

	const [advancedFilters, setAdvancedFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	
	const [savedViews, setSavedViews] = useState([]);
	const [quickFilter, setQuickFilter] = useState("all_categories");
	
	const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
	const [tempSortConfig, setTempSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

	// --- Pagination ---
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// --- Helpers ---
	const getCellValue = (item, key) => {
		if (key === 'parentCategory') return item.parentCategory?.name || '--';
		if (key === 'createdAt' || key === 'updatedAt') {
			return item[key] ? new Date(item[key]).toLocaleDateString() : '--';
		}
		
		// Handle Boolean for Assignment
		if (key === 'productAssignmentAllowed') {
			return item.productAssignmentAllowed ? 'Yes' : 'No';
		}

		if (key === 'status') {
			const status = item.status || "ACTIVE";
			if (status === 'ACTIVE') return 'Active';
			if (status === 'INACTIVE') return 'Inactive';
			if (status === 'CLOSED') return 'Closed';
			return status;
		}
		
		return item[key] || '--';
	};

	// --- Fetch Data ---
	const fetchCategories = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(`${BASE_URL_SM}/product-category`);
			if (!res.ok) throw new Error("Failed to fetch");
			const data = await res.json();
			
			// Flatten the nested structure (Main -> Subcategories)
			let flatList = [];
			if (Array.isArray(data)) {
				data.forEach(mainCat => {
					// 1. Add Main Category
					flatList.push(mainCat);

					// 2. Add Sub Categories (if any)
					if (mainCat.subcategories && Array.isArray(mainCat.subcategories)) {
						mainCat.subcategories.forEach(sub => {
							flatList.push({
								...sub,
								parentCategory: { 
									name: mainCat.name, 
									id: mainCat.id 
								}
							});
						});
					}
				});
			}
			
			setAllCategories(flatList);
		} catch (err) {
			console.error(err);
			toast.error("Error fetching categories");
		} finally {
			setLoading(false);
			setRefreshSpin(false);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
		const saved = localStorage.getItem("categoryViews");
		if (saved) setSavedViews(JSON.parse(saved));
	}, [fetchCategories]);

	// --- Stats ---
	const stats = useMemo(() => {
		const total = allCategories.length;
		const active = allCategories.filter(c => c.status === 'ACTIVE').length;
		const inactive = allCategories.filter(c => c.status === 'INACTIVE').length;
		const closed = allCategories.filter(c => c.status === 'CLOSED').length;
		return { total, active, inactive, closed };
	}, [allCategories]);

	// --- FILTER, SORT, PAGINATE LOGIC (Client-Side) ---
	const processedCategories = useMemo(() => {
		let result = [...allCategories];

		if (quickFilter === 'active_categories') {
			result = result.filter(c => c.status === 'ACTIVE');
		} else if (quickFilter === 'inactive_categories') {
			result = result.filter(c => c.status === 'INACTIVE');
		} else if (quickFilter === 'closed_categories') {
			result = result.filter(c => c.status === 'CLOSED');
		} 

		if (debouncedSearch) {
			const lower = debouncedSearch.toLowerCase();
			result = result.filter(c => 
				String(c.name).toLowerCase().includes(lower) || 
				String(c.categoryId).toLowerCase().includes(lower)
			);
		}

		if (Object.keys(columnSearch).length > 0) {
			result = result.filter(item => {
				return Object.entries(columnSearch).every(([key, value]) => {
					if (!value) return true;
					const cellValue = String(getCellValue(item, key)).toLowerCase();
					return cellValue.includes(value.toLowerCase());
				});
			});
		}

		Object.keys(advancedFilters).forEach(key => {
			const rule = advancedFilters[key];
			if (!rule.value) return;
			const filterVal = rule.value.toLowerCase();

			result = result.filter(item => {
				let cellValue = "";
				if (key === 'parentCategory') cellValue = item.parentCategory?.name || "";
				else cellValue = String(item[key] || "");
				
				const match = cellValue.toLowerCase().includes(filterVal);
				return rule.operator === 'include' ? match : !match;
			});
		});

		if (sortConfig.key) {
			result.sort((a, b) => {
				let valA = a[sortConfig.key];
				let valB = b[sortConfig.key];
				
				if (sortConfig.key === 'parentCategory') {
					valA = a.parentCategory?.name || "";
					valB = b.parentCategory?.name || "";
				}
				if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
					valA = new Date(valA || 0).getTime();
					valB = new Date(valB || 0).getTime();
				}

				if (typeof valA === 'string') valA = valA.toLowerCase();
				if (typeof valB === 'string') valB = valB.toLowerCase();

				if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
				if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [allCategories, debouncedSearch, advancedFilters, sortConfig, columnSearch, quickFilter]);

	const totalPages = Math.ceil(processedCategories.length / limit) || 1;
	const currentCategories = processedCategories.slice((page - 1) * limit, page * limit);

	// --- ACTIONS ---
	const handleActionsButtonClick = (e) => {
		e.stopPropagation();
		// Toggle action modal regardless of selection
		setShowActionsModal(prev => !prev);
	};

	const handleExport = () => {
		if (selectedRows.length === 0) {
			toast.warn("Select categories to export");
			setShowActionsModal(false);
			return;
		}

		const data = allCategories.filter(c => selectedRows.includes(c.id));
		const safeString = (str) => (str || "").toString().replace(/"/g, '""');

		const csv = [
			"Category ID,Name,Parent Category,Status,Assignment Allowed,Created At,Updated At",
			...data.map(c => [
				safeString(c.categoryId),
				`"${safeString(c.name)}"`,
				`"${safeString(c.parentCategory?.name)}"`,
				safeString(c.status),
				c.productAssignmentAllowed ? "Yes" : "No",
				new Date(c.createdAt).toLocaleDateString(),
				c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : ""
			].join(","))
		].join("\n");

		const blob = new Blob([csv], {type: "text/csv"});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = "categories_export.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setShowActionsModal(false);
		toast.success("Exported successfully");
	};

	const handlePrint = () => {
		if (selectedRows.length === 0) {
			toast.warn("Select categories to print");
			setShowActionsModal(false);
			return;
		}

		const fullData = allCategories.filter(c => selectedRows.includes(c.id));
		const printWindow = window.open('', '_blank');
		const content = `
			<html><head><title>Print Categories</title>
			<style>
				body { font-family: sans-serif; padding: 20px; }
				.item { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
				h1 { color: #365486; }
			</style>
			</head><body>
			${fullData.map(c => `
				<div class="item">
					<h1>${c.name}</h1>
					<p><strong>ID:</strong> ${c.categoryId}</p>
					<p><strong>Parent:</strong> ${c.parentCategory?.name || '-'}</p>
					<p><strong>Status:</strong> ${c.status}</p>
					<p><strong>Assignment Allowed:</strong> ${c.productAssignmentAllowed ? "Yes" : "No"}</p>
					<p><strong>Created:</strong> ${new Date(c.createdAt).toLocaleString()}</p>
				</div>
			`).join('')}
			<script>window.onload=function(){window.print();window.close();}</script>
			</body></html>
		`;
		printWindow.document.write(content);
		printWindow.document.close();
		setShowActionsModal(false);
	};

	const handleDeleteConfirm = async () => {
		const ids = deleteId ? [deleteId] : selectedRows;
		try {
			await Promise.all(ids.map(id => fetch(`${BASE_URL_SM}/product-category/${id}`, { method: 'DELETE' })));
			toast.success("Deleted successfully");
			fetchCategories(); 
			setSelectedRows([]);
			setDeleteId(null);
		} catch(e) { toast.error("Delete failed"); }
		setShowDeleteConfirm(false);
	};

	const handleMassDeleteClick = () => {
		if (selectedRows.length === 0) {
			toast.warn("Select items to delete");
			setShowActionsModal(false);
			return;
		}
		setDeleteId(null);
		setShowDeleteConfirm(true);
		setShowActionsModal(false);
	};

	// --- NAVIGATION ---
	const handleViewClick = (e, id) => { e.stopPropagation(); navigate(`/products/productcategories/details/${id}`, {state: {mode: 'view'}}); };
	const handleEditClick = (e, id) => { e.stopPropagation(); navigate(`/products/productcategories/details/${id}`, {state: {mode: 'edit'}}); };
	
	const handleGlobalReset = () => {
		setResetSpin(true); setSearchTerm(""); 
		setAdvancedFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE))); 
		setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
		setColumnSearch({}); setQuickFilter("all_categories"); setPage(1);
		setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
		setTimeout(() => { fetchCategories(); setResetSpin(false); toast.info("Reset successful"); }, 500);
	};

	// --- UI LOGIC ---
	const handleSelectAll = () => {
		if (selectedRows.length === currentCategories.length) setSelectedRows([]);
		else setSelectedRows(currentCategories.map(c => c.id));
	};

	const toggleRowSelection = (id) => {
		setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
	};

	// --- FILTER LOGIC ---
	const updateAdvancedFilter = (key, field, value) => {
		setTempFilters(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
	};

	const toggleOperator = (key) => {
		setTempFilters(prev => ({ ...prev, [key]: { ...prev[key], operator: prev[key].operator === 'include' ? 'exclude' : 'include' } }));
	};

	const applyFilters = () => {
		setAdvancedFilters(tempFilters);
		setShowAdvancedFilter(false);
		setPage(1);
		toast.success("Filters Applied");
	};

	const handleRestoreFilters = () => {
		setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	};

	// --- COLUMN SETTINGS LOGIC ---
	const openColumnControl = () => {
		// Prepare Visible Keys
		const currentVisible = ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => col.key);
		// Prepare Available Keys (All - Visible)
		const currentAvailable = ALL_COLUMNS.filter(col => !visibleColumns.includes(col.key)).map(col => col.key);
		
		setTempVisibleKeys(currentVisible);
		setTempAvailableKeys(currentAvailable);
		setSelectedAvailable([]);
		setSelectedVisible([]);
		setShowColumnControl(true);
	};

	const handleMoveToVisible = () => {
		setTempVisibleKeys([...tempVisibleKeys, ...selectedAvailable]);
		setTempAvailableKeys(tempAvailableKeys.filter(k => !selectedAvailable.includes(k)));
		setSelectedAvailable([]);
	};

	const handleMoveToAvailable = () => {
		setTempAvailableKeys([...tempAvailableKeys, ...selectedVisible]);
		setTempVisibleKeys(tempVisibleKeys.filter(k => !selectedVisible.includes(k)));
		setSelectedVisible([]);
	};

	const saveColumnSettings = () => {
		// Ensure "actions" is preserved manually if it's not in ALL_COLUMNS
		const newVisible = [...tempVisibleKeys];
		if (!newVisible.includes('actions')) newVisible.push('actions');
		
		setVisibleColumns(newVisible);
		setShowColumnControl(false);
		toast.success("Columns updated");
	};

	// --- RENDER HELPERS ---
	const renderHeaderCell = (colKey) => {
		const colDef = ALL_COLUMNS.find(c => c.key === colKey);
		if (!colDef) return null;
		const isPopupOpen = activePopupColumn === colKey;

		return (
			<th key={colKey} style={{ position: 'relative' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => setSortConfig({ key: colKey, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} style={{ cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
						{colDef.label} 
						{sortConfig.key === colKey && (
							sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon-active"/> : <ArrowDown size={14} className="sort-icon-active"/>
						)}
					</div>
					<button onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : colKey); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
						<MoreVertical size={16} color="#666" />
					</button>
				</div>
				{isPopupOpen && (
					<div ref={popupRef} className="prodcat-header-popup-menu" onClick={e => e.stopPropagation()}>
						<button onClick={() => setSortConfig({ key: colKey, direction: 'asc' })}><ArrowUp size={14} /> Ascending</button>
						<button onClick={() => setSortConfig({ key: colKey, direction: 'desc' })}><ArrowDown size={14} /> Descending</button>
						<div className="popup-search">
							<input 
								type="text" 
								placeholder={`Search ${colDef.label}...`}
								autoFocus
								value={columnSearch[colKey] || ""}
								onChange={(e) => setColumnSearch({...columnSearch, [colKey]: e.target.value})}
							/>
						</div>
					</div>
				)}
			</th>
		);
	};

	const filterFields = [
		{ label: "Category ID", key: "categoryId" },
		{ label: "Category Name", key: "name" },
		{ label: "Parent Category", key: "parentCategory" },
		{ label: "Status", key: "status", type: "select", options: ["ACTIVE", "INACTIVE", "CLOSED"] },
		{ label: "Created At", key: "createdAt", type: "date" }
	];

	// Close Modals on click outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if(actionRef.current && !actionRef.current.contains(e.target)) setShowActionsModal(false);
			if(popupRef.current && !popupRef.current.contains(e.target)) setActivePopupColumn(null);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handlePageInputCommit = () => {
		const val = parseInt(pageInput);
		if(!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
		else setPageInput(page);
	};

	// --- VIEW MANAGEMENT ---
	const handleSaveQuery = () => {
		const name = prompt("Enter view name:", "New View");
		if (name) {
			const newView = { id: Date.now().toString(), name, filters: tempFilters };
			setSavedViews([...savedViews, newView]);
			localStorage.setItem("categoryViews", JSON.stringify([...savedViews, newView]));
			setQuickFilter(newView.id);
			toast.success("View saved");
		}
	};

	const handleDeleteView = (id) => {
		const updated = savedViews.filter(v => v.id !== id);
		setSavedViews(updated);
		localStorage.setItem("categoryViews", JSON.stringify(updated));
		if (quickFilter === id) handleGlobalReset();
		toast.success("View deleted");
	};

	return (
		<div className="prodcat-management-container">
			{/* Stats */}
			<div className="prodcat-stats">
				<div className="prodcat-stat-item">
					<div className="prodcat-stat-badge"><div className="prodcat-stat-badge__inner">{stats.total}</div></div>
					<div className="prodcat-stat-content"><div className="prodcat-stat-value">Total Categories</div></div>
				</div>
				<div className="prodcat-stat-item">
					<div className="prodcat-stat-badge"><div className="prodcat-stat-badge__inner">{stats.active}</div></div>
					<div className="prodcat-stat-content"><div className="prodcat-stat-value">Active Categories</div></div>
				</div>
				<div className="prodcat-stat-item">
					<div className="prodcat-stat-badge"><div className="prodcat-stat-badge__inner">{stats.inactive}</div></div>
					<div className="prodcat-stat-content"><div className="prodcat-stat-value">Inactive Categories</div></div>
				</div>
			</div>

			{/* Actions */}
			<div className="prodcat-actions">
				<div className="prodcat-dropdown-container">
					<CircleUserRound size={20} className="user-round-icon" />
					<select className="prodcat-dropdown-button" value={quickFilter} onChange={e => setQuickFilter(e.target.value)}>
						<optgroup label="System Views">
							<option value="all_categories">All Categories ({stats.total})</option>
							<option value="active_categories">Active Categories ({stats.active})</option>
							<option value="inactive_categories">Inactive Categories ({stats.inactive})</option>
							<option value="closed_categories">Closed Categories ({stats.closed})</option>
						</optgroup>
						{savedViews.length > 0 && (
							<optgroup label="My Views">
								{savedViews.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
							</optgroup>
						)}
					</select>
					<ChevronDown size={16} className="dropdown-arrow-icon" />
				</div>
				<div className="prodcat-search-container">
					<input type="text" placeholder="Search..." className="prodcat-search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
					<Search className="search-icon-small" size={20} />
				</div>
				<div className="prodcat-action-icons">
					<button className="prodcat-create-btn" onClick={() => navigate("/products/productcategories/create")}><Plus size={15} strokeWidth={2}/> New</button>
					<button className="prodcat-icon-button-modern" onClick={() => { setRefreshSpin(true); fetchCategories(); }}><RefreshCcw size={30} strokeWidth={1} className={refreshSpin?"rotate-once":""}/></button>
					<button className="prodcat-icon-button-modern" onClick={() => setShowSortModal(true)}><ArrowUpDown size={30} strokeWidth={1} /></button>
					<button className={`prodcat-icon-button-modern ${showAdvancedFilter?'active-filter':''}`} onClick={() => { if(!showAdvancedFilter) setTempFilters(advancedFilters); setShowAdvancedFilter(!showAdvancedFilter); }}><Filter size={30} strokeWidth={1}/></button>
					<button className="prodcat-icon-button-modern" onClick={openColumnControl}><Settings size={30} strokeWidth={1}/></button>
					<button className="prodcat-icon-button-modern" onClick={handleGlobalReset}><RotateCcw size={30} className={resetSpin?"rotate-once":""} strokeWidth={1} /></button>
					
					<div className="prodcat-action-button-container" ref={actionRef}>
						<button className="prodcat-action-button" onClick={handleActionsButtonClick}>Actions <ChevronDown size={16}/></button>
						{showActionsModal && (
							<div className="prodcat-action-modal-container">
								<ul className="prodcat-action-modal-list">
									<li onClick={handleMassDeleteClick}>Mass Delete</li>
									<li onClick={handleExport}>Export</li>
									<li onClick={handlePrint}>Print View</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Filters Panel */}
			{showAdvancedFilter && (
				<div className="prodcat-filters-container">
					<div className="prodcat-filters-header">
						<h3><Filter size={18} style={{marginRight:'8px'}}/> Filter</h3>
						<button className="prodcat-close-filters" onClick={()=>setShowAdvancedFilter(false)}><X size={24}/></button>
					</div>
					<div className="advanced-filter-grid">
						{filterFields.map((field) => {
							const rule = tempFilters[field.key];
							return (
								<div key={field.key} className="advanced-filter-item">
									<label>{field.label}</label>
									<div className="advanced-input-group">
										{field.type === 'select' ? (
											<select value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)}>
												<option value="">All</option>
												{field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
											</select>
										) : (
											<input 
												type={field.type || "text"}
												value={rule.value} 
												onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)} 
												placeholder={`Filter ${field.label}...`} 
											/>
										)}
										<button className={`operator-toggle ${rule.operator}`} onClick={() => toggleOperator(field.key)} title="Toggle Include/Exclude">
											{rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className="advanced-filter-footer">
						<div className="prodcat-footer-left">
							<button className="prodcat-reset-btn-text" onClick={handleRestoreFilters}><RotateCcw size={16} /> Restore</button>
							<button className="prodcat-apply-btn" onClick={applyFilters}>Apply</button>
						</div>
						<div className="prodcat-footer-right">
							 <button className="prodcat-reset-btn-text" onClick={handleSaveQuery}><Copy size={16}/> Save Query As</button>
							 <button className="prodcat-reset-btn-text" onClick={() => setShowOrganizeModal(true)}><Settings size={16}/> Organize</button>
						</div>
					</div>
				</div>
			)}

			{/* Column Settings Modal */}
			{showColumnControl && (
				<div className="prodcat-delete-confirm-overlay">
					<div className="prodcat-column-control-dialog">
						<div className="dialog-header"><h3>Manage Columns</h3><button onClick={()=>setShowColumnControl(false)}><X size={20}/></button></div>
						<div className="column-control-body">
							<div className="column-list">
								<label>Available</label>
								<div className="list-box">{tempAvailableKeys.map(k=><div key={k} onClick={()=>setSelectedAvailable(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k])} className={selectedAvailable.includes(k)?'selected':''}>{ALL_COLUMNS.find(c=>c.key===k)?.label}</div>)}</div>
							</div>
							<div className="column-actions">
								<button onClick={handleMoveToVisible} disabled={selectedAvailable.length===0}><ChevronRight/></button>
								<button onClick={handleMoveToAvailable} disabled={selectedVisible.length===0}><ChevronLeft/></button>
							</div>
							<div className="column-list">
								<label>Visible</label>
								<div className="list-box">{tempVisibleKeys.map(k=><div key={k} onClick={()=>setSelectedVisible(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k])} className={selectedVisible.includes(k)?'selected':''}>{ALL_COLUMNS.find(c=>c.key===k)?.label}</div>)}</div>
							</div>
						</div>
						<div className="prodcat-dialog-buttons"><button className="prodcat-no-button" onClick={()=>setShowColumnControl(false)}>Cancel</button><button className="prodcat-yes-button" onClick={saveColumnSettings}>Save</button></div>
					</div>
				</div>
			)}

			{/* Organize Views Modal */}
			{showOrganizeModal && (
				<div className="prodcat-delete-confirm-overlay">
					<div className="prodcat-delete-confirm-dialog">
						<div className="prodcat-dialog-header"><h3>Manage Views</h3></div>
						<div style={{maxHeight:'300px', overflowY:'auto', textAlign:'left'}}>
							{savedViews.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>No saved views</p> : savedViews.map(v => (
								<div key={v.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
									<span>{v.name}</span>
									<button onClick={() => handleDeleteView(v.id)} style={{border:'none', background:'transparent', cursor:'pointer', color:'red'}}><Trash2 size={16}/></button>
								</div>
							))}
						</div>
						<div className="prodcat-dialog-buttons">
							<button className="prodcat-no-button" onClick={()=>setShowOrganizeModal(false)}>Close</button>
						</div>
					</div>
				</div>
			)}

			{/* Sort Modal */}
			{showSortModal && (
				<div className="prodcat-delete-confirm-overlay">
					<div className="prodcat-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
						<div className="dialog-header"><h3>Sort</h3></div>
						<div className="sort-modal-body">
							<h4>Sort Order</h4>
							<div className="radio-group">
								<label style={{display:'block', margin:'5px 0'}}><input type="radio" checked={tempSortConfig.direction==='asc'} onChange={()=>setTempSortConfig({...tempSortConfig, direction:'asc'})}/> Ascending</label>
								<label style={{display:'block', margin:'5px 0'}}><input type="radio" checked={tempSortConfig.direction==='desc'} onChange={()=>setTempSortConfig({...tempSortConfig, direction:'desc'})}/> Descending</label>
							</div>
							<h4>Sort By</h4>
							<div className="radio-group scrollable">
								{ALL_COLUMNS.map(c=><label key={c.key} style={{display:'block', margin:'5px 0'}}><input type="radio" checked={tempSortConfig.key===c.key} onChange={()=>setTempSortConfig({...tempSortConfig, key:c.key})}/> {c.label}</label>)}
							</div>
						</div>
						<div className="prodcat-dialog-buttons"><button className="prodcat-no-button" onClick={()=>setShowSortModal(false)}>Cancel</button><button className="prodcat-yes-button" onClick={()=>{setSortConfig(tempSortConfig); setShowSortModal(false);}}>OK</button></div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="prodcat-table-container">
				<table className="prodcat-table">
					<thead>
						<tr>
							<th className="checkbox-column"><input type="checkbox" className="prodcat-custom-checkbox" onChange={handleSelectAll} checked={currentCategories.length>0 && selectedRows.length===currentCategories.length}/></th>
							{visibleColumns.map(colKey => renderHeaderCell(colKey))}
							{visibleColumns.includes("actions") && <th>Actions</th>}
						</tr>
					</thead>
					<tbody>
						{currentCategories.length === 0 ? <tr><td colSpan="100%" className="prodcat-empty-state" style={{alignContent:"center", textAlign:"center"}}>No Categories Found</td></tr> : 
						currentCategories.map(main => (
							<tr key={main.id} className={selectedRows.includes(main.id) ? "selected-row" : ""}>
								<td className="checkbox-column"><input type="checkbox" className="prodcat-custom-checkbox" checked={selectedRows.includes(main.id)} onChange={()=>toggleRowSelection(main.id)}/></td>
								{visibleColumns.map(colKey => {
									if (colKey === 'actions') return null;
									return (
										<td key={colKey}>
											{getCellValue(main, colKey)}
										</td>
									);
								})}
								{visibleColumns.includes("actions") && (
									<td>
										<div className="prodcat-table-action-buttons">
											<button className="prodcat-view-btn" onClick={e => handleViewClick(e, main.id)}><Eye size={18} strokeWidth={1}/></button>
											<button className="prodcat-edit-btn" onClick={e => handleEditClick(e, main.id)}><SquarePen size={18} strokeWidth={1}/></button>
											<button className="prodcat-delete-btn" onClick={e => { setDeleteId(main.id); setShowDeleteConfirm(true); }}><Trash2 size={18} strokeWidth={1}/></button>
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="prodcat-pagination">
				<div className="prodcat-pagination-left"><span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}>{selectedRows.length} Selected</span></div>
				<div className="prodcat-pagination-right">
					<span>Item Per Page</span>
					<select className="prodcat-items-per-page" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
						<option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
					</select>
					
					<button className="prodcat-page-btn" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
					<button className="prodcat-page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>
					
					<div className="prodcat-page-input-container">
						<input className="prodcat-page-input" value={pageInput} onChange={e=>setPageInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handlePageInputCommit()} onBlur={handlePageInputCommit} />
						<span className="prodcat-page-numbers">of {totalPages || 1}</span>
					</div>

					<button className="prodcat-page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
					<button className="prodcat-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="prodcat-delete-confirm-overlay">
					<div className="prodcat-delete-confirm-dialog">
						<div className="prodcat-dialog-header"><h3>Confirm Delete</h3></div>
						<div className="prodcat-dialog-buttons">
							<button className="prodcat-yes-button" onClick={handleDeleteConfirm}>Yes</button>
							<button className="prodcat-no-button" onClick={()=>setShowDeleteConfirm(false)}>No</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductCategory;