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
    Calendar
} from "lucide-react";
import { toast } from "react-toastify";
import "./DetailedCustomerContact.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM; // Leads
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM; // Sales (Deals/Quotes)
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER; // Service (Tickets, Calls, etc.)

const DetailedCustomerContact = () => {
    const { id } = useParams(); // contactId
    const navigate = useNavigate();
    const location = useLocation();
    const actionRef = useRef(null);

    // --- UI States ---
    const [activeMainTab, setActiveMainTab] = useState("Overview");
    const [activeActivityTab, setActiveActivityTab] = useState("Calls"); // Sub-tab for Activities (Calls/Meetings)
    const [menuModal, setMenuModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    // --- Data States ---
    const [contactData, setContactData] = useState(null);
    const [accountData, setAccountData] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    // Related Data States
    const [relatedLeads, setRelatedLeads] = useState([]);
    const [relatedDeals, setRelatedDeals] = useState([]);
    const [relatedQuotes, setRelatedQuotes] = useState([]);
    
    // Activity Data States
    const [relatedTickets, setRelatedTickets] = useState([]);
    const [relatedCalls, setRelatedCalls] = useState([]);
    const [relatedEmails, setRelatedEmails] = useState([]);
    const [relatedMeetings, setRelatedMeetings] = useState([]);

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
            const res = await fetch(`${BASE_URL_AC}/contact/${id}/image?t=${new Date().getTime()}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setProfileImageUrl(url);
            } else {
                setProfileImageUrl(null);
            }
        } catch (err) {
            setProfileImageUrl(null);
        }
    };

    // --- Fetch Related Items with Client-Side Filtering ---
    const fetchRelatedData = async (contact) => {
        if (!contact) return;
        const currentContactId = String(contact.contactId);
        const currentEmail = contact.email ? contact.email.toLowerCase() : "";

        // 1. Fetch Leads
        if (currentEmail) {
            try {
                const res = await fetch(`${BASE_URL_LM}/leads/paginate?email=${encodeURIComponent(currentEmail)}&limit=100`);
                if (res.ok) {
                    const data = await res.json();
                    const items = data.items || [];
                    const filtered = items.filter(l => (l.email || "").toLowerCase() === currentEmail);
                    setRelatedLeads(filtered);
                }
            } catch (e) { console.error("Error fetching leads", e); }
        }

        // 2. Fetch Deals
        try {
            const res = await fetch(`${BASE_URL_SM}/opportunity/paginate?primaryContactId=${contact.contactId}&limit=100`);
            if (res.ok) {
                const data = await res.json();
                const items = data.items || [];
                const filtered = items.filter(d => String(d.primaryContactId) === currentContactId);
                setRelatedDeals(filtered);
            }
        } catch (e) { console.error("Error fetching deals", e); }

        // 3. Fetch Quotes
        try {
            const res = await fetch(`${BASE_URL_SM}/sales-quote/paginate?primaryContactId=${contact.contactId}&limit=100`);
            if (res.ok) {
                const data = await res.json();
                const items = data.items || [];
                const filtered = items.filter(q => String(q.primaryContactId) === currentContactId);
                setRelatedQuotes(filtered);
            }
        } catch (e) { console.error("Error fetching quotes", e); }

        // 4. Fetch Activities (Tickets, Calls, Emails, Meetings)
        try {
            // Tickets
            const ticketRes = await fetch(`${BASE_URL_SER}/tickets?primary_contact_id=${contact.contactId}`);
            if (ticketRes.ok) {
                const data = await ticketRes.json();
                const items = Array.isArray(data) ? data : (data.items || []);
                const filtered = items.filter(t => String(t.primary_contact_id) === currentContactId);
                setRelatedTickets(filtered);
            }
            
            // Calls
            const callRes = await fetch(`${BASE_URL_SER}/phone-calls?primaryContactId=${contact.contactId}`);
            if (callRes.ok) {
                const data = await callRes.json();
                const items = data.data || (Array.isArray(data) ? data : []);
                setRelatedCalls(items.filter(c => String(c.primaryContactId) === currentContactId));
            }
            
            // Emails
            const emailRes = await fetch(`${BASE_URL_AM}/emails?limit=100`);
             if (emailRes.ok) {
                 const data = await emailRes.json();
                 let items = [];
                 if (data.data && Array.isArray(data.data.emails)) items = data.data.emails;
                 else if (Array.isArray(data)) items = data;
                 
                 const filteredEmails = items.filter(e => {
                     const isIdMatch = String(e.contactId || e.contact_id) === currentContactId;
                     const recipientEmail = (e.recipient || "").match(/<([^>]+)>/)?.[1] || e.recipient || "";
                     const senderEmail = (e.sender || "").match(/<([^>]+)>/)?.[1] || e.sender || "";
                     const isEmailMatch = (recipientEmail.toLowerCase() === currentEmail) || (senderEmail.toLowerCase() === currentEmail);
                     return isIdMatch || (currentEmail && isEmailMatch);
                 });
                 setRelatedEmails(filteredEmails);
            }

            // Meetings
            const meetingRes = await fetch(`${BASE_URL_AM}/meetings`);
            if (meetingRes.ok) {
                 const data = await meetingRes.json();
                 const items = Array.isArray(data) ? data : [];
                 setRelatedMeetings(items.filter(m => String(m.primaryContactId) === currentContactId));
            }

        } catch (e) { console.error("Error fetching activities", e); }
    };

    const fetchContact = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL_AC}/contact/${id}`);
            if (!res.ok) throw new Error("Failed to fetch contact");
            const contact = await res.json();
            setContactData(contact);

            setEditFormData({
                contactStatus: contact.contactStatus || "",
                email: contact.email || "",
                note: contact.note || "",
                role: contact.role || "",
                department: contact.department || "",
                billingAddressLine1: contact.billingAddressLine1 || "",
                billingAddressLine2: contact.billingAddressLine2 || "",
                billingCity: contact.billingCity || "",
                billingState: contact.billingState || "",
                billingCountry: contact.billingCountry || "",
                billingZipCode: contact.billingZipCode || "",
                shippingAddressLine1: contact.shippingAddressLine1 || "",
                shippingAddressLine2: contact.shippingAddressLine2 || "",
                shippingCity: contact.shippingCity || "",
                shippingState: contact.shippingState || "",
                shippingCountry: contact.shippingCountry || "",
                shippingZipCode: contact.shippingZipCode || "",
            });

            if (contact.accountId) {
                const accRes = await fetch(`${BASE_URL_AC}/account/${contact.accountId}`);
                if (accRes.ok) {
                    setAccountData(await accRes.json());
                }
            }
            
            await fetchImage();
            fetchRelatedData(contact);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching contact details");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchContact();
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

    // --- Handlers ---
    const handleEditChange = (e) => {
        const { id, value } = e.target;
        setEditFormData((p) => ({ ...p, [id]: value }));
    };

    const handleSave = async () => {
        try {
            // MERGE existing required data with your edits
            const payload = {
                // 1. INCLUDE REQUIRED FIELDS (that are not in the form)
                accountId: contactData.accountId,
                firstName: contactData.firstName,
                lastName: contactData.lastName,
                isPrimary: contactData.isPrimary,
                phone: contactData.phone, // Optional but good to keep

                // 2. INCLUDE EDITED FIELDS
                ...editFormData,

                // 3. HANDLE ENUMS (Convert empty strings to null)
                department: editFormData.department === "" ? null : editFormData.department,
                role: editFormData.role === "" ? null : editFormData.role
            };

            const res = await fetch(`${BASE_URL_AC}/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Log the actual server error to the console
                const errorData = await res.text(); 
                console.error("Server Error Details:", errorData);
                throw new Error("Failed to update contact");
            }

            toast.success("Contact updated successfully!");
            await fetchContact();
            setIsEditMode(false);
        } catch (err) {
            console.error(err);
            toast.error("Error updating contact");
        }
    };

    const handleCancel = () => navigate("/customers/contacts");

    const handleDelete = async () => {
        try {
            const res = await fetch(`${BASE_URL_AC}/contact/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Contact deleted successfully");
                navigate("/customers/contacts");
            } else {
                toast.error("Failed to delete contact");
            }
        } catch (err) {
            toast.error("Error deleting contact");
        }
    };

    const getRoleLabel = (role) => {
        const map = {
            MANAGER: "Manager", DECISION_MAKER: "Decision Maker", STAKE_HOLDER: "Stake Holder",
            TECHNICAL_EVALUATOR: "Technical Evaluator", EXECUTIVE: "Executive",
            END_USER: "End User", OTHERS: "Others",
        };
        return map[role] || role || "--";
    };

    if (loading || !contactData) return <div className="dcc-loading">Loading...</div>;
    const fullName = `${contactData.firstName} ${contactData.lastName}`;

    return (
        <div className="dcc-container">
            {/* ---------- HEADER ---------- */}
            <div className="dcc-header-container">
                <div className="dcc-profile-section">
                    <div className="dcc-profile-image-wrapper">
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt="Profile" className="dcc-profile-image" />
                        ) : (
                            <div className="dcc-profile-placeholder">
                                <User size={40} color="#365486" />
                            </div>
                        )}
                    </div>
                    <h1 className="dcc-heading">{fullName}</h1>
                </div>

                <div className="dcc-header-buttons">
                    {!isEditMode ? (
                        <>
                            <button className="dcc-close-button" onClick={() => navigate("/customers/contacts")}>
                                <X size={15} strokeWidth={1} /> Close
                            </button>
                            <div className="dcc-options-button-container" ref={actionRef}>
                                <button className="dcc-options-button" onClick={() => setMenuModal(!menuModal)}>
                                    <MoreVertical size={20} />
                                </button>
                                {menuModal && (
                                    <div className="dcc-menu-modal-container">
                                        <ul className="dcc-menu-modal-list">
                                            {/*<li onClick={() => { setMenuModal(false); setIsEditMode(true); }}>Edit</li>*/}
                                            <li onClick={() => { setMenuModal(false); setShowDeleteConfirm(true); }}>Delete</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button className="dcc-save-button" onClick={handleSave}><Save size={15} strokeWidth={1} /> Save</button>
                            <button className="dcc-cancel-button" onClick={handleCancel}><CircleX size={15} strokeWidth={1} /> Cancel</button>
                        </>
                    )}
                </div>
            </div>

            {/* ---------- TABS ---------- */}
            <div className="dcc-tabs-container">
                <div className="dcc-tabs-left">
                    {["Overview", "Activities", "Leads", "Deals", "Quotes", "Tickets", "Interactions"].map((tab) => (
                        <button
                            key={tab}
                            className={`dcc-tab-btn ${activeMainTab === tab ? "active" : ""}`}
                            onClick={() => setActiveMainTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ---------- CONTENT AREA ---------- */}
            <div className="dcc-content-area">
                
                {/* 1. OVERVIEW TAB */}
                {activeMainTab === "Overview" && (
                    <>
                        <div className="dcc-form-container">
                            <h1 className="dcc-form-heading">Contact Information</h1>
                            <div className="dcc-form">
                                <form>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group">
                                            <label>Contact ID</label>
                                            <input type="text" value={contactData.contactId || ""} disabled className="input-disabled" />
                                        </div>
                                        <div className="dcc-form-group">
                                            <label>Job Title</label>
                                             {isEditMode ? (
                                                <select id="role" value={editFormData.role || ""} onChange={handleEditChange}>
                                                    <option value="">Select Job Title</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="DECISION_MAKER">Decision Maker</option>
                                                    <option value="STAKE_HOLDER">Stake Holder</option>
                                                    <option value="TECHNICAL_EVALUATOR">Technical Evaluator</option>
                                                    <option value="EXECUTIVE">Executive</option>
                                                    <option value="END_USER">End User</option>
                                                    <option value="OTHERS">Others</option>
                                                </select>
                                            ) : (
                                                <input type="text" value={getRoleLabel(contactData.role)} disabled className="input-disabled" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group">
                                            <label>Account Name</label>
                                            <input type="text" value={accountData?.name || contactData.accountId || "--"} disabled className="input-disabled" />
                                        </div>
                                        <div className="dcc-form-group">
                                            <label>Department</label>
                                            {isEditMode ? (
                                                <select id="department" value={editFormData.department || ""} onChange={handleEditChange}>
                                                    <option value="">Select Department</option>
                                                    <option value="IT">IT</option>
                                                    <option value="HR">HR</option>
                                                    <option value="SALES">Sales</option>
                                                    <option value="MARKETING">Marketing</option>
                                                    <option value="FINANCE">Finance</option>
                                                    <option value="ENGINEERING">Engineering</option>
                                                </select>
                                            ) : (
                                                <input type="text" value={contactData.department || "--"} disabled className="input-disabled" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group">
                                            <label>Email</label>
                                            <input type="text" value={contactData.email || "--"} disabled={!isEditMode} onChange={isEditMode ? handleEditChange : undefined} id="email" />
                                        </div>
                                        <div className="dcc-form-group">
                                            <label>Status</label>
                                            {isEditMode ? (
                                                <select id="contactStatus" value={editFormData.contactStatus} onChange={handleEditChange}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            ) : (
                                                <input type="text" value={contactData.contactStatus || "--"} disabled />
                                            )}
                                        </div>
                                    </div>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group">
                                            <label>Note</label>
                                            <textarea id="note" value={isEditMode ? editFormData.note : (contactData.note || "--")} onChange={isEditMode ? handleEditChange : undefined} disabled={!isEditMode} className={!isEditMode ? "input-disabled" : ""} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="dcc-form-container">
                            <h1 className="dcc-form-heading">Account Details</h1>
                            <div className="dcc-form">
                                <form>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group"><label>Type</label><input type="text" value={accountData?.type || "--"} disabled className="input-disabled" /></div>
                                        <div className="dcc-form-group"><label>Industry</label><input type="text" value={accountData?.industry || "--"} disabled className="input-disabled" /></div>
                                    </div>
                                    <div className="dcc-form-row">
                                        <div className="dcc-form-group"><label>Website</label><input type="text" value={accountData?.website || "--"} disabled className="input-disabled" /></div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="dcc-form-container">
                            <h1 className="dcc-form-heading">Address Information</h1>
                            <div className="dcc-form">
                                <h4 className="dcc-section-label">Billing</h4>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>Address Line 1</label><input type="text" id="billingAddressLine1" value={isEditMode ? editFormData.billingAddressLine1 : contactData.billingAddressLine1} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>Address Line 2</label><input type="text" id="billingAddressLine2" value={isEditMode ? editFormData.billingAddressLine2 : contactData.billingAddressLine2} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>City</label><input type="text" id="billingCity" value={isEditMode ? editFormData.billingCity : contactData.billingCity} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>State</label><input type="text" id="billingState" value={isEditMode ? editFormData.billingState : contactData.billingState} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>Country</label><input type="text" id="billingCountry" value={isEditMode ? editFormData.billingCountry : contactData.billingCountry} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>Zip Code</label><input type="text" id="billingZipCode" value={isEditMode ? editFormData.billingZipCode : contactData.billingZipCode} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                                <div className="dcc-divider" style={{ margin: "20px 0", borderBottom: "1px solid #eee" }}></div>
                                <h4 className="dcc-section-label">Shipping</h4>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>Address Line 1</label><input type="text" id="shippingAddressLine1" value={isEditMode ? editFormData.shippingAddressLine1 : contactData.shippingAddressLine1} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>Address Line 2</label><input type="text" id="shippingAddressLine2" value={isEditMode ? editFormData.shippingAddressLine2 : contactData.shippingAddressLine2} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>City</label><input type="text" id="shippingCity" value={isEditMode ? editFormData.shippingCity : contactData.shippingCity} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>State</label><input type="text" id="shippingState" value={isEditMode ? editFormData.shippingState : contactData.shippingState} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                                <div className="dcc-form-row">
                                    <div className="dcc-form-group"><label>Country</label><input type="text" id="shippingCountry" value={isEditMode ? editFormData.shippingCountry : contactData.shippingCountry} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                    <div className="dcc-form-group"><label>Zip Code</label><input type="text" id="shippingZipCode" value={isEditMode ? editFormData.shippingZipCode : contactData.shippingZipCode} onChange={handleEditChange} disabled={!isEditMode} /></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* 2. ACTIVITIES TAB (Calls & Meetings Only) */}
                {activeMainTab === "Activities" && (
                    <div className="dcc-form-container">
                        <div className="dcc-tab-action-header">
                            <h1 className="dcc-form-heading">Related Activities</h1>
                        </div>
                        <div className="dcc-activity-tabs">
                            <button className={`dcc-subtab-btn ${activeActivityTab === "Calls" ? "active" : ""}`} onClick={() => setActiveActivityTab("Calls")}>
                                <Phone size={14}/> Calls
                            </button>
                            <button className={`dcc-subtab-btn ${activeActivityTab === "Meetings" ? "active" : ""}`} onClick={() => setActiveActivityTab("Meetings")}>
                                <Calendar size={14}/> Meetings
                            </button>
                        </div>

                        {/* Calls Table */}
                        {activeActivityTab === "Calls" && (
                            <div className="dcc-table-area">
                                <table className="dcc-create-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Type</th>
                                            <th>Duration</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedCalls.length > 0 ? relatedCalls.map(call => (
                                            <tr key={call.id}>
                                                <td>{call.subject}</td>
                                                <td>{call.type}</td>
                                                <td>{call.duration}</td>
                                                <td>{new Date(call.date || call.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="dcc-view-btn" onClick={() => navigate(`/activitymanagement/phonecalls/details/${call.id}`)}>
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="dcc-empty-state">No related calls found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Meetings Table */}
                        {activeActivityTab === "Meetings" && (
                            <div className="dcc-table-area">
                                <table className="dcc-create-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Location</th>
                                            <th>Duration</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relatedMeetings.length > 0 ? relatedMeetings.map(meeting => (
                                            <tr key={meeting.id}>
                                                <td>{meeting.subject}</td>
                                                <td>{meeting.location}</td>
                                                <td>{meeting.duration}</td>
                                                <td>{new Date(meeting.fromDate || meeting.date).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="dcc-view-btn" onClick={() => navigate(`/activitymanagement/meetings/details/${meeting.id}`)}>
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="dcc-empty-state">No related meetings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. LEADS TAB */}
                {activeMainTab === "Leads" && (
                    <div className="dcc-form-container">
                        <h1 className="dcc-form-heading">Related Leads</h1>
                        <div className="dcc-table-area">
                            <table className="dcc-create-table">
                                <thead>
                                    <tr>
                                        <th>Lead Name</th>
                                        <th>Status</th>
                                        <th>Company</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedLeads.length > 0 ? relatedLeads.map(lead => (
                                        <tr key={lead.id}>
                                            <td>{lead.firstName} {lead.lastName}</td>
                                            <td>{lead.leadStatus}</td>
                                            <td>{lead.company}</td>
                                            <td>{lead.email}</td>
                                            <td>
                                                <button className="dcc-view-btn" onClick={() => navigate(`/sales/leads/details/${lead.id}`)}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="dcc-empty-state">No related leads found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. DEALS TAB */}
                {activeMainTab === "Deals" && (
                    <div className="dcc-form-container">
                        <h1 className="dcc-form-heading">Related Deals</h1>
                        <div className="dcc-table-area">
                            <table className="dcc-create-table">
                                <thead>
                                    <tr>
                                        <th>Deal Name</th>
                                        <th>Stage</th>
                                        <th>Amount</th>
                                        <th>Closing Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedDeals.length > 0 ? relatedDeals.map(deal => (
                                        <tr key={deal.id}>
                                            <td>{deal.name}</td>
                                            <td>{deal.stage}</td>
                                            <td>{deal.amount}</td>
                                            <td>{deal.closingDate ? new Date(deal.closingDate).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <button className="dcc-view-btn" onClick={() => navigate(`/sales/opportunities/details/${deal.id}`)}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="dcc-empty-state">No related deals found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. QUOTES TAB */}
                {activeMainTab === "Quotes" && (
                    <div className="dcc-form-container">
                        <h1 className="dcc-form-heading">Related Quotes</h1>
                        <div className="dcc-table-area">
                            <table className="dcc-create-table">
                                <thead>
                                    <tr>
                                        <th>Quote Name</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedQuotes.length > 0 ? relatedQuotes.map(quote => (
                                        <tr key={quote.id}>
                                            <td>{quote.name}</td>
                                            <td>{quote.status}</td>
                                            <td>{quote.totalPrice}</td>
                                            <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="dcc-view-btn" onClick={() => navigate(`/sales/sales-quote/details/${quote.id}`)}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="dcc-empty-state">No related quotes found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. TICKETS TAB */}
                {activeMainTab === "Tickets" && (
                    <div className="dcc-form-container">
                        <h1 className="dcc-form-heading">Related Tickets</h1>
                        <div className="dcc-table-area">
                             <table className="dcc-create-table">
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Created Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedTickets.length > 0 ? relatedTickets.map(ticket => (
                                        <tr key={ticket.ticket_id}>
                                            <td>{ticket.ticket_id}</td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.status}</td>
                                            <td>{ticket.priority}</td>
                                            <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button className="dcc-view-btn" onClick={() => navigate(`/service/tickets/details/${ticket.ticket_id}`)}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="dcc-empty-state">No related tickets found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 7. INTERACTIONS TAB (Emails) */}
                {activeMainTab === "Interactions" && (
                    <div className="dcc-form-container">
                        <h1 className="dcc-form-heading">Email Interactions</h1>
                        <div className="dcc-table-area">
                             <table className="dcc-create-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relatedEmails.length > 0 ? relatedEmails.map(email => (
                                        <tr key={email.id}>
                                            <td>{email.subject}</td>
                                            <td>{email.sender}</td>
                                            <td>{email.recipient}</td>
                                            <td>{new Date(email.receivedAt || email.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="dcc-view-btn" onClick={() => navigate(`/activitymanagement/emails/view`, { state: { emailId: email.id } })}>
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="dcc-empty-state">No email interactions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="dcc-modal-overlay">
                    <div className="dcc-modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this contact?</p>
                        <div className="dcc-modal-actions">
                            <button className="dcc-cancel-button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="dcc-delete-confirm-btn" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedCustomerContact;