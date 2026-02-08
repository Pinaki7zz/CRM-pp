import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    RefreshCcw,
    Search,
    ChevronDown,
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
    Plus,
    SquarePen,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AccessManagement.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

// --- Constants ---
const INITIAL_ADVANCED_STATE = {
    businessRoleId: { value: "", operator: "include" },
    businessRoleName: { value: "", operator: "include" },
    description: { value: "", operator: "include" },
    status: { value: "", operator: "include" },
};

const ALL_COLUMNS = [
    { key: "businessRoleId", label: "Role ID" },
    { key: "businessRoleName", label: "Role Name" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" }
];

const DEFAULT_VISIBLE_COLUMNS = ["businessRoleId", "businessRoleName", "description", "status", "createdAt"];

const AccessManagement = () => {
    // --- State Management ---
    const [roles, setRoles] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshSpin, setRefreshSpin] = useState(false);
    const [resetSpin, setResetSpin] = useState(false);

    // --- UI Controls ---
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showActionsDropdown, setShowActionsDropdown] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [showOrganizeModal, setShowOrganizeModal] = useState(false);

    // View Management
    const [quickFilter, setQuickFilter] = useState("all_roles");
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

    const fetchRoles = async () => {
        try {
            setRefreshSpin(true);
            const res = await fetch(`${BASE_URL_UM}/business-role/s-info`, { method: "GET", credentials: "include" });
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setRoles(data);
            setTimeout(() => setRefreshSpin(false), 500);
        } catch (err) {
            console.error("Error fetching roles:", err);
            toast.error("Error fetching roles");
            setRefreshSpin(false);
        }
    };

    useEffect(() => {
        fetchRoles();
        const saved = localStorage.getItem("roleViews");
        if (saved) setSavedViews(JSON.parse(saved));
    }, []);

    // --- Stats Calculations ---
    const stats = useMemo(() => {
        const activeCount = roles.filter(c => (c.status || "ACTIVE").toUpperCase() === 'ACTIVE').length;
        const inactiveCount = roles.filter(c => (c.status || "").toUpperCase() === 'INACTIVE').length;
        return { total: roles.length, active: activeCount, inactive: inactiveCount };
    }, [roles]);

    // --- Data Processing (Filter & Sort) ---
    const processedRoles = useMemo(() => {
        let result = [...roles];

        // 1. Quick Filters
        if (quickFilter === "active_roles") {
            result = result.filter(c => (c.status || "ACTIVE").toUpperCase() === 'ACTIVE');
        } else if (quickFilter === "inactive_roles") {
            result = result.filter(c => (c.status || "").toUpperCase() === 'INACTIVE');
        }

        // 2. Global Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c => 
                (c.businessRoleName || "").toLowerCase().includes(term) ||
                (c.description || "").toLowerCase().includes(term)
            );
        }

        // 3. Column Specific Search
        Object.keys(columnSearch).forEach(key => {
            const val = columnSearch[key]?.toLowerCase();
            if (val) {
                result = result.filter(item => {
                    const cellVal = String(item[key] || "");
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
                const cellValue = String(item[key] || "");
                const match = cellValue.toLowerCase().includes(filterVal);
                return rule.operator === 'include' ? match : !match;
            });
        });

        // 5. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = (valB || "").toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [roles, quickFilter, searchTerm, advancedFilters, sortConfig, columnSearch]);

    // --- Pagination Logic ---
    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = processedRoles.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(processedRoles.length / itemsPerPage);

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
        const idsToDelete = roleToDelete ? [roleToDelete] : selectedRows;
        try {
            await Promise.all(idsToDelete.map(id => fetch(`${BASE_URL_UM}/business-role/${id}`, { method: "DELETE" })));
            toast.success("Role(s) deleted successfully");
            setShowDeleteConfirm(false);
            setRoleToDelete(null);
            setSelectedRows([]);
            fetchRoles(); // Refetch
        } catch (err) {
            toast.error("Error deleting roles");
        }
    };

    const handleMassDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.warn("Please select roles to delete");
            return;
        }
        setRoleToDelete(null);
        setShowDeleteConfirm(true);
        setShowActionsDropdown(false);
    };

    // --- NAVIGATION HANDLERS ---

    // For Viewing (Eye Icon) -> Read Only Mode
   const handleViewClick = (roleId) => {
        // Pass 'view' mode via state to default to Read Only
        navigate(`/admin/accessmanagement/details/${roleId}`, { state: { mode: 'view' } });
    };

    const handleEditClick = (roleId) => {
        // Pass 'edit' mode via state to default to Edit Mode
        navigate(`/admin/accessmanagement/details/${roleId}`, { state: { mode: 'edit' } });
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
        setQuickFilter("all_roles");
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

    const handleSaveQuery = () => {
        const name = prompt("Enter a name for this view:", "New Custom View");
        if (name) {
            const newView = { id: Date.now().toString(), name: name, filters: tempFilters };
            const updatedViews = [...savedViews, newView];
            setSavedViews(updatedViews);
            localStorage.setItem("roleViews", JSON.stringify(updatedViews));
            setQuickFilter(newView.id);
            setAdvancedFilters(tempFilters);
            toast.success(`View "${name}" saved!`);
        }
    };

    const handleDeleteView = (viewId) => {
        if(window.confirm("Are you sure you want to delete this view?")) {
            const updatedViews = savedViews.filter(v => v.id !== viewId);
            setSavedViews(updatedViews);
            localStorage.setItem("roleViews", JSON.stringify(updatedViews));
            if (quickFilter === viewId) {
                setQuickFilter("all_roles");
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
            const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
            setAdvancedFilters(fresh);
            setTempFilters(fresh);
        }
    };

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
                    <button onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : colKey); }} className="am-header-menu-btn">
                        <MoreVertical size={16} color="#666"/>
                    </button>
                </div>
                {isPopupOpen && (
                    <div ref={popupRef} className="am-header-popup-menu" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleSort(colKey, 'asc')}><ArrowUp size={14}/> Ascending</button>
                        <button onClick={() => handleSort(colKey, 'desc')}><ArrowDown size={14}/> Descending</button>
                        <div className="am-header-search-box">
                            <input type="text" value={columnSearch[colKey] || ''} onChange={e => setColumnSearch({ ...columnSearch, [colKey]: e.target.value })} placeholder={`Search ${colDef.label}...`} autoFocus />
                        </div>
                    </div>
                )}
            </th>
        );
    };

    const renderBodyCell = (role, colKey) => {
        switch (colKey) {
            case "businessRoleId": return <td>{role.businessRoleId}</td>;
            case "businessRoleName": return <td>{role.businessRoleName}</td>;
            case "description": return <td>{role.description}</td>;
            case "createdAt": return <td>{new Date(role.createdAt).toLocaleDateString("en-GB")}</td>;
            case "updatedAt": return <td>{new Date(role.updatedAt).toLocaleDateString("en-GB")}</td>;
            case "status":
                return (
                    <td>
                        <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                            backgroundColor: (role.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#e6f4ea' : '#fce8e6',
                            color: (role.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? '#1e7e34' : '#d93025'
                        }}>
                            {role.status || "ACTIVE"}
                        </span>
                    </td>
                );
            default: return <td>--</td>;
        }
    };

    const filterFields = [
        { label: "Role ID", key: "businessRoleId" },
        { label: "Role Name", key: "businessRoleName" },
        { label: "Description", key: "description" },
        { label: "Status", key: "status", type: "select", options: ["ACTIVE", "INACTIVE"] }
    ];

    return (
        <div className="am-container">
            {/* Stats Section */}
            <div className="am-stats">
                <div className="am-stat-item">
                    <div className="am-stat-badge"><div className="am-stat-badge__inner">{stats.total}</div></div>
                    <div className="am-stat-content"><div className="am-stat-value">Total Roles</div></div>
                </div>
                <div className="am-stat-item">
                    <div className="am-stat-badge"><div className="am-stat-badge__inner">{stats.active}</div></div>
                    <div className="am-stat-content"><div className="am-stat-value">Active Roles</div></div>
                </div>
                <div className="am-stat-item">
                    <div className="am-stat-badge"><div className="am-stat-badge__inner">{stats.inactive}</div></div>
                    <div className="am-stat-content"><div className="am-stat-value">Inactive Roles</div></div>
                </div>
            </div>

            {/* Actions Header */}
            <div className="am-actions">
                <div className="am-dropdown-container">
                    <select className="am-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
                         <optgroup label="System Views">
                            <option value="all_roles">All Roles ({stats.total})</option>
                            <option value="active_roles">Active Roles ({stats.active})</option>
                            <option value="inactive_roles">Inactive Roles ({stats.inactive})</option>
                        </optgroup>
                        {savedViews.length > 0 && (
                            <optgroup label="My Custom Queries">
                                {savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
                            </optgroup>
                        )}
                    </select>
                    <ChevronDown className="dropdown-arrow-icon" size={16} />
                </div>

                <div className="am-search-container">
                    <input type="text" placeholder="Search roles..." className="am-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="search-icon-small" size={20} />
                </div>

                <div className="am-action-icons">
                    <button className="am-create-btn" onClick={() => navigate("/admin/accessmanagement/create")} title="Create Role">
                        <Plus size={15} strokeWidth={2} /> New
                    </button>
                    
                    <button className="am-icon-button-modern" onClick={fetchRoles} title="Refresh">
                        <RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
                    </button>

                    <button className="am-icon-button-modern" onClick={() => setShowSortModal(true)} title="Sort">
                        <ArrowUpDown size={30} strokeWidth={1} />
                    </button>

                    <button className={`am-icon-button-modern ${showFilterPanel ? 'active-filter' : ''}`} onClick={() => { if(!showFilterPanel) setTempFilters(advancedFilters); setShowFilterPanel(!showFilterPanel); }} title="Filter">
                        <Filter size={30} strokeWidth={1} />
                    </button>

                    <button className="am-icon-button-modern" onClick={openColumnSettings} title="Settings">
                        <Settings size={30} strokeWidth={1} />
                    </button>

                    <button className="am-icon-button-modern" onClick={handleGlobalReset} title="Reset">
                        <RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
                    </button>

                    <div className="am-add-button-container" ref={actionRef}>
                        <button className="am-dropdown-button" style={{position:'static', width:'100px', padding:'0 10px', backgroundColor:'#365486', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setShowActionsDropdown(!showActionsDropdown)}>
                            Actions <ChevronDown size={16} style={{marginLeft:'5px'}} />
                        </button>
                        {showActionsDropdown && (
                            <div className="am-action-modal-container">
                                <ul className="am-action-modal-list">
                                    <li onClick={handleMassDeleteClick}>Mass Delete</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="am-filters-container">
                    <div className="am-filters-header">
                        <h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
                        <button className="am-close-filters" onClick={() => setShowFilterPanel(false)}><X size={20}/></button>
                    </div>
                    <div className="am-filter-grid">
                        {filterFields.map((field) => {
                            const rule = tempFilters[field.key];
                            return (
                                <div key={field.key} className="am-filter-item">
                                    <label>{field.label}</label>
                                    <div className="am-input-group">
                                        {field.type === "select" ? (
                                            <select value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)}>
                                                <option value="">All</option>
                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)} placeholder={`Filter ${field.label}...`} />
                                        )}
                                        <button className={`am-operator-toggle ${rule.operator}`} onClick={() => toggleOperator(field.key)} title="Toggle Include/Exclude">
                                            {rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="am-filter-footer">
                        <div className="am-footer-left">
                            <button className="am-reset-filters" onClick={handleRestoreFilters}><RotateCcw size={16} /> Restore</button>
                            <button className="am-apply-btn" onClick={applyFilters}>Apply</button>
                        </div>
                        <div className="am-footer-right">
                             <button className="am-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Copy size={16}/> Save Query As
                            </button>
                            <button className="am-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Settings size={16}/> Organize Queries
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="am-table-container">
                <table className="am-table">
                    <thead>
                        <tr>
                            <th className="checkbox-column">
                                <input type="checkbox" className="am-custom-checkbox" checked={currentRecords.length > 0 && selectedRows.length === currentRecords.length} onChange={handleSelectAll} />
                            </th>
                            {visibleColumns.map(colKey => renderHeaderCell(colKey))}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? currentRecords.map((role) => (
                            <tr key={role.id}>
                                <td className="checkbox-column">
                                    <input type="checkbox" className="am-custom-checkbox" checked={selectedRows.includes(role.id)} onChange={() => toggleRowSelection(role.id)} />
                                </td>
                                {visibleColumns.map(colKey => (
                                    <React.Fragment key={colKey}>
                                        {renderBodyCell(role, colKey)}
                                    </React.Fragment>
                                ))}
                                <td>
                                    <div className="am-table-action-buttons">
                                         {/* ✅ ADDED Eye Icon for View Mode */}
                                        <button 
                                            className="am-view-btn" 
                                            onClick={() => handleViewClick(role.id)}
                                            title="View Details"
                                        >
                                            <Eye size={18} strokeWidth={1} />
                                        </button>
                                        <button 
                                            className="am-edit-btn" 
                                            onClick={() => handleEditClick(role.id)}
                                            title="Edit"
                                        >
                                            <SquarePen size={18} strokeWidth={1} />
                                        </button>
                                        <button 
                                            className="am-delete-btn" 
                                            onClick={() => {
                                                setRoleToDelete(role.id);
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
                            <tr><td colSpan={visibleColumns.length + 2} className="am-empty-state">No roles found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="am-pagination">
                <div className="am-pagination-left">
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#365486" }}>{selectedRows.length} Selected</span>
                </div>
                <div className="am-pagination-right">
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}> Item Per Page </span>
                    <select className="am-items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <button className="am-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
                    <button className="am-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>
                    <div className="am-page-input-container">
                        <input type="number" className="am-page-input" value={pageInput} min={1} max={totalPages || 1} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageInputCommit} onKeyDown={(e) => { if (e.key === 'Enter') { handlePageInputCommit(); e.target.blur(); } }} />
                        <span className="am-page-numbers">of {totalPages || 1}</span>
                    </div>
                    <button className="am-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
                    <button className="am-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
                </div>
            </div>

            {/* Modals */}
            {showDeleteConfirm && (
                <div className="am-delete-confirm-overlay">
                    <div className="am-delete-confirm-dialog">
                        <div className="am-dialog-header"><h3>Confirm Delete</h3><p>Are you sure you want to delete {roleToDelete ? "this role" : `${selectedRows.length} roles`}?</p></div>
                        <div className="am-dialog-buttons">
                            <button className="am-yes-button" onClick={handleDeleteConfirm}>Yes</button>
                            <button className="am-no-button" onClick={() => { setShowDeleteConfirm(false); setRoleToDelete(null); }}>No</button>
                        </div>
                    </div>
                </div>
            )}
             {/* Sort, Organize, Column Modals kept similar structure */}
             {showSortModal && (
                <div className="am-delete-confirm-overlay">
                    <div className="am-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
                        <div className="am-dialog-header"><h3>Sort</h3></div>
                        <div className="am-sort-modal-body">
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
                        <div className="am-dialog-buttons">
                            <button className="am-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
                            <button className="am-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
                        </div>
                    </div>
                </div>
            )}
            
             {showOrganizeModal && (
                <div className="am-delete-confirm-overlay">
                    <div className="am-delete-confirm-dialog" style={{ width: '400px' }}>
                        <div className="am-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                            <button className="am-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showColumnSettings && (
                <div className="am-delete-confirm-overlay">
                    <div className="am-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
                        <div className="am-dialog-header" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
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
                        <div className="am-dialog-buttons" style={{ marginTop: '20px' }}>
                            <button className="am-no-button" onClick={() => setShowColumnSettings(false)}>Cancel</button>
                            <button className="am-yes-button" onClick={saveColumnSettings}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessManagement;