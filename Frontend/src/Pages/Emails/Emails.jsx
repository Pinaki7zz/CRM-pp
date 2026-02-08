import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    RefreshCcw, Filter, Search, ChevronDown, Mail, Trash2,
    Eye, RotateCcw, X, CircleArrowLeft,
    CircleArrowRight, ArrowUpDown, ArrowUp, ArrowDown,
    Settings, ChevronsLeft, ChevronsRight, MoreVertical, Save,
    CheckCircle2, Ban, Printer, Download, FileText, Link as LinkIcon, Copy, Archive,
    Paperclip, ChevronLeft, ChevronRight, Unlink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Emails.css"; 
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

// --- Environment Variables ---
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

// --- CONSTANTS ---

// 1. Default Advanced Filters
const INITIAL_ADVANCED_STATE = {
    related_object: { value: "", operator: "include" },
    contact_name: { value: "", operator: "include" },
    account_name: { value: "", operator: "include" },
    priority: { value: "", operator: "include" },
    received_at: { value: "", operator: "include", type: "all", startDate: "", endDate: "" },
    subject: { value: "", operator: "include" },
    sender: { value: "", operator: "include" },
};

// 2. Default Visible Columns (Ordered Array for Emails)
const DEFAULT_VISIBLE_KEYS = [
    'associated_emails', 'subject', 'sender', 'priority', 
    'contact_name', 'account_name', 'related_object',
    'received_at', 'owner_name'
];

const Emails = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // --- Refs ---
    const actionRef = useRef(null);
    const popupRef = useRef(null);

    // --- Data State ---
    const [emails, setEmails] = useState([]);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 }); 
    
    // Using State for lookups
    const [lookupMaps, setLookupMaps] = useState({ contacts: {}, accounts: {}, users: {}, userEmails: {} });

    const [selectedRows, setSelectedRows] = useState([]);
    
    // --- UI Toggles & Modals ---
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [emailToDelete, setEmailToDelete] = useState(null);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [showActionsModal, setShowActionsModal] = useState(false);
    const [showColumnControl, setShowColumnControl] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showOrganizeModal, setShowOrganizeModal] = useState(false);
    const [activePopupColumn, setActivePopupColumn] = useState(null);

    // --- Loading States ---
    const [refreshSpin, setRefreshSpin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetSpin, setResetSpin] = useState(false);

    // --- MASTER COLUMN LIST ---
    const allColumns = useMemo(() => [
        { key: 'associated_emails', label: 'Associated Emails' },
        { key: 'subject', label: 'Subject' },
        { key: 'sender', label: 'Email From' },
        { key: 'recipient', label: 'Email To' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'has_attachments', label: 'Attachments' },
        { key: 'contact_name', label: 'Contact Name' },
        { key: 'account_name', label: 'Account Name' },
        { key: 'opportunity_name', label: 'Opportunity' },
        { key: 'related_object', label: 'Related Object' },
        { key: 'received_at', label: 'Received On' },
        { key: 'owner_name', label: 'Email Owner' }
    ], []);

    // State for Visible Column Keys (Ordered)
    const [visibleColumnKeys, setVisibleColumnKeys] = useState(DEFAULT_VISIBLE_KEYS);

    // --- Column Control Temp State ---
    const [tempVisibleKeys, setTempVisibleKeys] = useState([]);
    const [tempAvailableKeys, setTempAvailableKeys] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedVisible, setSelectedVisible] = useState([]);

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [columnSearch, setColumnSearch] = useState({});

    // --- Advanced Filters ---
    const [advancedFilters, setAdvancedFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
    const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
    
    const [savedViews, setSavedViews] = useState([]);
    const [quickFilter, setQuickFilter] = useState("all_emails");

    // --- Sorting & Pagination ---
    const [sortConfig, setSortConfig] = useState({ key: 'received_at', direction: 'desc' });
    const [tempSortConfig, setTempSortConfig] = useState({ key: 'received_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- HELPER FUNCTIONS ---
    const getHeaders = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };
    const isEmailUnread = (email) => {
        const status = (email.status || "").toUpperCase();
        return status !== 'READ' && status !== 'ARCHIVED';
    };

    // --- HELPERS: STATUS ---
    // ✅ Logic: Explicitly treat null, undefined, or empty string as 'UNREAD'
    const getEmailStatus = (email) => {
        if (!email.status || email.status.trim() === "") return "UNREAD";
        return email.status.toUpperCase();
    };
    const displayStats = useMemo(() => {
        if (emails.length > 0) {
            const total = emails.length;
            const read = emails.filter(e => (e.status || "").toUpperCase() === 'READ').length;
            const unread = emails.filter(e => isEmailUnread(e)).length;
            return { total, unread, read };
        }
        return stats;
    }, [stats, emails]);
    // --- LOOKUP DATA ---
    const fetchLookupData = async () => {
        const headers = getHeaders();
        const newMaps = { contacts: {}, accounts: {}, users: {}, userEmails: {} };
        const MAX_LIMIT = 10000;

        try {
            if (BASE_URL_AC) {
                // Fetch Accounts
                try {
                    const accountRes = await fetch(`${BASE_URL_AC}/account?limit=${MAX_LIMIT}`, { headers });
                    if (accountRes.ok) {
                        const json = await accountRes.json();
                        const list = json.items || json.data || (Array.isArray(json) ? json : []);
                        list.forEach(a => {
                            const id = String(a.accountId || a.id || a._id);
                            const name = a.accountName || a.name || a.account_name;
                            if (id) newMaps.accounts[id] = name;
                        });
                    }
                } catch (e) { console.error("Account error", e); }

                // Fetch Contacts
                try {
                    const contactRes = await fetch(`${BASE_URL_AC}/contact?limit=${MAX_LIMIT}`, { headers });
                    if (contactRes.ok) {
                        const json = await contactRes.json();
                        const list = json.items || json.data || (Array.isArray(json) ? json : []);
                        list.forEach(c => {
                            const name = c.firstName ? `${c.firstName} ${c.lastName}` : c.name;
                            const id = String(c.contactId || c.id || c._id);
                            const accountId = String(c.accountId || c.account_id || "");
                            if (id) newMaps.contacts[id] = { name, accountId };
                            if (c.email) newMaps.contacts[c.email.toLowerCase()] = { name, accountId };
                        });
                    }
                } catch (e) { console.error("Contact error", e); }
            }

            if (BASE_URL_UM) {
                try {
                    let userRes = await fetch(`${BASE_URL_UM}/users/s-info?limit=${MAX_LIMIT}`, { headers });
                    if (!userRes.ok) userRes = await fetch(`${BASE_URL_UM}/users?limit=${MAX_LIMIT}`, { headers });
                    if (userRes.ok) {
                        const json = await userRes.json();
                        const list = json.items || json.data || (Array.isArray(json) ? json : []);
                        list.forEach(u => {
                            const id = String(u.userId || u.id || u._id);
                            const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
                            const email = u.email ? u.email.toLowerCase() : "";
                            
                            if (id) newMaps.users[id] = name;
                            if (email) newMaps.userEmails[email] = name;
                        });
                    }
                } catch (e) { console.error("User error", e); }
            }
            setLookupMaps(newMaps);
        } catch (error) { console.error("Lookup fetch failed:", error); }
    };

    // --- VALUE RESOLVERS ---
    const extractEmailAddress = (rawString) => {
        if (!rawString) return "";
        const match = rawString.match(/<([^>]+)>/);
        return match ? match[1].trim().toLowerCase() : rawString.trim().toLowerCase();
    };

    const resolveContactObj = (email) => {
        const idsToCheck = [email.contactId, email.contact_id, email.contact, email.ticket?.primary_contact_id];
        for (const rawId of idsToCheck) {
            if (rawId && lookupMaps.contacts[String(rawId)]) return lookupMaps.contacts[String(rawId)];
        }
        const senderEmail = extractEmailAddress(email.sender);
        if (senderEmail && lookupMaps.contacts[senderEmail]) return lookupMaps.contacts[senderEmail];

        if (email.sender === 'Current User' || email.sender === 'System') {
             const recipientEmail = extractEmailAddress(email.recipient);
             if (recipientEmail && lookupMaps.contacts[recipientEmail]) return lookupMaps.contacts[recipientEmail];
        }
        return null;
    };

    const resolveContactName = (email) => {
        const contact = resolveContactObj(email);
        if (contact) return contact.name;
        if (email.contactName) return email.contactName;
        if (email.contact_name) return email.contact_name;
        if (email.ticket && (email.ticket.primary_contact_name || email.ticket.contact_name)) return email.ticket.primary_contact_name || email.ticket.contact_name;
        return "-";
    };

    const resolveAccountName = (email) => {
        const idsToCheck = [email.accountId, email.account_id, email.account, email.ticket?.account_id];
        for (const rawId of idsToCheck) {
            if (rawId && lookupMaps.accounts[String(rawId)]) return lookupMaps.accounts[String(rawId)];
        }
        const contact = resolveContactObj(email);
        if (contact && contact.accountId && lookupMaps.accounts[String(contact.accountId)]) {
            return lookupMaps.accounts[String(contact.accountId)];
        }
        if (email.accountName) return email.accountName;
        if (email.account_name) return email.account_name;
        if (email.ticket && email.ticket.account_name) return email.ticket.account_name;
        return "-";
    };

    const resolveOpportunityName = (email) => {
        if (email.opportunityName) return email.opportunityName;
        if (email.opportunity_name) return email.opportunity_name;
        if (email.opportunity && email.opportunity.name) return email.opportunity.name;
        if (email.opportunity && email.opportunity.opportunityName) return email.opportunity.opportunityName;
        return "-";
    };

    const getOwnerName = (email) => {
        if (user && (
            email.sender === 'Current User' || 
            email.sender === 'System' || 
            email.ticket?.ticket_owner_name === 'System'
        )) {
            return user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Me";
        }

        if (email.ticket && (email.ticket.ticket_owner_name || email.ticket.owner_name)) {
            return email.ticket.ticket_owner_name || email.ticket.owner_name;
        }
        
        const possibleIds = [email.ticket_owner_id, email.ownerId, email.owner_id, email.created_by, email.userId, email.user_id, email.assigned_to];
        for (const rawId of possibleIds) {
            if (!rawId) continue;
            const idStr = String(rawId);
            if (lookupMaps.users[idStr]) return lookupMaps.users[idStr];
        }

        const senderEmail = extractEmailAddress(email.sender);
        if (senderEmail && lookupMaps.userEmails[senderEmail]) return lookupMaps.userEmails[senderEmail];
        return "-";
    };

    const formatText = (text) => {
        if (!text) return "-";
        return String(text).charAt(0).toUpperCase() + String(text).slice(1).toLowerCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // --- CELL VALUE GETTER ---
    const getCellValue = (email, key) => {
        const relatedObj = (email.relatedObject || email.related_object || "").toLowerCase();
        
        // ✅ Strict Unread Check
        const status = getEmailStatus(email);
        const isUnread = status === 'UNREAD';
        const baseStyle = { fontWeight: isUnread ? '700' : '400', color: isUnread ? '#0f1035' : '#555' };

        if (relatedObj === 'lead' && (key === 'contact_name' || key === 'account_name')) {
            return "-";
        }

        switch(key) {
            case 'associated_emails': 
                // ✅ Enhanced Logic: Check actual IDs instead of just the 'relatedObject' string
                const isLinked = (
                    email.ticketId || email.ticket_id || 
                    email.opportunityId || email.opportunity_id || 
                    email.leadId || email.lead_id || 
                    email.accountId || email.account_id
                );
                
                if (isLinked) {
                    return (
                        <span title="Linked to Record" style={{color:'#2e7d32', display:'flex', alignItems:'center', gap:'5px', fontWeight: '600', fontSize:'13px'}}>
                            <LinkIcon size={14} /> Linked
                        </span>
                    );
                }
                return <span style={{color:'#999', display:'flex', alignItems:'center', gap:'5px', fontSize:'13px'}}><Unlink size={14} /> -</span>;

            case 'subject': return <span style={baseStyle}>{email.subject || '(No Subject)'}</span>;
            case 'sender': 
                let senderVal = email.sender || '-';
                if ((senderVal.toLowerCase() === 'current user' || senderVal.toLowerCase() === 'system') && user) {
                    senderVal = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "Me";
                }
                return <span style={baseStyle}>{senderVal}</span>;
            case 'recipient': return <span style={baseStyle}>{email.recipient || '-'}</span>;
            case 'priority': 
                // ✅ FIXED: Prefer Ticket Priority if linked, otherwise Email Priority, fallback to 'Normal'
                let rawPrio = email.priority;
                if (!rawPrio && email.ticket && email.ticket.priority) {
                    rawPrio = email.ticket.priority;
                }
                if (!rawPrio) rawPrio = 'NORMAL';
                
                return <span style={baseStyle}>{formatText(rawPrio)}</span>;
            case 'status':
                // ✅ FIXED: Display UNREAD if status is missing/empty
                const status = isUnread ? "UNREAD" : (email.status || "READ").toUpperCase();
                return <span style={baseStyle}>{formatText(status)}</span>;
            case 'has_attachments':
                const attList = email.attachments;
                if (!attList || attList.length === 0) return "-";
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {attList.slice(0, 3).map((att) => (
                            <a 
                                key={att.id} 
                                href={`${BASE_URL_AM}/emails/attachments/${att.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title={att.original_name || att.filename}
                                onClick={(e) => e.stopPropagation()} 
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#365486', textDecoration: 'none', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                <Paperclip size={12}/> {att.original_name || att.filename}
                            </a>
                        ))}
                        {attList.length > 3 && (
                            <span style={{ fontSize: '11px', color: '#666', paddingLeft: '16px' }}>
                                +{attList.length - 3} more
                            </span>
                        )}
                    </div>
                );
            case 'related_object': return <span style={baseStyle}>{formatText(email.relatedObject || (email.ticketId ? "Ticket" : ""))}</span>;
            case 'contact_name': return <span style={baseStyle}>{resolveContactName(email)}</span>;
            case 'account_name': return <span style={baseStyle}>{resolveAccountName(email)}</span>;
            case 'opportunity_name': return <span style={baseStyle}>{resolveOpportunityName(email)}</span>;
            case 'received_at': return <span style={{...baseStyle, fontSize: '13px'}}>{formatDate(email.receivedAt || email.created_at)}</span>;
            case 'owner_name': return <span style={baseStyle}>{getOwnerName(email)}</span>;
            default: return <span style={baseStyle}>{email[key] || ''}</span>;
        }
    };

    // --- API CALLS ---
    const fetchEmails = useCallback(async () => {
        setLoading(true);
        const headers = getHeaders();
        try {
            const response = await fetch(`${BASE_URL_AM}/emails?limit=2000`, { headers });
            if (response.ok) {
                const json = await response.json();
                let list = [];
                if (json.data && Array.isArray(json.data.emails)) list = json.data.emails;
                else if (json.data && Array.isArray(json.data)) list = json.data;
                else if (Array.isArray(json)) list = json;
                setEmails(list);
            }
        } catch (error) {
            toast.error("Failed to load emails");
        } finally {
            setLoading(false);
        }
    }, []);

    // --- INITIAL LOAD & PERSISTENCE ---
    useEffect(() => {
        fetchLookupData();
        fetchEmails();

        const saved = localStorage.getItem("emailViews");
        if (saved) setSavedViews(JSON.parse(saved));

        const savedCols = localStorage.getItem("emailColumnPrefs");
        if (savedCols) {
            try {
                const parsed = JSON.parse(savedCols);
                if(Array.isArray(parsed) && parsed.length > 0) {
                    const validKeys = parsed.filter(k => allColumns.some(c => c.key === k));
                    if (validKeys.length > 0) setVisibleColumnKeys(validKeys);
                }
            } catch(e) { console.error("Error parsing saved columns", e); }
        }
    }, [fetchEmails, allColumns]); 

    // --- REAL-TIME COUNTERS ---
    const emailCounts = useMemo(() => {
        const currentUserName = (user?.name || "").toLowerCase();
        const todayStr = new Date().toISOString().split('T')[0];
        
        return {
            all: emails.length,
            my: emails.filter(e => getOwnerName(e).toLowerCase().includes(currentUserName) || e.sender === "Current User").length,
            // ✅ Fix: Ensure status check handles empty/null as UNREAD
            unread: emails.filter(e => {
                const s = getEmailStatus(e);
                return s !== 'READ' && s !== 'ARCHIVED';
            }).length,
            read: emails.filter(e => getEmailStatus(e) === "READ").length,
            archived: emails.filter(e => getEmailStatus(e) === "ARCHIVED").length,
            today: emails.filter(e => (e.receivedAt || "").startsWith(todayStr)).length
        };
    }, [emails, user]);

    // --- PROCESSING LOGIC ---
    const processedEmails = useMemo(() => {
        let result = [...emails];

        // 1. IMPROVED SEARCH: Global Search
        if (searchTerm) {
            const searchTokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
            result = result.filter(e => {
                const searchableText = `
                    ${e.subject || ""} ${e.sender || ""} ${e.recipient || ""} 
                    ${resolveContactName(e) || ""} ${resolveAccountName(e) || ""} 
                    ${getOwnerName(e) || ""}
                `.toLowerCase();
                return searchTokens.every(token => searchableText.includes(token));
            });
        }

        // 2. Column Search
        Object.keys(columnSearch).forEach(key => {
            const val = columnSearch[key]?.toLowerCase();
            if (val) {
                result = result.filter(item => {
                    let cellValue = "";
                    if(key === 'contact_name') cellValue = resolveContactName(item);
                    else if(key === 'account_name') cellValue = resolveAccountName(item);
                    else if(key === 'opportunity_name') cellValue = resolveOpportunityName(item);
                    else if(key === 'owner_name') cellValue = getOwnerName(item);
                    else if(key === 'sender') cellValue = item.sender === 'Current User' && user ? (user.name || "Current User") : (item.sender || "");
                    else cellValue = String(item[key] || "");
                    return cellValue.toLowerCase().includes(val);
                });
            }
        });

        // 3. Quick Filters (System Views)
        const currentUserName = user?.name || "Current User";
        const todayStr = new Date().toISOString().split('T')[0];

        switch (quickFilter) {
            case "my_emails": result = result.filter(e => getOwnerName(e).toLowerCase().includes(currentUserName.toLowerCase()) || e.sender === "Current User"); break;
            case "unread_emails": result = result.filter(e => {
                const s = getEmailStatus(e);
                return s !== 'READ' && s !== 'ARCHIVED';
            }); break;
            case "read_emails": result = result.filter(e => getEmailStatus(e) === "READ"); break;
            case "archived_emails": result = result.filter(e => getEmailStatus(e) === "ARCHIVED"); break;
            case "today_emails": result = result.filter(e => (e.receivedAt || "").startsWith(todayStr)); break;
            case "last_7_days":
                const d7 = new Date(); d7.setDate(d7.getDate()-7);
                result = result.filter(e => new Date(e.receivedAt || e.created_at) >= d7); break;
            case "last_30_days":
                const d30 = new Date(); d30.setDate(d30.getDate()-30);
                result = result.filter(e => new Date(e.receivedAt || e.created_at) >= d30); break;
        }

        // 4. Advanced Filters
        Object.keys(advancedFilters).forEach(key => {
            const rule = advancedFilters[key];
            if (!rule.value && key !== 'received_at') return;
            
            if (key === 'received_at') {
                if (!rule.type || rule.type === 'all') return;
                const now = new Date();
                result = result.filter(item => {
                    const itemDate = new Date(item.receivedAt || item.created_at);
                    if (isNaN(itemDate.getTime())) return false;
                    const itemDateStr = itemDate.toISOString().split('T')[0];
                    const today = now.toISOString().split('T')[0];

                    if (rule.type === 'today') return itemDateStr === today;
                    else if (rule.type === 'last_7_days') {
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(now.getDate() - 7);
                        return itemDate >= sevenDaysAgo && itemDate <= now;
                    } else if (rule.type === 'this_month') {
                        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                    } else if (rule.type === 'custom') {
                        if (!rule.startDate && !rule.endDate) return true;
                        const start = rule.startDate ? new Date(rule.startDate) : new Date('1970-01-01');
                        const end = rule.endDate ? new Date(rule.endDate) : new Date('2100-01-01');
                        end.setHours(23, 59, 59, 999);
                        return itemDate >= start && itemDate <= end;
                    }
                    return true;
                });
                return;
            }

            const filterVal = rule.value.toLowerCase();
            const operator = rule.operator;
            
            result = result.filter(item => {
                let cellValue = "";
                if(key === 'contact_name') cellValue = resolveContactName(item);
                else if(key === 'account_name') cellValue = resolveAccountName(item);
                else if(key === 'related_object') cellValue = item.relatedObject || (item.ticketId ? "Ticket" : "");
                else if(key === 'sender') cellValue = item.sender === 'Current User' && user ? (user.name || "Current User") : (item.sender || "");
                else cellValue = String(item[key] || "");

                cellValue = cellValue.toLowerCase();
                const match = cellValue.includes(filterVal);
                return operator === 'include' ? match : !match;
            });
        });

        // 5. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = "", bValue = "";
                if(sortConfig.key === 'received_at') {
                    aValue = new Date(a.receivedAt || 0).getTime();
                    bValue = new Date(b.receivedAt || 0).getTime();
                } else if(sortConfig.key === 'owner_name') {
                    aValue = getOwnerName(a).toLowerCase();
                    bValue = getOwnerName(b).toLowerCase();
                } else {
                    aValue = String(a[sortConfig.key] || "").toLowerCase();
                    bValue = String(b[sortConfig.key] || "").toLowerCase();
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [emails, searchTerm, columnSearch, quickFilter, advancedFilters, sortConfig, user, lookupMaps]);

    // --- GLOBAL RESET LOGIC ---
    const handleGlobalReset = () => {
        setResetSpin(true);
        // 1. Clear simple filters
        setSearchTerm("");
        setColumnSearch({});
        setQuickFilter("all_emails");
        
        // 2. Deep copy clean state to wipe complex filters
        const freshState = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
        setAdvancedFilters(freshState);
        setTempFilters(freshState);
        
        // 3. Reset Table UI & Columns
        setSortConfig({ key: 'received_at', direction: 'desc' });
        setVisibleColumnKeys(DEFAULT_VISIBLE_KEYS); 
        setCurrentPage(1);
        setSelectedRows([]); 
        
        // 4. Refresh Data
        fetchEmails(); 

        setTimeout(() => setResetSpin(false), 500);
        toast.info("View reset to default");
    };

    // --- ACTIONS HANDLERS ---
    const handleSelectAll = () => {
        if (selectedRows.length === processedEmails.length && processedEmails.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(processedEmails.map(e => e.id));
        }
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    // ✅ FIXED: Using 'bulk-status' to ensure reliable update on View
    const handleViewEmail = async (email, e) => {
        if (e) e.stopPropagation();
        
        // If it's UNREAD, mark it as READ in the background
        if (getEmailStatus(email) === 'UNREAD') {
            try {
                fetch(`${BASE_URL_AM}/emails/bulk-status`, { 
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ ids: [email.id], status: 'READ' })
                }).catch(err => console.error("Error marking as read", err));
            } catch (e) { /* silent fail */ }
        }
        navigate(`/activitymanagement/emails/view`, { state: { emailId: email.id } });
    };

    const handleDeleteConfirm = async () => {
        const headers = getHeaders();
        const ids = emailToDelete ? [emailToDelete] : selectedRows;
        try {
            for (const id of ids) {
                await fetch(`${BASE_URL_AM}/emails/${id}`, { method: 'DELETE', headers });
            }
            toast.success("Deleted successfully");
            fetchEmails();
            setSelectedRows([]);
            setShowDeleteConfirm(false);
            setEmailToDelete(null);
        } catch (e) { toast.error("Delete failed"); }
    };

    const updateStatusApi = async (ids, status) => {
        const headers = getHeaders();
        try {
            await fetch(`${BASE_URL_AM}/emails/bulk-status`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ids, status })
            });
            toast.success(`Marked as ${status}`);
            fetchEmails();
            setSelectedRows([]);
        } catch (e) { toast.error("Update failed"); }
    };

    const handlePrintView = () => {
        const rowsToPrint = processedEmails.filter(e => selectedRows.includes(e.id));
        if (rowsToPrint.length === 0) return toast.warn("Select emails to print");

        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast.error("Popup blocked");

        const html = `
            <html>
                <head>
                    <title>Print Emails</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>Selected Emails (${rowsToPrint.length})</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th><th>From</th><th>To</th><th>Status</th><th>Received</th><th>Related To</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsToPrint.map(row => `
                                <tr>
                                    <td>${row.subject || '-'}</td>
                                    <td>${row.sender || '-'}</td>
                                    <td>${row.recipient || '-'}</td>
                                    <td>${row.status || '-'}</td>
                                    <td>${new Date(row.receivedAt).toLocaleDateString()}</td>
                                    <td>${row.relatedObject || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    const executeExport = (format) => {
        const rowsToExport = processedEmails.filter(e => selectedRows.includes(e.id));
        if (rowsToExport.length === 0) return toast.warn("Select emails to export");

        const headers = ["Associated Emails", "Subject", "Email From", "Email To", "Priority", "Status", "Contact Name", "Account Name", "Opportunity Name", "Related Object", "Received On", "Email Owner"];
        
        const data = rowsToExport.map(row => [
            row.relatedObject ? "Yes" : "No",
            row.subject || "",
            row.sender || "",
            row.recipient || "",
            row.priority || "Normal",
            row.status || "UNREAD",
            resolveContactName(row) || "",
            resolveAccountName(row) || "",
            resolveOpportunityName(row) || "",
            row.relatedObject || "",
            row.receivedAt ? new Date(row.receivedAt).toLocaleString() : "",
            getOwnerName(row) || ""
        ]);

        if (format === 'csv') {
            const csvContent = [
                headers.join(","),
                ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            ].join("\n");
            
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
            link.setAttribute("download", `emails_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Exported as CSV");
        } 
        else if (format === 'excel') {
            const xlsContent = [
                headers.join("\t"),
                ...data.map(row => row.map(cell => String(cell).replace(/\t/g, " ")).join("\t"))
            ].join("\n");
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([xlsContent], { type: "application/vnd.ms-excel;charset=utf-8;" }));
            link.setAttribute("download", `emails_export_${Date.now()}.xls`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Exported as Excel");
        }
        else if (format === 'pdf') {
            handlePrintView(); 
            toast.info("Please choose 'Save as PDF' in the print dialog");
        }
        setShowExportModal(false);
    };

    const handleActionClick = (action) => {
        setShowActionsModal(false);
        if (selectedRows.length === 0 && action !== 'export_menu') return toast.warn("Select emails first");

        switch(action) {
            case 'mass_delete': setShowDeleteConfirm(true); break;
            case 'export_menu': setShowExportModal(true); break;
            case 'print': handlePrintView(); break;
            case 'mark_read': updateStatusApi(selectedRows, 'READ'); break;
            case 'mark_unread': updateStatusApi(selectedRows, 'UNREAD'); break;
            case 'archive': updateStatusApi(selectedRows, 'ARCHIVED'); break;
        }
    };

    // --- UI LOGIC ---
    const handleViewChange = (viewId) => {
        setQuickFilter(viewId);
        setCurrentPage(1);
        const selectedSavedView = savedViews.find(v => v.id === viewId);
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

    const handleSaveChanges = () => {
        const systemViews = ["all_emails", "my_emails", "unread_emails", "read_emails", "archived_emails", "today_emails", "last_7_days", "last_30_days"];
        
        if (systemViews.includes(quickFilter)) {
            handleSaveQuery();
            return;
        }

        const updatedViews = savedViews.map(view => {
            if (view.id === quickFilter) {
                return { ...view, filters: tempFilters };
            }
            return view;
        });

        setSavedViews(updatedViews);
        localStorage.setItem("emailViews", JSON.stringify(updatedViews));
        setAdvancedFilters(tempFilters);
        toast.success("View updated successfully!");
    };

    const handleSaveQuery = () => {
        const name = prompt("Enter a name for this view:", "New Custom View");
        if (name) {
            const newView = { id: Date.now().toString(), name: name, filters: tempFilters };
            const updatedViews = [...savedViews, newView];
            setSavedViews(updatedViews);
            localStorage.setItem("emailViews", JSON.stringify(updatedViews));
            setQuickFilter(newView.id);
            setAdvancedFilters(tempFilters);
            toast.success(`View "${name}" saved!`);
        }
    };

    const handleDeleteView = (viewId) => {
        if(window.confirm("Are you sure you want to delete this view?")) {
            const updatedViews = savedViews.filter(v => v.id !== viewId);
            setSavedViews(updatedViews);
            localStorage.setItem("emailViews", JSON.stringify(updatedViews));
            
            if (quickFilter === viewId) {
                setQuickFilter("all_emails");
                const fresh = JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE));
                setAdvancedFilters(fresh);
                setTempFilters(fresh);
            }
            toast.success("View deleted.");
        }
    };

    const updateAdvancedFilter = (key, field, value) => {
        setTempFilters(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    };

    const toggleOperator = (key) => {
        setTempFilters(prev => ({ 
            ...prev, 
            [key]: { ...prev[key], operator: prev[key].operator === 'include' ? 'exclude' : 'include' } 
        }));
    };

    const handleApplyAdvancedFilter = () => {
        setAdvancedFilters(tempFilters);
        setCurrentPage(1);
        toast.success("Filters applied successfully");
    };

    const handleRestoreAdvancedFilter = () => {
        setResetSpin(true);
        setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
        setTimeout(() => setResetSpin(false), 500);
    };

    // --- Column Control (Adapted to match Ticket UI) ---
    const openColumnControl = () => {
        setTempVisibleKeys(visibleColumnKeys);
        
        // Calculate Available: All Columns NOT in Visible Keys
        const available = allColumns
            .filter(c => !visibleColumnKeys.includes(c.key))
            .map(c => c.key);
        
        setTempAvailableKeys(available);
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

    const handleSaveColumns = () => {
        setVisibleColumnKeys(tempVisibleKeys);
        localStorage.setItem("emailColumnPrefs", JSON.stringify(tempVisibleKeys));
        setShowColumnControl(false);
        toast.success("Columns updated");
    };

    const handleSort = (key, direction) => { setSortConfig({ key, direction }); setActivePopupColumn(null); };
    const renderSortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon-active"/> : <ArrowDown size={14} className="sort-icon-active"/>) : null;

    // --- PAGINATION STATE (Add This) ---
    const [pageInput, setPageInput] = useState(1);

    // Sync local input when actual page changes (e.g. clicking Next/Prev)
    useEffect(() => {
        setPageInput(currentPage);
    }, [currentPage]);

    // Handle committing the manual input (Enter key or Blur)
    const handlePageInputCommit = () => {
        const val = parseInt(pageInput);
        if (!isNaN(val) && val >= 1 && val <= (totalPages || 1)) {
            setCurrentPage(val);
        } else {
            // Revert if invalid
            setPageInput(currentPage);
        }
    };

    // --- UI RENDERERS ---
    const renderHeaderCell = (colKey) => {
        const col = allColumns.find(c => c.key === colKey);
        if (!col) return null;

        const isPopupOpen = activePopupColumn === col.key;
        return (
            <th key={col.key} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div onClick={() => handleSort(col.key, sortConfig.direction === 'asc' ? 'desc' : 'asc')} 
                         style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {col.label} 
                        {renderSortIcon(col.key)}
                    </div>
                    <button className="header-menu-btn" onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : col.key); }} style={{border: "none", background: "none", cursor: "pointer"}}>
                        <MoreVertical size={16} color="#666" />
                    </button>
                </div>
                {isPopupOpen && (
                    <div className="header-popup-menu" ref={popupRef} onClick={e => e.stopPropagation()} style={{position:'absolute', top:'100%', right:0, zIndex:100, background:'white', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', border:'1px solid #eee', borderRadius:'6px', padding:'10px', width:'200px'}}>
                         <button onClick={() => handleSort(col.key, 'asc')} style={{ display: 'flex', gap: '8px', width: '100%', padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}><ArrowUp size={14}/> Ascending</button>
                         <button onClick={() => handleSort(col.key, 'desc')} style={{ display: 'flex', gap: '8px', width: '100%', padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}><ArrowDown size={14}/> Descending</button>
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '5px' }}>
                            <input type="text" placeholder={`Filter ${col.label}...`} value={columnSearch[col.key] || ''} onChange={e => setColumnSearch({...columnSearch, [col.key]: e.target.value})} autoFocus style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                )}
            </th>
        );
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedEmails.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedEmails.length / itemsPerPage);

    useEffect(() => {
        function handleClickOutside(event) {
            if (actionRef.current && !actionRef.current.contains(event.target)) setShowActionsModal(false);
            if (popupRef.current && !popupRef.current.contains(event.target)) setActivePopupColumn(null);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="email-management-container">
            {/* Stats Panel */}
            <div className="email-stats">
                <div className="email-stat-item">
                    <div className="email-stat-badge"><div className="email-stat-badge__inner">{emailCounts.all}</div></div>
                    <div className="email-stat-content"><div className="email-stat-value">Total Emails</div></div>
                </div>
                <div className="email-stat-item">
                    <div className="email-stat-badge"><div className="email-stat-badge__inner">{emailCounts.unread}</div></div>
                    <div className="email-stat-content"><div className="email-stat-value">Unread Emails</div></div>
                </div>
                <div className="email-stat-item">
                    <div className="email-stat-badge"><div className="email-stat-badge__inner">{emailCounts.read}</div></div>
                    <div className="email-stat-content"><div className="email-stat-value">Read Emails</div></div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="email-actions">
                <div className="email-dropdown-container">
                    <Mail size={20} className="user-round-icon" strokeWidth={1} />
                    <select className="email-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
                        <optgroup label="System Views">
                            <option value="all_emails">All Emails ({emailCounts.all})</option>
                            <option value="my_emails">My Emails ({emailCounts.my})</option>
                            <option value="unread_emails">Unread Emails ({emailCounts.unread})</option>
                            <option value="read_emails">Read Emails ({emailCounts.read})</option>
                            <option value="archived_emails">Archived Emails ({emailCounts.archived})</option>
                            <option value="today_emails">Today's Emails ({emailCounts.today})</option>
                        </optgroup>
                        {savedViews.length > 0 && (
                            <optgroup label="My Custom Queries">
                                {savedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
                            </optgroup>
                        )}
                    </select>
                </div>

                <div className="email-search-container">
                    <input type="text" placeholder="Search Emails..." className="email-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Search className="search-icon-small" size={20} color="#0f1035" strokeWidth={1} />
                </div>

                <div className="email-action-icons">
                    <button className="email-icon-button-modern" title="Refresh List" onClick={() => { setRefreshSpin(true); fetchEmails(); setTimeout(() => setRefreshSpin(false), 500); }}>
                        <RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    <button className="email-icon-button-modern" title="Sort Columns" onClick={() => setShowSortModal(true)}>
                        <ArrowUpDown size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    <button className={`email-icon-button-modern ${showAdvancedFilter ? 'active-filter' : ''}`} title="Advanced Filters" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} style={{ backgroundColor: showAdvancedFilter ? '#dcf2f1' : 'transparent' }}>
                        <Filter size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    <button className="email-icon-button-modern" title="Manage Columns" onClick={openColumnControl}>
                        <Settings size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    <button className="email-icon-button-modern" title="Reset All Filters" onClick={handleGlobalReset}>
                        <RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
                    </button>
                    
                    <div className="email-action-button-container" ref={actionRef}>
                        <button className="email-action-button" title="Bulk Actions" onClick={() => setShowActionsModal(!showActionsModal)}>
                            Actions <ChevronDown size={20} color="#dcf2f1" strokeWidth={2} />
                        </button>
                        {showActionsModal && (
                            <div className="email-action-modal-container">
                                <ul className="email-action-modal-list">
                                    <li onClick={() => handleActionClick("mass_delete")}><Trash2 size={16} /> Mass Delete</li>
                                    <li onClick={() => handleActionClick("export_menu")}><Download size={16} /> Export</li>
                                    <li onClick={() => handleActionClick("print")}><Printer size={16} /> Print View</li>
                                    <li onClick={() => handleActionClick("mark_read")}><CheckCircle2 size={16} /> Mark as Read</li>
                                    <li onClick={() => handleActionClick("mark_unread")}><Ban size={16} /> Mark as Unread</li>
                                    <li onClick={() => handleActionClick("archive")}><Archive size={16} /> Archive</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced Filter Panel */}
            {showAdvancedFilter && (
                <div className="email-filters-container" style={{ border: '1px solid #365486', background: '#fff' }}>
                    <div className="email-filters-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <h3><Filter size={18} style={{ marginRight: '8px' }}/> Advanced Query Builder</h3>
                        <button className="email-close-filters" onClick={() => setShowAdvancedFilter(false)}><X size={24} strokeWidth={1.5} /></button>
                    </div>
                    
                    <div className="email-filter-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', padding: '15px' }}>
                        {Object.keys(tempFilters).map((key) => {
                            if (key === 'received_at' && tempFilters.received_at.type !== 'custom') return null; 
                            const label = allColumns.find(c => c.key === key)?.label || formatText(key);
                            const rule = tempFilters[key];

                            return (
                                <div key={key} className="email-filter-col" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>{label}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input 
                                            type="text" 
                                            className="email-filter-input"
                                            value={rule.value || ""} 
                                            onChange={(e) => updateAdvancedFilter(key, 'value', e.target.value)} 
                                            placeholder={`Filter ${label}...`}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <button onClick={() => toggleOperator(key)} title="Toggle Include/Exclude" style={{ background: rule.operator === 'include' ? '#dcf2f1' : 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', cursor: 'pointer', color: rule.operator === 'include' ? 'green' : 'red' }}>
                                            {rule.operator === 'include' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="email-filters-header" style={{ padding: '10px 15px', borderTop: '1px solid #eee', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="email-reset-filters" onClick={handleRestoreAdvancedFilter} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#365486', cursor: 'pointer' }}><RotateCcw className={resetSpin ? "rotate-once" : ""} size={16}/> Restore</button>
                            <button className="email-apply-btn" onClick={handleApplyAdvancedFilter} style={{ padding: '8px 20px' }}>Apply</button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="email-no-button" onClick={handleSaveChanges} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}><Save size={16}/> Save Changes</button>
                            <button className="email-no-button" onClick={handleSaveQuery} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}><Copy size={16}/> Save Query As</button>
                            <button className="email-no-button" onClick={() => setShowOrganizeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#365486' }}><Settings size={16}/> Organize Queries</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Organize Queries Modal */}
            {showOrganizeModal && (
                <div className="email-delete-confirm-overlay">
                    <div className="email-delete-confirm-dialog" style={{ width: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                                        <button onClick={() => handleDeleteView(view.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }} title="Delete View"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button className="email-no-button" onClick={() => setShowOrganizeModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Control Modal */}
            {showColumnControl && (
                <div className="email-delete-confirm-overlay">
                    <div className="email-delete-confirm-dialog" style={{ width: '600px', maxWidth: '95vw', padding: '20px' }}>
                        <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#0f1035' }}>Select Fields to Display</h3>
                            <button onClick={() => setShowColumnControl(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Available</label>
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#f9f9f9', padding: '5px' }}>
                                    {tempAvailableKeys.map(key => (<div key={key} onClick={() => setSelectedAvailable(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedAvailable.includes(key) ? '#dcf2f1' : 'transparent', color: selectedAvailable.includes(key) ? '#0f1035' : '#333' }}>{allColumns.find(c => c.key === key)?.label || key}</div>))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button onClick={handleMoveToVisible} disabled={selectedAvailable.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedAvailable.length > 0 ? '#365486' : '#eee', color: selectedAvailable.length > 0 ? '#fff' : '#999' }}><ChevronRight size={20} /></button>
                                <button onClick={handleMoveToAvailable} disabled={selectedVisible.length === 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: selectedVisible.length > 0 ? '#365486' : '#eee', color: selectedVisible.length > 0 ? '#fff' : '#999' }}><ChevronLeft size={20}/></button>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#365486' }}>Visible</label>
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', height: '250px', overflowY: 'auto', background: '#fff', padding: '5px' }}>
                                    {tempVisibleKeys.map(key => (<div key={key} onClick={() => setSelectedVisible(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])} style={{ padding: '8px', cursor: 'pointer', borderRadius: '3px', fontSize: '14px', backgroundColor: selectedVisible.includes(key) ? '#dcf2f1' : 'transparent', color: selectedVisible.includes(key) ? '#0f1035' : '#333' }}>{allColumns.find(c => c.key === key)?.label || key}</div>))}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="email-no-button" onClick={() => setShowColumnControl(false)}>Cancel</button>
                            <button className="email-yes-button" onClick={handleSaveColumns}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {showSortModal && (
                <div className="email-delete-confirm-overlay">
                    <div className="email-delete-confirm-dialog" style={{ width: '300px', textAlign: 'left' }}>
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f1035' }}>Sort</h3>
                        </div>
                        <div className="sort-modal-body">
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', color: '#365486', marginBottom: '10px' }}>Sort Order</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}><input type="radio" checked={tempSortConfig.direction === 'asc'} onChange={() => setTempSortConfig({ ...tempSortConfig, direction: 'asc' })} style={{ marginRight: '10px' }} /> Ascending</label>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}><input type="radio" checked={tempSortConfig.direction === 'desc'} onChange={() => setTempSortConfig({ ...tempSortConfig, direction: 'desc' })} style={{ marginRight: '10px' }} /> Descending</label>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', color: '#365486', marginBottom: '10px' }}>Sort By</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {allColumns.map((col) => (
                                        <label key={col.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                            <input type="radio" checked={tempSortConfig.key === col.key} onChange={() => setTempSortConfig({ ...tempSortConfig, key: col.key })} style={{ marginRight: '10px' }} /> {col.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="email-dialog-buttons" style={{ marginTop: '20px', justifyContent: 'flex-end', gap: '10px', display: 'flex' }}>
                            <button className="email-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
                            <button className="email-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="email-delete-confirm-overlay">
                    <div className="email-delete-confirm-dialog" style={{ width: '350px' }}>
                        <div className="dialog-header"><h3>Select Export Format</h3></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
                            <button onClick={() => executeExport('csv')} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize:'14px', color:'#333' }}>
                                <FileText size={20} color="#2e7d32" /> Export as CSV
                            </button>
                            <button onClick={() => executeExport('excel')} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize:'14px', color:'#333' }}>
                                <FileText size={20} color="#1565c0" /> Export as Excel (XLSX)
                            </button>
                            <button onClick={() => executeExport('pdf')} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize:'14px', color:'#333' }}>
                                <FileText size={20} color="#c62828" /> Export as PDF
                            </button>
                        </div>
                        <div className="email-dialog-buttons">
                            <button className="email-no-button" onClick={() => setShowExportModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="email-table-container" style={{ overflowX: 'auto', border: '1px solid #eee', width: '100%', maxWidth: '100%' }}>
                <table className="email-table">
                    <thead>
                        <tr>
                            <th className="checkbox-column">
                                <input type="checkbox" className="email-custom-checkbox" checked={processedEmails.length > 0 && selectedRows.length === processedEmails.length} onChange={handleSelectAll} />
                            </th>
                            {/* Render Columns based on ORDERED keys */}
                            {visibleColumnKeys.map(colKey => renderHeaderCell(colKey))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="100%" style={{ textAlign: "center", padding: "20px", fontStyle: 'italic', color: '#365486' }}>No emails found.</td></tr>
                        ) : (
                            currentItems.map((email) => (
                                // Bold Row Logic: Strict status check
                                <tr key={email.id} 
                                    className={`${selectedRows.includes(email.id) ? "selected-row" : ""} ${getEmailStatus(email) !== 'READ' && getEmailStatus(email) !== 'ARCHIVED' ? "unread-row" : ""}`}
                                    style={{ 
                                        cursor: 'default', 
                                        fontWeight: (getEmailStatus(email) !== 'READ' && getEmailStatus(email) !== 'ARCHIVED') ? '700' : '400',
                                        color: (getEmailStatus(email) !== 'READ' && getEmailStatus(email) !== 'ARCHIVED') ? '#0f1035' : '#555',
                                        backgroundColor: (getEmailStatus(email) !== 'READ' && getEmailStatus(email) !== 'ARCHIVED') ? '#f5f9ff' : 'white'
                                    }}
                                >
                                    <td className="checkbox-column"><input type="checkbox" className="email-custom-checkbox" checked={selectedRows.includes(email.id)} onChange={() => toggleRowSelection(email.id)} style={{ cursor: 'pointer' }} /></td>
                                    {visibleColumnKeys.map(colKey => <td key={colKey}>{getCellValue(email, colKey)}</td>)}
                                    <td>
                                        <div className="email-table-action-buttons">
                                            <button className="email-view-btn" onClick={(e) => handleViewEmail(email, e)}><Eye size={18} strokeWidth={1} /></button>
                                            <button className="email-delete-btn" onClick={(e) => { e.stopPropagation(); setEmailToDelete(email.id); setShowDeleteConfirm(true); }}><Trash2 size={18} strokeWidth={1} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="email-pagination">
                <div className="email-pagination-left">
                     <span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}>{selectedRows.length} Selected</span>
                </div>
                <div className="email-pagination-right">
    {/* 1. Items Per Page (Moved to First Position) */}
    <select 
        className="email-items-per-page" 
        value={itemsPerPage} 
        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
    >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
    </select>

    {/* 2. Previous Buttons */}
    <button className="email-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
        <ChevronsLeft size={24} strokeWidth={1.5} color="#dcf2f1"/>
    </button>
    <button className="email-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
        <CircleArrowLeft size={28} strokeWidth={1.5} color="#dcf2f1"/>
    </button>

    {/* 3. Editable Page Number Input */}
    <div className="email-page-input-container">
        <input 
            type="number" 
            className="email-page-input" 
            value={pageInput} 
            min={1} 
            max={totalPages || 1}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputCommit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handlePageInputCommit();
                    e.target.blur(); 
                }
            }}
        />
        <span className="email-page-numbers">of {totalPages || 1}</span>
    </div>

    {/* 4. Next Buttons */}
    <button className="email-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>
        <CircleArrowRight size={28} strokeWidth={1.5} color="#dcf2f1"/>
    </button>
    <button className="email-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
        <ChevronsRight size={24} strokeWidth={1.5} color="#dcf2f1"/>
    </button>
</div>
            </div>

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="email-delete-confirm-overlay">
                    <div className="email-delete-confirm-dialog">
                        <div className="dialog-header">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete {emailToDelete ? "this email" : `these ${selectedRows.length} emails`}?</p>
                        </div>
                        <div className="email-dialog-buttons">
                            <button className="email-yes-button" onClick={handleDeleteConfirm}>Yes</button>
                            <button className="email-no-button" onClick={() => { setShowDeleteConfirm(false); setEmailToDelete(null); }}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Emails;