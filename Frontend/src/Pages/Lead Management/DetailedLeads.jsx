import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import {
	Paperclip,
	SquarePen,
	Save,
	CircleX,
	Plus,
	UserRound,
	Upload,
	ChevronDown,
	Repeat,
	Phone,
	ListChecks,
	Mail,
	LaptopMinimal,
	Trash2,
	X,
	User,
	ListTodo,
	Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./DetailedLeads.css";

const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;

// Image size limits
const MIN_IMAGE_SIZE = 250 * 1024; // 250 KB
const MAX_IMAGE_SIZE = 600 * 1024; // 600 KB

const DetailedLeads = () => {
	const [formData, setFormData] = useState({
		leadId: "",
		leadOwnerId: "",
		firstName: "",
		lastName: "",
		company: "",
		title: "",
		dateOfBirth: "",
		notes: "",
		email: "",
		secondaryEmail: "",
		phoneNumber: "",
		fax: "",
		website: "",
		addressLine1: "",
		addressLine2: "",
		postalCode: "",
		budget: "",
		potentialRevenue: "",
		leadSource: "",
		leadStatus: "",
		interestLevel: "",
		country: "",
		state: "",
		city: "",
		interactionType: "",
		interactionOutcome: "",
		interactionDate: "",
		interactionNote: "",
	});
	const [menuModal, setMenuModal] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [loading, setLoading] = useState(false);
	const [activities, setActivities] = useState([]);
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [leadImage, setLeadImage] = useState(null);
	const [leadImageName, setLeadImageName] = useState("");
	const [leadImageFile, setLeadImageFile] = useState(null);
	const [activeTab, setActiveTab] = useState("overview");
	const [errors, setErrors] = useState({});
	const [showConvertModal, setShowConvertModal] = useState(false);
	const [convertData, setConvertData] = useState({
		accountId: "",
		contactId: "",
	});
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

	const navigate = useNavigate();
	const { user } = useAuth();
	const actionRef = useRef(null);
	const { id } = useParams();

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const fetchLead = async () => {
		try {
			const res = await fetch(`${BASE_URL_LM}/leads/${id}`);
			if (!res.ok) {
				toast.error("Failed to fetch lead");
				return;
			}
			const data = await res.json();
			console.log(data);
			setFormData((prev) => ({
				...prev,
				...Object.fromEntries(
					Object.entries(data).map(([key, value]) => [
						key,
						value ?? "", // 👈 convert null/undefined → ""
					]),
				),
			}));
			// ✅ IMPORTANT
			if (data.leadImageUrl) {
				setLeadImage(data.leadImageUrl);
				setLeadImageName(data.leadImageUrl.split("/").pop());
			}
			setAttachments(data.leadAttachments || []);
		} catch (err) {
			console.error("Error fetching lead:", err);
			toast.error("Error fetching lead");
		}
	};

	useEffect(() => {
		setCountries(Country.getAllCountries());
		fetchLead();
	}, []);

	const handleSave = async (type) => {
		try {
			setLoading(true);

			if (errors.leadImage) {
				toast.error("Please fix image upload errors");
				return;
			}

			const payload = new FormData();

			// 🔹 Required
			payload.append("leadOwnerId", user.id);
			payload.append("firstName", formData.firstName);
			payload.append("lastName", formData.lastName);
			payload.append("company", formData.company);
			payload.append("email", formData.email);

			// 🔹 Optional strings
			if (formData.secondaryEmail)
				payload.append("secondaryEmail", formData.secondaryEmail);
			if (formData.phoneNumber)
				payload.append("phoneNumber", formData.phoneNumber);
			if (formData.fax) payload.append("fax", formData.fax);
			if (formData.website) payload.append("website", formData.website);
			if (formData.notes) payload.append("notes", formData.notes);

			// 🔹 Numbers
			if (formData.budget) payload.append("budget", formData.budget);
			if (formData.potentialRevenue)
				payload.append("potentialRevenue", formData.potentialRevenue);

			// 🔹 Enums
			if (formData.leadSource)
				payload.append("leadSource", formData.leadSource);
			if (formData.leadStatus)
				payload.append("leadStatus", formData.leadStatus ?? "OPEN");
			if (formData.interestLevel)
				payload.append("interestLevel", formData.interestLevel);

			// 🔹 Location (names — ✅ correct)
			if (formData.country) payload.append("country", formData.country);
			if (formData.state) payload.append("state", formData.state);
			if (formData.city) payload.append("city", formData.city);
			if (formData.addressLine1)
				payload.append("addressLine1", formData.addressLine1);
			if (formData.addressLine2)
				payload.append("addressLine2", formData.addressLine2);
			if (formData.postalCode)
				payload.append("postalCode", formData.postalCode);

			// 🔹 Date
			if (formData.dateOfBirth) {
				payload.append(
					"dateOfBirth",
					new Date(formData.dateOfBirth).toISOString(),
				);
			}

			// 🔹 Image
			if (leadImageFile) {
				payload.append("leadImage", leadImageFile);
			}

			// Single request containing both parent and children
			const response = await fetch(`${BASE_URL_LM}/leads/${id}`, {
				method: "PATCH",
				body: payload, // ✅ FormData
			});

			if (!response.ok) {
				// try parse validation errors (400)
				const errorPayload = await response.json().catch(() => null);

				if (errorPayload && Array.isArray(errorPayload.errors)) {
					// Build map: { path: [msg1, msg2] }
					const map = {};
					errorPayload.errors.forEach((err) => {
						const key = err.path || "form";
						if (!map[key]) map[key] = [];
						map[key].push(err.msg || "Invalid value");
					});
					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				// fallback generic error
				toast.error("Failed to update lead");
				return;
			}

			// success: clear errors & handle navigation
			setErrors({});

			// Success
			toast.success("Lead updated successfully!");
			setIsEditMode(false);
			fetchLead(); // Refresh data after save
		} catch (error) {
			console.error("Error updating lead:", err);
			toast.error("Error updating lead");
		} finally {
			setLoading(false);
		}
	};

	// --- File Handling (Preview Only) ---
	const handleFileChange = (event) => {
		const file = event.target.files[0];

		// Clear previous image error
		setErrors((prev) => {
			const updated = { ...prev };
			delete updated.leadImage;
			return updated;
		});

		if (!file) return;

		// 1️⃣ Validate type
		const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
		if (!validImageTypes.includes(file.type)) {
			setErrors((prev) => ({
				...prev,
				leadImage: "Only JPG and PNG images are allowed",
			}));
			return;
		}

		// 2️⃣ Validate size range
		if (file.size < MIN_IMAGE_SIZE || file.size > MAX_IMAGE_SIZE) {
			setErrors((prev) => ({
				...prev,
				leadImage: "Image size must be between 250 KB and 600 KB",
			}));
			return;
		}

		// 3️⃣ Valid image → set preview
		setLeadImage(URL.createObjectURL(file));
		setLeadImageName(file.name);
		setLeadImageFile(file); // ✅ this is what we send
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

		const formData = new FormData();

		for (let file of files) {
			if (!allowedTypes.includes(file.type)) {
				toast.error(`Invalid file type: ${file.name}`);
				return;
			}

			if (file.size > 1024 * 1024) {
				toast.error(`File too large (max 1MB): ${file.name}`);
				return;
			}

			formData.append("files", file);
		}

		try {
			const res = await fetch(`${BASE_URL_LM}/leads/${id}/attachments`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				toast.error("Failed to upload files");
				return;
			}

			toast.success("Files uploaded successfully");
			fetchLead(); // Reload lead including attachments
		} catch (err) {
			toast.error("Error uploading");
		}
	};

	const handleDeleteAttachment = async (attachmentId) => {
		try {
			const res = await fetch(
				`${BASE_URL_LM}/leads/${id}/attachments/${attachmentId}`,
				{ method: "DELETE" },
			);

			if (!res.ok) {
				toast.error("Failed to delete attachment");
				return;
			}

			toast.success("Attachment deleted successfully!");
			fetchLead(); // Reload lead including files
		} catch (err) {
			console.error("Error deleting attachment:", err);
			toast.error("Error deleting attachment");
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

		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	// Handle the actual conversion after confirmation
	const handleConfirmConvert = async () => {
		try {
			setLoading(true);

			const res = await fetch(`${BASE_URL_LM}/leads/${id}/convert`, {
				method: "POST",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || "Lead conversion failed");
			}

			toast.success(
				<div>
					<div>Lead converted successfully</div>
					<div>Account: {formData.company}</div>
					<div>
						Contact: {formData.firstName} {formData.lastName}
					</div>
				</div>,
			);
			setShowConvertModal(false);

			navigate("/sales/leads");
		} catch (err) {
			console.error(err);
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			country: selected,
			state: "",
			city: "",
		});

		const countryObj = countries.find((c) => c.name === selected);
		if (countryObj) {
			setStates(State.getStatesOfCountry(countryObj.isoCode));
			setCities([]);
		} else {
			setStates([]);
			setCities([]);
		}
	};

	const handleStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({
			...formData,
			state: selectedState,
			city: "",
		});

		const countryObj = countries.find((c) => c.name === formData.country);
		const stateObj = states.find((s) => s.name === selectedState);

		if (countryObj && stateObj) {
			const cityList = City.getCitiesOfState(
				countryObj.isoCode,
				stateObj.isoCode,
			);
			setCities(cityList);
		} else {
			setCities([]);
		}
	};

	const validateIndianPinCode = async (postalCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${postalCode}`,
			);
			const data = await res.json();

			if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
				const postOffice = data[0].PostOffice[0];
				return {
					valid: true,
					district: postOffice.District,
					state: postOffice.State,
					country: postOffice.Country,
				};
			} else {
				return {
					valid: false,
					message: "Invalid PIN Code. Please select correct State.",
				};
			}
		} catch (err) {
			return {
				valid: false,
				message: "API error while validating pincode.",
			};
		}
	};

	useEffect(() => {
		if (
			formData.country === "India" &&
			(formData.postalCode || "").length === 6
		) {
			validateIndianPinCode(formData.postalCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.state.toLowerCase();

					if (!stateMatch) {
						console.warn(
							`PIN code doesn't match selected State. Expected State: ${result.state}`,
						);
					}
				} else {
					console.error(result.message);
				}
			});
		}
	}, [formData.postalCode, formData.country]);

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

	useEffect(() => {
		// Preload states when country is already set
		if (formData.country) {
			const countryObj = countries.find(
				(c) => c.name === formData.country,
			);

			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setStates(stateList);

				// Preload cities if state is already set
				if (formData.state) {
					const stateObj = stateList.find(
						(s) => s.name === formData.state,
					);
					if (stateObj) {
						const cityList = City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode,
						);
						setCities(cityList);
					}
				}
			}
		}
	}, [formData.country, formData.state, countries]);

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
		<div className="lead-edit-container">
			{/* Edit Lead Header Section */}
			<div className="lead-edit-header-container">
				<h1 className="lead-edit-heading">
					<div className="lead-edit-heading-image-container">
						{leadImage ? (
							<img
								src={leadImage}
								alt="Lead"
								className="lead-edit-heading-image-preview"
							/>
						) : (
							<UserRound
								size={50}
								strokeWidth={1}
								color="#365486"
							/>
						)}
					</div>
					{formData.firstName || ""} {formData.lastName || ""}
				</h1>
				<div className="lead-edit-header-container-buttons">
					{!isEditMode ? (
						<>
							<button
								className="lead-edit-edit-button"
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
							<button
								className="lead-edit-convert-button"
								onClick={() => {
									setConvertData({
										accountId: formData.company || "",
										contactId: `${
											formData.firstName || ""
										} ${formData.lastName || ""}`.trim(),
									});
									setShowConvertModal(true);
								}}
							>
								<Repeat
									size={17}
									strokeWidth={1}
									color="#0f1035"
								/>
								Convert
							</button>
							<div
								className="lead-edit-options-button-container"
								ref={actionRef}
							>
								<button
									className="lead-edit-options-button"
									onClick={() =>
										setMenuModal((prevState) => !prevState)
									}
								>
									⁞
								</button>
								{/* Menu Modal */}
								{menuModal && (
									<div className="lead-edit-menu-modal-container">
										<ul className="lead-edit-menu-modal-list">
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
								className="lead-edit-save-button"
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
								className="lead-edit-cancel-button"
								onClick={() => {
									fetchLead(); // Reset form data
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
			<div className="lead-edit-tabs-container">
				<div className="lead-edit-tabs-container-left">
					<button
						className={`lead-edit-tab ${
							activeTab === "overview" ? "active" : ""
						}`}
						onClick={() => setActiveTab("overview")}
					>
						Overview
					</button>
					<button
						className={`lead-edit-tab ${
							activeTab === "interactions" ? "active" : ""
						}`}
						onClick={() => setActiveTab("interactions")}
					>
						Interactions
					</button>
					<button
						className={`lead-edit-tab ${
							activeTab === "activities" ? "active" : ""
						}`}
						onClick={() => setActiveTab("activities")}
					>
						Activities
					</button>
					<button
						className={`lead-edit-tab ${
							activeTab === "attachments" ? "active" : ""
						}`}
						onClick={() => setActiveTab("attachments")}
					>
						Attachments
					</button>
				</div>

				{activeTab === "interactions" && (
					<div className="lead-edit-tabs-container-right">
						<button
							className="lead-edit-email-button"
							onClick={() => openComposeMail("new")}
						>
							<Mail size={17} strokeWidth={1} color="#0f1035" />
							Compose Mail
						</button>
					</div>
				)}

				{activeTab === "activities" && (
					<div className="lead-edit-tabs-container-right">
						<button
							className="lead-edit-call-button"
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
							className="lead-edit-task-button"
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
							className="lead-edit-meeting-button"
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
					<div className="lead-edit-tabs-container-right">
						<button
							className="lead-edit-attach-button"
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
					{/* Lead Information Container */}
					<div className="lead-edit-form-container">
						<h1 className="lead-edit-form-heading">
							Lead Information
						</h1>
						<div className="lead-edit-form">
							<form>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group leadOwnerId">
										<label htmlFor="leadOwnerId">
											Lead Owner *
										</label>
										<input
											type="text"
											id="leadOwnerId"
											value={`${user.firstName} ${user.lastName} (You)`}
											disabled
										/>
										{getError("leadOwnerId") && (
											<div className="field-error">
												{getError("leadOwnerId")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group leadId">
										<label htmlFor="leadid">
											Lead ID *
										</label>
										<input
											type="text"
											id="leadId"
											value={formData.leadId}
											disabled
										/>
										{getError("leadId") && (
											<div className="field-error">
												{getError("leadId")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group firstName">
										<label htmlFor="firstName">
											First Name *
										</label>
										<input
											type="text"
											placeholder="Enter First Name"
											id="firstName"
											value={formData.firstName}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("firstName") && (
											<div className="field-error">
												{getError("firstName")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group lastName">
										<label htmlFor="lastName">
											Last Name *
										</label>
										<input
											type="text"
											placeholder="Enter Last Name"
											id="lastName"
											value={formData.lastName}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("lastName") && (
											<div className="field-error">
												{getError("lastName")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group company">
										<label htmlFor="company">
											Company *
										</label>
										<input
											type="text"
											placeholder="Enter Company Name"
											id="company"
											value={formData.company}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("company") && (
											<div className="field-error">
												{getError("company")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group title">
										<label htmlFor="title">Title</label>
										{!isEditMode ? (
											<input
												type="text"
												value={
													formData.title === "MR"
														? "Mr."
														: formData.title ===
															  "MRS"
															? "Mrs."
															: formData.title ===
																  "MS"
																? "Ms."
																: formData.title ===
																	  "OTHERS"
																	? "Others"
																	: ""
												}
												placeholder="Select Title"
												disabled={!isEditMode}
											/>
										) : (
											<select
												id="title"
												value={formData.title}
												onChange={handleChange}
											>
												<option value="">
													Select Title
												</option>
												<option value="MR">Mr.</option>
												<option value="MRS">
													Mrs.
												</option>
												<option value="MS">Ms.</option>
												<option value="OTHERS">
													Others
												</option>
											</select>
										)}
										{getError("title") && (
											<div className="field-error">
												{getError("title")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group dateOfBirth">
										<label htmlFor="dateOfBirth">
											Date Of Birth
										</label>
										<input
											type="date"
											id="dateOfBirth"
											value={
												formData.dateOfBirth &&
												!isNaN(
													new Date(
														formData.dateOfBirth,
													).getTime(),
												)
													? new Date(
															formData.dateOfBirth,
														)
															.toISOString()
															.split("T")[0]
													: ""
											}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("dateOfBirth") && (
											<div className="field-error">
												{getError("dateOfBirth")}
											</div>
										)}
									</div>
									<div
										className="lead-edit-form-group status"
										style={{ visibility: "hidden" }}
									></div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group notes">
										<label htmlFor="notes">Notes</label>
										<textarea
											placeholder="Add notes here..."
											id="notes"
											value={formData.notes || ""}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("notes") && (
											<div className="field-error">
												{getError("notes")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-upload-image-outer-container">
										<div className="lead-edit-upload-image-inner-container">
											<div className="lead-edit-image-container">
												{leadImage ? (
													<img
														src={leadImage}
														alt="Lead"
														className="lead-edit-image-preview"
													/>
												) : (
													<UserRound
														size={50}
														strokeWidth={1}
														color="#365486"
													/>
												)}
											</div>
											<label
												htmlFor="lead-image-input"
												className="lead-edit-upload-btn"
											>
												{leadImageName ||
													"Upload Image"}
												<Upload
													size={16}
													strokeWidth={2}
													color="#365486"
												/>
											</label>
											<input
												type="file"
												id="lead-image-input"
												accept="image/*"
												hidden
												onChange={handleFileChange}
												disabled={!isEditMode}
											/>
										</div>
										{getError("leadImage") && (
											<div className="field-error">
												{getError("leadImage")}
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

					{/* Contact Information Container */}
					<div className="lead-edit-form-container">
						<h1 className="lead-edit-form-heading">
							Contact Information
						</h1>
						<div className="lead-edit-form">
							<form>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group email">
										<label htmlFor="email">
											Email ID *
										</label>
										<input
											type="email"
											placeholder="e.g. example@example.com"
											id="email"
											value={formData.email}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("email") && (
											<div className="field-error">
												{getError("email")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group secondaryEmail">
										<label htmlFor="secondaryEmail">
											Secondary Email
										</label>
										<input
											type="email"
											placeholder="e.g. example2@example2.com"
											id="secondaryEmail"
											value={formData.secondaryEmail}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("secondaryEmail") && (
											<div className="field-error">
												{getError("secondaryEmail")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group phoneNumber">
										<label htmlFor="phoneNumber">
											Phone No.
										</label>
										<input
											type="tel"
											placeholder="e.g. +12345 67890"
											id="phoneNumber"
											value={formData.phoneNumber}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("phoneNumber") && (
											<div className="field-error">
												{getError("phoneNumber")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group fax">
										<label htmlFor="fax">Fax</label>
										<input
											type="text"
											placeholder="Enter Fax Number"
											id="fax"
											value={formData.fax}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("fax") && (
											<div className="field-error">
												{getError("fax")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group website">
										<label htmlFor="website">Website</label>
										<input
											type="text"
											placeholder="e.g. www.example.com"
											id="website"
											value={formData.website}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("website") && (
											<div className="field-error">
												{getError("website")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group country">
										<label htmlFor="country">Country</label>
										{!isEditMode ? (
											<input
												type="text"
												value={formData.country ?? ""}
												placeholder="Select Country"
												disabled
											/>
										) : (
											<select
												id="country"
												name="country"
												value={formData.country}
												onChange={handleCountryChange}
												className={
													errors.country
														? "error"
														: ""
												}
											>
												<option value="">
													Select Country
												</option>
												{countries.map((country) => (
													<option
														key={country.isoCode}
														value={country.name}
													>
														{country.name}
													</option>
												))}
											</select>
										)}
										{getError("country") && (
											<div className="field-error">
												{getError("country")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group state">
										<label htmlFor="state">State</label>
										{!isEditMode ? (
											<input
												type="text"
												value={formData.state ?? ""}
												placeholder="Select State"
												disabled
											/>
										) : (
											<select
												id="state"
												name="state"
												value={formData.state}
												onChange={handleStateChange}
												disabled={!states.length}
												className={
													errors.state ? "error" : ""
												}
											>
												<option value="">
													Select State
												</option>
												{states.map((state) => (
													<option
														key={state.isoCode}
														value={state.name}
													>
														{state.name}
													</option>
												))}
											</select>
										)}
										{getError("state") && (
											<div className="field-error">
												{getError("state")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group city">
										<label htmlFor="city">City</label>
										{!isEditMode ? (
											<input
												type="text"
												value={formData.city ?? ""}
												placeholder="Select City"
												disabled
											/>
										) : (
											<select
												id="city"
												name="city"
												value={formData.city}
												onChange={handleChange}
												disabled={!cities.length}
												className={
													errors.city ? "error" : ""
												}
											>
												<option value="">
													Select City
												</option>
												{cities.map((city) => (
													<option
														key={city.name}
														value={city.name}
													>
														{city.name}
													</option>
												))}
											</select>
										)}
										{getError("city") && (
											<div className="field-error">
												{getError("city")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group addressLine1">
										<label htmlFor="addressLine1">
											Address Line 1
										</label>
										<input
											type="text"
											placeholder="Enter Address Line 1"
											id="addressLine1"
											value={formData.addressLine1}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("addressLine1") && (
											<div className="field-error">
												{getError("addressLine1")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group addressLine2">
										<label htmlFor="addressLine2">
											Address Line 2
										</label>
										<input
											type="text"
											placeholder="Enter Address Line 2"
											id="addressLine2"
											value={formData.addressLine2}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
										{getError("addressLine2") && (
											<div className="field-error">
												{getError("addressLine2")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group postalCode">
										<label htmlFor="postalCode">
											Zip/Postal Code
										</label>
										<input
											type="text"
											id="postalCode"
											value={formData.postalCode}
											onChange={handleChange}
											maxLength={6}
											placeholder="Enter Zip/Postal Code"
											className={
												errors.postalCode ? "error" : ""
											}
											disabled={!isEditMode}
										/>
										{getError("postalCode") && (
											<div className="field-error">
												{getError("postalCode")}
											</div>
										)}
									</div>
									<div
										className="lead-edit-form-group status"
										style={{ visibility: "hidden" }}
									></div>
								</div>

								<span className="required-field-text">
									* Required Field
								</span>
							</form>
						</div>
					</div>

					{/* Lead Qualification Information Container */}
					<div className="lead-edit-form-container">
						<h1 className="lead-edit-form-heading">
							Lead Qualification
						</h1>
						<div className="lead-edit-form">
							<form>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group leadSource">
										<label htmlFor="leadSource">
											Lead Source
										</label>
										{!isEditMode ? (
											<input
												type="text"
												value={
													formData.leadSource ===
													"EMAIL"
														? "Email"
														: formData.leadSource ===
															  "COLD_CALL"
															? "Cold Call"
															: formData.leadSource ===
																  "EMPLOYEE_REFERRAL"
																? "Employee Referral"
																: formData.leadSource ===
																	  "EXTERNAL_REFERRAL"
																	? "External Referral"
																	: formData.leadSource ===
																		  "SOCIAL_MEDIA"
																		? "Social Media"
																		: formData.leadSource ===
																			  "WHATSAPP"
																			? "WhatsApp"
																			: ""
												}
												placeholder="Select Lead Source"
												disabled
											/>
										) : (
											<select
												id="leadSource"
												value={formData.leadSource}
												onChange={handleChange}
											>
												<option value="">
													Select Lead Source
												</option>
												<option value="MANUAL">
													Manual
												</option>
												<option value="EMAIL">
													Email
												</option>
												<option value="COLD_CALL">
													Cold Call
												</option>
												<option value="EMPLOYEE_REFERRAL">
													Employee Referral
												</option>
												<option value="EXTERNAL_REFERRAL">
													External Referral
												</option>
												<option value="SOCIAL_MEDIA">
													Social Media
												</option>
												<option value="WHATSAPP">
													Whatsapp
												</option>
											</select>
										)}
										{getError("leadSource") && (
											<div className="field-error">
												{getError("leadSource")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group leadStatus">
										<label htmlFor="leadStatus">
											Lead Status
										</label>
										{!isEditMode ? (
											<input
												type="text"
												value={
													formData.leadStatus ===
													"OPEN"
														? "Open"
														: formData.leadStatus ===
															  "IN_PROGRESS"
															? "In Progress"
															: formData.leadStatus ===
																  "CONVERTED"
																? "Converted"
																: formData.leadStatus ===
																	  "LOST"
																	? "Lost"
																	: ""
												}
												placeholder="Select Lead Status"
												disabled
											/>
										) : (
											<select
												id="leadStatus"
												value={formData.leadStatus}
												onChange={handleChange}
											>
												<option value="">
													Select Lead Status
												</option>
												<option value="OPEN">
													Open
												</option>
												<option value="QUALIFIED">
													Qualified
												</option>
												<option value="IN_PROGRESS">
													In Progress
												</option>
												<option value="CONVERTED">
													Converted
												</option>
												<option value="LOST">
													Lost
												</option>
											</select>
										)}
										{getError("leadStatus") && (
											<div className="field-error">
												{getError("leadStatus")}
											</div>
										)}
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group interestLevel">
										<label htmlFor="interestLevel">
											Interest Level
										</label>
										{!isEditMode ? (
											<input
												type="text"
												value={
													formData.interestLevel ===
													"COLD"
														? "Cold"
														: formData.interestLevel ===
															  "WARM"
															? "Warm"
															: formData.interestLevel ===
																  "HOT"
																? "Hot"
																: ""
												}
												placeholder="Select Interest Level"
												disabled
											/>
										) : (
											<select
												id="interestLevel"
												value={formData.interestLevel}
												onChange={handleChange}
											>
												<option value="">
													Select Interest Level
												</option>
												<option value="COLD">
													Cold
												</option>
												<option value="WARM">
													Warm
												</option>
												<option value="HOT">Hot</option>
											</select>
										)}
										{getError("interestLevel") && (
											<div className="field-error">
												{getError("interestLevel")}
											</div>
										)}
									</div>
									<div className="lead-edit-form-group budget">
										<label htmlFor="budget">Budget</label>
										<input
											type="text"
											placeholder="Enter Budget"
											id="budget"
											value={formData.budget}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
									</div>
								</div>
								<div className="lead-edit-form-row">
									<div className="lead-edit-form-group potentialRevenue">
										<label htmlFor="potentialRevenue">
											Potential Revenue
										</label>
										<input
											type="text"
											placeholder="Enter Potential Revenue"
											id="potentialRevenue"
											value={formData.potentialRevenue}
											onChange={handleChange}
											disabled={!isEditMode}
										/>
									</div>
									<div
										className="lead-edit-form-group status"
										style={{ visibility: "hidden" }}
									></div>
								</div>
							</form>
						</div>
					</div>

					{/* Products Section */}
					<div className="product-section-container">
						<div className="product-section-heading">
							<h1>Products</h1>
							<button>
								Add Product
								<Plus size={15} />
							</button>
						</div>
						<div className="product-section-table">
							<div className="table-container">
								<div className="table-column">
									<h1>
										Product Name
										<ChevronDown size={15} />
									</h1>
									<p>1</p>
								</div>
								<div className="table-column">
									<h1>
										Product Code
										<ChevronDown size={15} />
									</h1>
									<p>2</p>
								</div>
								<div className="table-column">
									<h1>
										Vendor Name
										<ChevronDown size={15} />
									</h1>
									<p>3</p>
								</div>
								<div className="table-column">
									<h1>
										Unit Price
										<ChevronDown size={15} />
									</h1>
									<p>4</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === "interactions" && (
				<>
					<div className="lead-edit-form-container">
						<h1 className="lead-edit-form-heading">Email</h1>
						<div className="lead-edit-email-container">
							<div className="lead-edit-email-tabs-container">
								<div className="lead-edit-tabs-left">
									<button
										className={`lead-edit-email-tab-btn ${
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
										className={`lead-edit-email-tab-btn ${
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

							<div className="lead-edit-email-list-container">
								{activeEmailTab === "interactions" &&
									!selectedEmailInteraction && (
										<div className="lead-edit-table-box">
											<table className="lead-edit-table">
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
																className="lead-edit-empty-state"
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
																	className="lead-edit-email-row"
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
																	<td className="lead-edit-subject-text">
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
										<div className="lead-edit-email-detail-view">
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
									<div className="lead-edit-table-box">
										<table className="lead-edit-table">
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
														className="lead-email-row"
													>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
															className="lead-subject-text"
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
															className="lead-edit-empty-state"
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

			{activeTab === "activities" && (
				<>
					{/* Activities Section */}
					<div className="lead-edit-activity-table-container">
						<table className="lead-edit-activity-table">
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
											className="lead-edit-activity-empty-state"
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
					<div className="lead-edit-table-container">
						<h1 className="lead-edit-table-heading">Attachments</h1>
						<div className="lead-edit-table-area">
							<div className="lead-edit-table-box">
								<table className="lead-edit-table">
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
													className="lead-edit-empty-state"
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
															className="lead-edit-attachment-delete-btn"
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
					className={`lead-edit-compose-mail-window ${
						isMinimized ? "minimized" : ""
					}`}
				>
					<div
						className="lead-edit-compose-mail-header"
						onClick={() => setIsMinimized(!isMinimized)}
					>
						<h2 className="lead-edit-compose-title">Send Email</h2>
						<div className="lead-edit-compose-controls">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsMinimized(!isMinimized);
								}}
								className="lead-edit-compose-control-btn"
							>
								<Minimize2 size={16} color="#666" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowComposeMail(false);
								}}
								className="lead-edit-compose-control-btn"
							>
								<X size={16} color="#666" />
							</button>
						</div>
					</div>
					{!isMinimized && (
						<>
							<div className="lead-edit-compose-body">
								<div className="lead-edit-compose-field">
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
								<div className="lead-edit-compose-field">
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
								<div className="lead-edit-compose-field">
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
								<div className="lead-edit-compose-field">
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
								<div className="lead-edit-compose-editor">
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
									<div className="lead-edit-compose-attachments">
										{composeAttachments.map((file, idx) => (
											<div
												key={idx}
												className="lead-edit-compose-attachment-chip"
											>
												<Paperclip size={12} />
												<span className="lead-edit-compose-attachment-name">
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
							<div className="lead-edit-compose-footer">
								<div className="lead-edit-compose-tools">
									<input
										type="file"
										multiple
										ref={composeFileRef}
										style={{ display: "none" }}
										onChange={handleComposeFileSelect}
									/>
									<Paperclip
										size={24}
										className="lead-edit-compose-tool-icon"
										onClick={() =>
											composeFileRef.current.click()
										}
									/>
									<FileText
										size={24}
										className="lead-edit-compose-tool-icon"
										onClick={() => {
											setTemplateContext("emailCompose");
											setShowTemplateSelectModal(true);
										}}
									/>
									<Trash2
										size={24}
										className="lead-edit-compose-tool-icon"
										onClick={() => setShowCompose(false)}
									/>
								</div>
								<div className="lead-edit-compose-actions">
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

			{/* Convert Lead to Opportunity Modal */}
			{showConvertModal && (
				<div className="lead-edit-convert-modal-overlay">
					<div className="lead-edit-convert-modal">
						<h2 className="lead-edit-convert-modal-title">
							Convert Lead
						</h2>

						<div className="lead-edit-convert-modal-form">
							<div className="lead-edit-convert-field">
								<label htmlFor="accountId">Account *</label>
								<input
									id="accountId"
									value={convertData.accountId}
									onChange={(e) =>
										setConvertData({
											...convertData,
											accountId: e.target.value,
										})
									}
									placeholder="Enter Account Name"
									disabled
								/>
							</div>
							<div className="lead-edit-convert-field">
								<label htmlFor="contactId">Contact *</label>
								<input
									id="contactId"
									value={convertData.contactId}
									onChange={(e) =>
										setConvertData({
											...convertData,
											contactId: e.target.value,
										})
									}
									placeholder="Enter Contact Name"
									disabled
								/>
							</div>
							{/* <div className="lead-edit-convert-field">
								<label htmlFor="opportunityId">
									Opportunity
								</label>
								<select
									id="opportunityId"
									value={convertData.opportunityId}
									onChange={(e) =>
										setConvertData({
											...convertData,
											opportunityId: e.target.value,
										})
									}
								>
									<option value="">
										Select Existing Opportunity
									</option>
								</select>
							</div> */}
						</div>

						<div className="lead-edit-convert-modal-actions">
							<button
								className="lead-edit-convert-btn-primary"
								onClick={handleConfirmConvert}
							>
								Convert
							</button>
							<button
								className="lead-edit-convert-btn-secondary"
								onClick={() => setShowConvertModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedLeads;
