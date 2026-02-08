import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateNewTask.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const PRIORITY_OPTIONS = [
	{ value: "LOW", label: "Low" },
	{ value: "MEDIUM", label: "Medium" },
	{ value: "HIGH", label: "High" },
	{ value: "URGENT", label: "Urgent" },
];

const LEAD_SOURCE_OPTIONS = [
	{ value: "EMAIL", label: "Email" },
	{ value: "PHONE_CALL", label: "Phone Call" },
	{ value: "WEB_ENQUIRY", label: "Web Enquiry" },
];

const STATUS_OPTIONS = [
	{ value: "OPEN", label: "Open" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "OVERDUE", label: "Overdue" },
	{ value: "CANCELLED", label: "Cancelled" },
];

const CreateNewTask = () => {
	const navigate = useNavigate();

	const [allUsers, setAllUsers] = useState([]);
	const [allAccounts, setAllAccounts] = useState([]);
	const [allContacts, setAllContacts] = useState([]);

	const [form, setForm] = useState({
		taskOwner: "",
		opportunityName: "",
		subject: "",
		priority: "",
		startDate: "",
		dueDate: "",
		leadSource: "",
		status: "",
		description: "",
		accountIds: [],
		contactIds: [],
	});

	// ✅ FIXED: Use correct endpoint /api/users/s-info and handle raw array response
	useEffect(() => {
		async function fetchUsers() {
			try {
				const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
					method: "GET",
					credentials: "include",
				});

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const data = await res.json();
				console.log("Users API response:", data);

				// ✅ Spring Boot returns raw array, not wrapped in {data: []}
				const usersData = Array.isArray(data) ? data : [];

				// ✅ Sort by full name (firstName + lastName)
				const sortedUsers = usersData.sort((a, b) => {
					const nameA = `${a.firstName || ""} ${a.lastName || ""}`
						.trim()
						.toLowerCase();
					const nameB = `${b.firstName || ""} ${b.lastName || ""}`
						.trim()
						.toLowerCase();
					return nameA.localeCompare(nameB);
				});

				setAllUsers(sortedUsers);
			} catch (err) {
				console.error("Failed to fetch users:", err);
				setAllUsers([]);
			}
		}
		fetchUsers();
	}, []);

	// Fetch accounts and contacts from microservice
	useEffect(() => {
		async function fetchAccounts() {
			try {
				const res = await fetch(`${BASE_URL_AC}/account`);
				const data = await res.json();
				setAllAccounts(data);
			} catch (err) {
				console.error("Failed to fetch accounts:", err);
			}
		}
		async function fetchContacts() {
			try {
				const res = await fetch(`${BASE_URL_AC}/contact`);
				const data = await res.json();
				setAllContacts(data);
			} catch (err) {
				console.error("Failed to fetch contacts:", err);
			}
		}
		fetchAccounts();
		fetchContacts();
	}, []);

	const handleChange = (e) => {
		const { id, value } = e.target;
		// For accountIds/contactIds, wrap value in array (for backend API compatibility)
		if (id === "accountIds") {
			setForm((prev) => ({ ...prev, accountIds: value ? [value] : [] }));
		} else if (id === "contactIds") {
			setForm((prev) => ({ ...prev, contactIds: value ? [value] : [] }));
		} else {
			setForm((prev) => ({ ...prev, [id]: value }));
		}
	};

	const handleSave = async (type) => {
		try {
			const payload = {
				taskOwner: form.taskOwner,
				opportunityName: form.opportunityName,
				subject: form.subject,
				priority: form.priority || undefined,
				startDate: form.startDate
					? new Date(form.startDate).toISOString()
					: undefined,
				dueDate: form.dueDate
					? new Date(form.dueDate).toISOString()
					: undefined,
				leadSource: form.leadSource || undefined,
				status: form.status || undefined,
				description: form.description || undefined,
				accountIds: form.accountIds,
				contactIds: form.contactIds,
			};

			await axios.post(`${BASE_URL_AM}/tasks`, payload);
			alert("✅ Task created successfully!");

			if (type === "save") {
				navigate("/activitymanagement/tasks");
			} else {
				setForm({
					taskOwner: "",
					opportunityName: "",
					subject: "",
					priority: "",
					startDate: "",
					dueDate: "",
					leadSource: "",
					status: "",
					description: "",
					accountIds: [],
					contactIds: [],
				});
			}
		} catch (error) {
			console.error(
				"Error creating task:",
				error.response?.data || error.message
			);
			alert("❌ Failed to create task. Check console for details.");
		}
	};

	// ✅ FIXED: Helper function to get full user name from firstName + lastName
	const getUserFullName = (user) => {
		if (!user) return "";
		const fullName = `${user.firstName || ""} ${
			user.lastName || ""
		}`.trim();
		return fullName || user.username || user.email || "Unknown User";
	};

	return (
		<>
			{/* Page Header */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="task-heading">New Task</h1>
				</div>
				<div className="header-container-buttons">
					<button
						className="cancel-button"
						onClick={() => navigate("/activitymanagement/tasks")}
					>
						Cancel
					</button>
					<button
						className="save-button"
						onClick={() => handleSave("save")}
					>
						Save
					</button>
					<button
						className="save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						Save and New
					</button>
				</div>
			</div>

			{/* Task Form */}
			<div className="tasks-container">
				<div className="tasks-heading">
					<h1>Task Information</h1>
				</div>
				<div className="tasks-form1">
					<form>
						<div className="form-group taskowner1">
							<label htmlFor="taskOwner">Task Owner</label>
							<select
								id="taskOwner"
								value={form.taskOwner}
								onChange={handleChange}
							>
								<option value="">Select Owner</option>
								{allUsers.map((user) => (
									<option key={user.id} value={user.id}>
										{getUserFullName(user)}
									</option>
								))}
							</select>
						</div>

						<div className="form-group oppname1">
							<label htmlFor="opportunityName">Opp. Name</label>
							<input
								type="text"
								id="opportunityName"
								value={form.opportunityName}
								onChange={handleChange}
								placeholder="Opp. Name"
							/>
						</div>

						<div className="form-group subject1">
							<label htmlFor="subject">Subject</label>
							<input
								type="text"
								id="subject"
								value={form.subject}
								onChange={handleChange}
								placeholder="Subject"
							/>
						</div>

						<div className="form-group priority1">
							<label htmlFor="priority">Priority</label>
							<select
								id="priority"
								value={form.priority}
								onChange={handleChange}
							>
								<option value="" disabled>
									Select Priority
								</option>
								{PRIORITY_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						{/* Single-select for Account (only account name) */}
						<div className="form-group accountname1">
							<label htmlFor="accountIds">Account</label>
							<select
								id="accountIds"
								value={form.accountIds[0] || ""}
								onChange={handleChange}
							>
								<option value="" disabled>
									Select Account
								</option>
								{allAccounts.map((acc) => (
									<option
										key={acc.accountId}
										value={acc.accountId}
									>
										{acc.name}
									</option>
								))}
							</select>
						</div>

						{/* Single-select for Contact (only contact name) */}
						<div className="form-group primarycontact1">
							<label htmlFor="contactIds">Contact</label>
							<select
								id="contactIds"
								value={form.contactIds[0] || ""}
								onChange={handleChange}
							>
								<option value="" disabled>
									Select Contact
								</option>
								{allContacts.map((con) => (
									<option
										key={con.contactId}
										value={con.contactId}
									>
										{con.firstName} {con.lastName}
									</option>
								))}
							</select>
						</div>

						<div className="form-group startdate1">
							<label htmlFor="startDate">Start Date</label>
							<input
								type="datetime-local"
								id="startDate"
								value={form.startDate}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group duedate1">
							<label htmlFor="dueDate">Due Date</label>
							<input
								type="date"
								id="dueDate"
								value={form.dueDate}
								onChange={handleChange}
							/>
						</div>

						<div className="form-group leadsource1">
							<label htmlFor="leadSource">Lead Source</label>
							<select
								id="leadSource"
								value={form.leadSource}
								onChange={handleChange}
							>
								<option value="">Select Lead Source</option>
								{LEAD_SOURCE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<div className="form-group status1">
							<label htmlFor="status">Status</label>
							<select
								id="status"
								value={form.status}
								onChange={handleChange}
							>
								<option value="">Select Status</option>
								{STATUS_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<div className="form-group description1">
							<label htmlFor="description">Description</label>
							<textarea
								id="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Write description here..."
							/>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default CreateNewTask;
