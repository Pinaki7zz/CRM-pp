import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
	Paperclip,
	Plus,
	Save,
	CircleX,
	MoreVertical,
	X,
	Search,
	Trash2,
	Reply,
	Forward,
	FileText,
	ArrowLeft,
	Mail,
	Download,
	User,
	Minimize2,
	Phone,
	ListTodo,
	Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import "./DisplayTicket.css";

const cleanUrl = (url) => (url ? url.replace(/\/$/, "") : "");
const BASE_URL_SER = cleanUrl(import.meta.env.VITE_API_BASE_URL_SER);
const BASE_URL_AC = cleanUrl(import.meta.env.VITE_API_BASE_URL_AC);
const BASE_URL_UM = cleanUrl(import.meta.env.VITE_API_BASE_URL_UM);

const MOCK_TEMPLATES = [
	{
		id: "TMP001",
		name: "Escalation Notice",
		type: "Email",
		content:
			"Dear User,\n\nWe are escalating this ticket due to complexity. A senior engineer will be in touch shortly.\n\nRegards,\nSupport Team",
	},
	{
		id: "TMP002",
		name: "SLA Breach Warning",
		type: "Email",
		content:
			"Warning: This ticket is approaching SLA breach. Please expedite resolution.",
	},
	{
		id: "TMP004",
		name: "Standard Reply",
		type: "Email",
		content:
			"Hello,\n\nThank you for contacting support. We have received your request and are looking into it.\n\nRegards,\nSupport Team",
	},
];

const formatFileSize = (size) => {
	if (!size) return "0 Bytes";
	const i = Math.floor(Math.log(size) / Math.log(1024));
	return (
		(size / Math.pow(1024, i)).toFixed(2) * 1 +
		" " +
		["Bytes", "KB", "MB", "GB"][i]
	);
};

const getMimeType = (filename) => {
	if (!filename) return "application/octet-stream";
	const ext = filename.split(".").pop().toLowerCase();
	const mimeMap = {
		pdf: "application/pdf",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		txt: "text/plain",
		html: "text/html",
	};
	return mimeMap[ext] || "application/octet-stream";
};

const DisplayTicket = () => {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	// --- UI States ---
	const [activeMainTab, setActiveMainTab] = useState("Overview");
	const [menuModal, setMenuModal] = useState(false);
	const [showNoteModal, setShowNoteModal] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [loading, setLoading] = useState(true);

	// --- Feature Modals ---
	const [showEscalateModal, setShowEscalateModal] = useState(false);
	const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showUserSelectModal, setShowUserSelectModal] = useState(false);
	const [userSearchTerm, setUserSearchTerm] = useState("");
	const [userSelectContext, setUserSelectContext] = useState(null);
	const [showTemplateSelectModal, setShowTemplateSelectModal] =
		useState(false);
	const [templateSearchTerm, setTemplateSearchTerm] = useState("");
	const [templateContext, setTemplateContext] = useState(null);

	// --- Data States ---
	const [ticketData, setTicketData] = useState(null);
	const [allContacts, setAllContacts] = useState([]);
	const [users, setUsers] = useState([]);

	// --- Config States ---
	const [escalationConfig, setEscalationConfig] = useState({
		hours: "0",
		minutes: "0",
		reassignUser: "",
		notifyUser: false,
		emailTemplate: "",
	});
	const [ownerConfig, setOwnerConfig] = useState({
		currentOwner: "",
		newOwner: "",
	});

	// --- Activities, Notes & Attachments States ---
	const [newActivity, setNewActivity] = useState({
		subject: "",
		type: "Call",
		status: "Planned",
		date: new Date().toISOString().split("T")[0],
	});
	const [activities, setActivities] = useState([]);
	const [notes, setNotes] = useState([]);
	const [newNote, setNewNote] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [activeAttachmentTab, setActiveAttachmentTab] = useState("manual");

	// --- EMAIL SECTION STATES ---
	const [activeEmailTab, setActiveEmailTab] = useState("interactions");
	const [emailInteractions, setEmailInteractions] = useState([]);
	const [emailDrafts, setEmailDrafts] = useState([]);
	const [selectedEmailInteraction, setSelectedEmailInteraction] =
		useState(null);

	// --- COMPOSE WINDOW STATES ---
	const [showCompose, setShowCompose] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [composeData, setComposeData] = useState({
		to: "",
		cc: "",
		bcc: "",
		subject: "",
		body: "",
		id: null,
	});
	const [composeAttachments, setComposeAttachments] = useState([]);

	// 🛠️ REFS
	const actionRef = useRef(null);
	const fileInputRef = useRef(null);
	const composeFileRef = useRef(null);

	// ─────────────────────────────────────────────────────────────
	// ✅ HELPER: Safe Date Formatter
	// ─────────────────────────────────────────────────────────────
	const safeDate = (dateVal) => {
		if (!dateVal) return "-";
		const d = new Date(dateVal);
		return isNaN(d.getTime())
			? "-"
			: d.toLocaleDateString() +
					" " +
					d.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					});
	};

	// ─────────────────────────────────────────────────────────────
	// ✅ HELPER: Resolve Sender Name (Component Level for Email List)
	// ─────────────────────────────────────────────────────────────
	const resolveSenderGlobal = (senderName) => {
		if (!senderName) return "-";
		const lower = senderName.toLowerCase();
		if (
			lower === "system" ||
			lower === "current user" ||
			lower.includes("system")
		) {
			return ticketData?.ticket_owner_name || "System";
		}
		return senderName;
	};

	// ─────────────────────────────────────────────────────────────
	// ✅ ULTRA-ROBUST FILE HANDLER
	// ─────────────────────────────────────────────────────────────
	const getHeaders = () => {
		const token =
			localStorage.getItem("token") ||
			localStorage.getItem("accessToken");
		return { ...(token && { Authorization: `Bearer ${token}` }) };
	};

	const tryFetchBlob = async (urls) => {
		const headers = getHeaders();
		for (const url of urls) {
			try {
				const response = await fetch(url, { headers });
				if (response.ok) return await response.blob();
			} catch (e) {
				/* Next */
			}
		}
		throw new Error("File not found in any location");
	};

	const handleFileAction = async (att, action = "download") => {
		const targetFileName =
			att.original_name ||
			att.name ||
			att.fileName ||
			att.filename ||
			"attachment";
		const id = att.id;

		const candidateUrls = [];
		if (att.origin === "activity" && id) {
			candidateUrls.push(`${BASE_URL_AC}/emails/attachments/${id}`);
		} else if (id) {
			candidateUrls.push(
				`${BASE_URL_SER}/tickets/attachments/${id}/download`,
			);
		}
		const namesToTry = [
			att.filename,
			att.fileName,
			att.original_name,
			att.name,
		].filter(Boolean);
		namesToTry.forEach((n) => {
			const enc = encodeURIComponent(n);
			candidateUrls.push(`${BASE_URL_AC}/emails/files/${enc}`);
			candidateUrls.push(`${BASE_URL_SER}/tickets/files/${enc}`);
		});

		const toastId = toast.loading(
			`${action === "view" ? "Opening" : "Downloading"} ${targetFileName}...`,
		);

		try {
			const rawBlob = await tryFetchBlob(candidateUrls);
			const mimeType = getMimeType(targetFileName);
			const viewableBlob = new Blob([rawBlob], { type: mimeType });
			const blobUrl = window.URL.createObjectURL(viewableBlob);

			if (action === "view") {
				const isViewable = /\.(pdf|jpg|jpeg|png|gif|webp|txt)$/i.test(
					targetFileName,
				);
				if (isViewable) window.open(blobUrl, "_blank");
				else {
					const link = document.createElement("a");
					link.href = blobUrl;
					link.download = targetFileName;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					toast.info(`Preview not available. Downloading.`);
				}
			} else {
				const link = document.createElement("a");
				link.href = blobUrl;
				link.download = targetFileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			toast.update(toastId, {
				render: "Success!",
				type: "success",
				isLoading: false,
				autoClose: 1500,
			});
			setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
		} catch (error) {
			console.error("File Operation Failed:", error);
			toast.update(toastId, {
				render: "File not found on server.",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	};

	useEffect(() => {
		if (location.state && location.state.startInEditMode) {
			setIsEditMode(true);
			window.history.replaceState({}, document.title);
		}
	}, [location]);

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				const ticketRes = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}`,
				);
				if (!ticketRes.ok) throw new Error("Failed to fetch ticket");
				const tData = await ticketRes.json();
				setTicketData(tData);
				setOwnerConfig((prev) => ({
					...prev,
					currentOwner: tData.ticket_owner_name || "Unassigned",
				}));

				const [
					contactsRes,
					notesRes,
					activitiesRes,
					attachmentsRes,
					emailsRes,
					usersRes,
				] = await Promise.all([
					fetch(`${BASE_URL_AC}/contact`),
					fetch(`${BASE_URL_SER}/tickets/${ticketId}/notes`),
					fetch(`${BASE_URL_SER}/tickets/${ticketId}/activities`),
					fetch(`${BASE_URL_SER}/tickets/${ticketId}/attachments`),
					fetch(`${BASE_URL_SER}/tickets/${ticketId}/emails`),
					fetch(`${BASE_URL_UM}/users/s-info`),
				]);

				if (contactsRes.ok) setAllContacts(await contactsRes.json());
				if (notesRes.ok) setNotes(await notesRes.json());
				if (activitiesRes.ok) setActivities(await activitiesRes.json());
				if (attachmentsRes.ok)
					setAttachments(await attachmentsRes.json());
				if (usersRes.ok) setUsers(await usersRes.json());

				if (emailsRes.ok) {
					const allEmails = await emailsRes.json();
					setEmailInteractions(
						allEmails.filter((e) => e.type !== "draft"),
					);
					setEmailDrafts(allEmails.filter((e) => e.type === "draft"));
				}
				setLoading(false);
			} catch (err) {
				console.error(err);
				setLoading(false);
				toast.error("Failed to load ticket data");
			}
		};
		fetchAllData();
	}, [ticketId]);

	// ─────────────────────────────────────────────────────────────
	// ✅ FIX: NAME & DATE MAPPING
	// ─────────────────────────────────────────────────────────────
	const { manualAttachments, interactionAttachments } = useMemo(() => {
		const manual = [];
		const interaction = [];

		const getBestName = (att) =>
			att.original_name ||
			att.originalName ||
			att.name ||
			att.filename ||
			att.file_name ||
			"Attachment";
		const getSig = (name, size) =>
			`${(name || "").toLowerCase().trim()}_${size || 0}`;
		const emailAttSignatures = new Map();
		const emailIdMap = new Map();

		// 1. Index Emails
		if (emailInteractions) {
			emailInteractions.forEach((email) => {
				if (email.id) emailIdMap.set(String(email.id), email);
				(email.attachments || []).forEach((att) => {
					const name = getBestName(att);
					const size = att.file_size || att.size;
					if (name) emailAttSignatures.set(getSig(name, size), email);
				});
			});
		}

		// 2. Process Ticket Attachments (Manual Uploads)
		(attachments || []).forEach((att) => {
			const displayName = getBestName(att);
			const size = att.file_size || att.size;

			const standardizedAtt = {
				...att,
				fileName: displayName,
				fileSize: size,
				origin: "ticket",
			};

			if (att.email_log_id) {
				const linkedEmail = emailIdMap.get(String(att.email_log_id));
				interaction.push({
					...standardizedAtt,
					sourceSubject: linkedEmail?.subject || "Email Attachment",
					sender: linkedEmail?.sender || "-",
					date:
						linkedEmail?.receivedAt ||
						linkedEmail?.created_at ||
						att.created_at,
				});
			} else if (emailAttSignatures.get(getSig(displayName, size))) {
				const matchedEmail = emailAttSignatures.get(
					getSig(displayName, size),
				);
				interaction.push({
					...standardizedAtt,
					sourceSubject: matchedEmail.subject,
					sender: matchedEmail.sender,
					date:
						matchedEmail.receivedAt ||
						matchedEmail.created_at ||
						att.created_at,
				});
			} else {
				manual.push(standardizedAtt);
			}
		});

		// 3. Process Activity Attachments (Direct from Emails)
		if (emailInteractions) {
			emailInteractions.forEach((email) => {
				(email.attachments || []).forEach((eAtt) => {
					const displayName = getBestName(eAtt);
					const size = eAtt.file_size || eAtt.size;
					const alreadyAdded = interaction.some(
						(i) =>
							getSig(i.fileName, i.fileSize) ===
							getSig(displayName, size),
					);

					if (!alreadyAdded && displayName) {
						interaction.push({
							...eAtt,
							fileName: displayName,
							fileSize: size,
							sourceSubject: email.subject,
							sender: email.sender,
							date: email.receivedAt || email.created_at,
							origin: "activity",
						});
					}
				});
			});
		}
		return {
			manualAttachments: manual,
			interactionAttachments: interaction,
		};
	}, [attachments, emailInteractions]);

	const linkedContact = useMemo(() => {
		if (!ticketData || !allContacts.length) return null;
		return allContacts.find(
			(c) =>
				String(c.contactId) === String(ticketData.primary_contact_id) ||
				String(c.id) === String(ticketData.primary_contact_id),
		);
	}, [ticketData, allContacts]);

	const contactNameDisplay = linkedContact
		? `${linkedContact.firstName} ${linkedContact.lastName}`
		: ticketData?.primary_contact_name || "-";
	const contactEmailDisplay = linkedContact?.email || ticketData?.email || "";
	const contactPhoneDisplay =
		linkedContact?.phone || ticketData?.phone || "-";
	const reportedOn = ticketData?.created_at
		? new Date(ticketData.created_at)
		: new Date();

	const getDueDate = (date, priority, source, type) => {
		const d = new Date(date);
		d.setHours(d.getHours() + 24);
		return d;
	};
	const reviewDueDate = getDueDate(
		reportedOn,
		ticketData?.priority,
		ticketData?.source,
		"REVIEW",
	);
	const completionDueDate = getDueDate(
		reviewDueDate,
		ticketData?.priority,
		ticketData?.source,
		"COMPLETION",
	);
	const getChannelDisplay = () => ticketData?.source || "Manual";

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (actionRef.current && !actionRef.current.contains(event.target))
				setMenuModal(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleChange = (e) => {
		const { id, value } = e.target;
		setTicketData((prev) => ({ ...prev, [id]: value }));
	};
	const handleSave = async () => {
		try {
			const res = await fetch(`${BASE_URL_SER}/tickets/${ticketId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ticketData),
			});
			if (res.ok) {
				toast.success("Ticket updated successfully");
				navigate("/service/tickets");
			} else {
				toast.error("Failed to update ticket");
			}
		} catch (err) {
			toast.error("Error updating ticket: " + err.message);
		}
	};
	const handleDeleteTicket = async () => {
		/* ... */
	};

	const handlePrintPreview = () => window.print();
	const handleChangeOwnerSave = async () => {
		if (!ownerConfig.newOwner.trim())
			return toast.warn("Please select a new owner.");
		try {
			const res = await fetch(`${BASE_URL_SER}/tickets/${ticketId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...ticketData,
					ticket_owner_name: ownerConfig.newOwner,
				}),
			});
			if (res.ok) {
				const updatedTicket = await res.json();
				setTicketData(updatedTicket);
				setOwnerConfig((prev) => ({
					...prev,
					currentOwner: updatedTicket.ticket_owner_name,
					newOwner: "",
				}));
				setShowChangeOwnerModal(false);
				toast.success("Owner changed successfully!");
			} else {
				toast.error("Failed to change owner.");
			}
		} catch (err) {
			toast.error("Error changing owner: " + err.message);
		}
	};
	const handleEscalateChange = (f, v) =>
		setEscalationConfig((p) => ({ ...p, [f]: v }));
	const handleEscalateSave = async () => {
		try {
			if (
				escalationConfig.hours === "0" &&
				escalationConfig.minutes === "0"
			)
				return toast.warn("Please enter a valid duration.");
			const updates = { priority: "HIGH" };
			if (escalationConfig.reassignUser)
				updates.ticket_owner_name = escalationConfig.reassignUser;
			const res = await fetch(`${BASE_URL_SER}/tickets/${ticketId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...ticketData, ...updates }),
			});
			if (!res.ok) throw new Error("Failed");
			const updatedTicket = await res.json();
			setTicketData(updatedTicket);
			await fetch(`${BASE_URL_SER}/tickets/${ticketId}/activities`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					agentName: "Current User",
					action: "Escalation",
					details: `Escalated after ${escalationConfig.hours}h ${escalationConfig.minutes}m.`,
					ticketId: ticketId,
				}),
			});
			const activitiesRes = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}/activities`,
			);
			if (activitiesRes.ok) setActivities(await activitiesRes.json());
			setShowEscalateModal(false);
			toast.success("Ticket escalation configured!");
		} catch (err) {
			toast.error("Escalation failed: " + err.message);
		}
	};
	const handleSelectUser = (u) => {
		const fullName =
			[u.firstName, u.lastName].filter(Boolean).join(" ") || u.name;
		if (userSelectContext === "changeOwner")
			setOwnerConfig((p) => ({ ...p, newOwner: fullName }));
		else if (userSelectContext === "escalate")
			setEscalationConfig((p) => ({ ...p, reassignUser: fullName }));
		setShowUserSelectModal(false);
		setUserSearchTerm("");
		setUserSelectContext(null);
	};
	const handleSelectTemplate = (t) => {
		if (templateContext === "escalate")
			setEscalationConfig((p) => ({ ...p, emailTemplate: t.name }));
		else if (templateContext === "emailCompose") {
			setComposeData((p) => ({
				...p,
				body: p.body
					? p.body + "\n\n" + (t.content || "")
					: t.content || "",
			}));
			toast.success("Template added");
		}
		setShowTemplateSelectModal(false);
		setTemplateSearchTerm("");
		setTemplateContext(null);
	};
	const handleActivityChange = (e) =>
		setNewActivity({ ...newActivity, [e.target.name]: e.target.value });
	const handleAddActivity = async () => {
		try {
			if (!newActivity.subject || !newActivity.date)
				return toast.warn("Fill Subject/Date");
			const payload = {
				agentName: "Current User",
				action: newActivity.type,
				details: `${newActivity.subject} (${newActivity.status}) - ${newActivity.date}`,
				ticketId: ticketId,
			};
			const res = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}/activities`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			if (res.ok) {
				const savedActivity = await res.json();
				setActivities([savedActivity, ...activities]);
				setNewActivity({
					subject: "",
					type: "Call",
					status: "Planned",
					date: new Date().toISOString().split("T")[0],
				});
				toast.success("Activity added");
			} else {
				toast.error("Failed");
			}
		} catch (e) {
			toast.error("Error");
		}
	};
	const handleActivityRedirect = (type) => {
		let path = "";
		switch (type) {
			case "Task":
				path = "/activitymanagement/tasks/create";
				break;
			case "Meeting":
				path = "/activitymanagement/meetings/create";
				break;
			case "Phone Call":
				path = "/activitymanagement/phonecalls/create";
				break;
			default:
				return;
		}
		navigate(`${path}?related_id=${ticketId}&related_module=Ticket`);
	};
	const handleAddNote = async (e) => {
		if (e) e.preventDefault();
		if (!newNote.trim()) return;
		try {
			const res = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}/notes`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text: newNote,
						author: "Current User",
					}),
				},
			);
			if (res.ok) {
				const savedNote = await res.json();
				setNotes([savedNote, ...notes]);
				setNewNote("");
				setShowNoteModal(false);
				toast.success("Note added");
			} else {
				toast.error("Failed");
			}
		} catch (e) {
			toast.error("Failed");
		}
	};
	const handleFileSelect = async (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const formData = new FormData();
			formData.append("file", file);
			formData.append("ticketId", ticketId);
			formData.append("uploadedBy", "Current User");
			const id = toast.loading("Uploading...");
			try {
				const response = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}/attachments`,
					{ method: "POST", body: formData },
				);
				if (response.ok) {
					const savedAttachment = await response.json();
					setAttachments([savedAttachment, ...attachments]);
					toast.update(id, {
						render: "Uploaded",
						type: "success",
						isLoading: false,
						autoClose: 3000,
					});
				} else {
					toast.update(id, {
						render: "Failed",
						type: "error",
						isLoading: false,
						autoClose: 3000,
					});
				}
			} catch (error) {
				toast.update(id, {
					render: "Error",
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
			}
		}
	};
	const openCompose = (type, data = null) => {
		let newData = {
			to:
				type === "new"
					? contactEmailDisplay
					: type === "reply" && data
						? data.sender === "Current User" ||
							data.type === "outbound"
							? data.recipient
							: data.sender
						: "",
			cc: "",
			bcc: "",
			subject:
				type === "new"
					? `Re: ${ticketData.subject} [Ref:${ticketData.ticket_id}]`
					: data
						? type === "forward"
							? `Fwd: ${data.subject}`
							: data.subject.startsWith("Re:")
								? data.subject
								: `Re: ${data.subject}`
						: "",
			body: data
				? type === "forward"
					? `\n\n------------------\nForwarded message:\nFrom: ${data.sender}\nDate: ${data.created_at || data.date}\nSubject: ${data.subject}\n\n${data.body}`
					: `\n\n------------------\nOn ${data.created_at || data.date}, ${data.sender} wrote:\n${data.body}`
				: "",
			id: type === "draft" ? data.id : null,
		};
		setComposeData(newData);
		setComposeAttachments([]);
		setShowCompose(true);
		setIsMinimized(false);
	};
	const handleComposeChange = (f, v) =>
		setComposeData((p) => ({ ...p, [f]: v }));
	const handleComposeFileSelect = (e) => {
		if (e.target.files)
			setComposeAttachments((p) => [...p, ...Array.from(e.target.files)]);
		if (composeFileRef.current) composeFileRef.current.value = "";
	};
	const removeComposeAttachment = (index) =>
		setComposeAttachments((p) => p.filter((_, i) => i !== index));
	const handleSendEmail = async () => {
		if (!composeData.to) return toast.warn("Recipient Required");
		try {
			const formData = new FormData();
			formData.append("subject", composeData.subject);
			formData.append("sender", "Current User");
			formData.append("recipient", composeData.to);
			formData.append("cc", composeData.cc);
			formData.append("bcc", composeData.bcc);
			formData.append("body", composeData.body);
			formData.append("type", "outbound");
			if (composeData.id) formData.append("draftId", composeData.id);
			if (composeAttachments.length)
				composeAttachments.forEach((f) => formData.append("files", f));
			let res;
			if (composeAttachments.length)
				res = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}/emails/with-attachments`,
					{ method: "POST", body: formData },
				);
			else
				res = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}/emails`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							...composeData,
							sender: "Current User",
							recipient: composeData.to,
							type: "outbound",
						}),
					},
				);
			if (res.ok) {
				const sentEmail = await res.json();
				setEmailInteractions([sentEmail, ...emailInteractions]);
				if (composeData.id)
					setEmailDrafts(
						emailDrafts.filter((d) => d.id !== composeData.id),
					);
				setShowCompose(false);
				setActiveEmailTab("interactions");
				setSelectedEmailInteraction(null);
				setComposeAttachments([]);
				toast.success("Email sent");
			} else {
				const err = await res.json();
				toast.error("Failed: " + (err.message || "Error"));
			}
		} catch (e) {
			toast.error("Failed to send");
		}
	};
	const handleSaveDraft = async () => {
		try {
			const payload = {
				...composeData,
				recipient: composeData.to,
				sender: "Current User",
			};
			const res = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}/emails/draft`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			if (res.ok) {
				const savedDraft = await res.json();
				if (composeData.id)
					setEmailDrafts(
						emailDrafts.map((d) =>
							d.id === savedDraft.id ? savedDraft : d,
						),
					);
				else setEmailDrafts([savedDraft, ...emailDrafts]);
				setComposeData((p) => ({ ...p, id: savedDraft.id }));
				toast.success("Draft saved");
				setActiveEmailTab("drafts");
			} else {
				toast.error("Failed");
			}
		} catch (e) {
			toast.error("Error");
		}
	};
	const handleDeleteDraft = async (id) => {
		if (!confirm("Delete draft?")) return;
		try {
			const res = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}/emails/${id}`,
				{ method: "DELETE" },
			);
			if (res.ok) {
				setEmailDrafts(emailDrafts.filter((d) => d.id !== id));
				toast.info("Deleted");
				if (composeData.id === id) setShowCompose(false);
			} else {
				toast.error("Failed");
			}
		} catch (e) {
			toast.error("Error");
		}
	};
	const filteredUsers = users.filter(
		(u) =>
			`${u.firstName} ${u.lastName} ${u.name}`
				.toLowerCase()
				.includes(userSearchTerm.toLowerCase()) ||
			(u.email || "")
				.toLowerCase()
				.includes(userSearchTerm.toLowerCase()),
	);

	if (loading) return <div>Loading...</div>;
	if (!ticketData) return <div>No data found</div>;

	return (
		<div className="ticket-edit-container">
			{/* Header */}
			<div className="ticket-edit-header-container">
				<h1 className="ticket-edit-heading">
					{ticketData.subject || "Ticket Details"}
				</h1>
				<div className="ticket-edit-header-container-buttons">
					{!isEditMode ? (
						<>
							<button
								className="ticket-edit-close-button"
								onClick={() => navigate("/service/tickets")}
							>
								<X size={15} strokeWidth={1} /> Close
							</button>
							<div
								className="ticket-edit-options-button-container"
								ref={actionRef}
							>
								<button
									className="ticket-edit-options-button"
									onClick={() => setMenuModal(!menuModal)}
								>
									<MoreVertical size={20} />
								</button>
								{menuModal && (
									<div className="ticket-edit-menu-modal-container">
										<ul className="ticket-edit-menu-modal-list">
											<li
												onClick={() => {
													setMenuModal(false);
													setShowEscalateModal(true);
												}}
											>
												Escalate Ticket
											</li>
											<li
												onClick={() => {
													setMenuModal(false);
													setShowDeleteConfirm(true);
												}}
											>
												Delete
											</li>
											<li
												onClick={() => {
													setMenuModal(false);
													handlePrintPreview();
												}}
											>
												Print Preview
											</li>
											<li
												onClick={() => {
													setMenuModal(false);
													setShowChangeOwnerModal(
														true,
													);
												}}
											>
												Change Owner
											</li>
										</ul>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<button
								className="ticket-edit-save-button"
								onClick={handleSave}
							>
								<Save size={15} strokeWidth={1} /> Save
							</button>
							<button
								className="ticket-edit-cancel-button"
								onClick={() => navigate("/service/tickets")}
							>
								<CircleX size={15} strokeWidth={1} /> Cancel
							</button>
						</>
					)}
				</div>
			</div>

			{/* ✅ FIXED TABS SECTION - Using Flexbox for proper alignment */}
			<div
				className="ticket-email-tabs-container"
				style={{
					marginBottom: 30,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderBottom: "1px solid #e0e0e0",
					paddingBottom: "0",
				}}
			>
				{/* Left Side: Tabs */}
				<div
					className="ticket-tabs-left"
					style={{ display: "flex", gap: "5px" }}
				>
					{[
						"Overview",
						"Interactions",
						"Notes",
						"Activities",
						"Attachments",
					].map((tab) => (
						<button
							key={tab}
							className={`ticket-email-tab-btn ${activeMainTab === tab ? "active" : ""}`}
							onClick={() => setActiveMainTab(tab)}
							style={{
								borderBottom:
									activeMainTab === tab
										? "2px solid #365486"
										: "none",
								borderRadius: "0",
								marginBottom: "-1px", // To overlap the border
							}}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Right Side: Action Buttons aligned perfectly */}
				<div
					className="ticket-tab-actions-right"
					style={{
						display: "flex",
						gap: "10px",
						paddingBottom: "5px",
					}}
				>
					{activeMainTab === "Interactions" && (
						<button
							className="ticket-tab-action-btn"
							onClick={() => openCompose("new")}
						>
							<Mail size={16} /> Compose Mail
						</button>
					)}
					{activeMainTab === "Notes" && (
						<button
							className="ticket-tab-action-btn"
							onClick={() => setShowNoteModal(true)}
						>
							<Plus size={16} /> Add Note
						</button>
					)}
					{activeMainTab === "Activities" && (
						<>
							<button
								className="ticket-tab-action-btn"
								onClick={() =>
									handleActivityRedirect("Phone Call")
								}
							>
								<Phone size={16} /> Add Call
							</button>
							<button
								className="ticket-tab-action-btn"
								onClick={() => handleActivityRedirect("Task")}
							>
								<ListTodo size={16} /> Add Task
							</button>
							<button
								className="ticket-tab-action-btn"
								onClick={() =>
									handleActivityRedirect("Meeting")
								}
							>
								<Calendar size={16} /> Plan Meeting
							</button>
						</>
					)}
					{activeMainTab === "Attachments" &&
						activeAttachmentTab === "manual" && (
							<button
								className="ticket-tab-action-btn"
								onClick={() => fileInputRef.current.click()}
							>
								<Paperclip size={16} /> Upload File
							</button>
						)}
				</div>
			</div>

			{/* OVERVIEW TAB */}
			{activeMainTab === "Overview" && (
				<>
					<div className="ticket-edit-form-container">
						<h1 className="ticket-edit-form-heading">Overview</h1>
						<div className="ticket-edit-form">
							<form>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Ticket ID</label>
										<input
											type="text"
											value={ticketData.ticket_id}
											disabled
											className="input-disabled"
										/>
									</div>
									<div className="ticket-edit-form-group">
										<label>Priority</label>
										{isEditMode ? (
											<select
												id="priority"
												value={ticketData.priority}
												onChange={handleChange}
											>
												<option value="LOW">Low</option>
												<option value="NORMAL">
													Normal
												</option>
												<option value="MEDIUM">
													Medium
												</option>
												<option value="HIGH">
													High
												</option>
											</select>
										) : (
											<input
												type="text"
												value={ticketData.priority}
												disabled
											/>
										)}
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Subject</label>
										<input
											type="text"
											id="subject"
											value={ticketData.subject}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div className="ticket-edit-form-container">
						<h1 className="ticket-edit-form-heading">
							Ticket Information
						</h1>
						<div className="ticket-edit-form">
							<form>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Status</label>
										{isEditMode ? (
											<select
												id="status"
												value={ticketData.status}
												onChange={handleChange}
											>
												<option value="OPEN">
													Open
												</option>
												<option value="TO_BE_PROCESSED">
													To be Processed
												</option>
												<option value="COMPLETED">
													Completed
												</option>
												<option value="CLOSED">
													Closed
												</option>
											</select>
										) : (
											<input
												type="text"
												value={ticketData.status}
												disabled
											/>
										)}
									</div>
									<div className="ticket-edit-form-group">
										<label>Ticket Owner</label>
										<input
											type="text"
											value={
												ticketData.ticket_owner_name ||
												"Unassigned"
											}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Account Name</label>
										<input
											type="text"
											value={
												ticketData.account_name || ""
											}
											disabled
											className="input-disabled"
										/>
									</div>
									<div className="ticket-edit-form-group">
										<label>Contact Name</label>
										<input
											type="text"
											value={contactNameDisplay}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Service Group</label>
										<input
											type="text"
											value={
												ticketData.service_group ||
												"General Support"
											}
											disabled={!isEditMode}
										/>
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Description</label>
										<textarea
											id="description"
											value={ticketData.description || ""}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div className="ticket-edit-form-container">
						<h1 className="ticket-edit-form-heading">
							Contact Information
						</h1>
						<div className="ticket-edit-form">
							<form>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Email Address</label>
										<input
											type="text"
											value={contactEmailDisplay}
											disabled
											className="input-disabled"
										/>
									</div>
									<div className="ticket-edit-form-group">
										<label>Phone</label>
										<input
											type="text"
											value={contactPhoneDisplay}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div className="ticket-edit-form-container">
						<h1 className="ticket-edit-form-heading">
							Additional Information
						</h1>
						<div className="ticket-edit-form">
							<form>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Source</label>
										{isEditMode ? (
											<select
												id="source"
												value={
													ticketData.source ||
													"MANUAL"
												}
												onChange={handleChange}
												disabled={
													ticketData.source ===
														"EMAIL" ||
													ticketData.source ===
														"PHONE_CALL"
												}
											>
												<option value="MANUAL">
													Manual
												</option>
												<option value="EMAIL">
													Email
												</option>
												<option value="PHONE_CALL">
													Telephone
												</option>
											</select>
										) : (
											<input
												type="text"
												value={getChannelDisplay()}
												disabled
												className="input-disabled"
											/>
										)}
									</div>
									<div className="ticket-edit-form-group">
										<label>Channel</label>
										<input
											type="text"
											id="channel"
											value={
												ticketData.channel ||
												"Nordic Denmark"
											}
											onChange={handleChange}
											disabled={!isEditMode}
											placeholder="e.g. Nordic Denmark"
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div className="ticket-edit-form-container">
						<h1 className="ticket-edit-form-heading">
							SLA Timeline
						</h1>
						<div className="ticket-edit-form">
							<form>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Reported On</label>
										<input
											type="text"
											value={reportedOn.toLocaleString()}
											disabled
											className="input-disabled"
										/>
									</div>
									<div className="ticket-edit-form-group">
										<label>Received On</label>
										<input
											type="text"
											value={
												ticketData.received_at
													? new Date(
															ticketData.received_at,
														).toLocaleString()
													: reportedOn.toLocaleString()
											}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Initial Review Due</label>
										<input
											type="text"
											value={reviewDueDate.toLocaleString()}
											disabled
											className="input-disabled"
										/>
									</div>
									<div className="ticket-edit-form-group">
										<label>Initial Review Completed</label>
										<input
											type="text"
											value={
												ticketData.initial_review_completed_at
													? new Date(
															ticketData.initial_review_completed_at,
														).toLocaleString()
													: "-"
											}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
								<div className="ticket-edit-form-row">
									<div className="ticket-edit-form-group">
										<label>Completion Due</label>
										<input
											type="text"
											value={completionDueDate.toLocaleString()}
											disabled
											className="input-disabled"
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
				</>
			)}

			{/* INTERACTIONS TAB */}
			{activeMainTab === "Interactions" && (
				<div className="ticket-edit-form-container">
					<h1 className="ticket-edit-form-heading">Email</h1>
					<div
						className="ticket-email-tabs-container"
						style={{ paddingTop: 5 }}
					>
						<div className="ticket-tabs-left">
							<button
								className={`ticket-email-tab-btn ${activeEmailTab === "interactions" ? "active" : ""}`}
								onClick={() => {
									setActiveEmailTab("interactions");
									setSelectedEmailInteraction(null);
								}}
							>
								Email Interactions
							</button>
							<button
								className={`ticket-email-tab-btn ${activeEmailTab === "drafts" ? "active" : ""}`}
								onClick={() => {
									setActiveEmailTab("drafts");
									setSelectedEmailInteraction(null);
								}}
							>
								Email Drafts ({emailDrafts.length})
							</button>
						</div>
					</div>
					<div className="ticket-email-list-container">
						{activeEmailTab === "interactions" &&
							!selectedEmailInteraction && (
								<div className="ticket-edit-table-box">
									<table className="ticket-create-table">
										<thead>
											<tr>
												<th>Channel Name</th>
												<th>Subject</th>
												<th>Date & Time</th>
												<th>Sender Name</th>
												<th>Recipients Email</th>
											</tr>
										</thead>
										<tbody>
											{emailInteractions.length === 0 ? (
												<tr>
													<td
														colSpan="5"
														className="ticket-empty-state"
													>
														No interactions found.
													</td>
												</tr>
											) : (
												emailInteractions.map(
													(email) => (
														<tr
															key={email.id}
															className="ticket-email-row"
															onClick={() =>
																setSelectedEmailInteraction(
																	email,
																)
															}
														>
															<td>
																<div
																	style={{
																		display:
																			"flex",
																		alignItems:
																			"center",
																		gap: "5px",
																	}}
																>
																	{email.type ===
																	"inbound" ? (
																		<Mail
																			size={
																				16
																			}
																			color="#365486"
																		/>
																	) : (
																		<Reply
																			size={
																				16
																			}
																			color="#666"
																		/>
																	)}
																	{ticketData.channel ||
																		"Nordic Denmark"}
																</div>
															</td>
															<td className="ticket-subject-text">
																{email.subject}
															</td>
															<td>
																{new Date(
																	email.created_at ||
																		email.receivedAt ||
																		Date.now(),
																).toLocaleString()}
															</td>
															<td>
																{resolveSenderGlobal(
																	email.sender,
																)}
															</td>
															<td>
																{
																	email.recipient
																}
															</td>
														</tr>
													),
												)
											)}
										</tbody>
									</table>
								</div>
							)}
						{activeEmailTab === "interactions" &&
							selectedEmailInteraction && (
								<div className="ticket-email-detail-view">
									<div>
										<button
											onClick={() =>
												setSelectedEmailInteraction(
													null,
												)
											}
											className="email-back-btn"
										>
											<ArrowLeft size={16} /> Back to List
										</button>
									</div>
									<div className="email-detail-header-box">
										<div className="email-header-top">
											<div className="email-sender-group">
												<div className="email-avatar-circle">
													{selectedEmailInteraction.sender
														? selectedEmailInteraction.sender
																.charAt(0)
																.toUpperCase()
														: "U"}
												</div>
												<div>
													<div className="email-sender-name">
														{resolveSenderGlobal(
															selectedEmailInteraction.sender,
														)}
													</div>
													<div className="email-meta-text">
														To:{" "}
														{
															selectedEmailInteraction.recipient
														}
													</div>
													{selectedEmailInteraction.cc && (
														<div className="email-meta-text">
															CC:{" "}
															{
																selectedEmailInteraction.cc
															}
														</div>
													)}
												</div>
											</div>
											<div className="email-timestamp">
												{new Date(
													selectedEmailInteraction.created_at ||
														selectedEmailInteraction.receivedAt ||
														Date.now(),
												).toLocaleString()}
											</div>
										</div>
										<div className="email-subject-line">
											{selectedEmailInteraction.subject}
										</div>
									</div>
									<div
										className="email-body-content"
										dangerouslySetInnerHTML={{
											__html:
												selectedEmailInteraction.body ||
												selectedEmailInteraction.content,
										}}
									></div>
									{selectedEmailInteraction.attachments &&
										selectedEmailInteraction.attachments
											.length > 0 && (
											<div className="email-attachments-section">
												<strong>Attachments:</strong>
												<ul className="email-attachments-list">
													{selectedEmailInteraction.attachments.map(
														(file, idx) => (
															<li
																key={idx}
																className="email-attachment-item"
															>
																<span
																	onClick={() =>
																		handleFileAction(
																			{
																				...file,
																				origin: "activity",
																			},
																			"view",
																		)
																	}
																	style={{
																		color: "#365486",
																		textDecoration:
																			"underline",
																		cursor: "pointer",
																	}}
																>
																	{file.file_name ||
																		file.name ||
																		file.filename ||
																		"Attachment"}
																</span>
																<button
																	className="icon-btn"
																	style={{
																		marginLeft:
																			"10px",
																	}}
																	onClick={() =>
																		handleFileAction(
																			{
																				...file,
																				origin: "activity",
																			},
																			"download",
																		)
																	}
																>
																	<Download
																		size={
																			14
																		}
																	/>
																</button>
															</li>
														),
													)}
												</ul>
											</div>
										)}
									<div className="email-actions-bar">
										<div className="email-action-btn-group">
											<button
												onClick={() =>
													openCompose(
														"reply",
														selectedEmailInteraction,
													)
												}
												className="email-reply-btn"
											>
												<Reply size={14} /> Reply
											</button>
											<button
												onClick={() =>
													openCompose(
														"forward",
														selectedEmailInteraction,
													)
												}
												className="email-reply-btn"
											>
												<Forward size={14} /> Forward
											</button>
										</div>
									</div>
								</div>
							)}
						{activeEmailTab === "drafts" && (
							<div className="ticket-edit-table-box">
								<table className="ticket-create-table">
									<thead>
										<tr>
											<th>Subject</th>
											<th>To</th>
											<th>Saved At</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{emailDrafts.map((draft) => (
											<tr
												key={draft.id}
												className="ticket-email-row"
											>
												<td
													onClick={() =>
														openCompose(
															"draft",
															draft,
														)
													}
													className="ticket-subject-text"
												>
													{draft.subject ||
														"(No Subject)"}
												</td>
												<td
													onClick={() =>
														openCompose(
															"draft",
															draft,
														)
													}
												>
													{draft.to ||
														draft.recipient}
												</td>
												<td
													onClick={() =>
														openCompose(
															"draft",
															draft,
														)
													}
												>
													{new Date(
														draft.created_at ||
															draft.receivedAt ||
															Date.now(),
													).toLocaleString()}
												</td>
												<td className="cell-icon-action">
													<button
														className="icon-btn"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteDraft(
																draft.id,
															);
														}}
													>
														<Trash2
															size={16}
															color="red"
														/>
													</button>
												</td>
											</tr>
										))}
										{emailDrafts.length === 0 && (
											<tr>
												<td
													colSpan="4"
													className="ticket-empty-state"
												>
													No drafts.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}

			{/* NOTES TAB */}
			{activeMainTab === "Notes" && (
				<div className="ticket-edit-form-container">
					<h1 className="ticket-edit-form-heading">Notes</h1>
					<div className="ticket-edit-form">
						{notes.length > 0 ? (
							<div className="ticket-notes-container">
								<ul className="ticket-notes-list">
									{notes.map((note) => (
										<li
											key={note.id}
											className="ticket-note-item"
										>
											<div className="ticket-note-text">
												{note.text}
											</div>
											<div className="ticket-note-meta">
												<User size={12} /> {note.author}{" "}
												•{" "}
												{new Date(
													note.created_at ||
														note.date,
												).toLocaleString()}
											</div>
										</li>
									))}
								</ul>
							</div>
						) : (
							<div className="ticket-notes-empty">
								No notes added yet.
							</div>
						)}
					</div>
				</div>
			)}

			{/* ACTIVITIES TAB */}
			{activeMainTab === "Activities" && (
				<div className="ticket-edit-table-container">
					<h1 className="ticket-edit-form-heading">Activities</h1>
					<div className="ticket-edit-table-area">
						<div className="ticket-edit-table-box">
							<table className="ticket-create-table">
								<thead>
									<tr>
										<th>Type</th>
										<th>Subject</th>
										<th>Date</th>
									</tr>
								</thead>
								<tbody>
									{activities.length === 0 ? (
										<tr>
											<td
												colSpan="3"
												className="ticket-empty-state"
											>
												No Activities
											</td>
										</tr>
									) : (
										activities.map((a) => (
											<tr key={a.id}>
												<td className="ticket-subject-text">
													{a.action || a.type}
												</td>
												<td>
													{a.details ||
														a.subject ||
														"-"}
												</td>
												<td>
													{new Date(
														a.timestamp || a.date,
													).toLocaleString()}
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

			{/* ATTACHMENTS TAB */}
			{activeMainTab === "Attachments" && (
				<div className="ticket-edit-form-container">
					<h1 className="ticket-edit-form-heading">Attachments</h1>
					<div
						className="ticket-email-tabs-container"
						style={{ paddingTop: 5 }}
					>
						<div className="ticket-tabs-left">
							<button
								className={`ticket-email-tab-btn ${activeAttachmentTab === "manual" ? "active" : ""}`}
								onClick={() => setActiveAttachmentTab("manual")}
							>
								Attachment
							</button>
							<button
								className={`ticket-email-tab-btn ${activeAttachmentTab === "interaction" ? "active" : ""}`}
								onClick={() =>
									setActiveAttachmentTab("interaction")
								}
							>
								Interaction Attachment
							</button>
						</div>
					</div>
					<input
						type="file"
						ref={fileInputRef}
						style={{ display: "none" }}
						onChange={handleFileSelect}
					/>
					{activeAttachmentTab === "manual" && (
						<div className="ticket-edit-table-area">
							<div className="ticket-edit-table-box">
								<table className="ticket-create-table">
									<thead>
										<tr>
											<th>File Name</th>
											<th>Attached By</th>
											<th>Date Added</th>
											<th>Size</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{manualAttachments.map((att) => (
											<tr key={att.id}>
												<td>
													<span
														onClick={() =>
															handleFileAction(
																att,
																"view",
															)
														}
														style={{
															color: "#365486",
															textDecoration:
																"underline",
															cursor: "pointer",
														}}
													>
														{att.fileName ||
															att.original_name}
													</span>
												</td>
												<td>
													{att.uploaded_by ||
														att.uploader}
												</td>
												<td>
													{new Date(
														att.created_at ||
															att.date,
													).toLocaleDateString()}
												</td>
												<td>
													{formatFileSize(
														att.file_size ||
															att.size,
													)}
												</td>
												<td>
													<button
														className="icon-btn"
														onClick={() =>
															handleFileAction(
																att,
																"download",
															)
														}
													>
														<Download size={16} />
													</button>
												</td>
											</tr>
										))}
										{manualAttachments.length === 0 && (
											<tr>
												<td
													colSpan="5"
													className="ticket-empty-state"
												>
													No Attachments
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
					{activeAttachmentTab === "interaction" && (
						<div className="ticket-edit-table-area">
							<div className="ticket-edit-table-box">
								<table className="ticket-create-table">
									<thead>
										<tr>
											<th>File Name</th>
											<th>Source</th>
											<th>Date</th>
											<th>Size</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{interactionAttachments.map(
											(att, index) => (
												<tr
													key={`${att.sourceEmailId}-${index}`}
												>
													<td>
														<span
															onClick={() =>
																handleFileAction(
																	att,
																	"view",
																)
															}
															style={{
																color: "#365486",
																textDecoration:
																	"underline",
																cursor: "pointer",
															}}
														>
															{att.fileName ||
																att.original_name}
														</span>
													</td>
													<td>
														<div
															style={{
																display: "flex",
																flexDirection:
																	"column",
															}}
														>
															<span
																style={{
																	fontWeight: 500,
																}}
															>
																{
																	att.sourceSubject
																}
															</span>
															<span
																style={{
																	fontSize:
																		"11px",
																	color: "#666",
																}}
															>
																{resolveSenderGlobal(
																	att.sender,
																)}
															</span>
														</div>
													</td>
													<td>
														{safeDate(att.date)}
													</td>
													<td>
														{formatFileSize(
															att.fileSize ||
																att.size,
														)}
													</td>
													<td>
														<button
															className="icon-btn"
															onClick={() =>
																handleFileAction(
																	att,
																	"download",
																)
															}
														>
															<Download
																size={16}
															/>
														</button>
													</td>
												</tr>
											),
										)}
										{interactionAttachments.length ===
											0 && (
											<tr>
												<td
													colSpan="5"
													className="ticket-empty-state"
												>
													No Interaction Attachments
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Modals & Popups */}
			{showChangeOwnerModal && (
				<div className="ticket-modal-overlay">
					<div className="ticket-modal-content">
						<div className="ticket-modal-header">
							<h3 className="ticket-modal-title">Change Owner</h3>
							<button
								onClick={() => setShowChangeOwnerModal(false)}
								className="ticket-modal-close-btn"
							>
								<X size={20} color="#0f1035" />
							</button>
						</div>
						<div className="ticket-modal-body">
							<div className="ticket-modal-input-group">
								<label className="ticket-modal-label">
									Assign Owner (Current)
								</label>
								<input
									type="text"
									value={ownerConfig.currentOwner}
									disabled
									className="ticket-modal-input input-disabled"
								/>
							</div>
							<div className="ticket-modal-input-group">
								<label className="ticket-modal-label">
									Reassign Owner
								</label>
								<div className="ticket-modal-input-wrapper">
									<input
										type="text"
										placeholder="Search or Select User..."
										value={ownerConfig.newOwner}
										onChange={(e) =>
											setOwnerConfig((prev) => ({
												...prev,
												newOwner: e.target.value,
											}))
										}
										className="ticket-modal-input ticket-modal-input-search"
									/>
									<button
										onClick={() => {
											setUserSelectContext("changeOwner");
											setShowUserSelectModal(true);
										}}
										className="ticket-modal-search-icon"
										style={{
											background: "none",
											border: "none",
											cursor: "pointer",
											pointerEvents: "auto",
										}}
									>
										<Search size={18} color="#365486" />
									</button>
								</div>
							</div>
						</div>
						<div className="ticket-modal-footer">
							<button
								onClick={() => setShowChangeOwnerModal(false)}
								className="btn-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleChangeOwnerSave}
								className="btn-primary"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{showUserSelectModal && (
				<div className="ticket-modal-overlay higher-z-index">
					<div className="ticket-modal-content large">
						<div className="ticket-modal-header">
							<h3 className="ticket-modal-title">Select User</h3>
							<button
								onClick={() => setShowUserSelectModal(false)}
								className="ticket-modal-close-btn"
							>
								<X size={20} color="#0f1035" />
							</button>
						</div>
						<div className="ticket-search-bar-container">
							<div className="ticket-modal-input-wrapper">
								<input
									type="text"
									placeholder="Search by name or email..."
									value={userSearchTerm}
									onChange={(e) =>
										setUserSearchTerm(e.target.value)
									}
									autoFocus
									className="ticket-search-bar"
								/>
								<Search
									size={18}
									color="#888"
									className="ticket-search-bar-icon"
								/>
							</div>
						</div>
						<div
							style={{ flex: 1, overflowY: "auto", padding: "0" }}
						>
							<table className="ticket-modal-table">
								<thead>
									<tr>
										<th>Username</th>
										<th>Business Role</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.length > 0 ? (
										filteredUsers.map((user) => (
											<tr
												key={user.id}
												onClick={() =>
													handleSelectUser(user)
												}
												style={{ cursor: "pointer" }}
											>
												<td className="ticket-subject-text">
													<div
														style={{
															display: "flex",
															alignItems:
																"center",
															gap: "8px",
														}}
													>
														<User
															size={16}
															color="#365486"
														/>{" "}
														{user.name ||
															`${user.firstName} ${user.lastName}`}
													</div>
												</td>
												{/* FIXED: user.businessRoleName instead of user.role */}
												<td>
													{user.businessRoleName ||
														user.role ||
														"-"}
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan="2"
												className="ticket-empty-state"
											>
												No users found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						<div className="ticket-modal-footer">
							<button
								onClick={() => setShowUserSelectModal(false)}
								className="btn-secondary"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showEscalateModal && (
				<div className="ticket-modal-overlay">
					<div className="ticket-modal-content medium">
						<div className="ticket-modal-header">
							<h3 className="ticket-modal-title">
								Escalate Ticket
							</h3>
							<button
								onClick={() => setShowEscalateModal(false)}
								className="ticket-modal-close-btn"
							>
								<X size={20} color="#0f1035" />
							</button>
						</div>
						<div className="ticket-modal-body">
							<div className="ticket-modal-input-group">
								<label className="ticket-modal-label">
									1. Escalate Ticket After
								</label>
								<div className="escalate-time-row">
									<input
										type="number"
										min="0"
										value={escalationConfig.hours}
										onChange={(e) =>
											handleEscalateChange(
												"hours",
												e.target.value,
											)
										}
										className="escalate-time-input"
									/>
									<span style={{ fontSize: "14px" }}>
										Hours
									</span>
									<input
										type="number"
										min="0"
										value={escalationConfig.minutes}
										onChange={(e) =>
											handleEscalateChange(
												"minutes",
												e.target.value,
											)
										}
										className="escalate-time-input"
									/>
									<span style={{ fontSize: "14px" }}>
										Minutes
									</span>
								</div>
							</div>
							<div className="ticket-modal-input-group">
								<label className="ticket-modal-label">
									2. Reassign User
								</label>
								<div className="ticket-modal-input-wrapper">
									<input
										type="text"
										placeholder="Select User"
										value={escalationConfig.reassignUser}
										readOnly
										className="ticket-modal-input ticket-modal-input-search"
										onClick={() => {
											setUserSelectContext("escalate");
											setShowUserSelectModal(true);
										}}
									/>
									<Search
										size={18}
										color="#365486"
										className="ticket-modal-search-icon"
									/>
								</div>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
								}}
							>
								<input
									type="checkbox"
									id="notifyUser"
									checked={escalationConfig.notifyUser}
									onChange={(e) =>
										handleEscalateChange(
											"notifyUser",
											e.target.checked,
										)
									}
									style={{
										width: "16px",
										height: "16px",
										accentColor: "#365486",
									}}
								/>
								<label
									htmlFor="notifyUser"
									className="ticket-modal-label"
								>
									3. Notify User
								</label>
							</div>
							<div className="ticket-modal-input-group">
								<label className="ticket-modal-label">
									4. Select Email Template
								</label>
								<div className="ticket-modal-input-wrapper">
									<input
										type="text"
										placeholder="Select Template"
										value={escalationConfig.emailTemplate}
										readOnly
										className="ticket-modal-input ticket-modal-input-search"
										onClick={() => {
											setTemplateContext("escalate");
											setShowTemplateSelectModal(true);
										}}
									/>
									<Search
										size={18}
										color="#365486"
										className="ticket-modal-search-icon"
									/>
								</div>
							</div>
						</div>
						<div className="ticket-modal-footer">
							<button
								onClick={() => setShowEscalateModal(false)}
								className="btn-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleEscalateSave}
								className="btn-primary"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
			{showTemplateSelectModal && (
				<div className="ticket-modal-overlay higher-z-index">
					<div className="ticket-modal-content large">
						<div className="ticket-modal-header">
							<h3 className="ticket-modal-title">
								Choose Template
							</h3>
							<button
								onClick={() =>
									setShowTemplateSelectModal(false)
								}
								className="ticket-modal-close-btn"
							>
								<X size={20} color="#0f1035" />
							</button>
						</div>
						<div className="ticket-search-bar-container">
							<div className="ticket-modal-input-wrapper">
								<input
									type="text"
									placeholder="Search Template..."
									value={templateSearchTerm}
									onChange={(e) =>
										setTemplateSearchTerm(e.target.value)
									}
									autoFocus
									className="ticket-search-bar"
								/>
								<Search
									size={18}
									color="#888"
									className="ticket-search-bar-icon"
								/>
							</div>
						</div>
						<div
							style={{ flex: 1, overflowY: "auto", padding: "0" }}
						>
							<table className="ticket-modal-table">
								<thead>
									<tr>
										<th>Template Name</th>
										<th>Template Type</th>
									</tr>
								</thead>
								<tbody>
									{MOCK_TEMPLATES.filter((t) =>
										t.name
											.toLowerCase()
											.includes(
												templateSearchTerm.toLowerCase(),
											),
									).map((template) => (
										<tr
											key={template.id}
											onClick={() =>
												handleSelectTemplate(template)
											}
											style={{ cursor: "pointer" }}
										>
											<td className="ticket-subject-text">
												{template.name}
											</td>
											<td>{template.type}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="ticket-modal-footer">
							<button
								onClick={() =>
									setShowTemplateSelectModal(false)
								}
								className="btn-secondary"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
			{showDeleteConfirm && (
				<div className="ticket-modal-overlay">
					<div
						className="ticket-modal-content"
						style={{ width: "400px", padding: "20px", gap: "20px" }}
					>
						<div className="ticket-delete-confirm-center">
							<h3
								className="ticket-modal-title"
								style={{ marginBottom: "10px" }}
							>
								Confirm Delete
							</h3>
							<p style={{ color: "#666" }}>
								Are you sure you want to permanently delete this
								ticket?
							</p>
						</div>
						<div className="ticket-delete-confirm-actions">
							<button
								onClick={handleDeleteTicket}
								className="btn-danger"
							>
								Delete
							</button>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="btn-secondary"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
			{showNoteModal && (
				<div className="ticket-modal-overlay">
					<div className="ticket-modal-content medium">
						<div className="ticket-modal-header">
							<h3 className="ticket-modal-title">Add Note</h3>
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="ticket-modal-close-btn"
							>
								<X size={20} color="#0f1035" />
							</button>
						</div>
						<div style={{ padding: "20px" }}>
							<textarea
								placeholder="Type your note here..."
								value={newNote}
								onChange={(e) => setNewNote(e.target.value)}
								className="ticket-note-textarea"
							/>
						</div>
						<div className="ticket-modal-footer">
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="btn-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleAddNote}
								className="btn-primary"
							>
								Save Note
							</button>
						</div>
					</div>
				</div>
			)}
			{showCompose && (
				<div
					className={`ticket-compose-window ${isMinimized ? "minimized" : ""}`}
				>
					<div
						className="ticket-compose-header"
						onClick={() => setIsMinimized(!isMinimized)}
					>
						<h2 className="ticket-compose-title">Send Email</h2>
						<div className="ticket-compose-controls">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsMinimized(!isMinimized);
								}}
								className="ticket-compose-control-btn"
							>
								<Minimize2 size={16} color="#666" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowCompose(false);
								}}
								className="ticket-compose-control-btn"
							>
								<X size={16} color="#666" />
							</button>
						</div>
					</div>
					{!isMinimized && (
						<>
							<div className="ticket-compose-body">
								<div className="ticket-compose-field">
									<label>To</label>
									<input
										value={composeData.to}
										onChange={(e) =>
											handleComposeChange(
												"to",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="ticket-compose-field">
									<label>CC</label>
									<input
										value={composeData.cc}
										onChange={(e) =>
											handleComposeChange(
												"cc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="ticket-compose-field">
									<label>BCC</label>
									<input
										value={composeData.bcc}
										onChange={(e) =>
											handleComposeChange(
												"bcc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="ticket-compose-field">
									<label>Subject</label>
									<input
										value={composeData.subject}
										onChange={(e) =>
											handleComposeChange(
												"subject",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="ticket-compose-editor">
									<textarea
										value={composeData.body}
										onChange={(e) =>
											handleComposeChange(
												"body",
												e.target.value,
											)
										}
									/>
								</div>
								{composeAttachments.length > 0 && (
									<div className="ticket-compose-attachments">
										{composeAttachments.map((file, idx) => (
											<div
												key={idx}
												className="ticket-compose-attachment-chip"
											>
												<Paperclip size={12} />
												<span className="ticket-compose-attachment-name">
													{file.name}
												</span>
												<button
													onClick={() =>
														removeComposeAttachment(
															idx,
														)
													}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														padding: 0,
														display: "flex",
													}}
												>
													<X size={12} color="#666" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
							<div className="ticket-compose-footer">
								<div className="ticket-compose-tools">
									<input
										type="file"
										multiple
										ref={composeFileRef}
										style={{ display: "none" }}
										onChange={handleComposeFileSelect}
									/>
									<Paperclip
										size={24}
										className="ticket-compose-tool-icon"
										onClick={() =>
											composeFileRef.current.click()
										}
									/>
									<FileText
										size={24}
										className="ticket-compose-tool-icon"
										onClick={() => {
											setTemplateContext("emailCompose");
											setShowTemplateSelectModal(true);
										}}
									/>
									<Trash2
										size={24}
										className="ticket-compose-tool-icon"
										onClick={() => setShowCompose(false)}
									/>
								</div>
								<div className="ticket-compose-actions">
									<button
										onClick={handleSaveDraft}
										className="btn-draft"
									>
										Save Draft
									</button>
									<button
										onClick={handleSendEmail}
										className="btn-send"
									>
										Send
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default DisplayTicket;
