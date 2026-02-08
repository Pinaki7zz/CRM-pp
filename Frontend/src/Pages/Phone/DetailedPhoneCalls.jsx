import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paperclip, Plus, ChevronDown } from "lucide-react";
import "./DetailedPhoneCalls.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const DetailedPhoneCalls = () => {
	const { id } = useParams(); // Get phone call ID from URL
	const navigate = useNavigate();

	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);
	const [phoneCallData, setPhoneCallData] = useState({});
	const [accountData, setAccountData] = useState({});
	const [contactData, setContactData] = useState({});
	const [ownerData, setOwnerData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Add separate states for all users and contacts
	const [users, setUsers] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [contactsLoading, setContactsLoading] = useState(false);

	// Helper function to format datetime for input field
	const formatDateTimeForInput = (dateString) => {
		if (!dateString) return "";
		try {
			const date = new Date(dateString);
			// Format to YYYY-MM-DDTHH:MM for datetime-local input
			return date.toISOString().slice(0, 16);
		} catch (error) {
			return "";
		}
	};

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

	// Fetch ALL users and contacts on component mount
	useEffect(() => {
		const fetchAllUsers = async () => {
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
				console.log("All Users API response:", result);

				const usersData = result.data || result || [];
				setUsers(usersData);
			} catch (error) {
				console.error("Error fetching all users:", error);
			} finally {
				setUsersLoading(false);
			}
		};

		const fetchAllContacts = async () => {
			setContactsLoading(true);
			try {
				const response = await fetch(`${BASE_URL_AC}/contact`);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch contacts: ${response.status}`
					);
				}

				const result = await response.json();
				console.log("All Contacts API response:", result);

				const contactsData = result.data || result || [];
				setContacts(contactsData);
			} catch (error) {
				console.error("Error fetching all contacts:", error);
			} finally {
				setContactsLoading(false);
			}
		};

		fetchAllUsers();
		fetchAllContacts();
	}, []);

	useEffect(() => {
		if (!id) return;

		const fetchPhoneCallDetails = async () => {
			setLoading(true);
			try {
				console.log("Fetching phone call details for ID:", id);

				const phoneCallResponse = await fetch(
					`${BASE_URL_AM}/phone-calls/${id}`
				);

				if (!phoneCallResponse.ok) {
					throw new Error(
						`Failed to fetch phone call: ${phoneCallResponse.status}`
					);
				}

				const phoneCallResult = await phoneCallResponse.json();
				console.log("Phone call API response:", phoneCallResult);

				if (phoneCallResult.success) {
					const phoneCall = phoneCallResult.data;
					setPhoneCallData(phoneCall);

					// Fetch account details if needed
					if (phoneCall.relatedTo && phoneCall.callFor !== "LEADS") {
						await fetchAccountDetails(phoneCall.relatedTo);
					}
				}
			} catch (error) {
				console.error("Error fetching phone call details:", error);
				setError(`Failed to load phone call details: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		const fetchAccountDetails = async (accountId) => {
			try {
				console.log("Fetching account details for ID:", accountId);
				const response = await fetch(
					`${BASE_URL_AC}/account/${accountId}`
				);

				if (response.ok) {
					const result = await response.json();
					console.log("Account API response:", result);
					const account = result.data || result;
					setAccountData(account);
				}
			} catch (error) {
				console.error("Error fetching account details:", error);
			}
		};

		fetchPhoneCallDetails();
	}, [id]);

	// Helper function to get user name by ID
	const getUserNameById = (userId) => {
		if (!userId) return "-";
		const user = users.find((u) => u.id === userId);
		if (user) {
			return (
				user.name ||
				`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
				user.username ||
				user.email ||
				"Unknown User"
			);
		}
		return usersLoading ? "Loading..." : userId;
	};

	// Helper function to get contact name by ID
	const getContactNameById = (contactId) => {
		if (!contactId) return "-";
		const contact = contacts.find((c) => c.contactId === contactId);
		if (contact) {
			return (
				`${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
				contact.email ||
				"Unknown Contact"
			);
		}
		return contactsLoading ? "Loading..." : contactId;
	};

	// Format date for display
	const formatDate = (dateString) => {
		if (!dateString) return "-";
		try {
			return new Date(dateString).toLocaleString();
		} catch (error) {
			return "-";
		}
	};

	// Format call type for display
	const formatCallType = (callType) => {
		return callType
			? callType.charAt(0).toUpperCase() + callType.slice(1).toLowerCase()
			: "-";
	};

	// Get Related To value based on Call For type
	const getRelatedToValue = () => {
		if (phoneCallData.callFor === "LEADS") {
			return ""; // Empty for leads
		} else if (
			phoneCallData.callFor === "CONTACTS" ||
			phoneCallData.callFor === "CASES"
		) {
			return "Account"; // Always "Account" for contacts and cases
		}
		return "-";
	};

	// Handle delete phone call
	const handleDeletePhoneCall = async () => {
		if (
			window.confirm("Are you sure you want to delete this phone call?")
		) {
			try {
				const response = await fetch(
					`${BASE_URL_AM}/phone-calls/${id}`,
					{
						method: "DELETE",
					}
				);

				if (response.ok) {
					// Show success message
					const successDiv = document.createElement("div");
					successDiv.innerHTML = "Phone call deleted successfully!";
					successDiv.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #ef4444;
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

					navigate("/activitymanagement/phonecalls");
				} else {
					throw new Error("Failed to delete phone call");
				}
			} catch (error) {
				setError(`Failed to delete phone call: ${error.message}`);
			}
		}
	};

	// Handle cancel edit
	const handleCancelEdit = () => {
		setIsReadOnly(true);
		// Reset form fields to original values
		const subjectField = document.getElementById("subject");
		const callTimeFromField = document.getElementById("calltimefor");
		const callTimeToField = document.getElementById("calltimeto");
		const descriptionField = document.getElementById("description1");
		const notesField = document.getElementById("notes");

		if (subjectField) subjectField.value = phoneCallData.subject || "";
		if (callTimeFromField)
			callTimeFromField.value = formatDateTimeForInput(
				phoneCallData.callTimeFrom
			);
		if (callTimeToField)
			callTimeToField.value = formatDateTimeForInput(
				phoneCallData.callTimeTo
			);
		if (descriptionField)
			descriptionField.value = phoneCallData.description || "";
		if (notesField) notesField.value = phoneCallData.notes || "";
	};

	// UPDATED: Handle edit/save functionality with datetime fields
	const handleEditSave = async () => {
		if (isReadOnly) {
			setIsReadOnly(false);
		} else {
			try {
				// Get values from form fields
				const subject =
					document.getElementById("subject")?.value ||
					phoneCallData.subject;
				const callTimeFrom =
					document.getElementById("calltimefor")?.value;
				const callTimeTo = document.getElementById("calltimeto")?.value;
				const description =
					document.getElementById("description1")?.value ||
					phoneCallData.description;
				const notes =
					document.getElementById("notes")?.value ||
					phoneCallData.notes;

				const updateData = {
					subject,
					callTimeFrom: formatDateTimeForAPI(callTimeFrom), // Format for API
					callTimeTo: formatDateTimeForAPI(callTimeTo), // Format for API
					description,
					notes,
				};

				console.log("Updating phone call with data:", updateData);

				const response = await fetch(
					`${BASE_URL_AM}/phone-calls/${id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(updateData),
					}
				);

				if (response.ok) {
					const result = await response.json();
					setPhoneCallData(result.data);
					setIsReadOnly(true);

					// Show success message
					const successDiv = document.createElement("div");
					successDiv.innerHTML = "Phone call updated successfully!";
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
				} else {
					throw new Error("Failed to update phone call");
				}
			} catch (error) {
				setError(`Failed to update phone call: ${error.message}`);
			}
		}
	};

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "50vh",
					fontSize: "18px",
					color: "#666",
				}}
			>
				Loading phone call details...
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					background: "#fee",
					color: "#c33",
					padding: "20px",
					margin: "20px",
					borderRadius: "8px",
					border: "1px solid #fcc",
				}}
			>
				<h3>Error Loading Phone Call</h3>
				<p>{error}</p>
				<button
					onClick={() => navigate("/activitymanagement/phonecalls")}
					style={{
						background: "#3b82f6",
						color: "white",
						padding: "8px 16px",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						marginTop: "10px",
					}}
				>
					Back to Phone Calls
				</button>
			</div>
		);
	}

	return (
		<>
			{/* Phone Call Header Section */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="call-heading">
						{phoneCallData.subject || "Phone Call Details"}
					</h1>
				</div>
				<div className="header-container-buttons">
					<button className="send-email-button">Send Email</button>
					<button className="edit-button" onClick={handleEditSave}>
						{isReadOnly ? "Edit" : "Save"}
					</button>
					{!isReadOnly && (
						<button
							className="cancel-edit-button"
							onClick={handleCancelEdit}
						>
							Cancel Edit
						</button>
					)}
					<div className="more-options-container">
						<button
							className="more-options-button"
							onClick={() =>
								setMenuModal((prevState) => !prevState)
							}
						>
							⁞
						</button>
						{menuModal && (
							<div className="menu-modal-container">
								<div className="menu-modal">
									<ul className="menu-modal-list">
										<li>Submit for Approval</li>
										<li
											onClick={handleDeletePhoneCall}
											style={{
												color: "#ef4444",
												cursor: "pointer",
											}}
										>
											Delete
										</li>
										<li>Print Preview</li>
										<li>Change Owner</li>
									</ul>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div
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

			{/* Call Information Container */}
			<div className="call-information-container">
				<div className="call-information-heading">
					<h1>Call Information</h1>
				</div>
				<div className="call-information-form">
					<form>
						<div className="form-group callfor">
							<label htmlFor="callfor">Call For</label>
							<input
								type="text"
								placeholder="Call For"
								id="callfor"
								value={
									formatCallType(phoneCallData.callFor) || ""
								}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group relatedto">
							<label htmlFor="relatedto">Related To</label>
							<input
								type="text"
								placeholder="Related To"
								id="relatedto"
								value={getRelatedToValue()}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group calltimefor">
							<label htmlFor="calltimefor">
								Call Time (From)
							</label>
							{/* UPDATED: Make editable when not readonly */}
							{isReadOnly ? (
								<input
									type="text"
									placeholder="Call Time (From)"
									id="calltimefor"
									value={formatDate(
										phoneCallData.callTimeFrom
									)}
									readOnly={true}
									onChange={() => {}}
								/>
							) : (
								<input
									type="datetime-local"
									placeholder="Call Time (From)"
									id="calltimefor"
									defaultValue={formatDateTimeForInput(
										phoneCallData.callTimeFrom
									)}
								/>
							)}
						</div>
						<div className="form-group calltimeto">
							<label htmlFor="calltimeto">Call Time (To)</label>
							{/* UPDATED: Make editable when not readonly */}
							{isReadOnly ? (
								<input
									type="text"
									placeholder="Call Time (To)"
									id="calltimeto"
									value={formatDate(phoneCallData.callTimeTo)}
									readOnly={true}
									onChange={() => {}}
								/>
							) : (
								<input
									type="datetime-local"
									placeholder="Call Time (To)"
									id="calltimeto"
									defaultValue={formatDateTimeForInput(
										phoneCallData.callTimeTo
									)}
								/>
							)}
						</div>
						<div className="form-group calltype">
							<label htmlFor="calltype">Call Type</label>
							<input
								type="text"
								placeholder="Call Type"
								id="calltype"
								value={
									formatCallType(phoneCallData.callType) || ""
								}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group owner">
							<label htmlFor="owner">Owner</label>
							<input
								type="text"
								placeholder="Owner"
								id="owner"
								value={getUserNameById(phoneCallData.owner)}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group subject">
							<label htmlFor="subject">Subject</label>
							<input
								type="text"
								placeholder="Subject"
								id="subject"
								defaultValue={phoneCallData.subject || ""}
								readOnly={isReadOnly}
							/>
						</div>
						<div className="form-group status">
							<label htmlFor="status">Status</label>
							<input
								type="text"
								placeholder="Status"
								id="status"
								value={
									formatCallType(phoneCallData.status) || ""
								}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group primary-contact">
							<label htmlFor="primary-contact">
								Primary Contact
							</label>
							<input
								type="text"
								placeholder="Primary Contact"
								id="primary-contact"
								value={getContactNameById(
									phoneCallData.primaryContactId
								)}
								readOnly={true}
								onChange={() => {}}
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
				<div className="purpose-form">
					<form>
						<div className="form-group call-purpose">
							<label htmlFor="call-purpose">Call Purpose</label>
							<input
								type="text"
								placeholder="Call Purpose"
								id="call-purpose"
								value={
									formatCallType(phoneCallData.callPurpose) ||
									""
								}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
						<div className="form-group description1">
							<label htmlFor="description1">Description</label>
							<textarea
								placeholder="Write description here..."
								id="description1"
								defaultValue={phoneCallData.description || ""}
								readOnly={isReadOnly}
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Notes Container */}
			<div className="notes-container">
				<div className="notes-heading">
					<div className="left">
						<h1>Notes</h1>
					</div>
				</div>
				<div className="notes-form">
					<form>
						<div className="form-group notes">
							<label htmlFor="notes">Notes</label>
							<textarea
								placeholder="Write your note here..."
								id="notes"
								defaultValue={phoneCallData.notes || ""}
								readOnly={isReadOnly}
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Account Information Container */}
			{accountData && Object.keys(accountData).length > 0 && (
				<div className="account-information-container">
					<div className="account-information-heading">
						<div className="left">
							<h1>Account Information</h1>
						</div>
					</div>
					<div className="account-information-form">
						<form>
							<div className="form-group accountid">
								<label htmlFor="accountid">Account ID</label>
								<input
									type="text"
									placeholder="Account ID"
									id="accountid"
									value={accountData.accountId || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group accountname">
								<label htmlFor="accountname">
									Account Name
								</label>
								<input
									type="text"
									placeholder="Account Name"
									id="accountname"
									value={accountData.name || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group website">
								<label htmlFor="website">Website</label>
								<input
									type="text"
									placeholder="Website"
									id="website"
									value={accountData.website || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group accounttype">
								<label htmlFor="accounttype">
									Account Type
								</label>
								<input
									type="text"
									placeholder="Account Type"
									id="accounttype"
									value={
										formatCallType(accountData.type) || ""
									}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group accountowner">
								<label htmlFor="accountowner">
									Account Owner
								</label>
								<input
									type="text"
									placeholder="Account Owner"
									id="accountowner"
									value={accountData.ownerId || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group industry">
								<label htmlFor="industry">Industry</label>
								<input
									type="text"
									placeholder="Industry"
									id="industry"
									value={
										formatCallType(accountData.industry) ||
										""
									}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group parentaccount">
								<label htmlFor="parentaccount">
									Parent Account
								</label>
								<input
									type="text"
									placeholder="Parent Account"
									id="parentaccount"
									value={accountData.parentAccountId || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group notes">
								<label htmlFor="account-notes">Notes</label>
								<textarea
									placeholder="Write your notes here..."
									id="account-notes"
									value={accountData.note || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Contact Information Container */}
			{contactData && Object.keys(contactData).length > 0 && (
				<div className="contact-information-container">
					<div className="contact-information-heading">
						<div className="left">
							<h1>Contact Information</h1>
						</div>
					</div>
					<div className="contact3-information-form">
						<form>
							<div className="form-group contact-name">
								<label htmlFor="contact-name">Full Name</label>
								<input
									type="text"
									placeholder="Full Name"
									id="contact-name"
									value={`${contactData.firstName || ""} ${
										contactData.lastName || ""
									}`.trim()}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group emailid3">
								<label htmlFor="emailid3">Email ID</label>
								<input
									type="email"
									placeholder="Email ID"
									id="emailid3"
									value={contactData.email || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group phoneno3">
								<label htmlFor="phoneno3">Phone No.</label>
								<input
									type="tel"
									placeholder="e.g. +0 12345 67890"
									id="phoneno3"
									value={contactData.phone || ""}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group department">
								<label htmlFor="department">Department</label>
								<input
									type="text"
									placeholder="Department"
									id="department"
									value={
										formatCallType(
											contactData.department
										) || ""
									}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group role">
								<label htmlFor="contact-role">Role</label>
								<input
									type="text"
									placeholder="Role"
									id="contact-role"
									value={
										formatCallType(contactData.role) || ""
									}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
							<div className="form-group is-primary">
								<label htmlFor="is-primary">
									Primary Contact
								</label>
								<input
									type="text"
									placeholder="Primary Contact"
									id="is-primary"
									value={contactData.isPrimary ? "Yes" : "No"}
									readOnly={true}
									onChange={() => {}}
								/>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Attachments Section */}
			<div className="attachment1-section-container">
				<div className="attachment1-section-heading">
					<h1>Attachments</h1>
					<button>
						Attach
						<Paperclip size={15} />
					</button>
				</div>
				<div className="attachment1-section-table">
					<div className="table-container">
						<div className="table-column">
							<h1>
								File Name
								<ChevronDown size={15} />
							</h1>
							<p>No attachments available</p>
						</div>
						<div className="table-column">
							<h1>
								Attached By
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
						<div className="table-column">
							<h1>
								Date Added
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
						<div className="table-column">
							<h1>
								File Size
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
					</div>
				</div>
			</div>

			{/* Activities Section */}
			<div className="activity-section-container">
				<div className="activity-section-heading">
					<h1>Activities</h1>
					<button>
						Add Activity
						<Plus size={15} />
					</button>
				</div>
				<div className="activity-section-table">
					<div className="table-container">
						<div className="table-column">
							<h1>
								Activity Name
								<ChevronDown size={15} />
							</h1>
							<p>No activities available</p>
						</div>
						<div className="table-column">
							<h1>
								Activity Type
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
						<div className="table-column">
							<h1>
								Meetings
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
						<div className="table-column">
							<h1>
								Calls
								<ChevronDown size={15} />
							</h1>
							<p>-</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DetailedPhoneCalls;
