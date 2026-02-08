import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, ChevronRight, Plus, X, Save, CircleX } from "lucide-react";
import "./DetailedAccessManagement.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const DEFAULT_ACCESS = { read: false, write: false, update: false, delete: false };

const DetailedAccessManagement = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    
    // --- UI State ---
    const [isReadOnly, setIsReadOnly] = useState(location.state?.mode !== 'edit');
    const [activeTab, setActiveTab] = useState("general"); // 'general', 'workcenter', 'access'
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false); 
    
    // --- Data State ---
    const [workCenters, setWorkCenters] = useState([]);
    const [selectedParents, setSelectedParents] = useState({});
    const [selectedViews, setSelectedViews] = useState({});
    const [expanded, setExpanded] = useState({});
    const [accessSettings, setAccessSettings] = useState({});
    const [assignedUsers, setAssignedUsers] = useState([]);
    
    const [form, setForm] = useState({
        businessRoleId: "",
        businessRoleName: "",
        description: "",
        status: "ACTIVE"
    });

    // --- Modal State ---
    const [showUserModal, setShowUserModal] = useState(false);
    const [modalUsers, setModalUsers] = useState([]); // Stores Employees now
    const [modalSelected, setModalSelected] = useState({});
    const [modalSearch, setModalSearch] = useState("");
    const [modalSelectAll, setModalSelectAll] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const parentRefs = useRef({});

    // --- DATA LOADING ---
    useEffect(() => {
        const init = async () => {
            if (!id) return;
            setDataLoading(true);
            
            let wcData = [];
            let roleData = null;

            // 1. Fetch Work Centers
            try {
                const wcRes = await fetch(`${BASE_URL_UM}/work-center`, { credentials: "include" });
                if (wcRes.ok) {
                    wcData = await wcRes.json();
                    setWorkCenters(wcData);
                }
            } catch (error) { console.error("Work Center fetch error:", error); }

            // 2. Fetch Role Data
            try {
                const roleRes = await fetch(`${BASE_URL_UM}/business-role/${id}`, { credentials: "include" });
                if (!roleRes.ok) throw new Error("Failed to fetch role details");
                roleData = await roleRes.json();

                setForm({
                    businessRoleId: roleData.businessRoleId || "",
                    businessRoleName: roleData.businessRoleName || "",
                    description: roleData.description || "",
                    status: roleData.status || "ACTIVE"
                });

                // Load existing assigned users (These are already converted Users)
                const usersList = roleData.users || roleData.assignedUsers || [];
                setAssignedUsers(usersList.map(u => ({
                    id: u.id, userId: u.userId, name: `${u.firstName||''} ${u.lastName||''}`.trim()||u.username, email: u.email, status: u.status
                })));

            } catch (err) {
                console.error(err);
                toast.error("Error loading role details");
                setDataLoading(false);
                return;
            }

            // 3. Map Permissions
            try {
                const initialExpanded = {};
                const viewCodeToUuidMap = {};
                const viewUuidToParentUuidMap = {};

                wcData.forEach(wc => { 
                    initialExpanded[wc.id] = false; 
                    (wc.workCenterViews || []).forEach(v => {
                        viewCodeToUuidMap[v.workCenterViewId] = v.id;
                        viewUuidToParentUuidMap[v.id] = wc.id;
                    });
                });

                const newSelectedViews = {};
                const newAccessSettings = {};
                const newSelectedParents = {};

                if (roleData && roleData.permissions) {
                    roleData.permissions.forEach(perm => {
                        const viewUuid = viewCodeToUuidMap[perm.workCenterViewId] || perm.workCenterViewId;
                        if (viewUuid) {
                            newSelectedViews[viewUuid] = true;
                            newAccessSettings[viewUuid] = {
                                read: perm.readAccess, write: perm.writeAccess, update: perm.updateAccess, delete: perm.deleteAccess, accessContent: perm.accessContent
                            };
                            const parentUuid = viewUuidToParentUuidMap[viewUuid];
                            if (parentUuid) {
                                newSelectedParents[parentUuid] = true;
                                initialExpanded[parentUuid] = true; 
                            }
                        }
                    });
                }

                setSelectedViews(newSelectedViews);
                setAccessSettings(newAccessSettings);
                setSelectedParents(newSelectedParents);
                setExpanded(initialExpanded);

            } catch (err) { console.error("Error mapping permissions:", err); } 
            finally { setDataLoading(false); }
        };
        init();
    }, [id]);

    // --- HANDLERS ---
    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        if (!form.businessRoleId?.trim() || !form.businessRoleName?.trim()) {
            toast.error("Business Role ID and Name are required");
            return;
        }
        setLoading(true);
        try {
            const viewsById = {};
            workCenters.forEach((wc) => (wc.workCenterViews || []).forEach((v) => { viewsById[v.id] = v; }));

            const selectedViewIds = Object.entries(selectedViews).filter(([_, v]) => v).map(([id]) => id);
            const permissionEntries = selectedViewIds.map((vid) => {
                const view = viewsById[vid];
                const settings = accessSettings[vid] || DEFAULT_ACCESS;
                return {
                    workCenterViewId: view ? view.workCenterViewId : null,
                    readAccess: settings.read, writeAccess: settings.write, updateAccess: settings.update, deleteAccess: settings.delete, accessContent: settings.accessContent
                };
            });

            const workCenterIds = Object.entries(selectedParents).filter(([_, v]) => v).map(([id]) => id);
            const assignedUserIds = assignedUsers.map((u) => u.id);

            const payload = { ...form, permissions: permissionEntries, workCenterIds, assignedUserIds };

            const res = await fetch(`${BASE_URL_UM}/business-role/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Operation failed");
            toast.success("Business role updated successfully");
            navigate("/admin/accessmanagement");

        } catch (err) {
            toast.error(err.message || "Error saving role");
        } finally { setLoading(false); }

        if (!res.ok) {
    const errorData = await res.json();
    console.error("Server Error Details:", errorData); // Check your console for this
    toast.error(`Permission Error: ${errorData.message || "Access Denied"}`);
    return;
}
    };

    const handleClose = () => navigate("/admin/accessmanagement");
    
    const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));
    const toggleParent = (wc) => {
        if (isReadOnly) return;
        const parentId = wc.id;
        const newVal = !selectedParents[parentId];
        setSelectedParents((s) => ({ ...s, [parentId]: newVal }));
        setSelectedViews((s) => {
            const next = { ...s };
            (wc.workCenterViews || []).forEach((view) => { next[view.id] = newVal; });
            return next;
        });
    };
    const toggleChild = (wc, view) => {
        if (isReadOnly) return;
        const viewId = view.id;
        const parentId = wc.id;
        const newViewVal = !selectedViews[viewId];
        setSelectedViews((s) => {
            const next = { ...s, [viewId]: newViewVal };
            const views = wc.workCenterViews || [];
            const anyChecked = views.some((v) => v.id === viewId ? newViewVal : !!s[v.id]);
            setSelectedParents((p) => ({ ...p, [parentId]: anyChecked }));
            return next;
        });
    };
    const handleAccessChange = (viewId, field, value) => {
        if (isReadOnly) return;
        setAccessSettings((s) => ({ ...s, [viewId]: { ...(s[viewId] || {}), [field]: value } }));
    };

    // --- Render Helpers ---
    const buildAccessRows = () => {
        const rows = [];
        workCenters.forEach((wc) => {
            const views = wc.workCenterViews || [];
            const selectedChildViews = views.filter((v) => selectedViews[v.id]);
            if (selectedChildViews.length > 0) {
                selectedChildViews.forEach((v) => {
                    rows.push({
                        workCenterViewId: v.workCenterViewId, workCenterViewName: v.workCenterViewName,
                        workCenterId: wc.workCenterId, workCenterName: wc.workCenterName,
                        viewId: v.id, workCenterRowId: wc.id,
                    });
                });
            } else if ((views.length === 0 && selectedParents[wc.id]) || (views.length > 0 && selectedParents[wc.id] && selectedChildViews.length === 0)) {
                rows.push({
                    workCenterViewId: null, workCenterViewName: null,
                    workCenterId: wc.workCenterId, workCenterName: wc.workCenterName,
                    viewId: null, workCenterRowId: wc.id,
                });
            }
        });
        return rows;
    };
    const accessRows = buildAccessRows();

    const renderChildRows = (wc) => (wc.workCenterViews || []).map((view) => (
        <tr key={view.id} className="child-row">
            <td style={{ paddingLeft: 36 }}>{view.workCenterViewId}</td>
            <td>{view.workCenterViewName}</td>
            <td>
                <input type="checkbox" checked={!!selectedViews[view.id]} onChange={() => toggleChild(wc, view)} className="amc-custom-checkbox" disabled={isReadOnly} />
            </td>
        </tr>
    ));

    // --- MODAL LOGIC UPDATED TO FETCH EMPLOYEES ---
    const openUserModal = () => { if (!isReadOnly) setShowUserModal(true); };
    const closeUserModal = () => { setShowUserModal(false); setModalSelected({}); setModalSearch(""); setModalSelectAll(false); };
    
    useEffect(() => {
        if (!showUserModal) return;
        let mounted = true;
        const fetchEmployees = async () => {
            try {
                setModalLoading(true);
                // LOGIC CHANGE: Fetch EMPLOYEES (/users/emp/s-info) instead of Users
                const res = await fetch(`${BASE_URL_UM}/users/emp/s-info`, { method: "GET", credentials: "include" });
                if (res.ok && mounted) {
                    const data = await res.json();
                    setModalUsers(data.map((u) => ({ 
                        id: u.id, 
                        userId: u.userId || u.username, 
                        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username, 
                        email: u.email, 
                        status: u.status 
                    })));
                }
            } catch (err) { toast.error("Error fetching employees"); } finally { setModalLoading(false); }
        };
        fetchEmployees();
        return () => { mounted = false; };
    }, [showUserModal]);

    // Filter employees: Search text AND exclude those who are already assigned
    const filteredModalUsers = modalUsers.filter(u => {
        const matchesSearch = (u.name || "").toLowerCase().includes(modalSearch.toLowerCase()) || 
                              (u.userId || "").toLowerCase().includes(modalSearch.toLowerCase());
        const isNotAssigned = !assignedUsers.some(assigned => assigned.id === u.id);
        return matchesSearch && isNotAssigned;
    });

    const toggleModalUser = (id) => setModalSelected(p => { const n = { ...p }; if (n[id]) delete n[id]; else n[id] = true; return n; });
    
    const toggleModalSelectAll = () => { 
        if (modalSelectAll) { 
            setModalSelected({}); 
            setModalSelectAll(false); 
        } else { 
            const n = {}; 
            filteredModalUsers.forEach(u => n[u.id] = true); 
            setModalSelected(n); 
            setModalSelectAll(true); 
        } 
    };

    const confirmAddUsers = () => {
        const toAdd = modalUsers.filter((u) => modalSelected[u.id]);
        setAssignedUsers(prev => { 
            const map = {}; 
            prev.forEach((u) => (map[u.id] = u)); 
            toAdd.forEach((u) => (map[u.id] = u)); 
            return Object.values(map); 
        });
        closeUserModal();
    };

    const removeAssignedUser = (id) => { if (!isReadOnly) setAssignedUsers(prev => prev.filter(u => u.id !== id)); };

    if (dataLoading) return <div style={{padding: 30, display: 'flex', justifyContent: 'center'}}>Loading data...</div>;

    return (
        <div className="dam-edit-container">
            {/* Header */}
            <div className="dam-edit-header-container">
                <h1 className="dam-edit-heading">{form.businessRoleName || "Business Role Details"}</h1>
                <div className="dam-edit-header-container-buttons">
                    {isReadOnly ? (
                        <button className="dam-edit-close-button" onClick={handleClose}><X size={15}/> Close</button>
                    ) : (
                        <>
                            <button className="dam-edit-save-button" onClick={handleSave} disabled={loading}><Save size={17}/> {loading?"Saving...":"Save"}</button>
                            <button className="dam-edit-cancel-button" onClick={handleClose}><CircleX size={17}/> Cancel</button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="dam-tabs-container">
                <button className={`dam-tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General Information</button>
                <button className={`dam-tab-btn ${activeTab === 'workcenter' ? 'active' : ''}`} onClick={() => setActiveTab('workcenter')}>Work Center Assignment</button>
                <button className={`dam-tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>Access Restriction</button>
            </div>

            <div className="dam-tab-content">
                
                {/* TAB 1: General Information & Assigned Users */}
                {activeTab === 'general' && (
                    <>
                        <div className="dam-section-container">
                            <h2 className="dam-section-title">General Information</h2>
                            <div className="dam-form-grid">
                                <div className="dam-form-row">
                                    <div className="dam-form-group">
                                        <label>Business Role ID</label>
                                        <input name="businessRoleId" value={form.businessRoleId} disabled />
                                    </div>
                                    <div className="dam-form-group">
                                        <label>Business Role Name *</label>
                                        <input name="businessRoleName" value={form.businessRoleName} onChange={handleChange} disabled={isReadOnly} />
                                    </div>
                                </div>
                                <div className="dam-form-row">
                                    <div className="dam-form-group">
                                        <label>Status</label>
                                        <select name="status" value={form.status} onChange={handleChange} disabled={isReadOnly}>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="dam-form-row">
                                    <div className="dam-form-group full-width">
                                        <label>Description</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} disabled={isReadOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*<div className="dam-section-container">
                            <div className="dam-section-header-row">
                                <h2 className="dam-section-title">Assigned Users</h2>
                                {!isReadOnly && (
                                    <button className="dam-add-btn" onClick={openUserModal}>
                                        <Plus size={14} /> Add
                                    </button>
                                )}
                            </div>
                            <div className="dam-table-wrapper">
                                <table className="dam-table">
                                    <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {assignedUsers.length === 0 && <tr><td colSpan="5" className="dam-empty-state">No users assigned</td></tr>}
                                        {assignedUsers.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.userId}</td><td>{u.name}</td><td>{u.email}</td>
                                                <td>{u.status}</td>
                                                <td><button className="dam-delete-btn" onClick={() => removeAssignedUser(u.id)} disabled={isReadOnly}><X size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>*/}
                    </>
                )}

                {/* TAB 2: Work Center Assignment */}
                {activeTab === 'workcenter' && (
                    <div className="dam-section-container">
                        <h2 className="dam-section-title">Work Center Assignments</h2>
                        <div className="dam-table-wrapper">
                            <table className="dam-table">
                                <thead><tr><th>ID</th><th>Name</th><th>Assigned</th></tr></thead>
                                {workCenters.map((wc) => (
                                    <tbody key={wc.id}>
                                        <tr className="parent-row">
                                            <td>
                                                <button onClick={() => toggleExpand(wc.id)} className="dam-expand-btn">
                                                    {expanded[wc.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                                </button>
                                                {wc.workCenterId}
                                            </td>
                                            <td>{wc.workCenterName}</td>
                                            <td>
                                                <input type="checkbox" className="amc-custom-checkbox" 
                                                    checked={!!selectedParents[wc.id]} 
                                                    onChange={() => toggleParent(wc)} 
                                                    disabled={isReadOnly}
                                                    ref={el => parentRefs.current[wc.id] = el}
                                                />
                                            </td>
                                        </tr>
                                        {expanded[wc.id] && renderChildRows(wc)}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: Access Restriction */}
                {activeTab === 'access' && (
                    <div className="dam-section-container">
                        <h2 className="dam-section-title">Access Restrictions</h2>
                        <div className="dam-table-wrapper">
                            <table className="dam-table">
                                <thead>
                                    <tr>
                                        <th>View ID</th><th>View Name</th><th>Work Center ID</th><th>Work Center Name</th>
                                        <th>Read</th><th>Write</th><th>Update</th><th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accessRows.length === 0 && <tr><td colSpan="8" className="dam-empty-state">No restrictions selected</td></tr>}
                                    {accessRows.map(row => {
                                        const s = row.viewId ? (accessSettings[row.viewId] || DEFAULT_ACCESS) : DEFAULT_ACCESS;
                                        return (
                                            <tr key={row.workCenterRowId + (row.viewId || 'p')}>
                                                <td>{row.workCenterViewId || "--"}</td>
                                                <td>{row.workCenterViewName || "--"}</td>
                                                <td>{row.workCenterId}</td>
                                                <td>{row.workCenterName}</td>
                                                <td><input type="checkbox" checked={s.read} onChange={e=>row.viewId && handleAccessChange(row.viewId,'read',e.target.checked)} disabled={!row.viewId || isReadOnly} className="amc-custom-checkbox"/></td>
                                                <td><input type="checkbox" checked={s.write} onChange={e=>row.viewId && handleAccessChange(row.viewId,'write',e.target.checked)} disabled={!row.viewId || isReadOnly} className="amc-custom-checkbox"/></td>
                                                <td><input type="checkbox" checked={s.update} onChange={e=>row.viewId && handleAccessChange(row.viewId,'update',e.target.checked)} disabled={!row.viewId || isReadOnly} className="amc-custom-checkbox"/></td>
                                                <td><input type="checkbox" checked={s.delete} onChange={e=>row.viewId && handleAccessChange(row.viewId,'delete',e.target.checked)} disabled={!row.viewId || isReadOnly} className="amc-custom-checkbox"/></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* User Selection Modal (Updated to show Employees) */}
            {showUserModal && (
                <div className="amc-delete-confirm-overlay" onClick={closeUserModal}>
                    <div className="amc-delete-confirm-dialog" onClick={e => e.stopPropagation()} style={{width: 600}}>
                        <div className="amc-dialog-header">
                            <h3>Select Employees</h3>
                            <button className="amc-close-filters" onClick={closeUserModal}><X size={20}/></button>
                        </div>
                        <div style={{marginBottom: 15}}>
                            <input value={modalSearch} onChange={e=>setModalSearch(e.target.value)} placeholder="Search employees..." className="dam-search-input"/>
                        </div>
                        <div style={{maxHeight: 300, overflowY: 'auto'}}>
                            <table className="dam-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" checked={modalSelectAll} onChange={toggleModalSelectAll} className="amc-custom-checkbox"/></th>
                                        <th>Employee ID</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredModalUsers.length === 0 ? (
                                        <tr><td colSpan="3" style={{textAlign:'center', padding:20, color:'#888'}}>No employees found</td></tr>
                                    ) : (
                                        filteredModalUsers.map(u => (
                                            <tr key={u.id}>
                                                <td><input type="checkbox" checked={!!modalSelected[u.id]} onChange={()=>toggleModalUser(u.id)} className="amc-custom-checkbox"/></td>
                                                <td>{u.userId}</td><td>{u.name}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="amc-dialog-buttons">
                            <button className="amc-no-button" onClick={closeUserModal}>Cancel</button>
                            <button className="amc-yes-button" onClick={confirmAddUsers}>Add Selected</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedAccessManagement;