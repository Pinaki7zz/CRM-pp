import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
	Save,
	CircleX,
	MoreVertical,
	X,
	User,
	Eye,
	Plus,
	Phone,
	Calendar,
	Paperclip,
	ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";
import "./DetailedCustomerAccount.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM || "http://localhost:8086/api/v1"; // Fallback if undefined

const DetailedCustomerAccount = () => {
	const { accountId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const actionRef = useRef(null);

	// --- UI States ---
	const [activeMainTab, setActiveMainTab] = useState("Overview");
	const [activeActivityTab, setActiveActivityTab] = useState("Calls");
	const [menuModal, setMenuModal] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [profileImageUrl, setProfileImageUrl] = useState(null);

	// --- Data States ---
	const [formData, setFormData] = useState({});
	const [originalData, setOriginalData] = useState({});
	const [allUsers, setAllUsers] = useState([]);
	const [allAccounts, setAllAccounts] = useState([]);
	const [attachments, setAttachments] = useState([]);

	// Related Data States
	const [relatedContacts, setRelatedContacts] = useState([]);
	const [relatedLeads, setRelatedLeads] = useState([]);
	const [relatedDeals, setRelatedDeals] = useState([]);
	const [relatedQuotes, setRelatedQuotes] = useState([]);
	const [relatedTickets, setRelatedTickets] = useState([]);
	const [relatedCalls, setRelatedCalls] = useState([]);
	const [relatedMeetings, setRelatedMeetings] = useState([]);
	const [relatedEmails, setRelatedEmails] = useState([]);

	/* ------------------------------------------------- */
	/* INIT & FETCH DATA                                 */
	/* ------------------------------------------------- */

	useEffect(() => {
		if (location.state && location.state.startInEditMode) {
			setIsEditMode(true);
			window.history.replaceState({}, document.title);
		}
	}, [location]);

	const fetchImage = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/${accountId}/image?t=${new Date().getTime()}`);
			if (res.ok) {
				const blob = await res.blob();
				setProfileImageUrl(URL.createObjectURL(blob));
			} else {
				setProfileImageUrl(null);
			}
		} catch (err) { setProfileImageUrl(null); }
	};

	const fetchRelatedData = async (currentAccountId) => {
		// 1. Contacts
		try {
			const res = await fetch(`${BASE_URL_AC}/contact`);
			if (res.ok) {
				const data = await res.json();
				setRelatedContacts(data.filter(c => c.accountId === currentAccountId));
			}
		} catch (e) { console.error("Error fetching contacts", e); }

		// 2. Leads
		try {
			const res = await fetch(`${BASE_URL_LM}/leads`);
			if (res.ok) {
				const data = await res.json();
				const items = Array.isArray(data) ? data : (data.items || []);
				// Filter leads associated with this account (assuming leads have accountId or matching company name)
				setRelatedLeads(items.filter(l => l.accountId === currentAccountId)); 
			}
		} catch (e) { console.error("Error fetching leads", e); }

		// 3. Deals
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity/paginate?accountId=${currentAccountId}&limit=100`);
			if (res.ok) {
				const data = await res.json();
				setRelatedDeals((data.items || []).filter(d => d.accountId === currentAccountId));
			}
		} catch (e) { console.error("Error fetching deals", e); }

		// 4. Quotes
		try {
			const res = await fetch(`${BASE_URL_SM}/sales-quote/paginate?accountId=${currentAccountId}&limit=100`);
			if (res.ok) {
				const data = await res.json();
				setRelatedQuotes((data.items || []).filter(q => q.accountId === currentAccountId));
			}
		} catch (e) { console.error("Error fetching quotes", e); }

		// 5. Tickets
		try {
			const res = await fetch(`${BASE_URL_SER}/tickets`);
			if (res.ok) {
				const data = await res.json();
				const items = Array.isArray(data) ? data : (data.items || []);
				setRelatedTickets(items.filter(t => t.account_id === currentAccountId || t.accountId === currentAccountId));
			}
		} catch (e) { console.error("Error fetching tickets", e); }

		// 6. Activities (Calls/Meetings/Emails)
		try {
			// Calls
			const callRes = await fetch(`${BASE_URL_SER}/phone-calls`);
			if (callRes.ok) {
				const data = await callRes.json();
				const items = data.data || (Array.isArray(data) ? data : []);
				setRelatedCalls(items.filter(c => c.accountId === currentAccountId));
			}
			// Meetings
			const meetingRes = await fetch(`${BASE_URL_AM}/meetings`);
			if (meetingRes.ok) {
				const data = await meetingRes.json();
				setRelatedMeetings((Array.isArray(data) ? data : []).filter(m => m.accountId === currentAccountId));
			}
			// Emails (Interactions)
			const emailRes = await fetch(`${BASE_URL_AM}/emails?limit=100`);
			if (emailRes.ok) {
				const data = await emailRes.json();
				let items = [];
				if (data.data && Array.isArray(data.data.emails)) items = data.data.emails;
				else if (Array.isArray(data)) items = data;
				// Filter emails linked to this account
				setRelatedEmails(items.filter(e => e.accountId === currentAccountId));
			}
		} catch (e) { console.error("Error fetching activities", e); }
	};

	const fetchAccountData = async () => {
		try {
			setLoading(true);
			const [accRes, usersRes, allAccRes] = await Promise.all([
				fetch(`${BASE_URL_AC}/account/${accountId}`),
				fetch(`${BASE_URL_UM}/users/s-info`, { credentials: "include" }),
				fetch(`${BASE_URL_AC}/account/ids-names`)
			]);

			if (!accRes.ok) throw new Error("Failed to fetch account");
			const account = await accRes.json();
			setFormData(account);
			setOriginalData(account);

			if (usersRes.ok) setAllUsers(await usersRes.json());
			if (allAccRes.ok) setAllAccounts(await allAccRes.json());

			await fetchImage();
			fetchRelatedData(account.accountId);
		} catch (err) {
			console.error(err);
			toast.error("Error fetching account details");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { if (accountId) fetchAccountData(); }, [accountId]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (actionRef.current && !actionRef.current.contains(event.target)) setMenuModal(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

	const handleSave = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/${accountId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			if (!res.ok) throw new Error("Failed to update");
			toast.success("Account updated successfully");
			setOriginalData(formData);
			setIsEditMode(false);
			fetchAccountData();
		} catch (err) { toast.error("Error updating account"); }
	};

	const handleDelete = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/${accountId}`, { method: "DELETE" });
			if (res.ok) {
				toast.success("Account deleted");
				navigate("/customers/accounts");
			} else { toast.error("Failed to delete account"); }
		} catch (err) { toast.error("Error deleting account"); }
	};

	const handleAttachmentUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.type !== "application/pdf") { toast.error("Only PDF files are allowed"); return; }
		setAttachments(prev => [...prev, { name: file.name, size: (file.size / 1024).toFixed(2) + " KB", date: new Date().toLocaleDateString("en-GB") }]);
	};

	const formatName = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
	const getOwnerName = (id) => {
		if (!id) return "--";
		const user = allUsers.find(u => u.id === id);
		return user ? `${formatName(user.firstName)} ${formatName(user.lastName)}` : id;
	};

	if (loading) return <div className="dca-loading">Loading...</div>;

	return (
		<div className="dca-container">
			{/* Header */}
			<div className="dca-header-container">
				<div className="dca-profile-section">
					<div className="dca-profile-image-wrapper">
						{profileImageUrl ? (
							<img src={profileImageUrl} alt="Logo" className="dca-profile-image" />
						) : (
							<div className="dca-profile-placeholder"><User size={40} color="#365486" /></div>
						)}
					</div>
					<div>
						<h1 className="dca-heading">{formData.name}</h1>
						<span style={{ fontSize: '12px', color: '#666' }}>{formData.accountId}</span>
					</div>
				</div>

				<div className="dca-header-buttons">
					{!isEditMode ? (
						<>
							<button className="dca-close-button" onClick={() => navigate("/customers/accounts")}>
								<X size={15} strokeWidth={1} /> Close
							</button>
							<div className="dca-options-button-container" ref={actionRef}>
								<button className="dca-options-button" onClick={() => setMenuModal(!menuModal)}><MoreVertical size={20} /></button>
								{menuModal && (
									<div className="dca-menu-modal-container">
										<ul className="dca-menu-modal-list">
											{/*<li onClick={() => { setMenuModal(false); setIsEditMode(true); }}>Edit</li>*/}
											<li onClick={() => { setMenuModal(false); setShowDeleteConfirm(true); }}>Delete</li>
										</ul>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<button className="dca-save-button" onClick={handleSave}><Save size={15} strokeWidth={1} /> Save</button>
							<button className="dca-cancel-button" onClick={() => { setFormData(originalData); setIsEditMode(false); }}><CircleX size={15} strokeWidth={1} /> Cancel</button>
						</>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="dca-tabs-container">
				<div className="dca-tabs-left">
					{["Overview", "Contacts", "Activities", "Leads", "Deals", "Quotes", "Tickets", "Interactions"].map((tab) => (
						<button key={tab} className={`dca-tab-btn ${activeMainTab === tab ? "active" : ""}`} onClick={() => setActiveMainTab(tab)}>
							{tab}
						</button>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className="dca-content-area">
				
				{/* 1. OVERVIEW TAB */}
				{activeMainTab === "Overview" && (
					<>
						<div className="dca-form-container">
							<h1 className="dca-form-heading">Account Information</h1>
							<div className="dca-form">
								<div className="dca-form-row">
									<div className="dca-form-group">
										<label>Account ID</label>
										<input type="text" value={formData.accountId} disabled className="input-disabled" />
									</div>
									<div className="dca-form-group">
										<label>Account Name</label>
										<input id="name" type="text" value={formData.name} onChange={handleChange} disabled={!isEditMode} />
									</div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group">
										<label>Owner</label>
										{isEditMode ? (
											<select id="ownerId" value={formData.ownerId} onChange={handleChange}>
												<option value="">Select Owner</option>
												{allUsers.map(u => <option key={u.id} value={u.id}>{formatName(u.firstName)} {formatName(u.lastName)}</option>)}
											</select>
										) : (
											<input type="text" value={getOwnerName(formData.ownerId)} disabled className="input-disabled" />
										)}
									</div>
									<div className="dca-form-group">
										<label>Website</label>
										<input id="website" type="text" value={formData.website} onChange={handleChange} disabled={!isEditMode} />
									</div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group">
										<label>Type</label>
										<select id="type" value={formData.type} onChange={handleChange} disabled={!isEditMode}>
											<option value="">Select</option>
											<option value="CUSTOMER">Customer</option>
											<option value="PARTNER">Partner</option>
											<option value="OTHER">Other</option>
										</select>
									</div>
									<div className="dca-form-group">
										<label>Industry</label>
										<select id="industry" value={formData.industry} onChange={handleChange} disabled={!isEditMode}>
											<option value="">Select</option>
											<option value="TECH">Tech</option>
											<option value="FINANCE">Finance</option>
											<option value="HEALTHCARE">Healthcare</option>
										</select>
									</div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group">
										<label>Status</label>
										<select id="accountStatus" value={formData.accountStatus} onChange={handleChange} disabled={!isEditMode}>
											<option value="ACTIVE">Active</option>
											<option value="INACTIVE">Inactive</option>
										</select>
									</div>
									<div className="dca-form-group">
										<label>Parent Account</label>
										<select id="parentAccountId" value={formData.parentAccountId || ""} onChange={handleChange} disabled={!isEditMode}>
											<option value="">None</option>
											{allAccounts.filter(a => a.accountId !== formData.accountId).map(a => (
												<option key={a.accountId} value={a.accountId}>{a.name}</option>
											))}
										</select>
									</div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Note</label><textarea id="note" value={formData.note} onChange={handleChange} disabled={!isEditMode} style={{height:'80px'}}/></div>
								</div>
							</div>
						</div>

						<div className="dca-form-container">
							<h1 className="dca-form-heading">Address Information</h1>
							<div className="dca-form">
								<h4 className="dca-section-label">Billing</h4>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Address Line 1</label><input id="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>Address Line 2</label><input id="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>City</label><input id="billingCity" value={formData.billingCity} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>State</label><input id="billingState" value={formData.billingState} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Country</label><input id="billingCountry" value={formData.billingCountry} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>Zip</label><input id="billingZipCode" value={formData.billingZipCode} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
								<div className="dca-divider" style={{ margin: "20px 0", borderBottom: "1px solid #eee" }}></div>
								<h4 className="dca-section-label">Shipping</h4>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Address Line 1</label><input id="shippingAddressLine1" value={formData.shippingAddressLine1} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>Address Line 2</label><input id="shippingAddressLine2" value={formData.shippingAddressLine2} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>City</label><input id="shippingCity" value={formData.shippingCity} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>State</label><input id="shippingState" value={formData.shippingState} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Country</label><input id="shippingCountry" value={formData.shippingCountry} onChange={handleChange} disabled={!isEditMode}/></div>
									<div className="dca-form-group"><label>Zip</label><input id="shippingZipCode" value={formData.shippingZipCode} onChange={handleChange} disabled={!isEditMode}/></div>
								</div>
							</div>
						</div>
					{/*

						//Sales Order Information - Preserved 
						<div className="dca-form-container">
							<h1 className="dca-form-heading">Sales Order Information</h1>
							<div className="dca-form">
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Sales Order Owner</label><select disabled><option>Select</option></select></div>
									<div className="dca-form-group"><label>Sales Order Status</label><select disabled><option>Select</option></select></div>
								</div>
								<div className="dca-form-row">
									<div className="dca-form-group"><label>Purchase Order</label><input type="text" disabled/></div>
									<div className="dca-form-group"><label>Interaction Note</label><textarea disabled style={{height:'80px'}}/></div>
								</div>
							</div>
						</div>

						 Attachments - Preserved 
						<div className="dca-attachment-section-container">
							<div className="dca-attachment-section-heading">
								<h1>Attachments</h1>
								<label className="dca-attach-btn">Attach <Paperclip size={15} /><input type="file" accept="application/pdf" onChange={handleAttachmentUpload} style={{display:'none'}}/></label>
							</div>
							<div className="dca-table-area">
								<table className="dca-create-table">
									<thead><tr><th>File Name</th><th>Attached By</th><th>Date Added</th><th>File Size</th></tr></thead>
									<tbody>
										{attachments.map((f,i) => <tr key={i}><td>{f.name}</td><td>{getOwnerName(formData.ownerId)}</td><td>{f.date}</td><td>{f.size}</td></tr>)}
									</tbody>
								</table>
							</div>
						</div>

						 Products-Preserved

						<div className="dca-product-section-container">
							<div className="dca-product-section-heading">
								<h1>Products</h1>
								<button className="dca-action-btn" style={{backgroundColor:'#365486', color:'white'}}>Add Product <Plus size={15}/></button>
							</div>
							<div className="dca-table-area">
								<table className="dca-create-table">
									<thead><tr><th>Product Name</th><th>Product Code</th><th>Vendor Name</th><th>Unit Price</th></tr></thead>
									<tbody><tr><td colSpan="4" className="dca-empty-state">No products found.</td></tr></tbody>
								</table>
							</div>
						</div>
						*/}
					</>
				)}
			

				{/* 2. CONTACTS TAB */}
				{activeMainTab === "Contacts" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Related Contacts</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Action</th></tr></thead>
								<tbody>
									{relatedContacts.length > 0 ? relatedContacts.map(c => (
										<tr key={c.contactId}>
											<td>{c.firstName} {c.lastName}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.role}</td>
											<td><button className="dca-view-btn" onClick={() => navigate(`/customers/contacts/details/${c.contactId}`)}><Eye size={16}/></button></td>
										</tr>
									)) : <tr><td colSpan="5" className="dca-empty-state">No related contacts.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 3. ACTIVITIES TAB */}
				{activeMainTab === "Activities" && (
					<div className="dca-form-container">
						<div className="dca-tab-action-header"><h1 className="dca-form-heading">Related Activities</h1></div>
						<div className="dca-activity-tabs">
							<button className={`dca-subtab-btn ${activeActivityTab === "Calls" ? "active" : ""}`} onClick={() => setActiveActivityTab("Calls")}><Phone size={14}/> Calls</button>
							<button className={`dca-subtab-btn ${activeActivityTab === "Meetings" ? "active" : ""}`} onClick={() => setActiveActivityTab("Meetings")}><Calendar size={14}/> Meetings</button>
						</div>
						{activeActivityTab === "Calls" && (
							<div className="dca-table-area">
								<table className="dca-create-table">
									<thead><tr><th>Subject</th><th>Type</th><th>Duration</th><th>Date</th><th>Action</th></tr></thead>
									<tbody>
										{relatedCalls.length > 0 ? relatedCalls.map(c => (
											<tr key={c.id}><td>{c.subject}</td><td>{c.type}</td><td>{c.duration}</td><td>{new Date(c.date).toLocaleDateString()}</td><td><button className="dca-view-btn"><Eye size={16}/></button></td></tr>
										)) : <tr><td colSpan="5" className="dca-empty-state">No related calls.</td></tr>}
									</tbody>
								</table>
							</div>
						)}
						{activeActivityTab === "Meetings" && (
							<div className="dca-table-area">
								<table className="dca-create-table">
									<thead><tr><th>Subject</th><th>Location</th><th>Duration</th><th>Date</th><th>Action</th></tr></thead>
									<tbody>
										{relatedMeetings.length > 0 ? relatedMeetings.map(m => (
											<tr key={m.id}><td>{m.subject}</td><td>{m.location}</td><td>{m.duration}</td><td>{new Date(m.date).toLocaleDateString()}</td><td><button className="dca-view-btn"><Eye size={16}/></button></td></tr>
										)) : <tr><td colSpan="5" className="dca-empty-state">No related meetings.</td></tr>}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{/* 4. LEADS TAB */}
				{activeMainTab === "Leads" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Related Leads</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>Lead Name</th><th>Status</th><th>Company</th><th>Email</th><th>Action</th></tr></thead>
								<tbody>
									{relatedLeads.length > 0 ? relatedLeads.map(l => (
										<tr key={l.id}><td>{l.firstName} {l.lastName}</td><td>{l.leadStatus}</td><td>{l.company}</td><td>{l.email}</td><td><button className="dca-view-btn" onClick={() => navigate(`/sales/leads/details/${l.id}`)}><Eye size={16}/></button></td></tr>
									)) : <tr><td colSpan="5" className="dca-empty-state">No related leads.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 5. DEALS TAB */}
				{activeMainTab === "Deals" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Related Deals</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>Deal Name</th><th>Stage</th><th>Amount</th><th>Closing Date</th><th>Action</th></tr></thead>
								<tbody>
									{relatedDeals.length > 0 ? relatedDeals.map(d => (
										<tr key={d.id}><td>{d.name}</td><td>{d.stage}</td><td>{d.amount}</td><td>{new Date(d.closingDate).toLocaleDateString()}</td><td><button className="dca-view-btn" onClick={() => navigate(`/sales/opportunities/details/${d.id}`)}><Eye size={16}/></button></td></tr>
									)) : <tr><td colSpan="5" className="dca-empty-state">No related deals.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 6. QUOTES TAB */}
				{activeMainTab === "Quotes" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Related Quotes</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>Quote Name</th><th>Status</th><th>Total</th><th>Date</th><th>Action</th></tr></thead>
								<tbody>
									{relatedQuotes.length > 0 ? relatedQuotes.map(q => (
										<tr key={q.id}><td>{q.name}</td><td>{q.status}</td><td>{q.totalPrice}</td><td>{new Date(q.createdAt).toLocaleDateString()}</td><td><button className="dca-view-btn" onClick={() => navigate(`/sales/sales-quote/details/${q.id}`)}><Eye size={16}/></button></td></tr>
									)) : <tr><td colSpan="5" className="dca-empty-state">No related quotes.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 7. TICKETS TAB */}
				{activeMainTab === "Tickets" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Related Tickets</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>ID</th><th>Subject</th><th>Status</th><th>Priority</th><th>Date</th><th>Action</th></tr></thead>
								<tbody>
									{relatedTickets.length > 0 ? relatedTickets.map(t => (
										<tr key={t.ticket_id}><td>{t.ticket_id}</td><td>{t.subject}</td><td>{t.status}</td><td>{t.priority}</td><td>{new Date(t.created_at).toLocaleDateString()}</td><td><button className="dca-view-btn" onClick={() => navigate(`/service/tickets/details/${t.ticket_id}`)}><Eye size={16}/></button></td></tr>
									)) : <tr><td colSpan="6" className="dca-empty-state">No related tickets.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* 8. INTERACTIONS TAB (EMAILS) */}
				{activeMainTab === "Interactions" && (
					<div className="dca-form-container">
						<h1 className="dca-form-heading">Email Interactions</h1>
						<div className="dca-table-area">
							<table className="dca-create-table">
								<thead><tr><th>Subject</th><th>From</th><th>To</th><th>Date</th><th>Action</th></tr></thead>
								<tbody>
									{relatedEmails.length > 0 ? relatedEmails.map(e => (
										<tr key={e.id}><td>{e.subject}</td><td>{e.sender}</td><td>{e.recipient}</td><td>{new Date(e.receivedAt || e.createdAt).toLocaleDateString()}</td><td><button className="dca-view-btn" onClick={() => navigate(`/activitymanagement/emails/view`, { state: { emailId: e.id } })}><Eye size={16}/></button></td></tr>
									)) : <tr><td colSpan="5" className="dca-empty-state">No email interactions found.</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="dca-modal-overlay">
					<div className="dca-modal-content">
						<h3>Confirm Delete</h3>
						<p>Are you sure you want to delete this account?</p>
						<div className="dca-modal-actions">
							<button className="dca-cancel-button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
							<button className="dca-delete-confirm-btn" onClick={handleDelete}>Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedCustomerAccount;