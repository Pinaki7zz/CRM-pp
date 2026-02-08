import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Paperclip, Plus, ChevronDown } from "lucide-react";
import "./DetailedTasks.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const LEAD_SOURCE_OPTIONS = ["EMAIL", "PHONE_CALL", "WEB_ENQUIRY"];

const LEAD_STATUS_OPTIONS = [
	"OPEN",
	"IN_PROGRESS",
	"COMPLETED",
	"OVERDUE",
	"CANCELLED",
];

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const DetailedTasks = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [task, setTask] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);

	const [allUsers, setAllUsers] = useState([]);
	const [allContacts, setAllContacts] = useState([]);
	const [contactInfo, setContactInfo] = useState(null);
	const [accountInfo, setAccountInfo] = useState(null);

	// FIXED: Memoized resolveUserName function
	const resolveUserName = useCallback(
		(ownerId) => {
			if (!ownerId) return "";
			const user = allUsers.find((u) => u.id === ownerId);
			if (user) {
				// ✅ Combine firstName and lastName
				const fullName = `${user.firstName || ""} ${
					user.lastName || ""
				}`.trim();
				return (
					fullName || user.username || user.email || "Unknown User"
				);
			}
			return ownerId;
		},
		[allUsers]
	);

	// FIXED: Memoized fetchAccountByAccountId function
	const fetchAccountByAccountId = useCallback(async (accountId) => {
		try {
			if (!accountId) return;
			const listRes = await fetch(`${BASE_URL_AC}/account`);
			if (!listRes.ok) return;
			const list = await listRes.json();
			const match = list.find((a) => a.accountId === accountId);
			if (!match) return;
			const detailRes = await fetch(`${BASE_URL_AC}/account/${match.id}`);
			if (detailRes.ok) {
				const accountData = await detailRes.json();
				setAccountInfo(accountData);
			}
		} catch (err) {
			console.error("Failed to fetch account:", err);
		}
	}, []); // No dependencies needed as it uses fresh API calls

	// FIXED: Memoized fetchContactByContactId function
	const fetchContactByContactId = useCallback(
		async (contactId) => {
			try {
				if (!contactId || !allContacts.length) return;
				const match = allContacts.find(
					(c) => c.contactId === contactId
				);
				if (!match) {
					setContactInfo(null);
					return;
				}
				const res = await fetch(`${BASE_URL_AC}/contact/${match.id}`);
				if (res.ok) {
					const data = await res.json();
					setContactInfo(data);
					if (data.accountId) {
						fetchAccountByAccountId(data.accountId);
					}
				}
			} catch (err) {
				console.error("Failed to fetch contact:", err);
				setContactInfo(null);
			}
		},
		[allContacts, fetchAccountByAccountId]
	);

	// FIXED: Memoized fetchReferenceData function
	const fetchReferenceData = useCallback(async () => {
		try {
			const [usersRes, contactsRes] = await Promise.all([
				fetch(`${BASE_URL_UM}/users/s-info`, {
					method: "GET",
					credentials: "include",
				}),
				fetch(`${BASE_URL_AC}/contact`),
			]);

			if (usersRes.ok) {
				const data = await usersRes.json();
				console.log("Users API response:", data);

				// ✅ Spring Boot returns raw array
				const userData = Array.isArray(data) ? data : [];
				setAllUsers(userData);
			}

			if (contactsRes.ok) {
				const contactData = await contactsRes.json();
				setAllContacts(contactData);
			}
		} catch (err) {
			console.error("Failed to fetch reference data:", err);
		}
	}, []);

	// FIXED: Memoized fetchTask function
	const fetchTask = useCallback(async () => {
		if (!id) return;

		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${BASE_URL_AM}/tasks/${id}`);
			if (!res.ok) throw new Error("Failed to fetch task");
			const response = await res.json();

			if (response.success) {
				const taskData = response.data;
				setTask(taskData);
				console.log("Task data loaded:", taskData);
			} else {
				throw new Error("Failed to fetch task details");
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [id]);

	// FIXED: Main useEffect with all dependencies included
	useEffect(() => {
		if (id) {
			fetchReferenceData();
			fetchTask();
		}
	}, [id, fetchReferenceData, fetchTask]);

	// FIXED: Contact fetch useEffect - use first contact from contacts array
	useEffect(() => {
		if (
			task?.contacts &&
			task.contacts.length > 0 &&
			allContacts.length > 0
		) {
			// Get the first contact ID from the contacts array
			const firstContactId = task.contacts[0].contactId;
			fetchContactByContactId(firstContactId);
		}
	}, [task?.contacts, allContacts.length, fetchContactByContactId]);

	// Add this useEffect to fetch account info when task loads
	useEffect(() => {
		if (task?.accounts && task.accounts.length > 0) {
			const firstAccountId = task.accounts[0].accountId;
			fetchAccountByAccountId(firstAccountId);
		}
	}, [task?.accounts, fetchAccountByAccountId]);

	// Helper functions for displaying names
	const getOwnerName = useCallback(
		(taskOwnerId) => {
			return resolveUserName(taskOwnerId) || taskOwnerId || "-";
		},
		[resolveUserName]
	);

	const getAccountNameById = useCallback(
		(accountId) => {
			if (!accountId) {
				// If no specific accountId, get from task's accounts array
				if (task?.accounts && task.accounts.length > 0) {
					const firstAccount = task.accounts[0];
					accountId = firstAccount.accountId;
				}
				if (!accountId) return "-";
			}

			// First check if we have account info loaded
			if (accountInfo && accountInfo.accountId === accountId) {
				return (
					accountInfo.name ||
					accountInfo.accountName ||
					"Unknown Account"
				);
			}

			// Fallback to getting from contact data
			const contactWithAccount = allContacts.find(
				(c) => c.accountId === accountId
			);
			if (contactWithAccount && contactWithAccount.account) {
				return contactWithAccount.account.name || "Unknown Account";
			}

			return accountId; // Show ID as fallback
		},
		[accountInfo, allContacts, task]
	);

	const getContactNameById = useCallback(
		(contactId) => {
			if (!contactId) {
				// If no specific contactId, get from task's contacts array
				if (task?.contacts && task.contacts.length > 0) {
					const firstContact = task.contacts[0];
					contactId = firstContact.contactId;
				}
				if (!contactId) return "-";
			}

			// First check if we have contact info loaded
			if (contactInfo && contactInfo.contactId === contactId) {
				return (
					`${contactInfo.firstName || ""} ${
						contactInfo.lastName || ""
					}`.trim() ||
					contactInfo.email ||
					"Unknown Contact"
				);
			}

			// Fallback to allContacts array
			const contact = allContacts.find((c) => c.contactId === contactId);
			if (contact) {
				return (
					`${contact.firstName || ""} ${
						contact.lastName || ""
					}`.trim() ||
					contact.email ||
					"Unknown Contact"
				);
			}

			return contactId; // Show ID as fallback
		},
		[contactInfo, allContacts, task]
	);

	// FIXED: Memoized handleDeleteTask function
	const handleDeleteTask = useCallback(async () => {
		if (window.confirm("Are you sure you want to delete this task?")) {
			try {
				const response = await axios.delete(
					`${BASE_URL_AM}/tasks/${id}`
				);

				if (response.status === 200) {
					// Show success message
					const successDiv = document.createElement("div");
					successDiv.innerHTML = "Task deleted successfully!";
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

					navigate("/activitymanagement/tasks");
				} else {
					throw new Error("Failed to delete task");
				}
			} catch (error) {
				setError(`Failed to delete task: ${error.message}`);
			}
		}
	}, [id, navigate]);

	// FIXED: Memoized handleEditSave function

	const handleEditSave = useCallback(async () => {
		if (isReadOnly) {
			setIsReadOnly(false);
		} else {
			try {
				// ✅ FIXED: Include ALL required fields from task.validator.js
				const updateData = {
					// Required fields
					taskOwner: task.taskOwner,
					subject:
						document.getElementById("subject")?.value ||
						task?.subject,

					// Optional fields with proper fallbacks
					status:
						document.getElementById("status")?.value ||
						task?.status ||
						"OPEN",
					priority:
						document.getElementById("stage")?.value ||
						task?.priority ||
						undefined,

					// Dates - need proper formatting
					dueDate: (() => {
						const dueDateInput =
							document.getElementById("duedate")?.value;
						if (dueDateInput) {
							return new Date(dueDateInput).toISOString();
						}
						return task?.dueDate || undefined;
					})(),

					startDate: (() => {
						const startDateInput =
							document.getElementById("startdate")?.value;
						if (startDateInput) {
							return new Date(startDateInput).toISOString();
						}
						return task?.startDate || undefined;
					})(),

					leadSource:
						document.getElementById("leadsource")?.value ||
						task?.leadSource ||
						undefined,
					description:
						document.getElementById("description")?.value ||
						task?.description ||
						undefined,
					opportunityName: task?.opportunityName || undefined,

					// ✅ ADDED: Include notes field
					notes:
						document.getElementById("notes")?.value ||
						task?.notes ||
						undefined,

					// ✅ CRITICAL: Include existing account and contact IDs
					accountIds:
						task?.accounts?.map((acc) => acc.accountId) || [],
					contactIds:
						task?.contacts?.map((con) => con.contactId) || [],
				};

				console.log("Updating task with data:", updateData);

				const response = await axios.put(
					`${BASE_URL_AM}/tasks/${id}`,
					updateData
				);

				if (response.data.success) {
					setTask(response.data.data);
					setIsReadOnly(true);

					// Show success message
					const successDiv = document.createElement("div");
					successDiv.innerHTML = "Task updated successfully!";
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
					throw new Error("Failed to update task");
				}
			} catch (error) {
				console.error(
					"Update error details:",
					error.response?.data || error.message
				);
				setError(
					`Failed to update task: ${
						error.response?.data?.message || error.message
					}`
				);

				// Show error alert
				alert(
					`❌ Failed to update task: ${
						error.response?.data?.message || error.message
					}`
				);
			}
		}
	}, [isReadOnly, task, id]);

	// FIXED: Memoized handleCancelEdit function
	const handleCancelEdit = useCallback(() => {
		setIsReadOnly(true);
		// Reset form fields to original values
		const subjectField = document.getElementById("subject");
		const statusField = document.getElementById("status");
		const dueDateField = document.getElementById("duedate");
		const startDateField = document.getElementById("startdate");
		const priorityField = document.getElementById("stage");
		const leadSourceField = document.getElementById("leadsource");
		const descriptionField = document.getElementById("description");
		const notesField = document.getElementById("notes"); // ✅ ADDED

		if (subjectField) subjectField.value = task?.subject || "";
		if (statusField) statusField.value = task?.status || "";
		if (dueDateField)
			dueDateField.value = task?.dueDate ? task.dueDate.slice(0, 10) : "";
		if (startDateField)
			startDateField.value = task?.startDate
				? task.startDate.slice(0, 10)
				: "";
		if (priorityField) priorityField.value = task?.priority || "";
		if (leadSourceField) leadSourceField.value = task?.leadSource || "";
		if (descriptionField) descriptionField.value = task?.description || "";
		if (notesField) notesField.value = task?.notes || ""; // ✅ ADDED
	}, [task]);

	const formatDate = useCallback((dateString) => {
		return dateString ? dateString.slice(0, 10) : "";
	}, []);

	if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
	if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
	if (!task) return <div style={{ padding: 20 }}>Task not found</div>;

	return (
		<>
			{/* Tasks Header Section */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="tasks-heading">
						{task.subject || "Task Details"}
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
							onClick={() => setMenuModal(!menuModal)}
						>
							⁞
						</button>
						{menuModal && (
							<div className="menu-modal-container">
								<div className="menu-modal">
									<ul className="menu-modal-list">
										<li>Submit for Approval</li>
										<li
											onClick={handleDeleteTask}
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

			{/* Overview Container */}
			<div className="overview-container">
				<div className="overview-heading">
					<h1>Overview</h1>
				</div>
				<div className="overview-form1">
					<form>
						<div className="form-group createdon">
							<label htmlFor="createdon">Created On</label>
							<input
								type="text"
								id="createdon"
								value={formatDate(task.createdAt)}
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group status">
							<label htmlFor="status">Status</label>
							{isReadOnly ? (
								<input
									type="text"
									id="status"
									value={task.status || ""}
									readOnly
									onChange={() => {}}
								/>
							) : (
								<select
									id="status"
									defaultValue={task.status || ""}
								>
									<option value="">Select Status</option>
									{LEAD_STATUS_OPTIONS.map((status) => (
										<option key={status} value={status}>
											{status.replace(/_/g, " ")}
										</option>
									))}
								</select>
							)}
						</div>
						<div className="form-group duedate">
							<label htmlFor="duedate">Due Date</label>
							<input
								type="date"
								id="duedate"
								defaultValue={
									task.dueDate
										? task.dueDate.slice(0, 10)
										: ""
								}
								readOnly={isReadOnly}
							/>
						</div>
						<div className="form-group subject">
							<label htmlFor="subject">Subject</label>
							<input
								type="text"
								id="subject"
								defaultValue={task.subject || ""}
								readOnly={isReadOnly}
							/>
						</div>
						<div className="form-group owner">
							<label htmlFor="owner">Owner</label>
							<input
								type="text"
								id="owner"
								value={getOwnerName(task.taskOwner)}
								readOnly
								onChange={() => {}}
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Task Information Container */}
			<div className="task-information-container">
				<div className="task-information-heading">
					<div className="left">
						<h1>Task Information</h1>
					</div>
				</div>
				<div className="task-information-form">
					<form>
						<div className="form-group taskowner">
							<label htmlFor="taskowner">Task Owner</label>
							<input
								type="text"
								id="taskowner"
								value={getOwnerName(task.taskOwner)}
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group oppname">
							<label htmlFor="oppname">Opp. Name</label>
							<input
								type="text"
								id="oppname"
								value={task.opportunityName || ""}
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group subject">
							<label htmlFor="subject-info">Subject</label>
							<input
								type="text"
								id="subject-info"
								value={task.subject || ""}
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group stage">
							<label htmlFor="stage">Priority</label>
							{isReadOnly ? (
								<input
									type="text"
									id="stage"
									value={task.priority || ""}
									readOnly
									onChange={() => {}}
								/>
							) : (
								<select
									id="stage"
									defaultValue={task.priority || ""}
								>
									<option value="">Select Priority</option>
									{PRIORITY_OPTIONS.map((priority) => (
										<option key={priority} value={priority}>
											{priority}
										</option>
									))}
								</select>
							)}
						</div>
						<div className="form-group primarycontact">
							<label htmlFor="primarycontact">
								Primary Contact
							</label>
							<input
								type="text"
								id="primarycontact"
								value={getContactNameById()} // Remove the parameter
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group accountname">
							<label htmlFor="accountname">Account Name</label>
							<input
								type="text"
								id="accountname"
								value={getAccountNameById()} // Remove the parameter
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group startdate">
							<label htmlFor="startdate">Start Date</label>
							<input
								type="date"
								id="startdate"
								defaultValue={formatDate(task.startDate)}
								readOnly={isReadOnly}
							/>
						</div>
						<div className="form-group leadsource">
							<label htmlFor="leadsource">Lead Source</label>
							{isReadOnly ? (
								<input
									type="text"
									id="leadsource"
									value={task.leadSource || ""}
									readOnly
									onChange={() => {}}
								/>
							) : (
								<select
									id="leadsource"
									defaultValue={task.leadSource || ""}
								>
									<option value="">Select Lead Source</option>
									{LEAD_SOURCE_OPTIONS.map((source) => (
										<option key={source} value={source}>
											{source.replace(/_/g, " ")}
										</option>
									))}
								</select>
							)}
						</div>
						<div className="form-group status-info">
							<label htmlFor="status-info">Status</label>
							<input
								type="text"
								id="status-info"
								value={task.status || ""}
								readOnly
								onChange={() => {}}
							/>
						</div>
						<div className="form-group description">
							<label htmlFor="description">Description</label>
							<textarea
								id="description"
								defaultValue={task.description || ""}
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
								id="notes"
								defaultValue={task.notes || ""} // ✅ FIXED: Use defaultValue instead of value
								readOnly={isReadOnly}
								// ✅ FIXED: Remove onChange={() => {}} to allow editing
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Account Information Container */}
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
								id="accountid"
								value={accountInfo?.accountId || ""}
								readOnly
							/>
						</div>
						<div className="form-group accountname-detail">
							<label htmlFor="accountname-detail">
								Account Name
							</label>
							<input
								type="text"
								id="accountname-detail"
								value={
									accountInfo?.name ||
									accountInfo?.accountName ||
									""
								}
								readOnly
							/>
						</div>
						<div className="form-group website">
							<label htmlFor="website">Website</label>
							<input
								type="text"
								id="website"
								value={accountInfo?.website || ""}
								readOnly
							/>
						</div>
						<div className="form-group accounttype">
							<label htmlFor="accounttype">Account Type</label>
							<input
								type="text"
								id="accounttype"
								value={
									accountInfo?.type ||
									accountInfo?.accountType ||
									""
								}
								readOnly
							/>
						</div>
						<div className="form-group accountowner">
							<label htmlFor="accountowner">Account Owner</label>
							<input
								type="text"
								id="accountowner"
								value={resolveUserName(accountInfo?.ownerId)}
								readOnly
							/>
						</div>
						<div className="form-group industry">
							<label htmlFor="industry">Industry</label>
							<input
								type="text"
								id="industry"
								value={accountInfo?.industry || ""}
								readOnly
							/>
						</div>
						<div className="form-group parentaccount">
							<label htmlFor="parentaccount">
								Parent Account
							</label>
							<input
								type="text"
								id="parentaccount"
								value={accountInfo?.parentAccountId || ""}
								readOnly
							/>
						</div>
						<div className="form-group role">
							<label htmlFor="role">Role</label>
							<input
								type="text"
								id="role"
								value={accountInfo?.role || ""}
								readOnly
							/>
						</div>
						<div className="form-group account-notes">
							<label htmlFor="account-notes">Notes</label>
							<textarea
								id="account-notes"
								value={accountInfo?.note || ""}
								readOnly
							/>
						</div>
					</form>
				</div>
			</div>

			{/* Contact Information Container */}
			<div className="contact-information-container">
				<div className="contact-information-heading">
					<div className="left">
						<h1>Contact Information</h1>
					</div>
				</div>
				<div className="contact3-information-form">
					<form>
						<div className="form-group emailid3">
							<label htmlFor="emailid3">Email ID</label>
							<input
								type="email"
								id="emailid3"
								value={contactInfo?.email || ""}
								readOnly
							/>
						</div>
						<div className="form-group secondaryemail3">
							<label htmlFor="secondaryemail3">
								Secondary Email
							</label>
							<input
								type="email"
								id="secondaryemail3"
								value={contactInfo?.secondaryEmail || ""}
								readOnly
							/>
						</div>
						<div className="form-group phoneno3">
							<label htmlFor="phoneno3">Phone No.</label>
							<input
								type="tel"
								id="phoneno3"
								value={contactInfo?.phone || ""}
								readOnly
							/>
						</div>
						<div className="form-group mobileno3">
							<label htmlFor="mobileno3">Mobile No.</label>
							<input
								type="tel"
								id="mobileno3"
								value={contactInfo?.mobile || ""}
								readOnly
							/>
						</div>
						<div className="form-group fax3">
							<label htmlFor="fax3">Fax</label>
							<input
								type="text"
								id="fax3"
								value={contactInfo?.fax || ""}
								readOnly
							/>
						</div>
						<div className="form-group website3">
							<label htmlFor="website3">Website</label>
							<input
								type="text"
								id="website3"
								value={contactInfo?.website || ""}
								readOnly
							/>
						</div>
						<div className="form-group addressline13">
							<label htmlFor="addressline13">
								Address Line 1
							</label>
							<input
								type="text"
								id="addressline13"
								value={contactInfo?.billingAddressLine1 || ""}
								readOnly
							/>
						</div>
						<div className="form-group addressline23">
							<label htmlFor="addressline23">
								Address Line 2
							</label>
							<input
								type="text"
								id="addressline23"
								value={contactInfo?.billingAddressLine2 || ""}
								readOnly
							/>
						</div>
						<div className="form-group city3">
							<label htmlFor="city3">City</label>
							<input
								type="text"
								id="city3"
								value={contactInfo?.billingCity || ""}
								readOnly
							/>
						</div>
						<div className="form-group state3">
							<label htmlFor="state3">State</label>
							<input
								type="text"
								id="state3"
								value={contactInfo?.billingState || ""}
								readOnly
							/>
						</div>
						<div className="form-group country3">
							<label htmlFor="country3">Country</label>
							<input
								type="text"
								id="country3"
								value={contactInfo?.billingCountry || ""}
								readOnly
							/>
						</div>
						<div className="form-group zipcode3">
							<label htmlFor="zipcode3">ZIP Code</label>
							<input
								type="text"
								id="zipcode3"
								value={
									contactInfo?.billingZipCode ||
									contactInfo?.zipCode ||
									""
								}
								readOnly
							/>
						</div>
					</form>
				</div>
			</div>

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

export default DetailedTasks;
