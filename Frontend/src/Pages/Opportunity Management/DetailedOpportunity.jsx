import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Paperclip,
	Pencil,
	SquarePen,
	Mail,
	Save,
	CircleX,
	Phone,
	ListChecks,
	LaptopMinimal,
	Trash2,
	Plus,
	X,
	User,
	ListTodo,
	Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./DetailedOpportunity.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const DetailedOpportunity = () => {
	const [formData, setFormData] = useState({});
	const [accounts, setAccounts] = useState([]);
	const [menuModal, setMenuModal] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [users, setUsers] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({}); // { opportunityOwnerId: "Owner ID is required", name: "..." }
	const [activeTab, setActiveTab] = useState("overview");
	const [activities, setActivities] = useState([]);
	const [attachments, setAttachments] = useState([]);
	const [activeEmailTab, setActiveEmailTab] = useState("interactions");
	const [emailInteractions, setEmailInteractions] = useState([]);
	const [emailDrafts, setEmailDrafts] = useState([]);
	const [selectedEmailInteraction, setSelectedEmailInteraction] =
		useState(null);
	const [showComposeMail, setShowComposeMail] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [composeMailData, setComposeMailData] = useState({
		to: "",
		cc: "",
		bcc: "",
		subject: "",
		body: "",
		id: null,
	});
	const [composeMailAttachments, setComposeMailAttachments] = useState([]);
	const [notes, setNotes] = useState([]);
	const [showNoteModal, setShowNoteModal] = useState(false);
	const [newNote, setNewNote] = useState("");

	const navigate = useNavigate();
	const { user } = useAuth();
	const actionRef = useRef(null);
	const fileInputRef = useRef(null);
	const composeFileRef = useRef(null);
	const { id } = useParams();

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const stages = [
		{ label: "Qualification", value: "QUALIFICATION" },
		{ label: "Needs Analysis", value: "NEEDS_ANALYSIS" },
		{ label: "Value Proportion", value: "VALUE_PROPORTION" },
		{ label: "Price Quote", value: "PRICE_QUOTE" },
		{ label: "Negotiation", value: "NEGOTIATION" },
		{ label: "Closed Won", value: "CLOSED_WON" },
		{ label: "Closed Lost", value: "CLOSED_LOST" },
	];

	const statuses = [
		{ label: "Open", value: "OPEN" },
		{ label: "In Progress", value: "IN_PROGRESS" },
		{ label: "Completed", value: "COMPLETED" },
		{ label: "Cancelled", value: "CANCELLED" },
	];

	const leadSources = [
		{ label: "Email", value: "EMAIL" },
		{ label: "Web", value: "WEB" },
		{ label: "Call", value: "CALL" },
		{ label: "Referral", value: "REFERRAL" },
		{ label: "Social Media", value: "SOCIAL_MEDIA" },
	];

	const types = [
		{ label: "New Business", value: "NEW_BUSINESS" },
		{ label: "Existing Business", value: "EXISTING_BUSINESS" },
	];

	const STAGE_PROBABILITY_MAP = {
		QUALIFICATION: 10,
		NEEDS_ANALYSIS: 30,
		VALUE_PROPORTION: 50,
		PRICE_QUOTE: 70,
		NEGOTIATION: 90,
		CLOSED_WON: 100,
		CLOSED_LOST: 0,
	};

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Failed to fetch users");
				return;
			}
			const data = await res.json();
			console.log("Users:", data);
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users", err);
			toast.error("Error fetching users");
		}
	};

	const fetchOpportunity = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity/${id}`);
			if (!res.ok) {
				toast.error("Failed to fetch opportunity");
				return;
			}
			const data = await res.json();
			setFormData(data);

			// ⬅️ ADD THIS
			setNotes(data.opportunityNotes || []);

			setAttachments(data.opportunityAttachments || []);
		} catch (err) {
			console.error("Error fetching opportunity:", err);
			toast.error("Error fetching opportunity");
		}
	};

	const fetchAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				toast.error("Failed to fetch accounts");
				return;
			}
			const data = await res.json();
			setAccounts(data); // Set state with backend data
		} catch (err) {
			console.error("Error fetching opportunity:", err);
			toast.error("Error fetching opportunity");
		}
	};

	useEffect(() => {
		fetchOpportunity();
		fetchAccounts();
		fetchUsers();
	}, [id]);

	const handleSave = async () => {
		try {
			setLoading(true);

			const payload = {
				...formData,
				amount: parseFloat(formData.amount || 0),
				probability: parseFloat(formData.probability || 0),
				startDate: formData.startDate
					? new Date(formData.startDate).toISOString()
					: null,
				endDate: formData.endDate
					? new Date(formData.endDate).toISOString()
					: null,
			};

			// ⬇️ normalize enums
			if (!payload.type) payload.type = null;
			if (!payload.leadSource) payload.leadSource = null;

			const response = await fetch(`${BASE_URL_SM}/opportunity`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				// try parse validation errors (400)
				const payload = await res.json().catch(() => null);

				if (payload && Array.isArray(payload.errors)) {
					// Build map: { path: [msg1, msg2] }
					const map = {};
					payload.errors.forEach((err) => {
						const key = err.path || "form";
						if (!map[key]) map[key] = [];
						map[key].push(err.msg || "Invalid value");
					});
					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				// fallback generic error
				toast.error("Failed to update opportunity");
				return;
			}

			// success: clear errors & handle navigation
			setErrors({});

			toast.success("Opportunity updated successfully");
			setIsEditMode(false);
			fetchOpportunity(); // Refresh data after save
		} catch (err) {
			console.error("Error updating opportunity:", err);
			toast.error("Error updating opportunity");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { id, value } = e.target;

		// ❗ Clear backend validation errors for the current field
		if (errors[id]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
		}

		// 👇 If changing account, find contacts
		if (id === "accountId") {
			if (!value) {
				// Account cleared
				setAvailableContacts([]);
				setFormData((prev) => ({
					...prev,
					accountId: "",
					primaryContactId: "",
					contactName: "",
				}));
				return;
			}

			const selectedAccount = accounts.find(
				(acc) => acc.accountId === value,
			);

			if (selectedAccount) {
				setAvailableContacts(selectedAccount.contacts || []);

				const primary = selectedAccount.contacts?.find(
					(c) => c.isPrimary,
				);

				setFormData((prev) => ({
					...prev,
					accountId: value,
					primaryContactId: primary?.contactId || "",
					contactName: primary
						? `${primary.firstName} ${primary.lastName}`
						: "",
				}));
				return;
			}
		}

		if (id === "primaryContactId") {
			const selectedContact = availableContacts.find(
				(c) => c.contactId === value,
			);
			const fullName = selectedContact
				? `${selectedContact.firstName} ${selectedContact.lastName}`
				: "";

			setFormData((prev) => ({
				...prev,
				primaryContactId: value,
				contactName: fullName,
			}));
			return;
		}

		if (id === "stage") {
			const selectedProbability = STAGE_PROBABILITY_MAP[value] ?? "";
			setFormData((prev) => ({
				...prev,
				stage: value,
				probability: selectedProbability, // ← auto‑populate here
			}));
			return;
		}

		// For any other field (including manual edits to probability)
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	useEffect(() => {
		function handleClickOutside(event) {
			// If clicked outside the modal + button
			if (
				actionRef.current &&
				!actionRef.current.contains(event.target)
			) {
				setMenuModal(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// When opportunity and accounts have loaded, sync availableContacts
	useEffect(() => {
		if (!formData.accountId || accounts.length === 0) return;

		const selectedAccount = accounts.find(
			(acc) => acc.accountId === formData.accountId,
		);

		if (selectedAccount) {
			setAvailableContacts(selectedAccount.contacts || []);
		}
	}, [formData.accountId, accounts]);

	// ⬇️ Add this — very important
	const selectedContact = availableContacts.find(
		(c) => c.contactId === formData.primaryContactId,
	);

	const getOwnerDisplayName = () => {
		if (!formData.opportunityOwnerId || users.length === 0) return "--";

		const owner = users.find(
			(u) => String(u.id) === String(formData.opportunityOwnerId),
		);

		if (!owner) return "--";

		const isCurrentUser = user && String(user.id) === String(owner.id);

		return `${owner.firstName} ${owner.lastName}${
			isCurrentUser ? " (You)" : ""
		}`;
	};

	const handleAttachmentUpload = async (e) => {
		const files = Array.from(e.target.files);

		if (!files.length) return;

		// Allowed types
		const allowedTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/jpg",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
		];

		const uploadData = new FormData();

		for (let file of files) {
			if (!allowedTypes.includes(file.type)) {
				toast.error(`Invalid file type: ${file.name}`);
				return;
			}

			if (file.size > 1024 * 1024) {
				toast.error(`File too large (max 1MB): ${file.name}`);
				return;
			}

			uploadData.append("files", file);
		}

		try {
			const res = await fetch(
				`${BASE_URL_SM}/opportunity/${id}/attachments`,
				{
					method: "POST",
					body: uploadData,
				},
			);

			if (!res.ok) {
				toast.error("Failed to upload files");
				return;
			}

			toast.success("Files uploaded successfully");
			fetchOpportunity(); // Reload opportunity including files
		} catch (err) {
			toast.error("Error uploading");
		}
	};

	const handleDeleteAttachment = async (attachmentId) => {
		try {
			const res = await fetch(
				`${BASE_URL_SM}/opportunity/${id}/attachments/${attachmentId}`,
				{ method: "DELETE" },
			);

			if (!res.ok) {
				toast.error("Failed to delete file");
				return;
			}

			toast.success("File deleted successfully!");
			fetchOpportunity(); // Reload opportunity including files
		} catch (err) {
			console.error("Error deleting file:", err);
			toast.error("Error deleting file");
		}
	};

	// ✅ INDEPENDENT NOTE HANDLER (Called from Modal)
	const handleAddNote = async (e) => {
		if (e) e.preventDefault();
		if (!newNote.trim()) return;
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity/${id}/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: newNote,
					author: user
						? `${user.firstName} ${user.lastName}`
						: "Unknown",
				}),
			});
			if (!res.ok) {
				toast.error("Failed to save note");
			}
			const savedNote = await res.json();
			setNotes([savedNote, ...notes]);
			setNewNote("");
			setShowNoteModal(false); // ✅ Close Modal
			toast.success("Note added successfully!");
		} catch (err) {
			console.error("Error saving note:", err);
			toast.error("Error saving note");
		}
	};

	const handleDeleteNote = async (noteId) => {
		try {
			const res = await fetch(
				`${BASE_URL_SM}/opportunity/${id}/notes/${noteId}`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				toast.error("Failed to delete note");
				return;
			}

			// Remove note from UI
			setNotes(notes.filter((n) => n.id !== noteId));
			toast.success("Note deleted successfully!");
		} catch (err) {
			console.error("Error deleting note:", err);
			toast.error("Error deleting note");
		}
	};

	const openComposeMail = (type, data = null) => {
		let newData = {
			to:
				type === "new"
					? selectedContact?.email || ""
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
					? `\n\n------------------\nForwarded message:\nFrom: ${
							data.sender
						}\nDate: ${data.created_at || data.date}\nSubject: ${
							data.subject
						}\n\n${data.body}`
					: `\n\n------------------\nOn ${
							data.created_at || data.date
						}, ${data.sender} wrote:\n${data.body}`
				: "",
			id: type === "draft" ? data.id : null,
		};
		setComposeMailData(newData);
		setComposeMailAttachments([]); // Reset attachments
		setShowComposeMail(true);
		setIsMinimized(false);
	};

	const handleComposeMailChange = (field, value) =>
		setComposeMailData((prev) => ({ ...prev, [field]: value }));

	const handleComposeMailFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);
			setComposeMailAttachments((prev) => [...prev, ...newFiles]);
		}
		if (composeFileRef.current) composeFileRef.current.value = "";
	};

	const removeComposeMailAttachment = (index) => {
		setComposeMailAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSendEmail = async () => {
		if (!composeMailData.to) return toast.warn("Recipient Required");
		try {
			let response;
			if (composeMailAttachments.length > 0) {
				const formData = new FormData();
				formData.append("subject", composeMailData.subject);
				formData.append("sender", "Current User");
				formData.append("recipient", composeMailData.to);
				formData.append("cc", composeMailData.cc);
				formData.append("bcc", composeMailData.bcc);
				formData.append("body", composeMailData.body);
				formData.append("type", "outbound");
				composeMailAttachments.forEach((file) => {
					formData.append("files", file);
				});
				response = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}/emails/with-attachments`,
					{
						method: "POST",
						body: formData,
					},
				);
			} else {
				response = await fetch(
					`${BASE_URL_SER}/tickets/${ticketId}/emails`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							subject: composeMailData.subject,
							sender: "Current User",
							recipient: composeMailData.to,
							cc: composeMailData.cc,
							bcc: composeMailData.bcc,
							body: composeMailData.body,
							type: "outbound",
						}),
					},
				);
			}
			if (response.ok) {
				const sentEmail = await response.json();
				setEmailInteractions([sentEmail, ...emailInteractions]);
				if (composeMailData.id) handleDeleteDraft(composeMailData.id);
				setShowComposeMail(false);
				setActiveEmailTab("interactions");
				setSelectedEmailInteraction(null);
				setComposeMailAttachments([]);
				toast.success("Email sent successfully");
			} else {
				const err = await response.json();
				toast.error(
					"Failed to send: " + (err.message || "Unknown error"),
				);
			}
		} catch (e) {
			console.error(e);
			toast.error("Failed to send email");
		}
	};

	const handleSaveDraft = () => {
		const draft = {
			...composeMailData,
			id: composeMailData.id || Date.now(),
			savedAt: new Date().toLocaleString(),
		};
		setEmailDrafts(
			composeMailData.id
				? emailDrafts.map((d) => (d.id === draft.id ? draft : d))
				: [draft, ...emailDrafts],
		);
		localStorage.setItem(
			`ticket_${ticketId}_drafts`,
			JSON.stringify(
				composeMailData.id
					? emailDrafts.map((d) => (d.id === draft.id ? draft : d))
					: [draft, ...emailDrafts],
			),
		);
		setShowComposeMail(false);
		setActiveEmailTab("drafts");
		setComposeMailAttachments([]);
		toast.info("Draft saved");
	};

	const handleDeleteDraft = (id) => {
		setEmailDrafts(emailDrafts.filter((d) => d.id !== id));
		localStorage.setItem(
			`ticket_${ticketId}_drafts`,
			JSON.stringify(emailDrafts.filter((d) => d.id !== id)),
		);
		toast.info("Draft deleted");
	};

	return (
		<div className="opp-edit-container">
			{/* Opportunity Details Header Section */}
			<div className="opp-edit-header-container">
				<h1 className="opp-edit-heading">Opportunity Details</h1>
				<div className="opp-edit-header-container-buttons">
					{!isEditMode ? (
						<>
							<button
								className="opp-edit-edit-button"
								onClick={() => {
									setIsEditMode(true);
									setErrors({});
								}}
							>
								<SquarePen
									size={15}
									strokeWidth={1}
									color="#dcf2f1"
								/>
								Edit
							</button>
							<div
								className="opp-edit-options-button-container"
								ref={actionRef}
							>
								<button
									className="opp-edit-options-button"
									onClick={() =>
										setMenuModal((prevState) => !prevState)
									}
								>
									⁞
								</button>
								{/* Menu Modal */}
								{menuModal && (
									<div className="opp-edit-menu-modal-container">
										<ul className="opp-edit-menu-modal-list">
											<li>Submit for Approval</li>
											<li>Delete</li>
											<li>Print Preview</li>
											<li>Change Owner</li>
										</ul>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<button
								className="opp-edit-save-button"
								onClick={handleSave}
							>
								<Save
									size={17}
									strokeWidth={1}
									color="#dcf2f1"
								/>
								{loading ? "Saving..." : "Save"}
							</button>
							<button
								className="opp-edit-cancel-button"
								onClick={() => {
									fetchOpportunity(); // Reset form data
									setErrors({});
									setIsEditMode(false);
								}}
							>
								<CircleX
									size={17}
									strokeWidth={1}
									color="#0f1035"
								/>
								Cancel
							</button>
						</>
					)}
				</div>
			</div>

			{/* Overview and Activity Tab Section */}
			<div className="opp-edit-tabs-container">
				<div className="opp-edit-tabs-container-left">
					<button
						className={`opp-edit-tab ${
							activeTab === "overview" ? "active" : ""
						}`}
						onClick={() => setActiveTab("overview")}
					>
						Overview
					</button>
					<button
						className={`opp-edit-tab ${
							activeTab === "interactions" ? "active" : ""
						}`}
						onClick={() => setActiveTab("interactions")}
					>
						Interactions
					</button>
					<button
						className={`opp-edit-tab ${
							activeTab === "notes" ? "active" : ""
						}`}
						onClick={() => setActiveTab("notes")}
					>
						Notes
					</button>
					<button
						className={`opp-edit-tab ${
							activeTab === "activities" ? "active" : ""
						}`}
						onClick={() => setActiveTab("activities")}
					>
						Activities
					</button>
					<button
						className={`opp-edit-tab ${
							activeTab === "attachments" ? "active" : ""
						}`}
						onClick={() => setActiveTab("attachments")}
					>
						Attachments
					</button>
				</div>

				{activeTab === "interactions" && (
					<div className="opp-edit-tabs-container-right">
						<button
							className="opp-edit-email-button"
							onClick={() => openComposeMail("new")}
						>
							<Mail size={17} strokeWidth={1} color="#0f1035" />
							Compose Mail
						</button>
					</div>
				)}

				{activeTab === "notes" && (
					<div className="opp-edit-tabs-container-right">
						<button
							className="opp-edit-add-note-button"
							onClick={() => setShowNoteModal(true)}
						>
							<Plus size={18} strokeWidth={1} color="#0f1035" />
							Add Note
						</button>
					</div>
				)}

				{activeTab === "activities" && (
					<div className="opp-edit-tabs-container-right">
						<button
							className="opp-edit-call-button"
							onClick={() =>
								navigate(
									"/activitymanagement/phonecalls/create",
								)
							}
						>
							<Phone size={17} strokeWidth={1} color="#0f1035" />
							Add Call
						</button>
						<button
							className="opp-edit-task-button"
							onClick={() =>
								navigate("/activitymanagement/tasks/create")
							}
						>
							<ListChecks
								size={17}
								strokeWidth={1}
								color="#0f1035"
							/>
							Add Task
						</button>
						<button
							className="opp-edit-meeting-button"
							onClick={() =>
								navigate("/activitymanagement/meetings/create")
							}
						>
							<LaptopMinimal
								size={17}
								strokeWidth={1}
								color="#0f1035"
							/>
							Plan Meeting
						</button>
					</div>
				)}

				{activeTab === "attachments" && (
					<div className="opp-edit-tabs-container-right">
						<button
							className="opp-edit-attach-button"
							type="button"
							onClick={() =>
								document
									.getElementById("attachments-input")
									.click()
							}
						>
							<Paperclip
								size={15}
								strokeWidth={1}
								color="#0f1035"
							/>
							Attach
						</button>
						<input
							id="attachments-input"
							type="file"
							multiple
							hidden
							onChange={handleAttachmentUpload}
						/>
					</div>
				)}
			</div>

			{activeTab === "overview" && (
				<>
					{/* Opportunity Information Container */}
					<div className="opp-edit-form-container">
						<h1 className="opp-edit-form-heading">
							Opportunity Information
						</h1>
						<div className="opp-edit-form">
							<form>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group opportunityOwnerId">
										<label htmlFor="opportunityOwnerId">
											Opportunity Owner *
										</label>
										<input
											type="text"
											placeholder="Select Opportunity Owner"
											value={getOwnerDisplayName()}
											disabled
										/>
										{getError("opportunityOwnerId") && (
											<div className="field-error">
												{getError("opportunityOwnerId")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group name">
										<label htmlFor="name">
											Opportunity Name *
										</label>
										<input
											type="text"
											placeholder="Enter Opportunity Name"
											id="name"
											value={formData.name || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											disabled={!isEditMode}
										/>
										{getError("name") && (
											<div className="field-error">
												{getError("name")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group accountId">
										<label htmlFor="accountId">
											Account Name *
										</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Account"
												value={
													accounts.find(
														(acc) =>
															formData.accountId ===
															acc.accountId,
													)?.name || ""
												}
												disabled
											/>
										) : (
											<select
												id="accountId"
												value={formData.accountId || ""}
												onChange={handleChange}
											>
												<option value="">
													Select Account
												</option>
												{accounts.map((acc) => (
													<option
														key={acc.accountId}
														value={acc.accountId}
													>
														{acc.name}
													</option>
												))}
											</select>
										)}
										{getError("accountId") && (
											<div className="field-error">
												{getError("accountId")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group primaryContactId">
										<label htmlFor="primaryContactId">
											Primary Contact *
										</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Primary Contact"
												value={(() => {
													const selectedContact =
														availableContacts.find(
															(c) =>
																c.contactId ===
																formData.primaryContactId,
														);
													return selectedContact
														? `${selectedContact.firstName} ${selectedContact.lastName}`
														: "N/A";
												})()}
												disabled
											/>
										) : (
											<select
												id="primaryContactId"
												value={
													formData.primaryContactId ||
													""
												}
												onChange={handleChange}
											>
												<option value="">
													Select Contact
												</option>
												{accounts
													.find(
														(acc) =>
															acc.accountId ===
															formData.accountId,
													)
													?.contacts?.sort((a, b) =>
														`${a.firstName} ${a.lastName}`.localeCompare(
															`${b.firstName} ${b.lastName}`,
														),
													)
													.map((contact) => (
														<option
															key={
																contact.contactId
															}
															value={
																contact.contactId
															}
														>
															{contact.firstName}{" "}
															{contact.lastName}
															{contact.isPrimary
																? " (Primary)"
																: ""}
														</option>
													))}
											</select>
										)}
										{getError("primaryContactId") && (
											<div className="field-error">
												{getError("primaryContactId")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group startDate">
										<label htmlFor="startDate">
											Start Date *
										</label>
										<input
											type="date"
											placeholder="Select Start Date"
											id="startDate"
											value={
												formData.startDate &&
												!isNaN(
													new Date(
														formData.startDate,
													).getTime(),
												)
													? new Date(
															formData.startDate,
														)
															.toISOString()
															.split("T")[0]
													: ""
											}
											onChange={(e) =>
												setFormData({
													...formData,
													startDate: e.target.value,
												})
											}
											disabled={!isEditMode}
										/>
										{getError("startDate") && (
											<div className="field-error">
												{getError("startDate")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group endDate">
										<label htmlFor="endDate">
											End Date *
										</label>
										<input
											type="date"
											placeholder="Select End Date"
											id="endDate"
											value={
												formData.endDate &&
												!isNaN(
													new Date(
														formData.endDate,
													).getTime(),
												)
													? new Date(formData.endDate)
															.toISOString()
															.split("T")[0]
													: ""
											}
											min={
												formData.startDate &&
												!isNaN(
													new Date(
														formData.startDate,
													).getTime(),
												)
													? new Date(
															formData.startDate,
														)
															.toISOString()
															.split("T")[0]
													: ""
											}
											onChange={(e) =>
												setFormData({
													...formData,
													endDate: e.target.value,
												})
											}
											disabled={!isEditMode}
										/>
										{getError("endDate") && (
											<div className="field-error">
												{getError("endDate")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group stage">
										<label htmlFor="stage">Stage *</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Stage"
												id="stage"
												value={
													stages.find(
														(s) =>
															s.value ===
															formData.stage,
													)
														? stages.find(
																(s) =>
																	s.value ===
																	formData.stage,
															).label
														: ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														stage: e.target.value,
													})
												}
												disabled
											/>
										) : (
											<select
												id="stage"
												value={formData.stage || ""}
												onChange={handleChange} // ← use handleChange
											>
												<option value="">
													Select Stage
												</option>
												{stages.map((item) => (
													<option
														key={item.value}
														value={item.value}
													>
														{item.label}
													</option>
												))}
											</select>
										)}
										{getError("stage") && (
											<div className="field-error">
												{getError("stage")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group amount">
										<label htmlFor="amount">Amount</label>
										<input
											type="text"
											placeholder="Enter Amount"
											id="amount"
											value={formData.amount || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													amount: e.target.value,
												})
											}
											disabled={!isEditMode}
										/>
										{getError("amount") && (
											<div className="field-error">
												{getError("amount")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group status">
										<label htmlFor="status">Status *</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Status"
												id="status"
												value={
													statuses.find(
														(s) =>
															s.value ===
															formData.status,
													)
														? statuses.find(
																(s) =>
																	s.value ===
																	formData.status,
															).label
														: ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														status: e.target.value,
													})
												}
												disabled
											/>
										) : (
											<select
												id="status"
												value={formData.status || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														status: e.target.value,
													})
												}
											>
												<option value="">
													Select Status
												</option>
												{statuses.map((item) => (
													<option
														key={item.value}
														value={item.value}
													>
														{item.label}
													</option>
												))}
											</select>
										)}
										{getError("status") && (
											<div className="field-error">
												{getError("status")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group leadSource">
										<label htmlFor="leadSource">
											Lead Source
										</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Lead Source"
												id="leadSource"
												value={
													leadSources.find(
														(s) =>
															s.value ===
															formData.leadSource,
													)
														? leadSources.find(
																(s) =>
																	s.value ===
																	formData.leadSource,
															).label
														: ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														leadSource:
															e.target.value,
													})
												}
												disabled
											/>
										) : (
											<select
												id="leadSource"
												value={
													formData.leadSource || ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														leadSource:
															e.target.value,
													})
												}
											>
												<option value="">
													Select Lead Source
												</option>
												{leadSources.map((item) => (
													<option
														key={item.value}
														value={item.value}
													>
														{item.label}
													</option>
												))}
											</select>
										)}
										{getError("leadSource") && (
											<div className="field-error">
												{getError("leadSource")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group probability">
										<label htmlFor="probability">
											Probability %
										</label>
										<input
											type="number"
											id="probability"
											placeholder="Enter Probability"
											value={formData.probability ?? ""}
											onChange={handleChange} // ← also use handleChange
											disabled={!isEditMode}
											min={0}
											max={100}
										/>
										{getError("probability") && (
											<div className="field-error">
												{getError("probability")}
											</div>
										)}
									</div>
									<div className="opp-edit-form-group type">
										<label htmlFor="type">Type</label>
										{!isEditMode ? (
											<input
												type="text"
												placeholder="Select Type"
												id="type"
												value={
													types.find(
														(s) =>
															s.value ===
															formData.type,
													)
														? types.find(
																(s) =>
																	s.value ===
																	formData.type,
															).label
														: ""
												}
												onChange={(e) =>
													setFormData({
														...formData,
														type: e.target.value,
													})
												}
												disabled
											/>
										) : (
											<select
												id="type"
												value={formData.type || ""}
												onChange={(e) =>
													setFormData({
														...formData,
														type: e.target.value,
													})
												}
											>
												<option value="">
													Select Type
												</option>
												{types.map((item) => (
													<option
														key={item.value}
														value={item.value}
													>
														{item.label}
													</option>
												))}
											</select>
										)}
										{getError("type") && (
											<div className="field-error">
												{getError("type")}
											</div>
										)}
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group description">
										<label htmlFor="description">
											Description
										</label>
										<textarea
											placeholder="Add description here..."
											id="description"
											value={formData.description || ""}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											disabled={!isEditMode}
										/>
										{getError("description") && (
											<div className="field-error">
												{getError("description")}
											</div>
										)}
									</div>
								</div>

								<span className="required-field-text">
									* Required Field
								</span>
							</form>
						</div>
					</div>

					{/* Contact Roles Container */}
					<div className="opp-edit-form-container">
						<h1 className="opp-edit-form-heading">Contact Roles</h1>
						<div className="opp-edit-form">
							<form>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group contactName">
										<label htmlFor="contactName">
											Contact Name
										</label>
										<input
											type="text"
											placeholder="Enter Contact Name"
											id="contactName"
											value={
												selectedContact
													? `${selectedContact.firstName} ${selectedContact.lastName}`
													: ""
											}
											disabled
										/>
									</div>
									<div className="opp-edit-form-group contactEmail">
										<label htmlFor="contactEmail">
											Contact Email
										</label>
										<input
											type="email"
											placeholder="e.g. example@gmail.com"
											id="contactEmail"
											value={selectedContact?.email || ""}
											disabled
										/>
									</div>
								</div>
								<div className="opp-edit-form-row">
									<div className="opp-edit-form-group accountName">
										<label htmlFor="accountName">
											Account Name
										</label>
										<input
											type="text"
											placeholder="Enter Account Name"
											id="accountName"
											value={
												accounts.find(
													(acc) =>
														acc.accountId ===
														formData.accountId,
												)?.name || ""
											}
											disabled
										/>
									</div>
									<div className="opp-edit-form-group contactphone">
										<label htmlFor="contactphone">
											Contact Phone
										</label>
										<input
											type="tel"
											placeholder="e.g. +12345 67890"
											id="contactphone"
											value={selectedContact?.phone || ""}
											disabled
										/>
									</div>
								</div>
							</form>
						</div>
					</div>

					{/* Stage History */}
					<div className="opp-edit-table-container">
						<h1 className="opp-edit-table-heading">
							Stage History
						</h1>
						<div className="opp-edit-table-area">
							<div className="opp-edit-table-box">
								<table className="opp-edit-table">
									<thead>
										<tr>
											<th>Stage</th>
											<th>Probability</th>
											<th>Amount</th>
											<th>Expected Revenue</th>
											<th>Closing Date</th>
											<th>Modified By</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>1</td>
											<td>2</td>
											<td>3</td>
											<td>4</td>
											<td>5</td>
											<td>6</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === "interactions" && (
				<>
					<div className="opp-edit-form-container">
						<h1 className="opp-edit-form-heading">Email</h1>
						<div className="opp-edit-email-container">
							<div className="opp-edit-email-tabs-container">
								<div className="opp-edit-tabs-left">
									<button
										className={`opp-edit-email-tab-btn ${
											activeEmailTab === "interactions"
												? "active"
												: ""
										}`}
										onClick={() => {
											setActiveEmailTab("interactions");
											setSelectedEmailInteraction(null);
										}}
									>
										Email Interactions
									</button>
									<button
										className={`opp-edit-email-tab-btn ${
											activeEmailTab === "drafts"
												? "active"
												: ""
										}`}
										onClick={() => {
											setActiveEmailTab("drafts");
											setSelectedEmailInteraction(null);
										}}
									>
										Email Drafts ({emailDrafts.length})
									</button>
								</div>
							</div>

							<div className="opp-edit-email-list-container">
								{activeEmailTab === "interactions" &&
									!selectedEmailInteraction && (
										<div className="opp-edit-table-box">
											<table className="opp-edit-table">
												<thead>
													<tr>
														<th>Channel Name</th>
														<th>Subject</th>
														<th>Date & Time</th>
														<th>Sender Name</th>
														<th>
															Recipients Email
														</th>
													</tr>
												</thead>
												<tbody>
													{emailInteractions.length ===
													0 ? (
														<tr>
															<td
																colSpan="5"
																className="opp-edit-empty-state"
															>
																No Interactions
																Found
															</td>
														</tr>
													) : (
														emailInteractions.map(
															(email) => (
																<tr
																	key={
																		email.id
																	}
																	className="opp-edit-email-row"
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
																	<td className="opp-edit-subject-text">
																		{
																			email.subject
																		}
																	</td>
																	<td>
																		{new Date(
																			email.created_at ||
																				email.receivedAt ||
																				Date.now(),
																		).toLocaleString()}
																	</td>
																	<td>
																		{
																			email.sender
																		}
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
										<div className="opp-edit-email-detail-view">
											<div>
												<button
													onClick={() =>
														setSelectedEmailInteraction(
															null,
														)
													}
													className="email-back-btn"
												>
													<ArrowLeft size={16} /> Back
													to List
												</button>
											</div>
											<div className="email-detail-header-box">
												<div className="email-header-top">
													<div className="email-sender-group">
														<div className="email-avatar-circle">
															{selectedEmailInteraction.sender
																? selectedEmailInteraction.sender
																		.charAt(
																			0,
																		)
																		.toUpperCase()
																: "U"}
														</div>
														<div>
															<div className="email-sender-name">
																{
																	selectedEmailInteraction.sender
																}
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
													{
														selectedEmailInteraction.subject
													}
												</div>
											</div>
											<div className="email-body-content">
												{selectedEmailInteraction.body ||
													selectedEmailInteraction.content}
											</div>
											{selectedEmailInteraction.attachments &&
												selectedEmailInteraction
													.attachments.length > 0 && (
													<div className="email-attachments-section">
														<strong>
															Attachments:
														</strong>
														<ul className="email-attachments-list">
															{selectedEmailInteraction.attachments.map(
																(file, idx) => (
																	<li
																		key={
																			idx
																		}
																		className="email-attachment-item"
																	>
																		<Paperclip
																			size={
																				12
																			}
																		/>{" "}
																		{file.file_name ||
																			file.name ||
																			"Attachment"}
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
														<Reply size={14} />{" "}
														Reply
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
														<Forward size={14} />{" "}
														Forward
													</button>
												</div>
											</div>
										</div>
									)}
								{activeEmailTab === "drafts" && (
									<div className="opp-edit-table-box">
										<table className="opp-edit-table">
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
														className="opp-email-row"
													>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
															className="opp-subject-text"
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
															{draft.to}
														</td>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
														>
															{draft.savedAt}
														</td>
														<td className="cell-icon-action">
															<button
																className="icon-btn"
																onClick={(
																	e,
																) => {
																	e.stopPropagation();
																	handleDeleteDraft(
																		draft.id,
																	);
																}}
															>
																<Trash2
																	size={16}
																	strokeWidth={
																		1
																	}
																/>
															</button>
														</td>
													</tr>
												))}
												{emailDrafts.length === 0 && (
													<tr>
														<td
															colSpan="4"
															className="opp-edit-empty-state"
														>
															No Drafts Found
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === "notes" && (
				<>
					{/* Notes Container */}
					<div className="opp-edit-notes-container">
						<h1 className="opp-edit-notes-heading">Notes</h1>
						<div className="opp-edit-notes-form">
							{notes.length > 0 ? (
								<ul className="opp-edit-note-box-list">
									{notes.map((note) => (
										<li
											key={note.id}
											className="opp-edit-note-item"
										>
											<div className="opp-edit-note-text">
												{note.text}
											</div>
											<div className="opp-edit-note-footer">
												<div className="opp-edit-note-meta">
													<User size={12} />{" "}
													{note.author}
													<span
														style={{
															margin: "0 5px",
														}}
													>
														•
													</span>
													{new Date(
														note.createdAt,
													).toLocaleString("en-GB")}
												</div>
												<button
													className="opp-edit-note-delete-btn"
													onClick={() =>
														handleDeleteNote(
															note.id,
														)
													}
													title="Delete Note"
												>
													<Trash2
														size={14}
														strokeWidth={1}
													/>
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								<div className="opp-edit-notes-empty">
									No Note Found
								</div>
							)}
						</div>
					</div>
				</>
			)}

			{activeTab === "activities" && (
				<>
					{/* Activities Section */}
					<div className="opp-edit-activity-table-container">
						<table className="opp-edit-activity-table">
							<thead>
								<tr>
									<th>Activities</th>
									<th>Date & Time</th>
									<th>Type</th>
									<th>Last Interaction</th>
								</tr>
							</thead>
							<tbody>
								{activities.length === 0 ? (
									<tr>
										<td
											colSpan="9"
											className="opp-edit-activity-empty-state"
										>
											<p>No Activities Found</p>
										</td>
									</tr>
								) : (
									activities.map((activity) => (
										<tr>
											<td>1</td>
											<td>2</td>
											<td>3</td>
											<td>4</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "attachments" && (
				<>
					{/* Attachments Section */}
					<div className="opp-edit-table-container">
						<h1 className="opp-edit-table-heading">Attachments</h1>
						<div className="opp-edit-table-area">
							<div className="opp-edit-table-box">
								<table className="opp-edit-table">
									<thead>
										<tr>
											<th>File Name</th>
											<th>Date Added</th>
											<th>File Size</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{attachments.length === 0 ? (
											<tr>
												<td
													colSpan="4"
													className="opp-edit-empty-state"
												>
													No Attachments Found
												</td>
											</tr>
										) : (
											attachments.map((file) => (
												<tr key={file.id}>
													<td>
														<a
															href={file.fileUrl}
															target="_blank"
														>
															{file.fileName}
														</a>
													</td>
													<td>
														{new Date(
															file.uploadedAt,
														).toLocaleDateString(
															"en-GB",
														)}
													</td>
													<td>
														{(
															file.fileSize / 1024
														).toFixed(1)}{" "}
														KB
													</td>
													<td>
														<button
															className="opp-edit-attachment-delete-btn"
															title="Delete"
															onClick={() =>
																handleDeleteAttachment(
																	file.id,
																)
															}
														>
															<Trash2
																size={18}
																strokeWidth={1}
															/>
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
				</>
			)}

			{/* Compose Mail Window */}
			{showComposeMail && (
				<div
					className={`opp-edit-compose-mail-window ${
						isMinimized ? "minimized" : ""
					}`}
				>
					<div
						className="opp-edit-compose-mail-header"
						onClick={() => setIsMinimized(!isMinimized)}
					>
						<h2 className="opp-edit-compose-title">Send Email</h2>
						<div className="opp-edit-compose-controls">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsMinimized(!isMinimized);
								}}
								className="opp-edit-compose-control-btn"
							>
								<Minimize2 size={16} color="#666" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowComposeMail(false);
								}}
								className="opp-edit-compose-control-btn"
							>
								<X size={16} color="#666" />
							</button>
						</div>
					</div>
					{!isMinimized && (
						<>
							<div className="opp-edit-compose-body">
								<div className="opp-edit-compose-field">
									<label>To</label>
									<input
										value={composeMailData.to}
										onChange={(e) =>
											handleComposeChange(
												"to",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="opp-edit-compose-field">
									<label>CC</label>
									<input
										value={composeMailData.cc}
										onChange={(e) =>
											handleComposeChange(
												"cc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="opp-edit-compose-field">
									<label>BCC</label>
									<input
										value={composeMailData.bcc}
										onChange={(e) =>
											handleComposeChange(
												"bcc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="opp-edit-compose-field">
									<label>Subject</label>
									<input
										value={composeMailData.subject}
										onChange={(e) =>
											handleComposeChange(
												"subject",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="opp-edit-compose-editor">
									<textarea
										value={composeMailData.body}
										onChange={(e) =>
											handleComposeChange(
												"body",
												e.target.value,
											)
										}
									/>
								</div>
								{composeAttachments.length > 0 && (
									<div className="opp-edit-compose-attachments">
										{composeAttachments.map((file, idx) => (
											<div
												key={idx}
												className="opp-edit-compose-attachment-chip"
											>
												<Paperclip size={12} />
												<span className="opp-edit-compose-attachment-name">
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
							<div className="opp-edit-compose-footer">
								<div className="opp-edit-compose-tools">
									<input
										type="file"
										multiple
										ref={composeFileRef}
										style={{ display: "none" }}
										onChange={handleComposeFileSelect}
									/>
									<Paperclip
										size={24}
										className="opp-edit-compose-tool-icon"
										onClick={() =>
											composeFileRef.current.click()
										}
									/>
									<FileText
										size={24}
										className="opp-edit-compose-tool-icon"
										onClick={() => {
											setTemplateContext("emailCompose");
											setShowTemplateSelectModal(true);
										}}
									/>
									<Trash2
										size={24}
										className="opp-edit-compose-tool-icon"
										onClick={() => setShowCompose(false)}
									/>
								</div>
								<div className="opp-edit-compose-actions">
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

			{/* Add Note Modal */}
			{showNoteModal && (
				<div className="opp-edit-note-modal-overlay">
					<div className="opp-edit-note-modal-content medium">
						<div className="opp-edit-note-modal-header">
							<h3 className="opp-edit-note-modal-title">
								Add Note
							</h3>
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="opp-edit-note-modal-close-btn"
							>
								<X size={20} strokeWidth={1} color="#0f1035" />
							</button>
						</div>
						<div className="opp-edit-note-modal-body">
							<textarea
								placeholder="Enter your note here..."
								value={newNote}
								onChange={(e) => setNewNote(e.target.value)}
								className="opp-edit-note-textarea"
							/>
						</div>
						<div className="opp-edit-note-modal-footer">
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="opp-edit-note-btn-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleAddNote}
								className="opp-edit-note-btn-primary"
							>
								Save Note
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedOpportunity;
