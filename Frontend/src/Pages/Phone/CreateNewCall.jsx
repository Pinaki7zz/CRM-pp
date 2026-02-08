import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "./CreateNewCall.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const CreateNewCall = () => {
	const navigate = useNavigate();

	// State for form fields
	const [formData, setFormData] = useState({
		callFor: "CONTACTS", // Default to contacts (uppercase to match backend enum)
		relatedTo: "Account", // Will show "Account" for contacts/cases, empty for leads
		accountId: "", // New field for account selection (used only in frontend)
		callTimeFrom: "",
		callTimeTo: "",
		callType: "OUTBOUND",
		owner: "",
		status: "SCHEDULED",
		primaryContactId: "",
		subject: "",
		callPurpose: "",
		description: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [users, setUsers] = useState([]); // State for users from API
	const [usersLoading, setUsersLoading] = useState(false); // Loading state for users
	const [accounts, setAccounts] = useState([]); // State for accounts from API
	const [accountsLoading, setAccountsLoading] = useState(false); // Loading state for accounts
	const [contacts, setContacts] = useState([]); // State for contacts from API
	const [contactsLoading, setContactsLoading] = useState(false); // Loading state for contacts

	// Helper function to format datetime for API
	const formatDateTimeForAPI = (dateTimeString) => {
		if (!dateTimeString) return null;

		try {
			// Create a Date object from the input
			const date = new Date(dateTimeString);

			// Check if the date is valid
			if (isNaN(date.getTime())) {
				console.error("Invalid date:", dateTimeString);
				return null;
			}

			// Return ISO string
			return date.toISOString();
		} catch (error) {
			console.error("Date formatting error:", error);
			return null;
		}
	};

	// Validate datetime format
	const validateDateTime = (dateTimeString) => {
		if (!dateTimeString) return true; // Optional field

		try {
			const date = new Date(dateTimeString);
			return !isNaN(date.getTime());
		} catch {
			return false;
		}
	};

	// Fetch users from API on component mount
	useEffect(() => {
		const fetchUsers = async () => {
			setUsersLoading(true);
			try {
				const response = await fetch(`${BASE_URL_UM}/users/s-info`, {
					method: "GET",
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(
						`Failed to fetch users: ${response.status}`
					);
				}

				const result = await response.json();
				console.log("Users API response:", result);

				const usersData = result.data || result || [];
				setUsers(usersData);

				// Set the first user as default owner
				if (usersData.length > 0) {
					setFormData((prev) => ({
						...prev,
						owner: usersData[0].id, // Set first user's ID as default
					}));
					console.log("Default owner set:", usersData[0].id);
				}
			} catch (error) {
				console.error("Error fetching users:", error);
				setError(`Failed to load users: ${error.message}`);
			} finally {
				setUsersLoading(false);
			}
		};

		fetchUsers();
	}, []);

	// Fetch accounts from API when callFor is not LEADS
	useEffect(() => {
		if (formData.callFor !== "LEADS") {
			const fetchAccounts = async () => {
				setAccountsLoading(true);
				try {
					const response = await fetch(
						`${BASE_URL_AC}/account/ids-names`
					);

					if (!response.ok) {
						throw new Error(
							`Failed to fetch accounts: ${response.status}`
						);
					}

					const result = await response.json();
					console.log("Accounts API response:", result);

					const accountsData = result.data || result || [];
					setAccounts(accountsData);
				} catch (error) {
					console.error("Error fetching accounts:", error);
					setError(`Failed to load accounts: ${error.message}`);
				} finally {
					setAccountsLoading(false);
				}
			};

			fetchAccounts();
		} else {
			// Clear accounts when callFor is LEADS
			setAccounts([]);
			setFormData((prev) => ({
				...prev,
				accountId: "",
				primaryContactId: "",
			}));
		}
	}, [formData.callFor]);

	// Fetch contacts when an account is selected
	useEffect(() => {
		if (formData.accountId && formData.callFor !== "LEADS") {
			const fetchContacts = async () => {
				setContactsLoading(true);
				try {
					const response = await fetch(
						`${BASE_URL_AC}/contact?accountId=${formData.accountId}`
					);

					if (!response.ok) {
						throw new Error(
							`Failed to fetch contacts: ${response.status}`
						);
					}

					const result = await response.json();
					console.log("Contacts API response:", result);

					const contactsData = result.data || result || [];
					setContacts(contactsData);

					// Clear primary contact when account changes
					setFormData((prev) => ({
						...prev,
						primaryContactId: "",
					}));
				} catch (error) {
					console.error("Error fetching contacts:", error);
				} finally {
					setContactsLoading(false);
				}
			};

			fetchContacts();
		} else {
			// Clear contacts when no account is selected or callFor is LEADS
			setContacts([]);
			setFormData((prev) => ({
				...prev,
				primaryContactId: "",
			}));
		}
	}, [formData.accountId, formData.callFor]);

	// Handle call for change
	const handleCallForChange = (e) => {
		const selectedValue = e.target.value;
		console.log("Call For changed to:", selectedValue);
		setFormData((prev) => ({
			...prev,
			callFor: selectedValue,
			relatedTo: selectedValue === "LEADS" ? "" : "Account",
			accountId: "",
			primaryContactId: "",
		}));
	};

	// Handle general form field changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		console.log(`Field ${name} changed to:`, value);
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Validate form data
	const validateForm = () => {
		const errors = [];

		if (!formData.callFor) errors.push("Call For is required");
		if (!formData.owner) errors.push("Owner is required");

		// Add datetime validation
		if (formData.callTimeFrom && !validateDateTime(formData.callTimeFrom)) {
			errors.push("Call Time From must be a valid datetime");
		}

		if (formData.callTimeTo && !validateDateTime(formData.callTimeTo)) {
			errors.push("Call Time To must be a valid datetime");
		}

		if (
			formData.callTimeFrom &&
			formData.callTimeTo &&
			new Date(formData.callTimeTo) <= new Date(formData.callTimeFrom)
		) {
			errors.push("Call Time To must be after Call Time From");
		}

		return errors;
	};

	// Submit form data to backend with enhanced error handling
	const submitPhoneCall = async (phoneCallData) => {
		try {
			console.log(
				"Request payload:",
				JSON.stringify(phoneCallData, null, 2)
			);

			const response = await fetch(`${BASE_URL_AM}/phone-calls`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(phoneCallData),
			});

			console.log("Response status:", response.status);
			console.log("Response ok:", response.ok);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Error response:", errorText);

				try {
					const errorData = JSON.parse(errorText);
					throw new Error(
						errorData.message ||
							`HTTP ${response.status}: ${errorText}`
					);
				} catch (parseError) {
					console.error("Error parsing error response:", parseError);
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}
			}

			const result = await response.json();
			console.log("Parsed response:", result);
			return result;
		} catch (error) {
			console.error("Fetch error:", error);
			if (error.name === "TypeError" && error.message.includes("fetch")) {
				throw new Error(
					"Network error: Unable to connect to server. Please check if the backend is running on port 4005."
				);
			}
			throw error;
		}
	};

	// Handle save operations with comprehensive debugging and fixed datetime formatting
	const handleSave = async (type) => {
		console.log("handleSave called with type:", type);
		setError("");
		setLoading(true);

		try {
			// Validate form
			const validationErrors = validateForm();
			console.log("Validation errors:", validationErrors);

			if (validationErrors.length > 0) {
				setError(validationErrors.join(", "));
				setLoading(false);
				return;
			}

			// Prepare data for backend with properly formatted dates
			const phoneCallData = {
				callFor: formData.callFor,
				callTimeFrom: formatDateTimeForAPI(formData.callTimeFrom), // Fixed formatting
				callTimeTo: formatDateTimeForAPI(formData.callTimeTo), // Fixed formatting
				callType: formData.callType,
				owner: formData.owner,
				status: formData.status,
				primaryContactId: formData.primaryContactId || null,
				subject: formData.subject || null,
				callPurpose: formData.callPurpose || null,
				description: formData.description || null,
				relatedTo:
					formData.callFor === "LEADS" ? null : formData.accountId,
			};

			console.log(
				"Submitting phone call data with formatted dates:",
				phoneCallData
			);

			// Submit to backend
			const result = await submitPhoneCall(phoneCallData);
			console.log("Submit result:", result);

			// Show success message
			console.log("Phone call created successfully:", result);

			// Show success toast
			const successDiv = document.createElement("div");
			successDiv.innerHTML = "Phone call saved successfully!";
			successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 9999;
                font-weight: 500;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
			document.body.appendChild(successDiv);

			setTimeout(() => {
				if (document.body.contains(successDiv)) {
					document.body.removeChild(successDiv);
				}
			}, 3000);

			// Navigate based on save type
			if (type === "save") {
				navigate("/activitymanagement/phonecalls");
			} else if (type === "saveAndNew") {
				// Reset form for new entry but keep the first user as default owner
				const defaultOwner = users.length > 0 ? users[0].id : "";
				setFormData({
					callFor: "CONTACTS",
					relatedTo: "Account",
					accountId: "",
					callTimeFrom: "",
					callTimeTo: "",
					callType: "OUTBOUND",
					owner: defaultOwner,
					status: "SCHEDULED",
					primaryContactId: "",
					subject: "",
					callPurpose: "",
					description: "",
				});
			}
		} catch (error) {
			console.error("Error in handleSave:", error);
			setError(error.message || "Failed to save phone call");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Create Product Category Page Header Section */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="call-heading">Schedule a Call</h1>
				</div>
				<div className="header-container-buttons">
					<button
						className="cancel-button"
						onClick={() =>
							navigate("/activitymanagement/phonecalls")
						}
						disabled={loading}
					>
						Cancel
					</button>
					<button
						className="save-button"
						onClick={() => handleSave("save")}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save and New"}
					</button>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div
					className="error-container"
					style={{
						background: "#fee",
						color: "#c33",
						padding: "10px",
						margin: "10px",
						borderRadius: "4px",
						border: "1px solid #fcc",
						position: "relative",
					}}
				>
					{error}
					<button
						onClick={() => setError("")}
						style={{
							position: "absolute",
							top: "5px",
							right: "10px",
							background: "none",
							border: "none",
							fontSize: "16px",
							cursor: "pointer",
							color: "#c33",
						}}
					>
						×
					</button>
				</div>
			)}

			{/* Phone Calls Container */}
			<div className="calls-container">
				<div className="calls-heading">
					<h1>Call Information</h1>
				</div>
				<div className="calls-form">
					<form onSubmit={(e) => e.preventDefault()}>
						<div className="form-group callfor">
							<label htmlFor="callfor">Call For *</label>
							<select
								id="callfor"
								name="callFor"
								value={formData.callFor}
								onChange={handleCallForChange}
								required
							>
								<option value="LEADS">Leads</option>
								<option value="CONTACTS">Contacts</option>
								<option value="CASES">Cases</option>
							</select>
						</div>

						<div className="form-group relatedto">
							<label htmlFor="relatedto">Related To</label>
							<input
								type="text"
								id="relatedto"
								name="relatedTo"
								value={formData.relatedTo}
								disabled
								readOnly
								style={{
									backgroundColor: "#f5f5f5",
									color: "#666",
								}}
							/>
						</div>

						<div className="form-group account">
							<label htmlFor="account">Account</label>
							<select
								id="account"
								name="accountId"
								value={formData.accountId}
								onChange={handleInputChange}
								disabled={
									accountsLoading ||
									formData.callFor === "LEADS"
								}
							>
								<option value="">
									{accountsLoading
										? "Loading accounts..."
										: formData.callFor === "LEADS"
										? "Not available for Leads"
										: "Select Account"}
								</option>
								{accounts.map((account) => (
									<option
										key={account.accountId}
										value={account.accountId}
									>
										{account.name}
									</option>
								))}
							</select>
							{accountsLoading &&
								formData.callFor !== "LEADS" && (
									<small
										style={{
											color: "#666",
											fontSize: "0.8em",
										}}
									>
										Loading accounts from server...
									</small>
								)}
						</div>

						<div className="form-group calltimefrom">
							<label htmlFor="calltimefrom">
								Call Time (From)
							</label>
							<input
								type="datetime-local"
								id="calltimefrom"
								name="callTimeFrom"
								value={formData.callTimeFrom}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group calltimeto">
							<label htmlFor="calltimeto">Call Time (To)</label>
							<input
								type="datetime-local"
								id="calltimeto"
								name="callTimeTo"
								value={formData.callTimeTo}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group calltype">
							<label htmlFor="calltype">Call Type</label>
							<input
								type="text"
								value={formData.callType}
								id="calltype"
								readOnly
								disabled
							/>
						</div>
						<div className="form-group owner">
							<label htmlFor="owner">Owner *</label>
							<select
								id="owner"
								name="owner"
								value={formData.owner}
								onChange={handleInputChange}
								required
								disabled={usersLoading}
							>
								<option value="">
									{usersLoading
										? "Loading users..."
										: "Select Owner"}
								</option>
								{users.map((user) => (
									<option key={user.id} value={user.id}>
										{user.name ||
											user.firstName +
												" " +
												user.lastName ||
											user.username ||
											user.email}
									</option>
								))}
							</select>
							{usersLoading && (
								<small
									style={{ color: "#666", fontSize: "0.8em" }}
								>
									Loading users from server...
								</small>
							)}
						</div>

						<div className="form-group status">
							<label htmlFor="status">Status</label>
							<input
								type="text"
								value={formData.status}
								id="status"
								readOnly
								disabled
							/>
						</div>

						<div className="form-group primary-contact">
							<label htmlFor="primary-contact">
								Primary Contact
							</label>
							<select
								id="primary-contact"
								name="primaryContactId"
								value={formData.primaryContactId}
								onChange={handleInputChange}
								disabled={
									contactsLoading ||
									formData.callFor === "LEADS" ||
									!formData.accountId
								}
							>
								<option value="">
									{contactsLoading
										? "Loading contacts..."
										: formData.callFor === "LEADS"
										? "Not available for Leads"
										: !formData.accountId
										? "Select an account first"
										: "Select Primary Contact"}
								</option>
								{contacts.map((contact) => (
									<option
										key={contact.contactId}
										value={contact.contactId}
									>
										{contact.firstName} {contact.lastName}
									</option>
								))}
							</select>
							{contactsLoading &&
								formData.callFor !== "LEADS" &&
								formData.accountId && (
									<small
										style={{
											color: "#666",
											fontSize: "0.8em",
										}}
									>
										Loading contacts from server...
									</small>
								)}
						</div>

						<div className="form-group subject">
							<label htmlFor="subject">Subject</label>
							<input
								type="text"
								placeholder="Subject"
								id="subject"
								name="subject"
								value={formData.subject}
								onChange={handleInputChange}
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Purpose Container */}
			<div className="purpose-container">
				<div className="purpose-heading">
					<h1>Purpose</h1>
				</div>
				<div className="purpose-form1">
					<form onSubmit={(e) => e.preventDefault()}>
						<div className="form-group call-purpose">
							<label htmlFor="call-purpose">Call Purpose</label>
							<select
								id="call-purpose"
								name="callPurpose"
								value={formData.callPurpose}
								onChange={handleInputChange}
							>
								<option value="">Select Purpose</option>
								<option value="NEGOTIATION">Negotiation</option>
								<option value="DEMO">Demo</option>
								<option value="PROJECT">Project</option>
								<option value="PROSPECTING">Prospecting</option>
							</select>
						</div>
						<div className="form-group description1">
							<label htmlFor="description1">Description</label>
							<textarea
								placeholder="Write description here..."
								id="description1"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
							/>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default CreateNewCall;
