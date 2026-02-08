import React, { useEffect, useState } from "react";
import {
	Plus,
	RefreshCcw,
	Filter,
	Search,
	User,
	ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Tasks.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

// Dropdown options
const TASK_FILTER_OPTIONS = [
	{ value: "all", label: "All Tasks" },
	{ value: "closed", label: "Closed Tasks" },
	{ value: "today", label: "Today's Tasks" },
	{ value: "completed", label: "Completed Tasks" },
	{ value: "last7days", label: "Last 7 Days Tasks" },
];

const Tasks = () => {
	const [tasks, setTasks] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showcontactDropdown, setShowcontactDropdown] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [selectedTaskFilter, setSelectedTaskFilter] = useState(
		TASK_FILTER_OPTIONS[0]
	);
	const [isRefreshing, setIsRefreshing] = useState(false); // ✅ NEW: Refresh state

	const [accounts, setAccounts] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [accountsLoading, setAccountsLoading] = useState(false);
	const [contactsLoading, setContactsLoading] = useState(false);

	const navigate = useNavigate();

	// Fetch users from correct endpoint
	useEffect(() => {
		const fetchUsers = async () => {
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

				const usersData = Array.isArray(data) ? data : [];
				setAllUsers(usersData);
			} catch (err) {
				setAllUsers([]);
				console.error("Failed to fetch users:", err);
			}
		};
		fetchUsers();
	}, []);

	// Fetch accounts for name mapping
	useEffect(() => {
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
				setAccounts([]);
			} finally {
				setAccountsLoading(false);
			}
		};

		fetchAccounts();
	}, []);

	// Fetch contacts for name mapping
	useEffect(() => {
		const fetchContacts = async () => {
			setContactsLoading(true);
			try {
				const response = await fetch(`${BASE_URL_AC}/contact`);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch contacts: ${response.status}`
					);
				}

				const result = await response.json();
				console.log("Contacts API response:", result);

				const contactsData = result.data || result || [];
				setContacts(contactsData);
			} catch (error) {
				console.error("Error fetching contacts:", error);
				setContacts([]);
			} finally {
				setContactsLoading(false);
			}
		};

		fetchContacts();
	}, []);

	// Fetch tasks on component mount
	useEffect(() => {
		fetchTasks();
	}, []);

	// ✅ UPDATED: fetchTasks with refresh blink effect
	const fetchTasks = async () => {
		setIsRefreshing(true);
		try {
			const response = await axios.get(`${BASE_URL_AM}/tasks`);
			if (response.data.success) {
				setTasks(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching tasks:", error);
		} finally {
			setTimeout(() => setIsRefreshing(false), 100); // Quick 800ms blink
		}
	};

	const toggleRowSelection = (id) => {
		setSelectedRows((prev) =>
			prev.includes(id)
				? prev.filter((rowId) => rowId !== id)
				: [...prev, id]
		);
	};

	// Toggle select all functionality
	const toggleSelectAll = () => {
		if (
			selectedRows.length === filteredTasks.length &&
			filteredTasks.length > 0
		) {
			setSelectedRows([]);
		} else {
			setSelectedRows(filteredTasks.map((task) => task.id));
		}
	};

	// Check if all rows are selected
	const areAllSelected = () => {
		return (
			filteredTasks.length > 0 &&
			selectedRows.length === filteredTasks.length
		);
	};

	// Check if some (but not all) rows are selected
	const areSomeSelected = () => {
		return (
			selectedRows.length > 0 &&
			selectedRows.length < filteredTasks.length
		);
	};

	// Handle mass delete from Actions menu
	const handleMassDelete = () => {
		if (selectedRows.length === 0) {
			alert("Please select at least one task to delete");
			return;
		}
		setShowActionsModal(false);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			const deletePromises = selectedRows.map((id) =>
				axios.delete(`${BASE_URL_AM}/tasks/${id}`)
			);

			await Promise.all(deletePromises);

			// Show success message
			const successDiv = document.createElement("div");
			successDiv.innerHTML = `✅ Successfully deleted ${
				selectedRows.length
			} task${selectedRows.length > 1 ? "s" : ""}`;
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

			fetchTasks();
			setSelectedRows([]);
		} catch (error) {
			console.error("Error deleting tasks:", error);
			alert(`❌ Failed to delete tasks: ${error.message}`);
		} finally {
			setShowDeleteConfirm(false);
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US");
	};

	// Filtering Logic
	const today = new Date();
	const filteredTasks = tasks.filter((task) => {
		switch (selectedTaskFilter.value) {
			case "all":
				return true;
			case "closed":
				return (
					task.status &&
					String(task.status).toLowerCase() === "closed"
				);
			case "completed":
				return (
					task.status &&
					String(task.status).toLowerCase() === "completed"
				);
			case "today":
				return (
					task.startDate &&
					new Date(task.startDate).toDateString() ===
						today.toDateString()
				);
			case "last7days": {
				if (!task.startDate) return false;
				const taskDate = new Date(task.startDate);
				const diffDays = (today - taskDate) / (1000 * 60 * 60 * 24);
				return diffDays <= 7 && diffDays >= 0;
			}
			default:
				return true;
		}
	});

	// Helper function to get account name by ID
	const getAccountNameById = (accountId) => {
		if (!accountId) return "-";
		const account = accounts.find((a) => a.accountId === accountId);
		if (account) {
			return account.name || "Unknown Account";
		}
		return accountsLoading ? "Loading..." : accountId;
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

	// Render account names using ID mapping
	const renderAccountNames = (task) => {
		if (!Array.isArray(task.accounts) || task.accounts.length === 0)
			return "-";

		return task.accounts
			.map((accountItem) => {
				if (typeof accountItem === "object" && accountItem.name) {
					return accountItem.name;
				} else if (
					typeof accountItem === "object" &&
					accountItem.accountId
				) {
					return getAccountNameById(accountItem.accountId);
				} else if (typeof accountItem === "string") {
					return getAccountNameById(accountItem);
				}
				return "Unknown Account";
			})
			.join(", ");
	};

	// Render contact names using ID mapping
	const renderContactNames = (task) => {
		if (!Array.isArray(task.contacts) || task.contacts.length === 0)
			return "-";

		return task.contacts
			.map((contactItem) => {
				if (
					typeof contactItem === "object" &&
					(contactItem.firstName || contactItem.lastName)
				) {
					return `${contactItem.firstName || ""} ${
						contactItem.lastName || ""
					}`.trim();
				} else if (
					typeof contactItem === "object" &&
					contactItem.contactId
				) {
					return getContactNameById(contactItem.contactId);
				} else if (typeof contactItem === "string") {
					return getContactNameById(contactItem);
				}
				return "Unknown Contact";
			})
			.join(", ");
	};

	// Get the user's name from firstName + lastName
	const getOwnerName = (taskOwnerId) => {
		if (!taskOwnerId) return "-";
		const found = allUsers.find((u) => u.id === taskOwnerId);
		if (found) {
			const fullName = `${found.firstName || ""} ${
				found.lastName || ""
			}`.trim();
			return fullName || found.username || found.email || "Unknown User";
		}
		return taskOwnerId;
	};

	return (
		<div className="tasks-management-container">
			<div className="tasks-section">
				{/* Stats */}
				<div className="tasks-stats">
					<div className="stat-item">
						<div className="stat-label">TOTAL TASKS</div>
						<div className="stat-value">{tasks.length}</div>
					</div>
					{selectedRows.length > 0 && (
						<div className="stat-item">
							<div className="stat-label">SELECTED</div>
							<div className="stat-value">
								{selectedRows.length}
							</div>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="tasks-actions">
					<div className="tasks-actions-left">
						<div className="search-container">
							<input
								type="text"
								placeholder="Search tasks..."
								className="search-input"
							/>
							<Search
								className="search-icon-small"
								size={20}
								color="#64748b"
							/>
						</div>
						<div
							className="sales-quotes-dropdown-container"
							style={{ position: "relative" }}
						>
							<button
								className="sales-quotes-dropdown-button"
								onClick={() =>
									setShowcontactDropdown(!showcontactDropdown)
								}
							>
								<User size={20} color="#64748b" />
								<span>{selectedTaskFilter.label}</span>
								<ChevronDown size={20} color="#64748b" />
							</button>
							{showcontactDropdown && (
								<div className="dropdown-menu">
									{TASK_FILTER_OPTIONS.map((option) => (
										<div
											key={option.value}
											className={`dropdown-option${
												selectedTaskFilter.value ===
												option.value
													? " selected"
													: ""
											}`}
											onClick={() => {
												setSelectedTaskFilter(option);
												setShowcontactDropdown(false);
											}}
										>
											{option.label}
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="action-icons">
						<button
							className="modern-button add-button"
							onClick={() =>
								navigate("/activitymanagement/tasks/create")
							}
						>
							<Plus size={20} color="#fff" />
							<span>Add Task</span>
						</button>
						{/* ✅ UPDATED: Refresh button with blink effect */}
						<button
							className="icon-button-modern refresh-button"
							onClick={fetchTasks}
							style={{
								opacity: isRefreshing ? 0.5 : 1,
								transition: "opacity 0.2s ease",
							}}
						>
							<RefreshCcw size={20} color="#64748b" />
						</button>
						<button
							className="icon-button-modern filter-button"
							onClick={() => setShowFilters(!showFilters)}
						>
							<Filter size={20} color="#64748b" />
						</button>
						<div className="action-button-container">
							<button
								className="modern-button action-button"
								onClick={() =>
									setShowActionsModal((prev) => !prev)
								}
							>
								Actions
								<ChevronDown size={20} color="#64748b" />
							</button>
							{showActionsModal && (
								<div className="actions-modal-container">
									<ul className="actions-modal-list">
										<li>Mass Mail</li>
										<li
											onClick={handleMassDelete}
											style={{
												cursor: "pointer",
												color:
													selectedRows.length === 0
														? "#9ca3af"
														: "#ef4444",
											}}
										>
											Mass Delete{" "}
											{selectedRows.length > 0 &&
												`(${selectedRows.length})`}
										</li>
										<li>Export</li>
										<li>Mass Update</li>
										<li>Print View</li>
									</ul>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Filters Section */}
				{showFilters && (
					<div className="filters-container">
						<div className="filters-header">
							<h3>Filter Tasks</h3>
							<button
								className="close-filters"
								onClick={() => setShowFilters(false)}
							>
								×
							</button>
						</div>
						<div className="filter-row">
							<div className="filter-col">
								<label>Status</label>
								<select className="filter-select">
									<option>Select</option>
									<option>NOT_STARTED</option>
									<option>IN_PROGRESS</option>
									<option>COMPLETED</option>
									<option>CLOSED</option>
									<option>CANCELLED</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Priority</label>
								<select className="filter-select">
									<option>Select</option>
									<option>LOW</option>
									<option>MEDIUM</option>
									<option>HIGH</option>
									<option>URGENT</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Task Owner</label>
								<select className="filter-select">
									<option>Select</option>
									{allUsers.map((user) => (
										<option key={user.id} value={user.id}>
											{getOwnerName(user.id)}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="filter-row">
							<div className="filter-col">
								<label>Start Date</label>
								<input type="date" className="filter-select" />
							</div>
							<div className="filter-col">
								<label>Due Date</label>
								<input type="date" className="filter-select" />
							</div>
							<div className="filter-col">
								<label>Subject</label>
								<input
									type="text"
									className="filter-select"
									placeholder="Search by subject..."
								/>
							</div>
						</div>
						<div className="filter-actions">
							<div className="filter-buttons">
								<button className="reset-button">Reset</button>
								<button className="apply-button">Apply</button>
							</div>
						</div>
					</div>
				)}

				{/* ✅ UPDATED: Table with blink effect */}
				<div
					className="sales-quotes-table-container"
					style={{
						opacity: isRefreshing ? 0.4 : 1,
						transition: "opacity 0.001s ease",
					}}
				>
					<table className="contact-table">
						<thead>
							<tr>
								<th>
									<input
										type="checkbox"
										checked={areAllSelected()}
										ref={(input) => {
											if (input) {
												input.indeterminate =
													areSomeSelected();
											}
										}}
										onChange={toggleSelectAll}
										title={
											areAllSelected()
												? "Deselect all"
												: "Select all"
										}
									/>
								</th>
								<th>
									Subject <span className="sort-icon">↓</span>
								</th>
								<th>
									Status <span className="sort-icon">↓</span>
								</th>
								<th>
									Start Date{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Due Date{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Priority{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Accounts{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Contacts{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Description{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Task Owner{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Action <span className="sort-icon">↓</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredTasks.length === 0 ? (
								<tr>
									<td
										colSpan="11"
										style={{
											textAlign: "center",
											padding: "40px",
											color: "#6b7280",
										}}
									>
										<div>
											<div
												style={{
													fontSize: "18px",
													fontWeight: "500",
													marginBottom: "8px",
												}}
											>
												No tasks found
											</div>
											<div
												style={{
													fontSize: "14px",
													color: "#9ca3af",
												}}
											>
												Get started by creating your
												first task
											</div>
										</div>
									</td>
								</tr>
							) : (
								filteredTasks.map((task) => (
									<tr
										key={task.id}
										className={
											selectedRows.includes(task.id)
												? "selected-row"
												: ""
										}
									>
										<td>
											<input
												type="checkbox"
												checked={selectedRows.includes(
													task.id
												)}
												onChange={() =>
													toggleRowSelection(task.id)
												}
											/>
										</td>
										<td>{task.subject || "-"}</td>
										<td>
											<span
												className={`status-badge status-${task.status?.toLowerCase()}`}
											>
												{task.status
													? task.status
															.charAt(0)
															.toUpperCase() +
													  task.status
															.slice(1)
															.toLowerCase()
													: "-"}
											</span>
										</td>
										<td>{formatDate(task.startDate)}</td>
										<td>{formatDate(task.dueDate)}</td>
										<td>
											<span
												className={`priority-badge priority-${task.priority?.toLowerCase()}`}
											>
												{task.priority
													? task.priority
															.charAt(0)
															.toUpperCase() +
													  task.priority
															.slice(1)
															.toLowerCase()
													: "-"}
											</span>
										</td>
										<td>{renderAccountNames(task)}</td>
										<td>{renderContactNames(task)}</td>
										<td>{task.description || "-"}</td>
										<td>{getOwnerName(task.taskOwner)}</td>
										<td>
											<div className="action-buttons">
												<button
													className="display-btn"
													onClick={() =>
														navigate(
															`/activitymanagement/tasks/details/${task.id}`
														)
													}
												>
													Display
												</button>
												<button
													className="delete-btn"
													onClick={() => {
														setSelectedRows([
															task.id,
														]);
														setShowDeleteConfirm(
															true
														);
													}}
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<div className="delete-confirm-overlay">
						<div className="delete-confirm-dialog">
							<div className="dialog-header">
								<h3>Confirm Delete</h3>
								<p>
									Are you sure you want to delete{" "}
									{selectedRows.length} selected task
									{selectedRows.length > 1 ? "s" : ""}?
								</p>
							</div>
							<div className="dialog-buttons">
								<button
									className="confirm-cancel-button"
									onClick={() => setShowDeleteConfirm(false)}
								>
									Cancel
								</button>
								<button
									className="confirm-delete-button"
									onClick={handleDeleteConfirm}
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Tasks;
