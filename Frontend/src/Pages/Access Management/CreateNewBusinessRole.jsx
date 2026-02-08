import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, ChevronRight, Plus, X, Save, CircleX } from "lucide-react";
import "./CreateNewBusinessRole.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const DEFAULT_ACCESS = { read: false, write: false, update: false, delete: false };

const CreateNewBusinessRole = () => {
	const navigate = useNavigate();
	
	// --- UI State ---
	const [activeTab, setActiveTab] = useState("general"); // 'general', 'workcenter', 'access'
	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(false); 
	
	// --- Data State ---
	const [workCenters, setWorkCenters] = useState([]);
	const [selectedParents, setSelectedParents] = useState({});
	const [selectedViews, setSelectedViews] = useState({});
	const [expanded, setExpanded] = useState({});
	const [accessSettings, setAccessSettings] = useState({});
	
	// Assigned Users (Employees to be converted)
	const [assignedUsers, setAssignedUsers] = useState([]);
	
	const [form, setForm] = useState({
		businessRoleId: "",
		businessRoleName: "",
		description: "",
		status: "ACTIVE"
	});

	// --- Modal State ---
	const [showUserModal, setShowUserModal] = useState(false);
	const [modalUsers, setModalUsers] = useState([]);
	const [modalSelected, setModalSelected] = useState({});
	const [modalSearch, setModalSearch] = useState("");
	const [modalSelectAll, setModalSelectAll] = useState(false);
	const [modalLoading, setModalLoading] = useState(false);

	const parentRefs = useRef({});

	// --- INITIAL DATA LOADING ---
	useEffect(() => {
		const init = async () => {
			setDataLoading(true);
			try {
				// Fetch Work Centers Only
				const wcRes = await fetch(`${BASE_URL_UM}/work-center`, { credentials: "include" });
				if (!wcRes.ok) throw new Error("Failed to fetch work centers");
				const wcData = await wcRes.json();
				setWorkCenters(wcData);

				const initialExpanded = {};
				wcData.forEach(wc => { initialExpanded[wc.id] = false; });
				setExpanded(initialExpanded);

			} catch (err) {
				console.error(err);
				toast.error("Error loading work centers");
			} finally {
				setDataLoading(false);
			}
		};

		init();
	}, []);

	// --- HANDLERS ---
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSave = async (saveType) => {
		if (!form.businessRoleId?.trim() || !form.businessRoleName?.trim()) {
			toast.error("Business Role ID and Name are required");
			return;
		}

		setLoading(true);
		try {
			const viewsById = {};
			workCenters.forEach((wc) => {
				(wc.workCenterViews || []).forEach((v) => { viewsById[v.id] = v; });
			});

			const selectedViewIds = Object.entries(selectedViews).filter(([_, v]) => v).map(([id]) => id);
			const permissionEntries = selectedViewIds.map((vid) => {
				const view = viewsById[vid];
				return {
					workCenterViewId: view ? view.workCenterViewId : null,
					readAccess: accessSettings[vid]?.read || DEFAULT_ACCESS.read,
					writeAccess: accessSettings[vid]?.write || DEFAULT_ACCESS.write,
					updateAccess: accessSettings[vid]?.update || DEFAULT_ACCESS.update,
					deleteAccess: accessSettings[vid]?.delete || DEFAULT_ACCESS.delete,
					accessContent: accessSettings[vid]?.accessContent || null,
				};
			});

			const workCenterIds = Object.entries(selectedParents).filter(([_, v]) => v).map(([id]) => id);
			const assignedUserIds = assignedUsers.map((u) => u.id);

			const payload = {
				...form,
				permissions: permissionEntries,
				workCenterIds,
				assignedUserIds
			};

			const res = await fetch(`${BASE_URL_UM}/business-role`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || "Operation failed");
			}

			toast.success(`Business role created successfully`);

			if (saveType === "save") {
				navigate("/admin/accessmanagement");
			} else if (saveType === "saveAndNew") {
				setForm({ businessRoleId: "", businessRoleName: "", description: "", status: "ACTIVE" });
				setSelectedParents({}); setSelectedViews({}); setAccessSettings({}); setAssignedUsers([]);
				setActiveTab("general");
				window.scrollTo(0, 0);
			}

		} catch (err) {
			console.error(err);
			toast.error(err.message || "Error creating role");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate("/admin/accessmanagement");
	};

	// --- TOGGLE LOGIC ---
	const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

	const toggleParent = (wc) => {
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
		setAccessSettings((s) => ({ ...s, [viewId]: { ...(s[viewId] || {}), [field]: value } }));
	};

	// --- MODAL LOGIC (Fetch Employees) ---
	const openUserModal = () => { setShowUserModal(true); };
	const closeUserModal = () => { setShowUserModal(false); setModalSelected({}); setModalSearch(""); setModalSelectAll(false); };
	
	useEffect(() => {
		if (!showUserModal) return;
		let mounted = true;
		const fetchEmployees = async () => {
			try {
				setModalLoading(true);
				// Fetch Employees to assign
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

	const removeAssignedUser = (id) => {
		setAssignedUsers(prev => prev.filter(u => u.id !== id));
	};

	// --- RENDER HELPERS ---
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
				<input type="checkbox" checked={!!selectedViews[view.id]} onChange={() => toggleChild(wc, view)} className="amc-custom-checkbox" />
			</td>
		</tr>
	));

	if (dataLoading) return <div style={{padding: 30, display: 'flex', justifyContent: 'center'}}>Loading work centers...</div>;

	return (
		<div className="amc-edit-container">
			<div className="amc-edit-header-container">
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
					<h1 className="amc-edit-heading">New Business Role</h1>
				</div>
				
				<div className="amc-edit-header-container-buttons">
					<button className="amc-edit-save-button" onClick={() => handleSave("save")} disabled={loading}>
						<Save size={17} strokeWidth={1} color="#dcf2f1" />
						{loading ? "Saving..." : "Save"}
					</button>
					
					<button
						className="amc-edit-save-button" 
						style={{ backgroundColor: '#fff', color: '#0f1035', border: '1px solid #0f1035', width: '150px' }}
						onClick={() => handleSave("saveAndNew")}
						disabled={loading}
					>
						<Save size={17} strokeWidth={1} color="#0f1035" />
						{loading ? "Saving..." : "Save and New"}
					</button>

					<button className="amc-edit-cancel-button" onClick={handleCancel}>
						<CircleX size={17} strokeWidth={1} color="#0f1035" /> Cancel
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="amc-tabs-container">
				<button className={`amc-tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General Information</button>
				<button className={`amc-tab-btn ${activeTab === 'workcenter' ? 'active' : ''}`} onClick={() => setActiveTab('workcenter')}>Work Center Assignment</button>
				<button className={`amc-tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>Access Restriction</button>
			</div>

			<div className="amc-tab-content">
				
				{/* TAB 1: General Info & Assigned Users */}
				{activeTab === 'general' && (
					<>
						<div className="amc-edit-form-container">
							<h1 className="amc-edit-form-heading">General Information</h1>
							<div className="amc-edit-form">
								<div className="amc-edit-form-row">
									<div className="amc-edit-form-group">
										<label>Business Role ID *</label>
										<input name="businessRoleId" value={form.businessRoleId} onChange={handleChange} placeholder="Business Role ID" />
									</div>
									<div className="amc-edit-form-group">
										<label>Business Role Name *</label>
										<input name="businessRoleName" value={form.businessRoleName} onChange={handleChange} placeholder="Business Role Name" />
									</div>
								</div>
								<div className="amc-edit-form-row">
									<div className="amc-edit-form-group">
										<label>Status</label>
										<select name="status" value={form.status} onChange={handleChange}>
											<option value="ACTIVE">Active</option>
											<option value="INACTIVE">Inactive</option>
										</select>
									</div>
								</div>
								<div className="amc-edit-form-row">
									<div className="amc-edit-form-group" style={{width: '100%'}}>
										<label>Description</label>
										<textarea name="description" value={form.description} onChange={handleChange} placeholder="Write description here..." rows={3} />
									</div>
								</div>
							</div>
						</div>

						{/*<div className="amc-edit-form-container">
							<div className="amc-edit-form-header-row">
								<h1 className="amc-edit-form-heading">Assigned Users</h1>
								<button className="amc-add-btn" onClick={openUserModal}>
									<Plus size={14} /> Add
								</button>
							</div>
							<div className="amc-table-container">
								<table className="amc-table">
									<thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
									<tbody>
										{assignedUsers.length === 0 && <tr><td colSpan="5" className="amc-empty-state">No users assigned</td></tr>}
										{assignedUsers.map(u => (
											<tr key={u.id}>
												<td>{u.userId}</td><td>{u.name}</td><td>{u.email}</td>
												<td>{u.status}</td>
												<td><button className="amc-delete-btn" onClick={() => removeAssignedUser(u.id)}><X size={16} /></button></td>
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
					<div className="amc-edit-form-container">
						<h1 className="amc-edit-form-heading">Work Center Assignments</h1>
						<div className="amc-table-container">
							<table className="amc-table">
								<thead><tr><th>ID</th><th>Name</th><th>Assigned</th></tr></thead>
								{workCenters.map((wc) => (
									<tbody key={wc.id}>
										<tr className="parent-row" style={{backgroundColor: '#f9fafb'}}>
											<td>
												<button onClick={() => toggleExpand(wc.id)} style={{border:'none', background:'transparent', marginRight:5, cursor:'pointer'}}>
													{expanded[wc.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
												</button>
												{wc.workCenterId}
											</td>
											<td>{wc.workCenterName}</td>
											<td>
												<input type="checkbox" className="amc-custom-checkbox" 
													checked={!!selectedParents[wc.id]} 
													onChange={() => toggleParent(wc)} 
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
					<div className="amc-edit-form-container">
						<h1 className="amc-edit-form-heading">Access Restrictions</h1>
						<div className="amc-table-container">
							<table className="amc-table">
								<thead>
									<tr>
										<th>View ID</th><th>View Name</th><th>Work Center ID</th><th>Work Center Name</th>
										<th>Read</th><th>Write</th><th>Update</th><th>Delete</th>
									</tr>
								</thead>
								<tbody>
									{accessRows.length === 0 && <tr><td colSpan="8" className="amc-empty-state">No restrictions</td></tr>}
									{accessRows.map(row => {
										const s = row.viewId ? (accessSettings[row.viewId] || DEFAULT_ACCESS) : DEFAULT_ACCESS;
										return (
											<tr key={row.workCenterRowId + (row.viewId || 'p')}>
												<td>{row.workCenterViewId || "--"}</td>
												<td>{row.workCenterViewName || "--"}</td>
												<td>{row.workCenterId}</td>
												<td>{row.workCenterName}</td>
												<td><input type="checkbox" className="amc-custom-checkbox" checked={s.read} onChange={e=>row.viewId && handleAccessChange(row.viewId,'read',e.target.checked)} disabled={!row.viewId} /></td>
												<td><input type="checkbox" className="amc-custom-checkbox" checked={s.write} onChange={e=>row.viewId && handleAccessChange(row.viewId,'write',e.target.checked)} disabled={!row.viewId} /></td>
												<td><input type="checkbox" className="amc-custom-checkbox" checked={s.update} onChange={e=>row.viewId && handleAccessChange(row.viewId,'update',e.target.checked)} disabled={!row.viewId} /></td>
												<td><input type="checkbox" className="amc-custom-checkbox" checked={s.delete} onChange={e=>row.viewId && handleAccessChange(row.viewId,'delete',e.target.checked)} disabled={!row.viewId} /></td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{/* Modal for Selecting Employees */}
			{showUserModal && (
				<div className="amc-delete-confirm-overlay" onClick={closeUserModal}>
					<div className="amc-delete-confirm-dialog" onClick={e => e.stopPropagation()} style={{width: 600}}>
						<div className="amc-dialog-header">
							<h3>Select Employees</h3>
							<button className="amc-close-filters" onClick={closeUserModal}><X size={20}/></button>
						</div>
						<div className="amc-header-search-box" style={{marginBottom: 15}}>
							<input value={modalSearch} onChange={e=>setModalSearch(e.target.value)} placeholder="Search employees..." />
						</div>
						<div style={{maxHeight: 300, overflowY: 'auto'}}>
							<table className="amc-table" style={{width: '100%'}}>
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
												<td>{u.userId}</td>
												<td>{u.name}</td>
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

export default CreateNewBusinessRole;