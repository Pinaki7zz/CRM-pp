import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
    Download, 
    FileText, 
    Image as ImageIcon, 
    UserCircle,
    X,
    ChevronLeft
} from "lucide-react";
import "./DisplayEmail.css";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

// --- Environment Variables ---
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

// --- Helper: Get MIME Type ---
const getMimeType = (filename) => {
    if (!filename) return 'application/octet-stream';
    const ext = filename.split('.').pop().toLowerCase();
    const mimeMap = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        txt: 'text/plain',
        html: 'text/html'
    };
    return mimeMap[ext] || 'application/octet-stream';
};

// --- Helper: Extract Email Address ---
const extractEmail = (str) => {
    if (!str) return "";
    const match = str.match(/<([^>]+)>/);
    return match ? (match[1] || "").toLowerCase() : str.toLowerCase();
};

const DisplayEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const { user } = useAuth();
    
    // --- UI State ---
    const [loading, setLoading] = useState(false);
    
    // --- Preview Modal State ---
    const [previewFile, setPreviewFile] = useState(null); // { name, url, type, size }
    
    // --- Data State ---
    const [emailDetails, setEmailDetails] = useState(null);
    const [fetchedAttachments, setFetchedAttachments] = useState([]); 
    
    // --- Linked Data State ---
    const [linkedNames, setLinkedNames] = useState({
        account: "Not Linked",
        contact: "Not Linked",
        opportunity: "Not Linked"
    });

    const emailId = location.state?.emailId || paramId;

    const getHeaders = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    useEffect(() => {
        if (emailId) {
            fetchData(emailId);
        }
    }, [emailId]);

    const fetchData = async (id) => {
        setLoading(true);
        try {
            const emailRes = await fetch(`${BASE_URL_AM}/emails/${id}`, { headers: getHeaders() });
            if (emailRes.ok) {
                const json = await emailRes.json();
                const data = json.data || json;
                
                if (data) {
                    setEmailDetails(data);

                    if (data.attachments && data.attachments.length > 0) {
                         setFetchedAttachments(data.attachments);
                    } else {
                         fetchAttachments(id);
                    }

                    fetchLinkedRecords(data);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load email details");
        } finally {
            setLoading(false);
        }
    };

    const fetchAttachments = async (id) => {
        try {
            const res = await fetch(`${BASE_URL_AM}/emails/${id}/attachments`, { headers: getHeaders() });
            if (res.ok) {
                const json = await res.json();
                const list = json.data || json;
                if (Array.isArray(list)) setFetchedAttachments(list);
            }
        } catch (e) { console.error("Attachment fetch error", e); }
    };

    const getId = (val) => {
        if (!val) return null;
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (typeof val === 'object') return val.id || val._id || val.contactId || val.accountId || val.opportunityId;
        return null;
    };

    const fetchLinkedRecords = async (email) => {
        const headers = getHeaders();
        
        setLinkedNames(prev => ({
            ...prev,
            contact: email.contact_name || email.contactName || (email.contact?.name) || prev.contact,
            account: email.account_name || email.accountName || (email.account?.accountName) || prev.account,
            opportunity: email.opportunity_name || email.opportunityName || prev.opportunity
        }));

        const updateName = (field, value) => {
            if(value && value !== "Not Linked") setLinkedNames(prev => ({ ...prev, [field]: value }));
        };

        let conId = getId(email.contactId || email.contact_id || email.contact);
        let accId = getId(email.accountId || email.account_id || email.account);
        let oppId = getId(email.opportunityId || email.opportunity_id);
        const ticketId = getId(email.ticketId || email.ticket_id);

        // Ticket Lookup
        if (!conId && ticketId && BASE_URL_SER) {
            try {
                const ticketRes = await fetch(`${BASE_URL_SER}/tickets/${ticketId}`, { headers });
                if (ticketRes.ok) {
                    const tJson = await ticketRes.json();
                    const ticketData = tJson.data || tJson;
                    if (ticketData.primary_contact_name) updateName('contact', ticketData.primary_contact_name);
                    if (ticketData.primary_contact_id) conId = ticketData.primary_contact_id;
                    if (ticketData.account_name) updateName('account', ticketData.account_name);
                    if (ticketData.account_id) accId = ticketData.account_id;
                }
            } catch (e) { console.log("Ticket context fetch failed"); }
        }

        // Email Lookup
        if (!conId && BASE_URL_AC) {
            const targetEmail = email.direction === 'outbound' ? extractEmail(email.recipient) : extractEmail(email.sender);
            const isSystemEmail = targetEmail.includes('system') || targetEmail.includes('noreply') || targetEmail.includes('current user');
            
            if (targetEmail && !isSystemEmail) {
                try {
                    const searchRes = await fetch(`${BASE_URL_AC}/contact?email=${encodeURIComponent(targetEmail)}`, { headers });
                    if (searchRes.ok) {
                        const searchJson = await searchRes.json();
                        const foundContacts = Array.isArray(searchJson) ? searchJson : (searchJson.data || searchJson.items || []);
                        if (foundContacts.length > 0) {
                            const found = foundContacts[0];
                            conId = found.id || found.contactId || found._id;
                            updateName('contact', found.firstName ? `${found.firstName} ${found.lastName}` : found.name);
                            if (!accId && found.accountId) accId = found.accountId;
                        }
                    }
                } catch (e) { console.log("Email lookup failed"); }
            }
        }

        // Fetch Details
        if (conId) {
            if(BASE_URL_AC) {
                fetch(`${BASE_URL_AC}/contact/${conId}`, { headers })
                    .then(res => res.json())
                    .then(json => {
                        const data = json.data || json;
                        if (data) {
                            updateName('contact', data.firstName ? `${data.firstName} ${data.lastName}` : data.name);
                            if (data.accountId && !accId) fetchAccount(data.accountId);
                        } else {
                            fetchUser(conId); 
                        }
                    })
                    .catch(() => fetchUser(conId));
            } else {
                fetchUser(conId);
            }
        }

        function fetchUser(userId) {
            if(!BASE_URL_UM) return;
            fetch(`${BASE_URL_UM}/users/${userId}`, { headers })
                .then(res => res.json())
                .then(json => {
                    const data = json.data || json;
                    if(data) updateName('contact', data.name || `${data.firstName} ${data.lastName}`);
                }).catch(() => {});
        }

        if (accId) fetchAccount(accId);

        async function fetchAccount(id) {
            if(!BASE_URL_AC) return;
            try {
                const res = await fetch(`${BASE_URL_AC}/account/${id}`, { headers });
                const json = await res.json();
                const data = json.data || json;
                if (data) updateName('account', data.accountName || data.name);
            } catch(e) {}
        }

        if (oppId && BASE_URL_SM) {
            fetch(`${BASE_URL_SM}/opportunities/${oppId}`, { headers })
                .then(res => res.json())
                .then(json => {
                    const data = json.data || json;
                    if (data) updateName('opportunity', data.opportunityName || data.name || data.title);
                }).catch(() => {});
        }
    };

    // --- File Handling ---
    const handleFileAction = async (att, action = 'view') => {
        const name = att.original_name || att.name || att.filename || "file";
        const id = att.id;
        const size = att.size; // Get size for preview modal
        const amBase = BASE_URL_AM.endsWith('/') ? BASE_URL_AM.slice(0, -1) : BASE_URL_AM;
        
        let fetchUrl = null;
        if (id) fetchUrl = `${amBase}/emails/attachments/${id}`;
        else if (name) fetchUrl = `${amBase}/emails/files/${encodeURIComponent(name)}`;

        if (!fetchUrl) return toast.error("Cannot locate file");

        const toastId = toast.loading("Loading file...");

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error("File not found");
            const blob = await response.blob();
            const mimeType = getMimeType(name);
            const viewableBlob = new Blob([blob], { type: mimeType });
            const blobUrl = window.URL.createObjectURL(viewableBlob);

            toast.dismiss(toastId);

            if (action === 'view') {
                const isViewable = /\.(pdf|jpg|jpeg|png|gif|webp|txt)$/i.test(name);
                if (isViewable) {
                    setPreviewFile({ name, url: blobUrl, type: mimeType, size }); // Added size
                } else {
                    triggerDownload(blobUrl, name);
                }
            } else {
                triggerDownload(blobUrl, name);
            }
        } catch (error) {
            console.error("File error:", error);
            toast.update(toastId, { render: "File not found.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const triggerDownload = (url, name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const closePreview = () => {
        if (previewFile?.url) window.URL.revokeObjectURL(previewFile.url);
        setPreviewFile(null);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    };

    const formatEmailDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (loading && !emailDetails && emailId) return <div style={{padding: 30}}>Loading Email...</div>;

    const attachments = fetchedAttachments;
    const hasAttachments = attachments.length > 0;

    return (
        <div className="display-email-container">
            <div className="email-header-top">
                <button onClick={() => navigate("/activitymanagement/emails")} className="back-btn">
                    <ChevronLeft size={20}/> Back
                </button>
            </div>

            <div className="email-main-box">
                <div className="email-subject-row">
                    <span className="email-subject-text">{emailDetails?.subject || "No Subject"}</span>
                </div>

                <div className="email-meta-header">
                    <div className="meta-left">
                        <UserCircle size={32} className="user-icon" strokeWidth={1.5} />
                        <div className="meta-info">
                            <span className="meta-from"><strong>From:</strong> {emailDetails?.sender || "Unknown"}</span>
                            <span className="meta-to"><strong>To:</strong> {emailDetails?.recipient || "Me"}</span>
                        </div>
                    </div>
                    <div className="meta-right">
                        <span className="email-date">{formatEmailDate(emailDetails?.receivedAt || emailDetails?.created_at)}</span>
                    </div>
                </div>

                <div className="email-content-box">
                    <div className="email-body-text">
                        {emailDetails?.htmlContent ? 
                            <div dangerouslySetInnerHTML={{ __html: emailDetails.htmlContent }} /> : 
                            <pre className="text-pre-wrap">{emailDetails?.content || "No content."}</pre>
                        }
                    </div>
                </div>

                <div className="email-attachments-box">
                    <div className="section-title">Attachments ({hasAttachments ? attachments.length : 0})</div>
                    <div className="attachments-grid">
                        {hasAttachments ? (
                            attachments.map((att, idx) => (
                                <div key={idx} className="attachment-item" onClick={() => handleFileAction(att, 'view')}>
                                    <div className="att-icon-wrapper">
                                        {att.contentType?.includes('pdf') ? <FileText size={24} color="#e74c3c"/> : 
                                         att.contentType?.includes('image') ? <ImageIcon size={24} color="#3498db"/> : 
                                         <FileText size={24} color="#666"/>}
                                    </div>
                                    <div className="att-details">
                                        <span className="att-name" title={att.original_name || att.filename}>{att.original_name || att.filename || "File"}</span>
                                        <span className="att-size">{formatFileSize(att.size)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No attachments found.</div>
                        )}
                    </div>
                </div>

                <div className="email-linked-box">
                    <div className="section-title">Linked To:</div>
                    <div className="linked-grid">
                        <div className="linked-item">
                            <span className="link-label">Opportunity:</span>
                            <span className="link-value">{linkedNames.opportunity}</span>
                        </div>
                        <div className="linked-item">
                            <span className="link-label">Account Name:</span>
                            <span className="link-value">{linkedNames.account}</span>
                        </div>
                        <div className="linked-item">
                            <span className="link-label">Contact Name:</span>
                            <span className="link-value">{linkedNames.contact}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {previewFile && (
                <div className="attachment-modal-overlay">
                    <div className="attachment-modal">
                        <div className="modal-header">
                            <h3 className="modal-filename">{previewFile.name}</h3>
                            <div className="modal-actions">
                                <button onClick={() => triggerDownload(previewFile.url, previewFile.name)} title="Download">
                                    <Download size={20} />
                                </button>
                                <button onClick={closePreview} title="Close">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {previewFile.type.includes('image') ? (
                                <img src={previewFile.url} alt="Preview" className="preview-content" />
                            ) : (
                                <iframe src={previewFile.url} className="preview-content" title="File Preview"></iframe>
                            )}
                        </div>
                        {/* UPDATE: Replaced "Page 1/1" with File Type & Size info */}
                        <div className="modal-footer">
                            {previewFile.type.toUpperCase().split('/')[1]} File • {formatFileSize(previewFile.size)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayEmail;