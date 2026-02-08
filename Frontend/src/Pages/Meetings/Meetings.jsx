import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { 
    Plus, 
    RefreshCcw, 
    RotateCcw, 
    Filter, 
    Search, 
    X, 
    CircleUserRound, 
    ChevronDown, 
    Trash2,     
    CircleArrowLeft, 
    CircleArrowRight,
    Eye,
    Settings, 
    ArrowUp,    
    ArrowDown,  
    ArrowUpDown,
    CheckCircle2,
    Ban,
    Copy,
    MoreVertical,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
    Printer,
    Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import { useAuth } from "../../contexts/AuthContext"; 
import "./Meetings.css"; 

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

// --- CONSTANTS ---

const INITIAL_ADVANCED_STATE = {
    subject: { value: "", operator: "include" },
    status: { value: "", operator: "include" },
    meetingOwner: { value: "", operator: "include" }, 
    location: { value: "", operator: "include" },
    relatedTo: { value: "", operator: "include" }, 
    fromDate: { value: "", operator: "include" }, 
};

const DEFAULT_VISIBLE_COLUMNS = {
    subject: true,
    status: true,
    fromDate: true,
    toDate: true,
    relatedTo: true,
    primaryContact: true,
    meetingOwner: true,
    location: false,
    actions: true 
};

const Meetings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const actionRef = useRef(null);
    const popupRef = useRef(null); 
    const [pageInput, setPageInput] = useState(1);
    
    // --- State Management ---
    const [meetings, setMeetings] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // --- Filter & Modal States ---
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false); 
    const [showActionsModal, setShowActionsModal] = useState(false); 
    const [showColumnControl, setShowColumnControl] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showOrganizeModal, setShowOrganizeModal] = useState(false); // For "Organize Queries" match

    const [activePopupColumn, setActivePopupColumn] = useState(null); 

    const [meetingToDelete, setMeetingToDelete] = useState(null);
    const [refreshSpin, setRefreshSpin] = useState(false);
    const [resetSpin, setResetSpin] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- Column Definitions ---
    const allColumns = useMemo(() => [
        { key: 'subject', label: 'Subject' },
        { key: 'status', label: 'Status' },
        { key: 'fromDate', label: 'From' },
        { key: 'toDate', label: 'To' },
        { key: 'relatedTo', label: 'Related Object' },
        { key: 'primaryContact', label: 'Contact Name' },
        { key: 'meetingOwner', label: 'Host' },
        { key: 'location', label: 'Location' },
        { key: 'accountName', label: 'Account Name' },
    ], []);

    const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
    const [tempVisibleKeys, setTempVisibleKeys] = useState([]);
    const [tempAvailableKeys, setTempAvailableKeys] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState([]); 
    const [selectedVisible, setSelectedVisible] = useState([]);     

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [columnSearch, setColumnSearch] = useState({}); 

    const [tempSortConfig, setTempSortConfig] = useState({ key: 'fromDate', direction: 'desc' });
    const [sortConfig, setSortConfig] = useState({ key: 'fromDate', direction: 'desc' });

    const [advancedFilters, setAdvancedFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
    const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));

    const [savedViews, setSavedViews] = useState([]);
    const [quickFilter, setQuickFilter] = useState("all_meetings");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    // --- Helpers ---
    const getLoggedInUserName = () => {
        if (user) {
            return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || user.username || "Current User";
        }
        return "Current User";
    };

    const resolveUserName = (userId) => {
        if (!userId) return "Unassigned";
        const u = allUsers.find(u => u.id === userId);
        return u ? (u.name || `${u.firstName} ${u.lastName}`) : userId;
    };

    const resolveContactName = (contactId) => {
        if (!contactId) return "-";
        const c = allContacts.find(c => c.id === contactId || c.contactId === contactId);
        return c ? `${c.firstName} ${c.lastName}` : contactId;
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getCellValue = (meeting, key) => {
        switch(key) {
            case 'subject': return meeting.subject || '-';
            case 'status': return (meeting.status || '-').replace(/_/g, ' '); 
            case 'fromDate': return formatDateTime(meeting.fromDate);
            case 'toDate': return formatDateTime(meeting.toDate);
            case 'relatedTo': return meeting.relatedTo ? `${meeting.relatedTo}` : '-'; 
            case 'primaryContact': return resolveContactName(meeting.primaryContactId);
            case 'meetingOwner': return resolveUserName(meeting.meetingOwnerId);
            case 'location': return meeting.location || '-';
            case 'accountName': return meeting.accountName || '-';
            default: return meeting[key] || '';
        }
    };

    // --- Data Fetching ---
    const fetchReferenceData = async () => {
        try {
            const [usersRes, contactsRes] = await Promise.all([
                fetch(`${BASE_URL_UM}/users/s-info`),
                fetch(`${BASE_URL_AC}/contact`),
            ]);
            if (usersRes.ok) setAllUsers(await usersRes.json());
            if (contactsRes.ok) setAllContacts(await contactsRes.json());
        } catch (error) { console.error("Ref Data Error", error); }
    };

    const fetchMeetings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL_AM}/meetings`, { headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } });
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            setMeetings(Array.isArray(data) ? data : []); 
            setCurrentPage(1); 
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
            toast.error("Failed to fetch meetings"); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeetings(); 
        fetchReferenceData();
        const saved = localStorage.getItem("meetingViews");
        if (saved) setSavedViews(JSON.parse(saved));
    }, [fetchMeetings]); 

    // --- Event Handlers ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionRef.current && !actionRef.current.contains(event.target)) setShowActionsModal(false);
            if (popupRef.current && !popupRef.current.contains(event.target)) setActivePopupColumn(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => { setPageInput(currentPage); }, [currentPage]);

    const handlePageInputCommit = () => {
        const val = parseInt(pageInput);
        if (!isNaN(val) && val >= 1 && val <= (totalPages || 1)) setCurrentPage(val);
        else setPageInput(currentPage);
    };

    const handleToggleAdvancedFilter = () => {
        if (!showAdvancedFilter) setTempFilters(advancedFilters);
        setShowAdvancedFilter(!showAdvancedFilter);
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        setSelectedRows(selectedRows.length === processedMeetings.length ? [] : processedMeetings.map(m => m.id));
    };

    // --- Column Control ---
    const openColumnControl = () => {
        const currentVisible = allColumns.filter(col => visibleColumns[col.key]).map(col => col.key);
        const currentAvailable = allColumns.filter(col => !visibleColumns[col.key]).map(col => col.key);
        setTempVisibleKeys(currentVisible);
        setTempAvailableKeys(currentAvailable);
        setSelectedAvailable([]);
        setSelectedVisible([]);
        setShowColumnControl(true);
    };

    const handleSaveColumns = () => {
        const newVisibleState = { actions: true }; 
        allColumns.forEach(col => newVisibleState[col.key] = false);
        tempVisibleKeys.forEach(key => newVisibleState[key] = true);
        setVisibleColumns(newVisibleState);
        setShowColumnControl(false);
        toast.success("List view updated!");
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

    // --- Navigation & Actions ---
    const handleViewClick = (id) => navigate(`/activitymanagement/meetings/details/${id}`);
    
    const handleDeleteConfirm = async () => {
        const toDel = meetingToDelete ? [meetingToDelete] : selectedRows;
        try {
            await Promise.all(toDel.map(id => fetch(`${BASE_URL_AM}/meetings/${id}`, { method: "DELETE" })));
            setShowDeleteConfirm(false); setSelectedRows([]); setMeetingToDelete(null); fetchMeetings();
            toast.success("Deleted successfully");
        } catch (e) { toast.error("Error deleting"); }
    };

    const handleActionClick = (action) => {
        setShowActionsModal(false);
        if (selectedRows.length === 0 && action !== 'export') { toast.warn("Select at least one meeting."); return; }
        switch (action) {
            case "delete": 
                setMeetingToDelete(null); setShowDeleteConfirm(true); 
                break;
            case "export": 
                handleExport(); 
                break;
            case "print": 
                handlePrintView(); 
                break;
            default: break;
        }
    };

    const handleExport = () => {
        const rows = meetings.filter(m => selectedRows.includes(m.id));
        if (!rows.length) return;
        const csv = ["Subject,Status,From,To,Host", ...rows.map(r => `"${r.subject}","${r.status}","${r.fromDate}","${r.toDate}","${resolveUserName(r.meetingOwnerId)}"` )].join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        link.download = "meetings.csv";
        link.click();
        toast.success("Exported!");
    };

    const handlePrintView = () => {
        const rows = meetings.filter(m => selectedRows.includes(m.id));
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print View</title></head><body>');
        printWindow.document.write('<h1>Selected Meetings</h1><table border="1" style="width:100%;border-collapse:collapse;"><thead><tr><th>Subject</th><th>Status</th><th>From</th><th>To</th></tr></thead><tbody>');
        rows.forEach(r => {
            printWindow.document.write(`<tr><td>${r.subject}</td><td>${r.status}</td><td>${new Date(r.fromDate).toLocaleString()}</td><td>${new Date(r.toDate).toLocaleString()}</td></tr>`);
        });
        printWindow.document.write('</tbody></table></body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    // --- Filtering Logic ---
    const updateAdvancedFilter = (field, key, value) => {
        setTempFilters(prev => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
    };

    const handleApplyAdvancedFilter = () => {
        setAdvancedFilters(tempFilters); 
        setCurrentPage(1);
        toast.success("Filters applied");
    };

    const handleRestoreAdvancedFilter = () => {
        setResetSpin(true);
        setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
        setTimeout(() => setResetSpin(false), 500);
    };

    // Placeholders for Save Query functions to match Ticket UI
    const handleSaveQuery = () => {
        toast.info("Save Query feature available in next update.");
    };

    const handleGlobalReset = () => {
        setResetSpin(true);
        setSearchTerm("");
        setColumnSearch({});
        setQuickFilter("all_meetings");
        const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
        setAdvancedFilters(fresh);
        setTempFilters(fresh);
        setSortConfig({ key: 'fromDate', direction: 'desc' });
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
        setCurrentPage(1);
        setSelectedRows([]);
        fetchMeetings();
        setTimeout(() => setResetSpin(false), 500);
        toast.info("View reset");
    };

    // --- Processing Data (Search, Filter, Sort) ---
    const processedMeetings = useMemo(() => {
        let result = [...meetings];

        // 1. Global Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(item => allColumns.some(col => String(getCellValue(item, col.key)).toLowerCase().includes(lower)));
        }

        // 2. Column Search
        Object.keys(columnSearch).forEach(key => {
            const val = columnSearch[key]?.toLowerCase();
            if (val) result = result.filter(item => String(getCellValue(item, key)).toLowerCase().includes(val));
        });

        // 3. System Views
        const myName = getLoggedInUserName().toLowerCase();
        const now = new Date();
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
        const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);

        if (quickFilter === "my_meetings") result = result.filter(m => resolveUserName(m.meetingOwnerId).toLowerCase().includes(myName));
        if (quickFilter === "cancelled_meetings") result = result.filter(m => (m.status||"").toUpperCase() === "CANCELLED");
        if (quickFilter === "completed_meetings") result = result.filter(m => (m.status||"").toUpperCase() === "COMPLETED");
        if (quickFilter === "today_open") result = result.filter(m => {
            const isToday = new Date(m.fromDate) >= startOfToday;
            const isOpen = (m.status||"").toUpperCase() === "OPEN" || (m.status||"").toUpperCase() === "SCHEDULED";
            return isToday && isOpen;
        });
        if (quickFilter === "last_7_days") result = result.filter(m => new Date(m.createdAt || m.fromDate) >= sevenDaysAgo);

        // 4. Advanced Filters
        Object.keys(advancedFilters).forEach(key => {
            const rule = advancedFilters[key];
            if (!rule.value) return;
            const filterVal = rule.value.toLowerCase();
            result = result.filter(item => {
                const cellValue = getCellValue(item, key);
                const match = String(cellValue).toLowerCase().includes(filterVal);
                return rule.operator === 'include' ? match : !match;
            });
        });

        // 5. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = getCellValue(a, sortConfig.key).toLowerCase();
                const valB = getCellValue(b, sortConfig.key).toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [meetings, searchTerm, columnSearch, quickFilter, sortConfig, advancedFilters, allUsers, allContacts]);

    // Counters
    const meetingCounts = useMemo(() => ({
        all: meetings.length,
        my: meetings.filter(m => resolveUserName(m.meetingOwnerId).toLowerCase().includes(getLoggedInUserName().toLowerCase())).length,
        completed: meetings.filter(m => (m.status||"").toUpperCase() === "COMPLETED").length,
    }), [meetings, allUsers, user]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedMeetings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedMeetings.length / itemsPerPage);

    // Render Helpers
    const handleSort = (key, direction) => { setSortConfig({ key, direction }); setActivePopupColumn(null); };
    const renderSortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon-active"/> : <ArrowDown size={14} className="sort-icon-active"/>) : null;
    
    // --- EXACT HEADER CELL RENDER FROM TICKETS.JSX ---
    const renderHeaderCell = (col) => {
        if (!visibleColumns[col.key]) return null;
        const isPopupOpen = activePopupColumn === col.key;
        return (
            <th key={col.key} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div onClick={() => handleSort(col.key, sortConfig.direction==='asc'?'desc':'asc')} style={{cursor:'pointer', display:'flex', gap:'5px', alignItems:'center'}}>
                        {col.label} {renderSortIcon(col.key)}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : col.key); }} style={{background:'none', border:'none', cursor:'pointer'}}><MoreVertical size={16} color="#666"/></button>
                </div>
                {isPopupOpen && (
                    <div ref={popupRef} className="header-popup-menu" onClick={e=>e.stopPropagation()} style={{position:'absolute', top:'100%', right:0, zIndex:100, background:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', border:'1px solid #eee', borderRadius:'6px', padding:'10px', width:'200px'}}>
                        <button onClick={() => handleSort(col.key, 'asc')} style={{display:'flex', gap:'8px', width:'100%', padding:'6px', border:'none', background:'transparent', cursor:'pointer'}}><ArrowUp size={14}/> Ascending</button>
                        <button onClick={() => handleSort(col.key, 'desc')} style={{display:'flex', gap:'8px', width:'100%', padding:'6px', border:'none', background:'transparent', cursor:'pointer'}}><ArrowDown size={14}/> Descending</button>
                        <div style={{borderTop:'1px solid #eee', marginTop:'5px', paddingTop:'5px'}}>
                            <input type="text" value={columnSearch[col.key]||''} onChange={e=>setColumnSearch({...columnSearch, [col.key]: e.target.value})} placeholder={`Search ${col.label}...`} style={{width:'100%', padding:'5px', border:'1px solid #ccc', borderRadius:'4px'}} autoFocus/>
                        </div>
                    </div>
                )}
            </th>
        );
    };

    return (
        <div className="meeting-management-container">
            {/* Stats */}
            <div className="meeting-stats">
                <div className="meeting-stat-item meeting-stat-card--with-badge">
                    <div className="meeting-stat-badge"><div className="meeting-stat-badge__inner">{meetings.length}</div></div>
                    <div className="meeting-stat-content"><div className="meeting-stat-value">Total Meetings</div></div>
                </div>
            </div>

            {/* Actions Bar - MATCHING TICKET UI */}
            <div className="meeting-actions">
                <div className="meeting-dropdown-container">
                    <CircleUserRound size={20} className="user-round-icon" strokeWidth={1} />
                    <ChevronDown size={16} className="dropdown-arrow-icon" />
                    <select className="meeting-dropdown-button" onChange={(e) => setQuickFilter(e.target.value)} value={quickFilter}>
                        <optgroup label="System Views">
                            <option value="all_meetings">All Meetings ({meetingCounts.all})</option>
                            <option value="my_meetings">My Meetings ({meetingCounts.my})</option>
                            <option value="today_open">Today's / Open Meetings</option>
                            <option value="completed_meetings">Completed Meetings ({meetingCounts.completed})</option>
                            <option value="cancelled_meetings">Cancelled Meetings</option>
                            <option value="last_7_days">Last 7 Days Meetings</option>
                        </optgroup>
                    </select>
                </div>

                <div className="meeting-search-container">
                    <input type="text" placeholder="Search Meeting..." className="meeting-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="search-icon-small" size={20} color="#0f1035" strokeWidth={1} />
                </div>

                <div className="meeting-action-icons">
                    <button className="meeting-create-btn" title="Create New Meeting" onClick={() => navigate("/activitymanagement/meetings/create")}>
                        <Plus size={18} strokeWidth={2} /> New
                    </button>
                    
                    <button className="meeting-icon-button-modern" title="Refresh List" onClick={() => { setRefreshSpin(true); fetchMeetings(); setTimeout(() => setRefreshSpin(false), 500); }}>
                        <RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
                    </button>

                    <button className="meeting-icon-button-modern" title="Sort Columns" onClick={() => setShowSortModal(true)}>
                        <ArrowUpDown size={30} color="#0f1035" strokeWidth={1} />
                    </button>

                    <button className={`meeting-icon-button-modern ${showAdvancedFilter ? 'active-filter' : ''}`} title="Advanced Filters" onClick={handleToggleAdvancedFilter} style={{ backgroundColor: showAdvancedFilter ? '#dcf2f1' : 'transparent' }}>
                        <Filter size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    
                    <button className="meeting-icon-button-modern" title="Manage Columns" onClick={openColumnControl}>
                        <Settings size={30} color="#0f1035" strokeWidth={1} />
                    </button>

                    <button className="meeting-icon-button-modern" title="Reset All Filters" onClick={handleGlobalReset}>
                        <RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    
                    <div className="meeting-action-button-container" ref={actionRef}>
                        <button className="meeting-action-button" title="Bulk Actions" onClick={() => setShowActionsModal(!showActionsModal)}>
                            Actions <ChevronDown size={20} color="#dcf2f1" strokeWidth={2} />
                        </button>
                        {showActionsModal && (
                            <div className="meeting-action-modal-container">
                                <ul className="meeting-action-modal-list">
                                    <li onClick={() => handleActionClick("delete")}><Trash2 size={16} /> Mass Delete</li>
                                    <li onClick={() => handleActionClick("export")}><Download size={16} /> Export</li>
                                    <li onClick={() => handleActionClick("print")}><Printer size={16} /> Print View</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel - MATCHING TICKET UI */}
            {showAdvancedFilter && (
                <div className="meeting-filters-container" style={{ border: '1px solid #365486', background: '#fff' }}>
                    <div className="meeting-filters-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
                        <button className="meeting-close-filters" onClick={() => setShowAdvancedFilter(false)}><X size={24} strokeWidth={1.5} /></button>
                    </div>
                    <div className="advanced-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', padding: '15px' }}>
                        {Object.keys(tempFilters).map((key) => {
                            const label = allColumns.find(c => c.key === key)?.label || key;
                            const rule = tempFilters[key];
                            return (
                                <div key={key} className="advanced-filter-item" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>{label}</label>
                                    <div className="advanced-input-group" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input 
                                            type={key.includes('Date') ? 'date' : 'text'} 
                                            value={rule.value} 
                                            onChange={(e) => updateAdvancedFilter(key, 'value', e.target.value)} 
                                            placeholder={`Filter ${label}...`}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <button className={`operator-toggle ${rule.operator}`} onClick={() => updateAdvancedFilter(key, 'operator', rule.operator==='include'?'exclude':'include')} style={{ background: rule.operator === 'include' ? '#dcf2f1' : 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', cursor: 'pointer', color: rule.operator === 'include' ? 'green' : 'red' }}>
                                            {rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="advanced-filter-footer" style={{ padding: '10px 15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="footer-left" style={{ display: 'flex', gap: '10px' }}>
                            <button className="meeting-reset-filters" onClick={handleRestoreAdvancedFilter} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#365486', cursor: 'pointer' }}><RotateCcw className={resetSpin ? "rotate-once" : ""} size={16}/> Restore</button>
                            <button className="meeting-apply-btn" onClick={handleApplyAdvancedFilter} style={{ padding: '8px 20px' }}>Apply</button>
                        </div>
                        <div className="footer-right" style={{ display: 'flex', gap: '15px' }}>
                            <button className="meeting-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Copy size={16}/> Save Query As
                            </button>
                            <button className="meeting-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}>
                                <Settings size={16}/> Organize Queries
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Control Modal */}
            {showColumnControl && (
                <div className="meeting-delete-confirm-overlay">
                    <div className="meeting-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
                        <div className="dialog-header" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#0f1035' }}>Select Fields to Display</h3>
                            <button onClick={() => setShowColumnControl(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="col-control-list">
                                <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Available</label>
                                <div className="col-control-box" style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#f9f9f9', padding: '5px' }}>
                                    {tempAvailableKeys.map(key => (<div key={key} onClick={() => setSelectedAvailable(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])} className={`col-item ${selectedAvailable.includes(key)?'selected':''}`} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedAvailable.includes(key) ? '#dcf2f1' : 'transparent', color: selectedAvailable.includes(key) ? '#0f1035' : '#333' }}>{allColumns.find(c=>c.key===key)?.label || key}</div>))}
                                </div>
                            </div>
                            <div className="col-control-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button onClick={handleMoveToVisible} disabled={selectedAvailable.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedAvailable.length > 0 ? '#365486' : '#eee', color: selectedAvailable.length > 0 ? '#fff' : '#999' }}><ChevronRight size={20} /></button>
                                <button onClick={handleMoveToAvailable} disabled={selectedVisible.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedVisible.length > 0 ? '#365486' : '#eee', color: selectedVisible.length > 0 ? '#fff' : '#999' }}><ChevronLeft size={20} /></button>
                            </div>
                            <div className="col-control-list">
                                <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Visible</label>
                                <div className="col-control-box" style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#fff', padding: '5px' }}>
                                    {tempVisibleKeys.map(key => (<div key={key} onClick={() => setSelectedVisible(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])} className={`col-item ${selectedVisible.includes(key)?'selected':''}`} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedVisible.includes(key) ? '#dcf2f1' : 'transparent', color: selectedVisible.includes(key) ? '#0f1035' : '#333' }}>{allColumns.find(c=>c.key===key)?.label || key}</div>))}
                                </div>
                            </div>
                        </div>
                        <div className="meeting-dialog-buttons">
                            <button className="meeting-no-button" onClick={() => setShowColumnControl(false)}>Cancel</button>
                            <button className="meeting-yes-button" onClick={handleSaveColumns}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {showSortModal && (
                <div className="meeting-delete-confirm-overlay">
                    <div className="meeting-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
                        <div className="dialog-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}><h3 style={{ margin: 0, fontSize: '18px', color: '#0f1035' }}>Sort</h3></div>
                        <div className="sort-modal-body">
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', color: '#365486', marginBottom: '10px' }}>Sort Order</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}><input type="radio" name="sortOrder" checked={tempSortConfig.direction === 'asc'} onChange={() => setTempSortConfig(prev => ({ ...prev, direction: 'asc' }))} style={{ marginRight: '10px' }} /> Ascending</label>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}><input type="radio" name="sortOrder" checked={tempSortConfig.direction === 'desc'} onChange={() => setTempSortConfig(prev => ({ ...prev, direction: 'desc' }))} style={{ marginRight: '10px' }} /> Descending</label>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', color: '#365486', marginBottom: '10px' }}>Sort By</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {allColumns.map((col) => (
                                        <label key={col.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                            <input type="radio" name="sortBy" checked={tempSortConfig.key === col.key} onChange={() => setTempSortConfig(prev => ({ ...prev, key: col.key }))} style={{ marginRight: '10px' }} /> {col.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="meeting-dialog-buttons" style={{ marginTop: '20px', justifyContent: 'flex-end', gap: '10px', display: 'flex' }}>
                            <button className="meeting-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
                            <button className="meeting-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Organize Modal */}
            {showOrganizeModal && (
                <div className="meeting-delete-confirm-overlay">
                    <div className="meeting-delete-confirm-dialog" style={{ width: '400px' }}>
                         <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Manage Custom Queries</h3>
                            <button onClick={() => setShowOrganizeModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No custom queries saved.</p>
                        </div>
                         <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button className="meeting-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="meeting-table-container" style={{ overflowX: 'auto', border: '1px solid #eee' }}>
                <table className="meeting-table" style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr>
                            <th className="checkbox-column">
                                <input type="checkbox" className="meeting-custom-checkbox" checked={processedMeetings.length > 0 && selectedRows.length === processedMeetings.length} onChange={handleSelectAll} />
                            </th>
                            {allColumns.map(col => renderHeaderCell(col))}
                            {visibleColumns.actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="100%" className="meeting-empty-state">No meetings found.</td></tr>
                        ) : (
                            currentItems.map((meeting) => (
                                <tr key={meeting.id} className={selectedRows.includes(meeting.id) ? "selected-row" : ""}>
                                    <td className="checkbox-column"><input type="checkbox" className="meeting-custom-checkbox" checked={selectedRows.includes(meeting.id)} onChange={() => toggleRowSelection(meeting.id)} /></td>
                                    {allColumns.map(col => visibleColumns[col.key] && <td key={col.key}>{getCellValue(meeting, col.key)}</td>)}
                                    {visibleColumns.actions && (
                                        <td>
                                            <div className="meeting-table-action-buttons">
                                                <button className="meeting-view-btn" onClick={() => handleViewClick(meeting.id)}><Eye size={18} strokeWidth={1} /></button>
                                                <button className="meeting-delete-btn" onClick={() => { setMeetingToDelete(meeting.id); setShowDeleteConfirm(true); }}><Trash2 size={18} strokeWidth={1} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination - MATCHING TICKET UI */}
            <div className="meeting-pagination">
                <div className="meeting-pagination-left">
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}>{selectedRows.length} Selected</span>
                </div>
                <div className="meeting-pagination-right">
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}>Item Per Page</span>
                    <select className="meeting-items-per-page" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <button className="meeting-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={24} strokeWidth={1.5} color="#dcf2f1"/></button>
                    <button className="meeting-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><CircleArrowLeft size={28} strokeWidth={1.5} color="#dcf2f1"/></button>
                    <div className="meeting-page-input-container">
                        <input type="number" className="meeting-page-input" value={pageInput} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageInputCommit} />
                        <span className="meeting-page-numbers">of {totalPages || 1}</span>
                    </div>
                    <button className="meeting-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><CircleArrowRight size={28} strokeWidth={1.5} color="#dcf2f1"/></button>
                    <button className="meeting-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={24} strokeWidth={1.5} color="#dcf2f1"/></button>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="meeting-delete-confirm-overlay">
                    <div className="meeting-delete-confirm-dialog">
                        <div className="dialog-header"><h3>Confirm Delete</h3><p>Are you sure you want to delete {meetingToDelete ? "this meeting" : `these ${selectedRows.length} meetings`}?</p></div>
                        <div className="meeting-dialog-buttons">
                            <button className="meeting-yes-button" onClick={handleDeleteConfirm}>Yes</button>
                            <button className="meeting-no-button" onClick={() => { setShowDeleteConfirm(false); setMeetingToDelete(null); }}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;