// D:\Galvinus\CRM\CRM-main\Frontend-App\src\pages\Tickets\CreateTicket.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CircleX, Save, FilePlus } from "lucide-react";
import { toast } from "react-toastify";
// 1. Import Auth Context
import { useAuth } from "../../contexts/AuthContext";
import "./CreateTicket.css";

const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

const ENUM_MAPS = {
	priority: { low: "LOW", medium: "MEDIUM", high: "HIGH", normal: "NORMAL" },
	source: {
		manual: "MANUAL",
		phone_call: "PHONE_CALL",
		web: "WEB",
		referral: "REFERRAL",
		email: "EMAIL",
		linkedin: "LINKEDIN",
		others: "OTHERS",
	},
	status: {
		open: "OPEN",
		to_be_processed: "TO_BE_PROCESSED",
		completed: "COMPLETED",
		closed: "CLOSED",
	},
};

const CreateTicket = () => {
	const navigate = useNavigate();
	// 2. Get the real logged-in user from Context
	const { user } = useAuth();

	// Data states
	const [allAccounts, setAllAccounts] = useState([]);
	const [allContacts, setAllContacts] = useState([]);

	// Popup states
	const [showContactPopup, setShowContactPopup] = useState(false);
	const [contactSearchTerm, setContactSearchTerm] = useState("");

	// Form state
	const [formData, setFormData] = useState({
		ticketOwner: "",
		accountName: "",
		primaryContact: "",
		primaryContactName: "",
		subject: "",
		source: "manual", // Default strictly to Manual
		priority: "normal",
		status: "open",
		description: "",
	});

	// 3. FIXED: Set Ticket Owner based on the Authenticated User (Context)
	useEffect(() => {
		if (user) {
			// Construct full name securely
			const fullName =
				[user.firstName, user.lastName].filter(Boolean).join(" ") ||
				user.name ||
				user.username ||
				"Current User";

			setFormData((prev) => ({
				...prev,
				ticketOwner: fullName,
			}));
		}
	}, [user]);

	// 4. Fetch Accounts & Contacts
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const res = await fetch(`${BASE_URL_AC}/account`);
				if (!res.ok)
					throw new Error(`HTTP error! status: ${res.status}`);
				const data = await res.json();
				setAllAccounts(data);
			} catch (err) {
				console.error("Failed to fetch accounts:", err);
			}
		};

		const fetchContacts = async () => {
			try {
				const res = await fetch(`${BASE_URL_AC}/contact`);
				if (!res.ok)
					throw new Error(`HTTP error! status: ${res.status}`);
				const data = await res.json();
				setAllContacts(data);
			} catch (err) {
				console.error("Failed to fetch contacts:", err);
			}
		};

		fetchAccounts();
		fetchContacts();
	}, []);

	// --- CONTACT SELECTION LOGIC ---
	const handleContactSelect = (contact) => {
		const associatedAccountId = contact.accountId || contact.account_id;

		// Only set Contact & Account. DO NOT touch ticketOwner.
		setFormData((prev) => ({
			...prev,
			primaryContact: contact.contactId,
			primaryContactName: `${contact.firstName} ${contact.lastName}`,
			accountName: associatedAccountId || "",
		}));

		setShowContactPopup(false);
	};

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	// Helper to display Account Name
	const getDisplayAccountName = () => {
		if (!formData.accountName) return "";
		const acc = allAccounts.find(
			(a) =>
				String(a.accountId) === String(formData.accountName) ||
				String(a.id) === String(formData.accountName),
		);
		return acc ? acc.name : "";
	};

	// Submit form
	const submitForm = async () => {
		try {
			const displayAccountName = getDisplayAccountName();

			let contactIdToSend = null;
			if (formData.primaryContact) {
				contactIdToSend = String(formData.primaryContact);
			}

			const payload = {
				ticket_owner_name: formData.ticketOwner,
				primary_contact_id: contactIdToSend,
				account_name: displayAccountName,
				subject: formData.subject,
				source: ENUM_MAPS.source.manual,
				priority: ENUM_MAPS.priority[formData.priority],
				status: ENUM_MAPS.status[formData.status],
				description: formData.description,
			};

			const requiredFields = {
				ticket_owner_name: "Ticket Owner",
				subject: "Subject",
				priority: "Priority",
				status: "Status",
				//primary_contact_id: "Contact Name",
				source: "Source",
			};

			for (const [field, label] of Object.entries(requiredFields)) {
				if (!payload[field]) {
					toast.warn(`Please fill the required field: ${label}`);
					return false;
				}
			}

			const res = await fetch(`${BASE_URL_SER}/tickets`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const err = await res.json();
				const msg = err.message || JSON.stringify(err);
				toast.error("Error creating ticket: " + msg);
				return false;
			}
			return true;
		} catch (error) {
			toast.error("Network error: " + error.message);
			return false;
		}
	};

	const handleSave = async (type) => {
		const success = await submitForm();
		if (!success) return;

		toast.success("Ticket created successfully!");

		if (type === "save") {
			navigate("/service/tickets");
		} else if (type === "saveAndNew") {
			// Keep owner, reset others
			setFormData((prev) => ({
				...prev,
				accountName: "",
				primaryContact: "",
				primaryContactName: "",
				subject: "",
				source: "manual",
				priority: "normal",
				status: "open",
				description: "",
			}));
			navigate("/service/tickets/create");
		}
	};

	// Filter contacts: Search term + Match current owner
	const popupContacts = allContacts.filter((c) =>
		(c.firstName + " " + c.lastName)
			.toLowerCase()
			.includes(contactSearchTerm.toLowerCase()),
	);

	return (
		<div className="ticket-create-container">
			<div className="ticket-create-header-container">
				<h1 className="ticket-create-heading">Create Ticket</h1>
				<div className="ticket-create-header-container-buttons">
					<button
						className="ticket-create-save-button"
						onClick={() => handleSave("save")}
					>
						<Save size={18} /> Save
					</button>
					<button
						className="ticket-create-save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						<FilePlus size={18} /> Save and New
					</button>
					<button
						className="ticket-create-cancel-button"
						onClick={() => navigate("/service/tickets")}
					>
						<CircleX size={18} /> Cancel
					</button>
				</div>
			</div>

			<div className="ticket-create-form-container">
				<h1 className="ticket-create-form-heading">
					Ticket Information
				</h1>
				<div className="ticket-create-form">
					<form>
						<div className="ticket-create-form-row">
							<div className="ticket-create-form-group">
								<label htmlFor="ticketOwner">
									Ticket Owner
								</label>
								{/* Owner Field: Read-Only & Auto-Filled from Context */}
								<input
									type="text"
									id="ticketOwner"
									value={formData.ticketOwner}
									readOnly
									style={{
										backgroundColor: "#e9ecef",
										cursor: "not-allowed",
									}}
								/>
							</div>
							<div className="ticket-create-form-group">
								<label htmlFor="primaryContactName">
									Contact Name{" "}
									{/* <span
										style={{
											color: "#365486",
											fontWeight: "bold",
										}}
									>
										*
									</span> */}
								</label>
								<div
									className="ticket-input-with-icon"
									onClick={() => setShowContactPopup(true)}
								>
									<input
										type="text"
										id="primaryContactName"
										value={formData.primaryContactName}
										placeholder="Click to select Contact"
										readOnly
										style={{
											cursor: "pointer",
											paddingRight: "40px",
											backgroundColor: "#fff",
										}}
									/>
									<Search
										size={18}
										className="ticket-input-icon"
									/>
								</div>
							</div>
						</div>

						<div className="ticket-create-form-row">
							<div className="ticket-create-form-group">
								<label htmlFor="accountName">
									Account Name
								</label>
								<input
									type="text"
									id="accountName"
									value={getDisplayAccountName()}
									placeholder="(Auto-populated from Contact)"
									readOnly
									style={{
										backgroundColor: "#e9ecef",
										cursor: "not-allowed",
									}}
								/>
							</div>
							<div className="ticket-create-form-group">
								<label htmlFor="subject">
									Subject{" "}
									<span
										style={{
											color: "#365486",
											fontWeight: "bold",
										}}
									>
										*
									</span>
								</label>
								<input
									type="text"
									id="subject"
									value={formData.subject}
									onChange={handleChange}
									placeholder="Enter ticket subject" // Added Placeholder
								/>
							</div>
						</div>

						<div className="ticket-create-form-row">
							<div className="ticket-create-form-group">
								<label htmlFor="source">Source</label>
								<input
									type="text"
									id="source"
									value="Manual"
									readOnly
									style={{
										backgroundColor: "#e9ecef",
										cursor: "not-allowed",
									}}
								/>
							</div>
							<div className="ticket-create-form-group">
								<label htmlFor="priority">Priority</label>
								<select
									id="priority"
									value={formData.priority}
									onChange={handleChange}
								>
									<option value="low">Low</option>
									{/* <option value="medium">Medium</option> */}
									<option value="normal">Normal</option>
									<option value="high">High</option>
								</select>
							</div>
						</div>

						<div className="ticket-create-form-row">
							<div className="ticket-create-form-group">
								<label htmlFor="status">
									Status{" "}
									<span
										style={{
											color: "#365486",
											fontWeight: "bold",
										}}
									>
										*
									</span>
								</label>
								{/* <select
									id="status"
									value={formData.status}
									onChange={handleChange}
									required
								>
									<option value="open">Open</option>
									<option value="to_be_processed">
										To be Processed
									</option>
									<option value="closed">Closed</option>
								</select> */}
								<input
									type="text"
									id="status"
									name="status"
									value="Open"
									readOnly
									style={{
										backgroundColor: "#e9ecef",
										cursor: "not-allowed",
									}}
								/>

							</div>
							<div className="ticket-create-form-group"></div>
						</div>

						<div className="ticket-create-form-row">
							<div className="ticket-create-form-group">
								<label htmlFor="description">Description</label>
								<textarea
									id="description"
									rows={4}
									value={formData.description}
									onChange={handleChange}
									placeholder="Enter detailed description of the issue..." // Added Placeholder
								/>
							</div>
						</div>

						<span
							className="required-field-text"
							style={{ color: "#365486" }}
						>
							* Required Field
						</span>
					</form>
				</div>
			</div>

			{/* --- CONTACT POPUP --- */}
			{showContactPopup && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.6)",
						zIndex: 9999,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<div
						style={{
							backgroundColor: "white",
							width: "500px",
							maxWidth: "90%",
							borderRadius: "8px",
							boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
							display: "flex",
							flexDirection: "column",
							maxHeight: "80vh",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								padding: "15px 20px",
								borderBottom: "1px solid #eee",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								backgroundColor: "#f8f9fa",
							}}
						>
							<h3
								style={{
									margin: 0,
									fontSize: "18px",
									color: "#0f1035",
								}}
							>
								Select Contact
							</h3>
							<button
								onClick={() => setShowContactPopup(false)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								<CircleX size={20} color="#0f1035" />
							</button>
						</div>
						<div style={{ padding: "15px" }}>
							<input
								type="text"
								placeholder="Search by name..."
								value={contactSearchTerm}
								onChange={(e) =>
									setContactSearchTerm(e.target.value)
								}
								autoFocus
								style={{
									width: "100%",
									padding: "10px",
									border: "1px solid #365486",
									borderRadius: "5px",
									outline: "none",
								}}
							/>
						</div>
						<div
							style={{
								flex: 1,
								overflowY: "auto",
								padding: "0 15px 15px",
							}}
						>
							{popupContacts.length > 0 ? (
								<ul
									style={{
										listStyle: "none",
										padding: 0,
										margin: 0,
									}}
								>
									{popupContacts.map((contact) => (
										<li
											key={contact.contactId}
											onClick={() =>
												handleContactSelect(contact)
											}
											style={{
												padding: "12px",
												borderBottom:
													"1px solid #f0f0f0",
												cursor: "pointer",
											}}
											onMouseEnter={(e) =>
											(e.currentTarget.style.backgroundColor =
												"#dcf2f1")
											}
											onMouseLeave={(e) =>
											(e.currentTarget.style.backgroundColor =
												"transparent")
											}
										>
											<div
												style={{
													fontWeight: "600",
													color: "#0f1035",
												}}
											>
												{contact.firstName}{" "}
												{contact.lastName}
											</div>
											<div
												style={{
													fontSize: "12px",
													color: "#365486",
												}}
											>
												{contact.email}
											</div>
										</li>
									))}
								</ul>
							) : (
								<div
									style={{
										textAlign: "center",
										color: "#999",
										padding: "20px",
									}}
								>
									No contacts found.
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateTicket;
