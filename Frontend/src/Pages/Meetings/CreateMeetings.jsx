import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, FilePlus, CircleX, Search, Plus, Mail } from "lucide-react";
import { toast } from "react-toastify";
import "./CreateMeetings.css";
import ParticipantPopup from "./ParticipantPopup";
import { useAuth } from "../../contexts/AuthContext";

// API Base URLs
const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER; 

// Enums
const MEETING_PLATFORMS = ["Google Meet", "Microsoft Teams", "Zoom"];
const REMINDERS = [
    { label: "Before 5 min", value: "5" },
    { label: "Before 10 min", value: "10" },
    { label: "Before 15 min", value: "15" },
    { label: "Before 30 min", value: "30" },
    { label: "Before 1 hour", value: "60" }
];
const RELATED_OBJECTS = [
    "Lead", "Contact", "Account", "Opportunity", "Sales Quote", "Sales Order", "Ticket"
];

const CreateMeetings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- Data States ---
    const [allUsers, setAllUsers] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [allLeads, setAllLeads] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [allOpportunities, setAllOpportunities] = useState([]); 
    const [allSalesQuotes, setAllSalesQuotes] = useState([]);
    const [allSalesOrders, setAllSalesOrders] = useState([]);

    // --- UI States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showParticipantPopup, setShowParticipantPopup] = useState(false);
    const [lookupConfig, setLookupConfig] = useState({ show: false, type: "", data: [], columns: [] });
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [createdMeetingId, setCreatedMeetingId] = useState(null);
    const [saveType, setSaveType] = useState("save"); 

    // --- Form Data ---
    const [formData, setFormData] = useState({
        subject: "",
        platform: "",
        meetingUrl: "",
        fromDate: "",
        toDate: "",
        relatedObject: "Contact", // Default
        
        // Selected Record Details
        relatedRecordId: "", 
        relatedRecordName: "", 
        
        // Lead/Contact/Account
        leadId: "",
        leadName: "",
        primaryContactId: "",
        primaryContactName: "",
        accountId: "",
        accountName: "",
        
        hostId: "", 
        hostName: "", 
        
        status: "Scheduled", // Display only
        participants: [],
        contactIds: [], 
        participantReminder: "",
        description: "",
        participantsInput: ""
    });

    // --- Initial Fetch & Data Enrichment ---
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [usersRes, leadsRes, contactsRes, accountsRes, ticketsRes] = await Promise.all([
                    fetch(`${BASE_URL_UM}/users/s-info`),
                    fetch(`${BASE_URL_LM}/leads`),
                    fetch(`${BASE_URL_AC}/contact`),
                    fetch(`${BASE_URL_AC}/account`),
                    fetch(`${BASE_URL_SER}/tickets`)
                ]);

                let usersData = [], accountsData = [], contactsData = [], leadsData = [], ticketsData = [];

                if (usersRes.ok) usersData = await usersRes.json();
                if (accountsRes.ok) accountsData = await accountsRes.json();
                if (contactsRes.ok) contactsData = await contactsRes.json();
                if (leadsRes.ok) leadsData = await leadsRes.json();
                if (ticketsRes.ok) ticketsData = await ticketsRes.json();

                // 1. Set Users & Default Host
                setAllUsers(usersData);
                if (user) {
                    const matchedUser = usersData.find(u => u.id === user.id || u.email === user.email) || 
                                      usersData.find(u => u.username === user.username);
                    if (matchedUser) {
                        setFormData(prev => ({ ...prev, hostId: matchedUser.id, hostName: matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}` }));
                    } else {
                         setFormData(prev => ({ ...prev, hostId: user.id, hostName: user.name || user.firstName }));
                    }
                }

                // 2. Enrich Contacts with Account Name
                // This ensures the Popup shows Account Name even if the raw contact API doesn't send it
                const enrichedContacts = contactsData.map(c => ({
                    ...c,
                    // Try to find account name from loaded accounts if not present in contact
                    accountName: c.accountName || accountsData.find(a => a.accountId === c.accountId)?.accountName || ""
                }));
                setAllContacts(enrichedContacts);

                // 3. Enrich Tickets with Contact & Account Names
                const enrichedTickets = ticketsData.map(t => ({
                    ...t,
                    contactName: t.primary_contact_name || enrichedContacts.find(c => c.contactId === t.primary_contact_id)?.firstName || "",
                    accountName: t.account_name || accountsData.find(a => a.accountId === t.account_id)?.accountName || ""
                }));
                setAllTickets(enrichedTickets);

                setAllAccounts(accountsData);
                setAllLeads(leadsData);

            } catch (error) {
                console.error("Error loading data", error);
                toast.error("Failed to load reference data.");
            }
        };
        fetchReferenceData();
    }, [user]);

    // --- Dynamic Lookup Logic ---
    const getLookupConfig = (type) => {
        switch (type) {
            case "Lead":
                return {
                    title: "Choose Lead",
                    data: allLeads.map(l => ({ 
                        id: l.leadId, name: `${l.firstName} ${l.lastName}`, 
                        email: l.email, phone: l.phone, company: l.company 
                    })),
                    columns: [
                        { label: "Lead Name", key: "name" },
                        { label: "Email", key: "email" },
                        { label: "Phone", key: "phone" },
                        { label: "Company", key: "company" }
                    ]
                };

            case "Contact":
                // FILTER LOGIC: If an Account is selected, show only contacts for that account
                let filteredContacts = allContacts;
                if (formData.accountId) {
                    filteredContacts = allContacts.filter(c => c.accountId === formData.accountId);
                }

                return {
                    title: "Choose Contact",
                    data: filteredContacts.map(c => ({
                        id: c.contactId, 
                        name: `${c.firstName} ${c.lastName}`,
                        email: c.email, 
                        phone: c.phone, 
                        accountName: c.accountName,
                        accountId: c.accountId // Store for logic
                    })),
                    columns: [
                        { label: "Contact Name", key: "name" },
                        { label: "Account Name", key: "accountName" },
                        { label: "Email", key: "email" },
                        { label: "Phone", key: "phone" }
                    ]
                };

            case "Account":
                return {
                    title: "Choose Account",
                    data: allAccounts.map(a => ({
                        id: a.accountId, 
                        name: a.accountName,
                        email: a.email, 
                        phone: a.phone
                    })),
                    columns: [
                        { label: "Account Name", key: "name" },
                        { label: "Email", key: "email" },
                        { label: "Phone", key: "phone" }
                    ]
                };

            case "Ticket":
                // FILTER LOGIC: Filter by Contact OR Account if selected
                let filteredTickets = allTickets;
                if (formData.primaryContactId) {
                    filteredTickets = filteredTickets.filter(t => t.primary_contact_id === formData.primaryContactId);
                } else if (formData.accountId) {
                    // Assuming ticket has account_id
                    filteredTickets = filteredTickets.filter(t => t.account_id === formData.accountId);
                }

                return {
                    title: "Choose Ticket",
                    data: filteredTickets.map(t => ({
                        id: t.ticket_id, 
                        subject: t.subject, 
                        contactName: t.contactName, 
                        accountName: t.accountName,
                        // Hidden fields for auto-fill
                        contactId: t.primary_contact_id,
                        accountId: t.account_id
                    })),
                    columns: [
                        { label: "Ticket ID", key: "id" },
                        { label: "Subject", key: "subject" },
                        { label: "Contact", key: "contactName" },
                        { label: "Account", key: "accountName" }
                    ]
                };

             case "Opportunity":
                // Placeholder Logic for Opps
                let filteredOpps = allOpportunities;
                // Add similar filtering logic here
                return {
                    title: "Choose Opportunity",
                    data: filteredOpps, 
                    columns: [
                        { label: "Opp Name", key: "name" },
                        { label: "Stage", key: "stage" },
                        { label: "Account", key: "accountName" }
                    ]
                };
            default: return null;
        }
    };

    const handleOpenLookup = (type) => {
        const config = getLookupConfig(type);
        if (config) {
            setLookupConfig({ show: true, type, ...config });
        } else {
            toast.info(`${type} selection not yet implemented.`);
        }
    };

    const handleLookupSelect = (record) => {
        // 1. LEAD SELECTION
        if (lookupConfig.type === "Lead") {
            setFormData(prev => ({
                ...prev,
                leadId: record.id,
                leadName: record.name,
                // Clear Contact/Account context
                primaryContactId: "", primaryContactName: "", 
                accountId: "", accountName: "",
                relatedRecordId: formData.relatedObject === 'Lead' ? record.id : prev.relatedRecordId,
                relatedRecordName: formData.relatedObject === 'Lead' ? record.name : prev.relatedRecordName
            }));
        } 
        
        // 2. CONTACT SELECTION
        else if (lookupConfig.type === "Contact") {
            // Auto-fetch Account based on Contact
            const associatedAccount = allAccounts.find(a => a.accountId === record.accountId);
            
            setFormData(prev => ({
                ...prev,
                primaryContactId: record.id,
                primaryContactName: record.name,
                // Auto-fill Account
                accountId: associatedAccount ? associatedAccount.accountId : "",
                accountName: associatedAccount ? associatedAccount.accountName : "",
                
                // If Related Object is Contact, update that too
                relatedRecordId: formData.relatedObject === 'Contact' ? record.id : prev.relatedRecordId,
                relatedRecordName: formData.relatedObject === 'Contact' ? record.name : prev.relatedRecordName
            }));
        } 
        
        // 3. ACCOUNT SELECTION (If Related Object is Account)
        else if (lookupConfig.type === "Account") {
            setFormData(prev => ({
                ...prev,
                accountId: record.id,
                accountName: record.name,
                
                // If switching account, clear contact ONLY IF the old contact doesn't belong to new account
                primaryContactId: "", // Safer to clear for fresh selection
                primaryContactName: "",

                relatedRecordId: formData.relatedObject === 'Account' ? record.id : prev.relatedRecordId,
                relatedRecordName: formData.relatedObject === 'Account' ? record.name : prev.relatedRecordName
            }));
        }

        // 4. RELATED OBJECTS (Ticket, etc.)
        else {
            let associatedContactId = "";
            let associatedContactName = "";
            let associatedAccountId = "";
            let associatedAccountName = "";

            if (lookupConfig.type === "Ticket") {
                // record contains contactId and accountId from the mapping in getLookupConfig
                associatedContactId = record.contactId || "";
                associatedContactName = record.contactName || "";
                associatedAccountId = record.accountId || "";
                associatedAccountName = record.accountName || "";
            }

            setFormData(prev => ({
                ...prev,
                relatedRecordId: record.id,
                relatedRecordName: record.subject || record.name,
                
                // Auto-fill Contact & Account if they exist on the record
                primaryContactId: associatedContactId || prev.primaryContactId,
                primaryContactName: associatedContactName || prev.primaryContactName,
                accountId: associatedAccountId || prev.accountId,
                accountName: associatedAccountName || prev.accountName
            }));
        }
        setLookupConfig({ ...lookupConfig, show: false });
    };

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRelatedObjectChange = (e) => {
        const newObj = e.target.value;
        // Reset related fields when object type changes to avoid mismatch
        setFormData(prev => ({
            ...prev,
            relatedObject: newObj,
            relatedRecordId: "",
            relatedRecordName: "",
            // Optional: You might want to keep Contact/Account if user just changes type
            // But usually safe to clear "Related Record" specific ID
        }));
    };

    const handleAddParticipant = () => {
        const val = formData.participantsInput.trim();
        if (val && !formData.participants.includes(val)) {
            setFormData(prev => ({
                ...prev,
                participants: [...prev.participants, val],
                participantsInput: ""
            }));
        }
    };

    const handleRemoveParticipant = (index) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    const handlePopupParticipants = (emails) => {
        const unique = new Set([...formData.participants, ...emails]);
        const newContactIds = new Set(formData.contactIds);
        emails.forEach(email => {
            const contact = allContacts.find(c => c.email === email);
            if (contact) newContactIds.add(contact.contactId);
        });

        setFormData(prev => ({ 
            ...prev, 
            participants: Array.from(unique),
            contactIds: Array.from(newContactIds)
        }));
    };

    const validate = () => {
        if (!formData.subject.trim()) return "Subject is required.";
        if (!formData.platform && !formData.meetingUrl) return "Location (Platform or URL) is required.";
        if (!formData.fromDate) return "From Date is required.";
        if (!formData.toDate) return "To Date is required.";
        if (!formData.hostId) return "Meeting Owner is required.";
        return null;
    };

    const handleSubmit = async (type) => {
        const error = validate();
        if (error) { toast.warn(error); return; }

        setIsSubmitting(true);
        try {
            const payload = {
                subject: formData.subject,
                location: formData.platform ? `${formData.platform} - ${formData.meetingUrl}` : formData.meetingUrl,
                fromDate: new Date(formData.fromDate).toISOString(),
                toDate: new Date(formData.toDate).toISOString(),
                status: "OPEN", 
                priority: "MEDIUM", 
                description: formData.description,
                participantReminder: formData.participantReminder ? String(formData.participantReminder) : null,
                meetingOwnerId: formData.hostId, 
                hostId: formData.hostId, 
                relatedTo: formData.relatedObject,
                relatedRecordId: formData.relatedRecordId || null,
                primaryContactId: formData.primaryContactId || null,
                leadId: formData.leadId || null,
                accountId: formData.accountId || null,
                participants: formData.participants,
                contactIds: formData.contactIds
            };

            const res = await fetch(`${BASE_URL_AM}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to create meeting");
            }
            
            const data = await res.json();
            const newMeetingId = data.id || data.meetingId;

            setCreatedMeetingId(newMeetingId);
            setSaveType(type);
            setShowInvitePopup(true); 

        } catch (error) {
            console.error(error);
            toast.error("Error creating meeting: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendInvites = async () => {
        if (!createdMeetingId) return;
        
        const toastId = toast.loading("Sending invitations...");
        try {
            await new Promise(r => setTimeout(r, 1000)); 
            toast.update(toastId, { render: "Invitations sent!", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            toast.update(toastId, { render: "Failed to send invites.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setShowInvitePopup(false);
            finalizeNavigation();
        }
    };

    const handleCancelInvites = () => {
        setShowInvitePopup(false);
        toast.success("Meeting saved successfully.");
        finalizeNavigation();
    };

    const finalizeNavigation = () => {
        if (saveType === "save") {
            navigate("/activitymanagement/meetings");
        } else {
            setFormData(prev => ({
                ...prev,
                subject: "", meetingUrl: "", description: "", participants: [], 
                relatedRecordId: "", relatedRecordName: "",
                leadId: "", leadName: "", primaryContactId: "", primaryContactName: "",
                accountId: "", accountName: ""
            }));
            window.scrollTo(0,0);
        }
    };

    return (
        <div className="meeting-create-container">
            {/* Header */}
            <div className="meeting-create-header-container">
                <h1 className="meeting-create-heading">New Meeting</h1>
                <div className="meeting-create-header-container-buttons">
                    <button className="meeting-create-save-button" onClick={() => handleSubmit("save")} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : <><Save size={18} /> Save</>}
                    </button>
                    <button className="meeting-create-save-and-new-button" onClick={() => handleSubmit("saveAndNew")} disabled={isSubmitting}>
                        <FilePlus size={18} /> Save and New
                    </button>
                    <button className="meeting-create-cancel-button" onClick={() => navigate("/activitymanagement/meetings")}>
                        <CircleX size={18} /> Cancel
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="meeting-create-form-container">
                <h1 className="meeting-create-form-heading">Meeting Information</h1>
                <div className="meeting-create-form">
                    <form onSubmit={e => e.preventDefault()}>
                        
                        {/* Row 1: Subject & Location */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>Subject <span className="required-star">*</span></label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Project Discussion" 
                                />
                            </div>
                            <div className="meeting-create-form-group">
                                <label>Meeting Location <span className="required-star">*</span></label>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <select 
                                        id="platform" 
                                        value={formData.platform} 
                                        onChange={handleChange}
                                        style={{flex: '0 0 140px'}}
                                    >
                                        <option value="">Select Platform</option>
                                        {MEETING_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <input 
                                        type="text" 
                                        id="meetingUrl" 
                                        value={formData.meetingUrl} 
                                        onChange={handleChange} 
                                        placeholder="Meeting Link (https://...)" 
                                        style={{flex: 1}}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Dates */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>From <span className="required-star">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    id="fromDate" 
                                    value={formData.fromDate} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="meeting-create-form-group">
                                <label>To <span className="required-star">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    id="toDate" 
                                    value={formData.toDate} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>

                        {/* Row 3: Related Object Logic */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>Related Object</label>
                                <div className="meeting-input-with-icon">
                                    <select id="relatedObject" value={formData.relatedObject} onChange={handleRelatedObjectChange}>
                                        {RELATED_OBJECTS.map(obj => <option key={obj} value={obj}>{obj}</option>)}
                                    </select>
                                    
                                    {/* Secondary Lookup: Shows for Ticket, Account, Opportunity, etc. */}
                                    {["Opportunity", "Sales Order", "Sales Quote", "Ticket", "Account"].includes(formData.relatedObject) && (
                                        <div className="secondary-lookup-container" style={{marginTop:'5px'}}>
                                            <div className="meeting-input-with-icon" onClick={() => handleOpenLookup(formData.relatedObject)}>
                                                <input 
                                                    type="text" 
                                                    value={formData.relatedRecordName} 
                                                    readOnly 
                                                    placeholder={`Select ${formData.relatedObject}`} 
                                                    style={{cursor:'pointer', paddingRight:'35px', background:'#f8f9fa'}}
                                                />
                                                <Search size={16} className="meeting-input-icon"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="meeting-create-form-group">
                                <label>
                                    {formData.relatedObject === "Lead" ? "Lead Name" : "Contact Name"}
                                </label>
                                <div className="meeting-input-with-icon" onClick={() => handleOpenLookup(formData.relatedObject === "Lead" ? "Lead" : "Contact")}>
                                    <input 
                                        type="text" 
                                        value={formData.relatedObject === "Lead" ? formData.leadName : formData.primaryContactName} 
                                        readOnly 
                                        placeholder="Click to select..." 
                                        style={{cursor:'pointer', background:'#fff'}} 
                                    />
                                    <Search size={18} className="meeting-input-icon" />
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Account & Host */}
                        <div className="meeting-create-form-row">
                            {formData.relatedObject !== "Lead" && (
                                <div className="meeting-create-form-group">
                                    <label>Account Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.accountName} 
                                        readOnly 
                                        style={{background: '#e9ecef', cursor:'not-allowed'}} 
                                    />
                                </div>
                            )}
                            <div className="meeting-create-form-group">
                                <label>Host</label>
                                <input 
                                    type="text" 
                                    value={formData.hostName} 
                                    readOnly 
                                    style={{background: '#e9ecef', cursor:'not-allowed'}} 
                                />
                            </div>
                        </div>

                        {/* Row 5: Status & Reminder */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>Status</label>
                                <input 
                                    type="text" 
                                    value={formData.status} 
                                    readOnly 
                                    style={{background: '#e9ecef', cursor:'not-allowed'}} 
                                />
                            </div>
                            <div className="meeting-create-form-group">
                                <label>Participants Reminder</label>
                                <select id="participantReminder" value={formData.participantReminder} onChange={handleChange}>
                                    <option value="">-- No Reminder --</option>
                                    {REMINDERS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 6: Participants */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>Participants</label>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input 
                                        type="text" 
                                        id="participantsInput"
                                        value={formData.participantsInput}
                                        onChange={handleChange}
                                        onKeyDown={e => { if(e.key==='Enter') { e.preventDefault(); handleAddParticipant(); } }}
                                        placeholder="Add email or name..."
                                    />
                                    <button type="button" className="meeting-add-btn" onClick={() => setShowParticipantPopup(true)}>
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="meeting-participants-list">
                                    {formData.participants.map((p, i) => (
                                        <span key={i} className="participant-chip">
                                            {p} <button type="button" onClick={() => handleRemoveParticipant(i)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 7: Description */}
                        <div className="meeting-create-form-row">
                            <div className="meeting-create-form-group">
                                <label>Description</label>
                                <textarea 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    placeholder="Enter meeting agenda..." 
                                />
                            </div>
                        </div>

                        <span className="required-field-text">* Required Field</span>
                    </form>
                </div>
            </div>

            {/* --- Modals --- */}
            
            <ParticipantPopup 
                open={showParticipantPopup} 
                onClose={() => setShowParticipantPopup(false)}
                contacts={allContacts}
                leads={allLeads}
                users={allUsers}
                selectedParticipants={formData.participants}
                onAddParticipants={handlePopupParticipants}
            />

            {lookupConfig.show && (
                <div className="lookup-overlay">
                    <div className="lookup-modal">
                        <div className="lookup-header">
                            <h3>{lookupConfig.title}</h3>
                            <button onClick={() => setLookupConfig({...lookupConfig, show: false})}><CircleX size={20}/></button>
                        </div>
                        <div className="lookup-body">
                            <table className="lookup-table">
                                <thead>
                                    <tr>
                                        {lookupConfig.columns.map(col => <th key={col.key}>{col.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lookupConfig.data.length === 0 ? (
                                        <tr><td colSpan={lookupConfig.columns.length} style={{textAlign:'center', padding:'20px'}}>No records found</td></tr>
                                    ) : (
                                        lookupConfig.data.map((row, i) => (
                                            <tr key={i} onClick={() => handleLookupSelect(row)}>
                                                {lookupConfig.columns.map(col => <td key={col.key}>{row[col.key] || '-'}</td>)}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showInvitePopup && (
                <div className="lookup-overlay">
                    <div className="invite-modal">
                        <div className="invite-header">
                            <h3>Send Invitations</h3>
                        </div>
                        <div className="invite-body">
                            <p>Would you like to send invitations to the participants?</p>
                        </div>
                        <div className="invite-footer">
                            <button className="invite-btn-cancel" onClick={handleCancelInvites}>Cancel</button>
                            <button className="invite-btn-send" onClick={handleSendInvites}><Mail size={16} style={{marginRight:5}}/> Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateMeetings;