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
    SquarePen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./CustomerAccount.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

// --- Constants ---
const INITIAL_ADVANCED_STATE = {
    name: { value: "", operator: "include" },
    accountId: { value: "", operator: "include" },
    ownerId: { value: "", operator: "include" },
    type: { value: "", operator: "include" },
    industry: { value: "", operator: "include" },
    city: { value: "", operator: "include" },
    accountStatus: { value: "", operator: "include" }
};

const ALL_COLUMNS = [
    { key: "name", label: "Account Name" },
    { key: "accountId", label: "Account ID" },
    { key: "ownerId", label: "Owner" },
    { key: "type", label: "Type" },
    { key: "industry", label: "Industry" },
    { key: "website", label: "Website" },
    { key: "billingCity", label: "City" },
    { key: "accountStatus", label: "Status" }
];

const DEFAULT_VISIBLE_COLUMNS = ["name", "accountId", "ownerId", "type", "industry", "accountStatus"];

const CustomerAccount = () => {
    // --- State Management ---
    const [accounts, setAccounts] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // For Owner Name resolution
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
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
    const [quickFilter, setQuickFilter] = useState("all_accounts");
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

    // --- Fetch Data ---
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${BASE_URL_UM}/users/s-info`, { credentials: "include" });
            if (res.ok) setAllUsers(await res.json());
        } catch (err) { console.error("Error fetching users", err); }
    };

    const fetchAccounts = async () => {
        try {
            setRefreshSpin(true);
            const res = await fetch(`${BASE_URL_AC}/account`);
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setAccounts(data);
            setTimeout(() => setRefreshSpin(false), 500);
        } catch (err) {
            console.error("Error fetching accounts:", err);
            toast.error("Error fetching accounts");
            setRefreshSpin(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAccounts();
        const saved = localStorage.getItem("accountViews");
        if (saved) setSavedViews(JSON.parse(saved));
    }, []);

    // Helper: Format Name
    const formatName = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
    
    // Helper: Get Owner Name
    const getOwnerName = (ownerId) => {
        if (!ownerId) return "--";
        const user = allUsers.find(u => u.id === ownerId);
        return user ? `${formatName(user.firstName)} ${formatName(user.lastName)}` : ownerId;
    };

    // --- Stats Calculations ---
    const stats = useMemo(() => {
        const activeCount = accounts.filter(a => (a.accountStatus || "ACTIVE").toUpperCase() === 'ACTIVE').length;
        const inactiveCount = accounts.filter(a => (a.accountStatus || "").toUpperCase() === 'INACTIVE').length;
        return { total: accounts.length, active: activeCount, inactive: inactiveCount };
    }, [accounts]);

    // --- Data Processing (Filter & Sort) ---
    const processedAccounts = useMemo(() => {
        let result = [...accounts];

        // 1. Quick Filters
        if (quickFilter === "active_accounts") {
            result = result.filter(a => (a.accountStatus || "ACTIVE").toUpperCase() === 'ACTIVE');
        } else if (quickFilter === "inactive_accounts") {
            result = result.filter(a => (a.accountStatus || "").toUpperCase() === 'INACTIVE');
        }

        // 2. Global Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(a => 
                (a.name || "").toLowerCase().includes(term) ||
                (a.accountId || "").toLowerCase().includes(term) ||
                (a.website || "").toLowerCase().includes(term)
            );
        }

        // 3. Column Specific Search
        Object.keys(columnSearch).forEach(key => {
            const val = columnSearch[key]?.toLowerCase();
            if (val) {
                result = result.filter(item => {
                    let cellVal = "";
                    if (key === 'ownerId') cellVal = getOwnerName(item.ownerId);
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
                if (key === 'ownerId') cellValue = getOwnerName(item.ownerId);
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

                if (sortConfig.key === 'ownerId') {
                    valA = getOwnerName(a.ownerId).toLowerCase();
                    valB = getOwnerName(b.ownerId).toLowerCase();
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
    }, [accounts, quickFilter, searchTerm, advancedFilters, sortConfig, columnSearch, allUsers]);

    // --- Pagination Logic ---
    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = processedAccounts.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(processedAccounts.length / itemsPerPage);

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
        else setSelectedRows(currentRecords.map(c => c.accountId));
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = accountToDelete ? [accountToDelete] : selectedRows;
        try {
            // Sequential delete to handle individual failures/successes if needed
            for (const id of idsToDelete) {
                await fetch(`${BASE_URL_AC}/account/${id}`, { method: "DELETE" });
            }
            toast.success("Account(s) deleted successfully");
            setShowDeleteConfirm(false);
            setAccountToDelete(null);
            setSelectedRows([]);
            fetchAccounts();
        } catch (err) {
            toast.error("Error deleting accounts");
        }
    };

    const handleMassDeleteClick = () => {
        if (selectedRows.length === 0) {
            toast.warn("Please select accounts to delete");
            return;
        }
        setAccountToDelete(null); 
        setShowDeleteConfirm(true);
        setShowActionsDropdown(false);
    };

    const handleImportAccounts = () => {
        toast.info("Import feature coming soon!");
        setShowActionsDropdown(false);
    };

    const handleEditClick = (e, accountId) => {
        e.stopPropagation();
        // Assuming your edit route handles 'startInEditMode' via location state
        navigate(`/customers/accounts/details/${accountId}`, { state: { startInEditMode: true } });
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
        setQuickFilter("all_accounts");
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
            localStorage.setItem("accountViews", JSON.stringify(updatedViews));
            setQuickFilter(newView.id);
            setAdvancedFilters(tempFilters);
            toast.success(`View "${name}" saved!`);
        }
    };

    const handleDeleteView = (viewId) => {
        if(window.confirm("Are you sure you want to delete this view?")) {
            const updatedViews = savedViews.filter(v => v.id !== viewId);
            setSavedViews(updatedViews);
            localStorage.setItem("accountViews", JSON.stringify(updatedViews));
            if (quickFilter === viewId) {
                setQuickFilter("all_accounts");
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

    // --- Render Helpers ---
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
                        className="cap-header-menu-btn"
                    >
                        <MoreVertical size={16} color="#666"/>
                    </button>
                </div>
                {isPopupOpen && (
                    <div ref={popupRef} className="cap-header-popup-menu" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleSort(colKey, 'asc')}><ArrowUp size={14}/> Ascending</button>
                        <button onClick={() => handleSort(colKey, 'desc')}><ArrowDown size={14}/> Descending</button>
                        <div className="cap-header-search-box">
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

    const renderBodyCell = (account, colKey) => {
        switch (colKey) {
            case "name": return <td>{account.name}</td>;
            case "accountId": return <td>{account.accountId}</td>;
            case "ownerId": return <td>{getOwnerName(account.ownerId)}</td>;
            case "type": return <td>{account.type || "--"}</td>;
            case "industry": return <td>{account.industry || "--"}</td>;
            case "website": 
                return <td>{account.website ? <a href={account.website} target="_blank" rel="noreferrer" style={{color:'#2563eb'}}>{account.website}</a> : "--"}</td>;
            case "billingCity": return <td>{account.billingCity || "--"}</td>;
            case "accountStatus":
                const status = (account.accountStatus || "ACTIVE").toUpperCase();
                return (
                    <td>
                        <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px',
                            backgroundColor: status === 'ACTIVE' ? '#e6f4ea' : '#fce8e6',
                            color: status === 'ACTIVE' ? '#1e7e34' : '#d93025'
                        }}>
                            {account.accountStatus || "ACTIVE"}
                        </span>
                    </td>
                );
            default: return <td>{account[colKey] || "--"}</td>;
        }
    };

    const filterFields = [
        { label: "Account Name", key: "name" },
        { label: "Account ID", key: "accountId" },
        { label: "Owner", key: "ownerId" }, // Will handle text search for name inside filter logic
        { label: "Type", key: "type", type: "select", options: ["CUSTOMER", "PARTNER", "OTHER"] },
        { label: "Industry", key: "industry", type: "select", options: ["TECH", "FINANCE", "HEALTHCARE"] },
        { label: "City", key: "city" },
        { label: "Status", key: "accountStatus", type: "select", options: ["ACTIVE", "INACTIVE"] }
    ];

    return (
        <div className="cap-account-management-container">
            {/* Stats Section */}
            <div className="cap-account-stats">
                <div className="cap-stat-item">
                    <div className="cap-stat-badge"><div className="cap-stat-badge__inner">{stats.total}</div></div>
                    <div className="cap-stat-content"><div className="cap-stat-value">Total Accounts</div></div>
                </div>
                <div className="cap-stat-item">
                    <div className="cap-stat-badge"><div className="cap-stat-badge__inner">{stats.active}</div></div>
                    <div className="cap-stat-content"><div className="cap-stat-value">Active Accounts</div></div>
                </div>
                <div className="cap-stat-item">
                    <div className="cap-stat-badge"><div className="cap-stat-badge__inner">{stats.inactive}</div></div>
                    <div className="cap-stat-content"><div className="cap-stat-value">Inactive Accounts</div></div>
                </div>
            </div>

            {/* Actions Header */}
            <div className="cap-account-actions">
                <div className="cap-account-dropdown-container">
                    <select className="cap-account-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
                         <optgroup label="System Views">
                            <option value="all_accounts">All Accounts ({stats.total})</option>
                            <option value="active_accounts">Active Accounts ({stats.active})</option>
                            <option value="inactive_accounts">Inactive Accounts ({stats.inactive})</option>
                        </optgroup>
                        {savedViews.length > 0 && (
                            <optgroup label="My Custom Queries">
                                {savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
                            </optgroup>
                        )}
                    </select>
                    <ChevronDown className="dropdown-arrow-icon" size={16} />
                </div>

                <div className="cap-search-container">
                    <input type="text" placeholder="Search accounts..." className="cap-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="cap-search-icon-small" size={20} />
                </div>

                <div className="cap-action-icons">
                    <button className="cap-account-create-btn" onClick={() => navigate("/customers/accounts/create")}>
                        <Plus size={18} strokeWidth={2} /> New
                    </button>

                    <button className="cap-icon-button-modern" onClick={fetchAccounts} title="Refresh">
                        <RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
                    </button>

                    <button className="cap-icon-button-modern" onClick={() => setShowSortModal(true)} title="Sort">
                        <ArrowUpDown size={30} strokeWidth={1} />
                    </button>

                    <button className={`cap-icon-button-modern ${showFilterPanel ? 'active-filter' : ''}`} onClick={() => { if(!showFilterPanel) setTempFilters(advancedFilters); setShowFilterPanel(!showFilterPanel); }} title="Filter">
                        <Filter size={30} strokeWidth={1} />
                    </button>

                    <button className="cap-icon-button-modern" onClick={openColumnSettings} title="Settings">
                        <Settings size={30} strokeWidth={1} />
                    </button>

                    <button className="cap-icon-button-modern" onClick={handleGlobalReset} title="Reset">
                        <RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} strokeWidth={1}/>
                    </button>

                    {/* Actions Dropdown */}
                    <div className="cap-add-button-container" ref={actionRef}>
                        <button className="cap-account-dropdown-button" style={{position:'static', width:'100px', padding:'0 10px', backgroundColor:'#365486', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setShowActionsDropdown(!showActionsDropdown)}>
                            Actions <ChevronDown size={16} style={{marginLeft:'5px'}} />
                        </button>
                        {showActionsDropdown && (
                            <div className="cap-account-action-modal-container">
                                <ul className="cap-account-action-modal-list">
                                    <li onClick={handleMassDeleteClick}>Mass Delete</li>
                                    <li onClick={handleImportAccounts}>Import Accounts</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="cap-filters-container">
                    <div className="cap-filters-header">
                        <h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
                        <button className="cap-close-filters" onClick={() => setShowFilterPanel(false)}><X size={20}/></button>
                    </div>
                    <div className="cap-filter-grid">
                        {filterFields.map((field) => {
                            const rule = tempFilters[field.key];
                            return (
                                <div key={field.key} className="cap-filter-item">
                                    <label>{field.label}</label>
                                    <div className="cap-input-group">
                                        {field.type === "select" ? (
                                            <select value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)}>
                                                <option value="">All</option>
                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" value={rule.value} onChange={(e) => updateAdvancedFilter(field.key, 'value', e.target.value)} placeholder={`Filter ${field.label}...`} />
                                        )}
                                        <button className={`cap-operator-toggle ${rule.operator}`} onClick={() => toggleOperator(field.key)} title="Toggle Include/Exclude">
                                            {rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="cap-filter-footer">
                        <div className="cap-footer-left">
                            <button className="cap-reset-filters" onClick={handleRestoreFilters}><RotateCcw size={16} /> Restore</button>
                            <button className="cap-apply-btn" onClick={applyFilters}>Apply</button>
                        </div>
                        <div className="cap-footer-right">
                             <button className="cap-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Copy size={16}/> Save Query As
                            </button>
                            <button className="cap-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Settings size={16}/> Organize Queries
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="cap-account-table-container">
                <table className="cap-account-table">
                    <thead>
                        <tr>
                            <th className="checkbox-column">
                                <input type="checkbox" className="cap-custom-checkbox" checked={currentRecords.length > 0 && selectedRows.length === currentRecords.length} onChange={handleSelectAll} />
                            </th>
                            {visibleColumns.map(colKey => renderHeaderCell(colKey))}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.length > 0 ? currentRecords.map((account) => (
                            <tr key={account.accountId}>
                                <td className="checkbox-column">
                                    <input type="checkbox" className="cap-custom-checkbox" checked={selectedRows.includes(account.accountId)} onChange={() => toggleRowSelection(account.accountId)} />
                                </td>
                                {visibleColumns.map(colKey => renderBodyCell(account, colKey))}
                                <td>
                                    <div className="cap-table-action-buttons">
                                        <button 
                                            className="cap-view-btn" 
                                            onClick={() => navigate(`/customers/accounts/details/${account.accountId}`)}
                                            title="View Details"
                                        >
                                            <Eye size={18} strokeWidth={1} />
                                        </button>
                                        <button 
                                            className="cap-edit-btn" 
                                            onClick={(e) => handleEditClick(e, account.accountId)}
                                            title="Edit"
                                        >
                                            <SquarePen size={18} strokeWidth={1} />
                                        </button>
                                        <button 
                                            className="cap-delete-btn" 
                                            onClick={() => {
                                                setAccountToDelete(account.accountId);
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
                            <tr><td colSpan={visibleColumns.length + 2} className="cap-empty-state">No accounts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="cap-pagination">
                <div className="cap-pagination-left">
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#365486" }}>{selectedRows.length} Selected</span>
                </div>
                <div className="cap-pagination-right">
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}> Item Per Page </span>
                    <select className="cap-items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>

                    <button className="cap-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
                    <button className="cap-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>

                    <div className="cap-page-input-container">
                        <input type="number" className="cap-page-input" value={pageInput} min={1} max={totalPages || 1} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageInputCommit} onKeyDown={(e) => { if (e.key === 'Enter') { handlePageInputCommit(); e.target.blur(); } }} />
                        <span className="cap-page-numbers">of {totalPages || 1}</span>
                    </div>

                    <button className="cap-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
                    <button className="cap-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="cap-delete-confirm-overlay">
                    <div className="cap-delete-confirm-dialog">
                        <div className="cap-dialog-header">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete {accountToDelete ? "this account" : `${selectedRows.length} accounts`}?</p>
                        </div>
                        <div className="cap-dialog-buttons">
                            <button className="cap-yes-button" onClick={handleDeleteConfirm}>Yes</button>
                            <button className="cap-no-button" onClick={() => { setShowDeleteConfirm(false); setAccountToDelete(null); }}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {showSortModal && (
                <div className="cap-delete-confirm-overlay">
                    <div className="cap-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
                        <div className="cap-dialog-header"><h3>Sort</h3></div>
                        <div className="cap-sort-modal-body">
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
                        <div className="cap-dialog-buttons">
                            <button className="cap-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
                            <button className="cap-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Organize Queries Modal */}
             {showOrganizeModal && (
                <div className="cap-delete-confirm-overlay">
                    <div className="cap-delete-confirm-dialog" style={{ width: '400px' }}>
                        <div className="cap-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                            <button className="cap-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Settings Modal */}
            {showColumnSettings && (
                <div className="cap-delete-confirm-overlay">
                    <div className="cap-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
                        <div className="cap-dialog-header" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
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
                        <div className="cap-dialog-buttons" style={{ marginTop: '20px' }}>
                            <button className="cap-no-button" onClick={() => setShowColumnSettings(false)}>Cancel</button>
                            <button className="cap-yes-button" onClick={saveColumnSettings}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerAccount;