import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
	Save, CircleX, MoreVertical, X, Search,
	Paperclip, Plus, Download, Trash2, SquarePen, ChevronDown, ChevronUp, Copy, Merge, Printer, User, Eye
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./DetailedProducts.css";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

// Updated Tabs List
const TABS = ["Overview", "Attachment", "Price Books"];

// Helper to format file size
const formatFileSize = (size) => {
	if (!size) return "0 Bytes";
	const i = Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["Bytes", "KB", "MB", "GB"][i];
};

const DetailedProducts = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const actionRef = useRef(null);
	const fileInputRef = useRef(null); 
	const { user: loggedInUser } = useAuth(); 
	
	const initialMode = location.state?.mode || "view"; 
	const [isReadOnly, setIsReadOnly] = useState(initialMode === "view");

	// UI States
	const [activeTab, setActiveTab] = useState("Overview");
	const [showDetails, setShowDetails] = useState(false);
	const [menuModal, setMenuModal] = useState(false);
	
	// Modals
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showChangeOwner, setShowChangeOwner] = useState(false); 
	const [showUserSelectModal, setShowUserSelectModal] = useState(false); 
	const [showAddNoteModal, setShowAddNoteModal] = useState(false);
	
	const [loading, setLoading] = useState(true);
	const [userSearchTerm, setUserSearchTerm] = useState(""); 
	const [users, setUsers] = useState([]); 

	// Data States
	const [productData, setProductData] = useState(null);
	const [editableData, setEditableData] = useState(null);
	const [allCategories, setAllCategories] = useState([]);
	const [notes, setNotes] = useState([]); 
	const [attachments, setAttachments] = useState([]); 
	const [newNote, setNewNote] = useState("");

	const [ownerConfig, setOwnerConfig] = useState({ currentOwner: "", newOwner: "", newOwnerId: "" });

	// Helper to get owner name safely
	const getOwnerName = (ownerId) => {
		const foundUser = users.find(u => u.userId === ownerId || u.id === ownerId);
		if (foundUser) return foundUser.name || `${foundUser.firstName} ${foundUser.lastName}`;
		if (loggedInUser && (loggedInUser.id === ownerId || loggedInUser.userId === ownerId)) {
			return `${loggedInUser.firstName} ${loggedInUser.lastName}`;
		}
		return ownerId || "System Owner";
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Determine user fetch URL - prioritize UAM
				const usersUrl = BASE_URL_UM ? `${BASE_URL_UM}/users/s-info` : `${BASE_URL_SM}/user-profile`;
				
				const [productRes, categoryRes, usersRes, attachmentsRes] = await Promise.all([
					fetch(`${BASE_URL_SM}/product/${id}`),
					fetch(`${BASE_URL_SM}/product-category`),
					fetch(usersUrl, { credentials: 'include' }).catch(e => { console.warn("Users fetch failed", e); return { ok: false }; }),
					fetch(`${BASE_URL_SM}/product/${id}/attachments`).catch(() => ({ ok: false })) 
				]);

				if (!productRes.ok) throw new Error("Product not found");
				if (!categoryRes.ok) throw new Error("Failed to fetch categories");

				const product = await productRes.json();
				const categories = await categoryRes.json();
				
				let usersData = [];
				if (usersRes.ok) {
					const rawUsers = await usersRes.json();
					// Handle wrapped responses: { data: [...] } or direct array [...]
					if (Array.isArray(rawUsers)) {
						usersData = rawUsers;
					} else if (rawUsers.data && Array.isArray(rawUsers.data)) {
						usersData = rawUsers.data;
					} else if (rawUsers.users && Array.isArray(rawUsers.users)) {
						usersData = rawUsers.users;
					}
				}
				
				const attachmentsData = attachmentsRes.ok ? await attachmentsRes.json() : [];

				setProductData(product);
				setEditableData(product);
				setAllCategories(categories);
				setUsers(usersData);
				setNotes(product.notes || []); 
				setAttachments(attachmentsData || []);

				setOwnerConfig({ 
					currentOwner: getOwnerName(product.productOwnerId), 
					newOwner: "",
					newOwnerId: ""
				});

			} catch (err) {
				console.error(err);
				toast.error("Failed to load data");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id]); 

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (actionRef.current && !actionRef.current.contains(event.target)) {
				setMenuModal(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSave = async () => {
		if (!editableData.name || !editableData.productCategoryId || !editableData.unitPrice) {
			toast.error("Please fill in all required fields (Name, Category, Unit Price)");
			return;
		}
		try {
			const res = await fetch(`${BASE_URL_SM}/product/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editableData),
			});
			if (!res.ok) throw new Error("Failed to update product");
			const updated = await res.json();
			setProductData(updated);
			setEditableData(updated);
			setIsReadOnly(true); 
			toast.success("Product updated successfully!");
		} catch (err) {
			console.error(err);
			toast.error("Failed to update product.");
		}
	};
	
	const handleClone = () => { setMenuModal(false); navigate("/products/products/create", { state: { clonedData: productData } }); };
	const handlePrintPreview = () => { setMenuModal(false); window.print(); };
	const handleChangeOwnerClick = () => { 
		setMenuModal(false); 
		// Re-calc current owner in case data loaded late
		setOwnerConfig({ 
			currentOwner: getOwnerName(productData.productOwnerId), 
			newOwner: "", 
			newOwnerId: "" 
		}); 
		setShowChangeOwner(true); 
	};
	
	const handleUserSelect = (selectedUser) => { 
		const fullName = selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`; 
		setOwnerConfig(prev => ({ ...prev, newOwner: fullName, newOwnerId: selectedUser.userId || selectedUser.id })); 
		setShowUserSelectModal(false); 
		setUserSearchTerm(""); 
	};

	const handleChangeOwnerSave = async () => { 
		if (!ownerConfig.newOwnerId) { 
			toast.warn("Please select a new owner."); 
			return; 
		} 
		// In a real app, you would PATCH the owner here
		setEditableData(prev => ({ ...prev, productOwnerId: ownerConfig.newOwnerId })); 
		setProductData(prev => ({ ...prev, productOwnerId: ownerConfig.newOwnerId })); 
		setShowChangeOwner(false); 
		toast.success("Owner changed successfully!"); 
	};

	const handleFindMerge = () => { setMenuModal(false); toast.info("Find and Merge Duplicate functionality coming soon."); };
	const handleDeleteClick = () => { setMenuModal(false); setShowDeleteConfirm(true); };
	const confirmDelete = async () => { try { const res = await fetch(`${BASE_URL_SM}/product/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error("Failed to delete product"); toast.success("Product deleted successfully"); navigate("/products/products"); } catch (err) { console.error(err); toast.error("Failed to delete product"); } finally { setShowDeleteConfirm(false); } };
	const handleSaveNote = () => { if (!newNote.trim()) return; const note = { id: Date.now(), text: newNote, date: new Date().toLocaleString(), user: loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}` : "System User" }; setNotes([note, ...notes]); setNewNote(""); setShowAddNoteModal(false); toast.success("Note added"); };

	// --- FILE HANDLING ---
	const handleFileSelect = async (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const formData = new FormData();
			formData.append("file", file);
			
			const toastId = toast.loading("Uploading...");
			try {
				const response = await fetch(`${BASE_URL_SM}/product/${id}/attachments`, { 
					method: "POST", 
					body: formData 
				});
				
				if (response.ok) {
					const savedAttachment = await response.json();
					setAttachments([savedAttachment, ...attachments]);
					toast.update(toastId, { render: "Uploaded successfully", type: "success", isLoading: false, autoClose: 3000 });
				} else {
					const localUrl = URL.createObjectURL(file);
					const mockAttachment = {
						id: Date.now(),
						fileName: file.name,
						size: file.size,
						date: new Date().toISOString(),
						uploadedBy: loggedInUser ? `${loggedInUser.firstName}` : "User",
						url: localUrl, 
						fileObj: file 
					};
					setAttachments([mockAttachment, ...attachments]);
					toast.update(toastId, { render: "Uploaded (Mock)", type: "success", isLoading: false, autoClose: 3000 });
				}
			} catch (error) {
				 const localUrl = URL.createObjectURL(file);
				 const mockAttachment = {
					id: Date.now(),
					fileName: file.name,
					size: file.size,
					date: new Date().toISOString(),
					uploadedBy: loggedInUser ? `${loggedInUser.firstName}` : "User",
					url: localUrl,
					fileObj: file
				};
				setAttachments([mockAttachment, ...attachments]);
				toast.update(toastId, { render: "Uploaded (Mock)", type: "success", isLoading: false, autoClose: 3000 });
			}
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleDownload = (attachment) => {
		const link = document.createElement('a');
		link.href = attachment.url || (attachment.fileObj ? URL.createObjectURL(attachment.fileObj) : "#");
		link.download = attachment.fileName || "download";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handlePreview = (attachment) => {
		const url = attachment.url || (attachment.fileObj ? URL.createObjectURL(attachment.fileObj) : "#");
		window.open(url, '_blank');
	};

	if (loading) return <div className="loading-state">Loading...</div>;

	const filteredUsers = users.filter(u => 
		(u.name && u.name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
		(`${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase())) || 
		(u.email || "").toLowerCase().includes(userSearchTerm.toLowerCase())
	);

	return (
		<div className="product-edit-container">
			{/* Header */}
			<div className="product-edit-header-container">
				<h1 className="product-edit-heading">{productData?.name || "Product Details"}</h1>
				<div className="product-edit-header-container-buttons">
					{isReadOnly ? (
						<>
							<button className="product-edit-close-button" onClick={() => navigate("/products/products")}>
								<X size={16} /> Close
							</button>
						</>
					) : (
						<>
							<button className="product-edit-save-button" onClick={handleSave}>
								<Save size={16} /> Save
							</button>
							<button className="product-edit-cancel-button" onClick={() => { setIsReadOnly(true); setEditableData(productData); }}>
								<CircleX size={16} /> Cancel
							</button>
						</>
					)}

					<div className="product-edit-options-button-container" ref={actionRef}>
						<button className="product-edit-options-button" onClick={() => setMenuModal(!menuModal)}>
							<MoreVertical size={20} />
						</button>
						{menuModal && (
							<div className="product-edit-menu-modal-container">
								<ul className="product-edit-menu-modal-list">
									<li onClick={handleClone}>Clone</li>
									<li onClick={handleChangeOwnerClick}>Change Owner</li>
									<li onClick={handlePrintPreview}>Print Preview</li>
									<li onClick={handleFindMerge}>Find & Merge Duplicate</li>
									<li onClick={handleDeleteClick}>Delete</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tabs & Actions */}
			<div className="product-email-tabs-container">
				<div className="product-tabs-left">
					{TABS.map((tab) => (
						<button
							key={tab}
							className={`product-email-tab-btn ${activeTab === tab ? "active" : ""}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</button>
					))}
				</div>
				<div className="product-tab-actions-right">
					{activeTab === "Overview" && (
						 <button className="product-tab-action-btn" onClick={() => setShowAddNoteModal(true)}>
							<Plus size={16}/> Add Note
						</button>
					)}
					{activeTab === "Attachment" && (
						 <button className="product-tab-action-btn" onClick={() => fileInputRef.current.click()}>
							<Plus size={16}/> Add Attachment
						</button>
					)}
					{activeTab === "Price Books" && (
						 <button className="product-tab-action-btn" onClick={() => toast.info("Add Price Book modal would open here")}>
							<Plus size={16}/> Add Price Book
						</button>
					)}
				</div>
				<input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelect} />
			</div>

			{/* OVERVIEW TAB */}
			{activeTab === "Overview" && (
				<>
					{/* 1. Product Information */}
					<div className="product-edit-form-container">
						<h1 className="product-edit-form-heading">Product Information</h1>
						<div className="product-edit-form">
							<div className="product-edit-form-row">
								<div className="product-edit-form-group">
									<label>Product ID <span className="required-star">*</span></label>
									<input type="text" value={editableData.productId || ""} disabled className="read-only-input"/>
								</div>
								<div className="product-edit-form-group">
									<label>Product Owner <span className="required-star">*</span></label>
									<input type="text" value={getOwnerName(editableData.productOwnerId)} disabled className="read-only-input"/>
								</div>
							</div>

							{[
								{ label: "Product Name", id: "name", required: true },
								{ label: "Vendor Name", id: "vendorName" },
								{ label: "Manufacturer", id: "manufacturer" },
								{ label: "Sales Start Date", id: "salesStartDate", type: "date", required: true },
								{ label: "Sales End Date", id: "salesEndDate", type: "date", required: true },
								{ label: "Support Start Date", id: "supportStartDate", type: "date" },
								{ label: "Support End Date", id: "supportEndDate", type: "date" },
							].map(({ label, id, type = "text", required }) => (
								<div key={id} className="product-edit-form-group">
									<label>{label} {required && <span className="required-star">*</span>}</label>
									<input
										type={type}
										readOnly={isReadOnly}
										disabled={isReadOnly}
										value={
											type === "date" && editableData?.[id]
												? new Date(editableData[id]).toISOString().slice(0, 10)
												: editableData?.[id] ?? ""
										}
										onChange={(e) => setEditableData({ ...editableData, [id]: e.target.value })}
									/>
								</div>
							))}
							
							<div className="product-edit-form-group">
								<label>Product Category <span className="required-star">*</span></label>
								<select
									disabled={isReadOnly}
									value={editableData?.productCategoryId || ""}
									onChange={(e) => setEditableData({ ...editableData, productCategoryId: e.target.value })}
								>
									<option value="">Select Category</option>
									{allCategories.map(cat => (
										<optgroup key={cat.categoryId} label={cat.name}>
											<option value={cat.categoryId}>{cat.name}</option>
											{cat.subcategories?.map(sub => (
												<option key={sub.categoryId} value={sub.categoryId}>-- {sub.name}</option>
											))}
										</optgroup>
									))}
								</select>
							</div>
							
							<div className="product-edit-form-group checkbox-group">
								<input
									type="checkbox"
									disabled={isReadOnly}
									checked={editableData?.isActiveStock ?? false}
									onChange={(e) => setEditableData({ ...editableData, isActiveStock: e.target.checked })}
								/>
								<label>Product Active</label>
							</div>
						</div>
					</div>

					{/* 2. Notes Section */}
					<div className="product-edit-form-container" style={{marginTop: '20px', marginBottom: '20px'}}>
						<h1 className="product-edit-form-heading">Notes</h1>
						<div className="product-edit-form" style={{display: 'flex', flexDirection:'column'}}>
							<div className="product-notes-list">
								{notes.length === 0 ? <p className="no-records-text">No notes yet.</p> : notes.map(note => (
									<div key={note.id} className="product-note-item">
										<p className="product-note-text">{note.text}</p>
										<span className="product-note-meta"><User size={12} style={{marginRight: '5px'}}/> {note.user} • {note.date}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div style={{ marginBottom: 20, textAlign: 'center' }}>
						<button className="product-details-toggle-btn" onClick={() => setShowDetails(p => !p)}>
							{showDetails ? <><ChevronUp size={16}/> Hide Details</> : <><ChevronDown size={16}/> Show Details</>}
						</button>
					</div>

					{/* Rest of Sections */}
					{showDetails && (
						<>
							<div className="product-edit-form-container">
								<h1 className="product-edit-form-heading">Price Information</h1>
								<div className="product-edit-form">
									{[
										{ label: "Unit Price", id: "unitPrice", required: true },
										{ label: "Commission Rate", id: "commissionRate" },
										{ label: "Tax", id: "tax" },
									].map(({ label, id, required }) => (
										<div key={id} className="product-edit-form-group">
											<label>{label} {required && <span className="required-star">*</span>}</label>
											<input
												type="text"
												readOnly={isReadOnly}
												disabled={isReadOnly}
												value={editableData?.[id] ?? ""}
												onChange={(e) => setEditableData({ ...editableData, [id]: e.target.value })}
											/>
										</div>
									))}
									<div className="product-edit-form-group checkbox-group">
										<input
											type="checkbox"
											disabled={isReadOnly}
											checked={editableData?.taxable ?? false}
											onChange={(e) => setEditableData({ ...editableData, taxable: e.target.checked })}
										/>
										<label>Taxable?</label>
									</div>
								</div>
							</div>

							<div className="product-edit-form-container">
								<h1 className="product-edit-form-heading">Stock Information</h1>
								<div className="product-edit-form">
									{[
										{ label: "Usage Unit", id: "usageUnit" },
										{ label: "Qty Ordered", id: "quantityOrdered" },
										{ label: "Qty in Stock", id: "quantityInStock" },
										{ label: "Reorder Level", id: "reorderLevel" },
										{ label: "Handler", id: "handler" },
										{ label: "Qty in Demand", id: "quantityInDemand" },
									].map(({ label, id }) => (
										<div key={id} className="product-edit-form-group">
											<label>{label}</label>
											<input
												type="text"
												readOnly={isReadOnly}
												disabled={isReadOnly}
												value={editableData?.[id] ?? ""}
												onChange={(e) => setEditableData({ ...editableData, [id]: e.target.value })}
											/>
										</div>
									))}
								</div>
							</div>

							<div className="product-edit-form-container">
								<h1 className="product-edit-form-heading">Description</h1>
								<div className="product-edit-form">
									<div className="product-edit-form-group full-width">
										<textarea
											placeholder="Description..."
											readOnly={isReadOnly}
											disabled={isReadOnly}
											value={editableData?.description ?? ""}
											onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
											className="product-description-textarea"
										/>
									</div>
								</div>
							</div>
						</>
					)}
				</>
			)}

			{/* ATTACHMENTS TAB */}
			{activeTab === "Attachment" && (
				<div className="product-edit-table-container">
					<h1 className="product-edit-form-heading" style={{top: '-15px'}}>Attachments</h1>
					<div className="product-edit-table-area">
						 <div className="product-edit-table-box">
							 <table className="product-create-table">
								 <thead><tr><th>File Name</th><th>Date Added</th><th>Size</th><th>Action</th></tr></thead>
								 <tbody>
									{attachments.length === 0 ? (
										<tr><td colSpan="4" className="no-records-text">No Attachments Found</td></tr>
									) : (
										attachments.map(att => (
											<tr key={att.id}>
												<td>
													<span 
														className="attachment-name-link" 
														onClick={() => handlePreview(att)}
														style={{cursor:'pointer', color:'#365486', textDecoration:'underline'}}
													>
														{att.fileName}
													</span>
												</td>
												<td>{new Date(att.date).toLocaleDateString()}</td>
												<td>{formatFileSize(att.size)}</td>
												<td>
													<button className="icon-btn" onClick={() => handleDownload(att)} title="Download">
														<Download size={16}/>
													</button>
												</td>
											</tr>
										))
									)}
								 </tbody>
							 </table>
						 </div>
					</div>
				</div>
			)}

			{/* PRICE BOOKS TAB */}
			{activeTab === "Price Books" && (
				<div className="product-edit-table-container">
					<h1 className="product-edit-form-heading" style={{top: '-15px'}}>Price Books</h1>
					<div className="product-edit-table-area">
						 <div className="product-edit-table-box">
							 <table className="product-create-table">
								 <thead><tr><th>Book Name</th><th>Price</th><th>Action</th></tr></thead>
								 <tbody>
									<tr><td colSpan="3" className="no-records-text">No Price Books Found</td></tr>
								 </tbody>
							 </table>
						 </div>
					</div>
				</div>
			)}

			{/* MODALS */}
			
			{showDeleteConfirm && (
				<div className="product-modal-overlay" style={{zIndex: 4000}}>
					<div className="product-modal-content">
						<div className="product-dialog-header"><h3>Confirm Delete</h3></div>
						<div className="product-dialog-body">Are you sure you want to delete this product?</div>
						<div className="product-dialog-buttons">
							<button className="product-yes-button" onClick={confirmDelete}>Yes</button>
							<button className="product-no-button" onClick={() => setShowDeleteConfirm(false)}>No</button>
						</div>
					</div>
				</div>
			)}

			{/* Change Owner Modal 1: Status & Button */}
			{showChangeOwner && (
				<div className="product-modal-overlay" style={{zIndex: 3000}}>
					<div className="product-modal-content" style={{ width: '400px' }}>
						<div className="product-dialog-header">
							<h3>Change Owner</h3>
							<button onClick={() => setShowChangeOwner(false)}><X size={20}/></button>
						</div>
						<div className="product-dialog-body" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
							<div className="product-edit-form-group">
								<label style={{fontSize:'12px', color:'#666'}}>Assign Owner (Current)</label>
								<input type="text" value={ownerConfig.currentOwner} disabled style={{background:'#f5f5f5', border:'1px solid #ddd'}}/>
							</div>
							<div className="product-edit-form-group">
								<label style={{fontSize:'12px', color:'#666'}}>Reassign Owner</label>
								<div style={{position:'relative'}}>
									<input 
										type="text" 
										placeholder="Search or Select User..." 
										value={ownerConfig.newOwner}
										readOnly 
										onClick={() => setShowUserSelectModal(true)}
										style={{cursor:'pointer', paddingRight:'35px'}}
									/>
									<Search size={16} color="#666" style={{position:'absolute', right:'10px', top:'10px', pointerEvents:'none'}}/>
								</div>
							</div>
						</div>
						<div className="product-dialog-buttons">
							<button className="product-no-button" onClick={() => setShowChangeOwner(false)}>Cancel</button>
							<button className="product-yes-button" onClick={handleChangeOwnerSave}>Save</button>
						</div>
					</div>
				</div>
			)}
			
			{/* Change Owner Modal 2: User Selector */}
			{showUserSelectModal && (
				<div className="product-modal-overlay" style={{zIndex: 3500}}>
					<div className="product-modal-content" style={{ width: '600px', height:'500px' }}>
						<div className="product-dialog-header">
							<h3>Select User</h3>
							<button onClick={() => setShowUserSelectModal(false)}><X size={20}/></button>
						</div>
						<div className="product-search-bar-container">
							<div className="product-modal-input-wrapper">
								<input 
									type="text" 
									placeholder="Search by name or email..." 
									value={userSearchTerm} 
									onChange={(e) => setUserSearchTerm(e.target.value)} 
									autoFocus 
									className="product-search-bar" 
								/>
								<Search size={18} color="#888" className="product-search-bar-icon" />
							</div>
						</div>
						<div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
							<table className="product-modal-table" style={{width:'100%', borderCollapse:'collapse'}}>
								<thead>
									<tr style={{background:'#f9fafb', borderBottom:'1px solid #eee'}}>
										<th style={{padding:'10px 20px', textAlign:'left', fontSize:'14px', color:'#365486'}}>Username</th>
										<th style={{padding:'10px 20px', textAlign:'left', fontSize:'14px', color:'#365486'}}>Business Role</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.length > 0 ? (
										filteredUsers.map((user) => (
											<tr key={user.id} onClick={() => handleUserSelect(user)} style={{ cursor: "pointer", borderBottom:'1px solid #f0f0f0' }} className="product-modal-row">
												<td style={{padding:'12px 20px'}}>
													<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
														<div className="owner-avatar" style={{width:'24px', height:'24px', fontSize:'12px'}}>{(user.firstName || user.name || "?").charAt(0)}</div> 
														<span style={{fontSize:'14px', color:'#333'}}>{user.name || `${user.firstName} ${user.lastName}`}</span>
													</div>
												</td>
												<td style={{padding:'12px 20px', fontSize:'14px', color:'#666'}}>
													{user.businessRoleName || user.businessRole || user.role || user.roleName || "-"}
												</td>
											</tr>
										))
									) : (
										<tr><td colSpan="2" className="no-records-text">No users found.</td></tr>
									)}
								</tbody>
							</table>
						</div>
						<div className="product-dialog-buttons">
							<button onClick={() => setShowUserSelectModal(false)} className="product-no-button">Cancel</button>
						</div>
					</div>
				</div>
			)}

			{/* Add Note Modal - Styled exactly like Ticket modals */}
			{showAddNoteModal && (
				<div className="product-modal-overlay" style={{zIndex: 4000}}>
					<div className="product-modal-content" style={{width:'500px'}}>
						<div className="product-dialog-header"><h3>Add Note</h3><button onClick={()=>setShowAddNoteModal(false)}><X size={20}/></button></div>
						<div className="product-dialog-body">
							 <textarea 
								className="product-notes-textarea" 
								placeholder="Type your note here..." 
								value={newNote}
								onChange={e => setNewNote(e.target.value)}
								style={{height:'100px', width:'100%', marginBottom:'10px'}}
							 />
						</div>
						<div className="product-dialog-buttons">
							<button className="product-yes-button" onClick={handleSaveNote}>Save</button>
							<button className="product-no-button" onClick={() => setShowAddNoteModal(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedProducts;