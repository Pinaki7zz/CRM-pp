import { useState, useEffect } from "react";
import {
	Plus,
	RefreshCcw,
	Filter,
	Search,
	User,
	ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PhoneCalls.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const PhoneCalls = () => {
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showcontactDropdown, setShowcontactDropdown] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const [phoneCallsData, setPhoneCallsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalRecords: 0,
	});

	// State for mapping names
	const [users, setUsers] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [contactsLoading, setContactsLoading] = useState(false);

	const navigate = useNavigate();

	// FIXED: Move fetchPhoneCalls inside useEffect to resolve dependency issue
	useEffect(() => {
		const fetchPhoneCalls = async (page = 1) => {
			setLoading(true);
			try {
				const response = await fetch(
					`${BASE_URL_AM}/phone-calls?page=${page}&limit=10`
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch phone calls: ${response.status}`
					);
				}

				const result = await response.json();
				console.log("Phone calls API response:", result);

				if (result.success) {
					setPhoneCallsData(result.data);
					setPagination(result.pagination);
				} else {
					throw new Error(
						result.message || "Failed to fetch phone calls"
					);
				}
			} catch (error) {
				console.error("Error fetching phone calls:", error);
				setError(`Failed to load phone calls: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		fetchPhoneCalls(pagination.currentPage);
	}, [pagination.currentPage]); // FIXED: Only pagination.currentPage in dependencies

	// FIXED: Move fetchUsers inside useEffect to resolve dependency issue
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
			} catch (error) {
				console.error("Error fetching users:", error);
				// Don't show error for mapping data as it's not critical
			} finally {
				setUsersLoading(false);
			}
		};

		fetchUsers();
	}, []); // Empty dependency array - runs once on mount

	// FIXED: Move fetchContacts inside useEffect to resolve dependency issue
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
				// Don't show error for mapping data as it's not critical
			} finally {
				setContactsLoading(false);
			}
		};

		fetchContacts();
	}, []); // Empty dependency array - runs once on mount

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
		return usersLoading ? "Loading..." : "Unknown User";
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
		return contactsLoading ? "Loading..." : "Unknown Contact";
	};

	// Format date for display
	const formatDate = (dateString) => {
		if (!dateString) return "-";
		try {
			return new Date(dateString).toLocaleString();
		} catch (error) {
			console.error("Error formatting date:", error);
			return "-";
		}
	};

	// Format call type for display
	const formatCallType = (callType) => {
		return callType
			? callType.charAt(0).toUpperCase() + callType.slice(1).toLowerCase()
			: "-";
	};

	// Format status for display
	const formatStatus = (status) => {
		return status
			? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
			: "-";
	};

	// Delete phone call
	const handleDeletePhoneCall = async (phoneCallId) => {
		try {
			console.log("Deleting phone call:", phoneCallId);
			const response = await fetch(
				`${BASE_URL_AM}/phone-calls/${phoneCallId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to delete phone call: ${response.status}`
				);
			}

			console.log("Phone call deleted successfully");

			// Refetch phone calls after deletion
			const fetchPhoneCallsAfterDelete = async () => {
				setLoading(true);
				try {
					const response = await fetch(
						`${BASE_URL_AM}/phone-calls?page=${pagination.currentPage}&limit=10`
					);

					if (!response.ok) {
						throw new Error(
							`Failed to fetch phone calls: ${response.status}`
						);
					}

					const result = await response.json();

					if (result.success) {
						setPhoneCallsData(result.data);
						setPagination(result.pagination);
					}
				} catch (error) {
					console.error(
						"Error fetching phone calls after delete:",
						error
					);
					setError(`Failed to refresh phone calls: ${error.message}`);
				} finally {
					setLoading(false);
				}
			};

			await fetchPhoneCallsAfterDelete();
			setShowDeleteConfirm(false);
			setSelectedRows([]);

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
		} catch (error) {
			console.error("Error deleting phone call:", error);
			setError(`Failed to delete phone call: ${error.message}`);
		}
	};

	const contactCategories = [
		{
			id: "all",
			name: "All Calls",
			count: pagination.totalRecords.toString(),
		},
		{ id: "mycalls", name: "My Calls", count: "" },
		{ id: "closed", name: "Closed Calls", count: "" },
		{ id: "today", name: "Todays/Open Calls", count: "" },
		{ id: "completed", name: "Completed Calls", count: "" },
		{ id: "lastweek", name: "Last 7 Days Calls", count: "" },
	];

	const toggleRowSelection = (id) => {
		if (selectedRows.includes(id)) {
			setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
		} else {
			setSelectedRows([...selectedRows, id]);
		}
	};

	const handleDeleteConfirm = () => {
		if (selectedRows.length > 0) {
			handleDeletePhoneCall(selectedRows[0]);
		}
	};

	const toggleContactsDropdown = () => {
		setShowcontactDropdown(!showcontactDropdown);
	};

	const toggleFilters = () => {
		setShowFilters(!showFilters);
	};

	const handlePageChange = (page) => {
		setPagination((prev) => ({ ...prev, currentPage: page }));
	};

	// FIXED: handleRefresh now creates its own fetch functions to avoid dependency issues
	const handleRefresh = () => {
		console.log("Refreshing phone calls...");

		// Refresh phone calls
		const refreshPhoneCalls = async () => {
			setLoading(true);
			try {
				const response = await fetch(
					`${BASE_URL_AM}/phone-calls?page=${pagination.currentPage}&limit=10`
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch phone calls: ${response.status}`
					);
				}

				const result = await response.json();

				if (result.success) {
					setPhoneCallsData(result.data);
					setPagination(result.pagination);
				}
			} catch (error) {
				console.error("Error refreshing phone calls:", error);
				setError(`Failed to refresh phone calls: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		// Refresh users
		const refreshUsers = async () => {
			setUsersLoading(true);
			try {
				const response = await fetch(`${BASE_URL_UM}/users/s-info`, {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const result = await response.json();
					const usersData = result.data || result || [];
					setUsers(usersData);
				}
			} catch (error) {
				console.error("Error refreshing users:", error);
			} finally {
				setUsersLoading(false);
			}
		};

		// Refresh contacts
		const refreshContacts = async () => {
			setContactsLoading(true);
			try {
				const response = await fetch(`${BASE_URL_AC}/contact`);

				if (response.ok) {
					const result = await response.json();
					const contactsData = result.data || result || [];
					setContacts(contactsData);
				}
			} catch (error) {
				console.error("Error refreshing contacts:", error);
			} finally {
				setContactsLoading(false);
			}
		};

		// Execute all refresh functions
		refreshPhoneCalls();
		refreshUsers();
		refreshContacts();
	};

	return (
		<div className="phonecalls-management-container">
			<div className="phonecalls-section">
				{/* Phone Calls Stats */}
				<div className="phonecalls-stats">
					<div className="stat-item">
						<div className="stat-label">TOTAL CALLS</div>
						<div className="stat-value">
							{pagination.totalRecords}
						</div>
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
							margin: "10px 0",
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

				{/* Search and Actions */}
				<div className="phonecalls-actions">
					<div className="phonecalls-actions-left">
						<div className="search-container">
							<input
								type="text"
								placeholder="Search phone calls..."
								className="search-input"
							/>
							<Search
								className="search-icon-small"
								size={20}
								color="#64748b"
								strokeWidth={1}
							/>
						</div>
						<div className="phonecalls-dropdown-container">
							<button
								className="phonecalls-dropdown-button"
								onClick={toggleContactsDropdown}
							>
								<User
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
								<span>All Calls</span>
								<ChevronDown
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
							</button>
							{showcontactDropdown && (
								<div className="phonecalls-dropdown-menu">
									{contactCategories.map((category) => (
										<div
											key={category.id}
											className="phonecalls-dropdown-item"
										>
											<span className="icon-category"></span>
											<span>{category.name}</span>
											{category.count && (
												<span className="count">
													{category.count}
												</span>
											)}
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
								navigate(
									"/activitymanagement/phonecalls/create"
								)
							}
						>
							<Plus size={20} color="#fff" strokeWidth={2} />
							<span>Add Call</span>
						</button>
						<button
							className="icon-button-modern refresh-button"
							onClick={handleRefresh}
						>
							<RefreshCcw
								size={20}
								color="#64748b"
								strokeWidth={2}
							/>
						</button>
						<button
							className="icon-button-modern filter-button"
							onClick={toggleFilters}
						>
							<Filter size={20} color="#64748b" strokeWidth={2} />
						</button>
						<div className="action-button-container">
							<button
								className="modern-button action-button"
								onClick={() =>
									setShowActionsModal((prev) => !prev)
								}
							>
								Actions
								<ChevronDown
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
							</button>
							{/* Actions Modal */}
							{showActionsModal && (
								<div className="actions-modal-container">
									<div className="actions-modal">
										<ul className="actions-modal-list">
											<li>Mass Mail</li>
											<li>Mass Delete</li>
											<li>Export</li>
											<li>Mass Update</li>
											<li>Print View</li>
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Filters Section */}
				{showFilters && (
					<div className="filters-container">
						<div className="filters-header">
							<h3>Filter Calls</h3>
							<button
								className="close-filters"
								onClick={toggleFilters}
							>
								×
							</button>
						</div>
						<div className="filter-row">
							<div className="filter-col">
								<label>Status</label>
								<select className="filter-select">
									<option>Select</option>
									<option>SCHEDULED</option>
									<option>IN_PROGRESS</option>
									<option>COMPLETED</option>
									<option>CANCELLED</option>
									<option>NO_ANSWER</option>
									<option>BUSY</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Contact Name</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Subject</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Call Type</label>
								<select className="filter-select">
									<option>Select</option>
									<option>INBOUND</option>
									<option>OUTBOUND</option>
								</select>
							</div>
						</div>
						<div className="filter-row">
							<div className="filter-col">
								<label>Start Date</label>
								<input type="date" className="filter-select" />
							</div>
							<div className="filter-col">
								<label>End Date</label>
								<input type="date" className="filter-select" />
							</div>
							<div className="filter-col">
								<label>Call For</label>
								<select className="filter-select">
									<option>Select</option>
									<option>LEADS</option>
									<option>CONTACTS</option>
									<option>CASES</option>
								</select>
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

				{/* Phone Calls Table */}
				<div className="phonecalls-table-container">
					<table className="contact-table">
						<thead>
							<tr>
								<th className="checkbox-column">
									<input
										type="checkbox"
										className="custom-checkbox"
									/>
								</th>
								<th>
									Subject <span className="sort-icon">↓</span>
								</th>
								<th>
									Status <span className="sort-icon">↓</span>
								</th>
								<th>
									Call Start Time{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Call End Time{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Created Date{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Call Type{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Call For{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Contact <span className="sort-icon">↓</span>
								</th>
								<th>
									Call Owner{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Action <span className="sort-icon">↓</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td
										colSpan="11"
										style={{
											textAlign: "center",
											padding: "20px",
										}}
									>
										Loading phone calls...
									</td>
								</tr>
							) : phoneCallsData.length > 0 ? (
								phoneCallsData.map((phoneCall) => (
									<tr
										key={phoneCall.id}
										className={
											selectedRows.includes(phoneCall.id)
												? "selected-row"
												: ""
										}
									>
										<td className="checkbox-column">
											<input
												type="checkbox"
												className="custom-checkbox"
												checked={selectedRows.includes(
													phoneCall.id
												)}
												onChange={() =>
													toggleRowSelection(
														phoneCall.id
													)
												}
											/>
										</td>
										<td>{phoneCall.subject || "-"}</td>
										<td>
											<span
												className={`status-badge status-${phoneCall.status?.toLowerCase()}`}
											>
												{formatStatus(phoneCall.status)}
											</span>
										</td>
										<td>
											{formatDate(phoneCall.callTimeFrom)}
										</td>
										<td>
											{formatDate(phoneCall.callTimeTo)}
										</td>
										<td>
											{formatDate(phoneCall.createdAt)}
										</td>
										<td>
											{formatCallType(phoneCall.callType)}
										</td>
										<td>
											{formatCallType(phoneCall.callFor)}
										</td>
										<td>
											{getContactNameById(
												phoneCall.primaryContactId
											)}
										</td>
										<td>
											{getUserNameById(phoneCall.owner)}
										</td>
										<td>
											<div className="action-buttons">
												<button
													className="display-btn"
													onClick={() =>
														navigate(
															`/activitymanagement/phonecalls/details/${phoneCall.id}`
														)
													}
												>
													Display
												</button>
												<button
													className="delete-btn"
													onClick={() => {
														setSelectedRows([
															phoneCall.id,
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
							) : (
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
											{/* <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div> */}
											<div
												style={{
													fontSize: "18px",
													fontWeight: "500",
													marginBottom: "8px",
												}}
											>
												No phone calls found
											</div>
											<div
												style={{
													fontSize: "14px",
													color: "#9ca3af",
												}}
											>
												Get started by creating your
												first phone call
											</div>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="pagination">
					<button
						className="pagination-button"
						disabled={pagination.currentPage === 1}
						onClick={() =>
							handlePageChange(pagination.currentPage - 1)
						}
					>
						Previous
					</button>
					<div className="page-numbers">
						{Array.from(
							{ length: Math.max(1, pagination.totalPages) },
							(_, index) => (
								<button
									key={index + 1}
									className={`page-number ${
										pagination.currentPage === index + 1
											? "active"
											: ""
									}`}
									onClick={() => handlePageChange(index + 1)}
								>
									{index + 1}
								</button>
							)
						)}
					</div>
					<button
						className="pagination-button"
						disabled={
							pagination.currentPage === pagination.totalPages ||
							pagination.totalPages === 0
						}
						onClick={() =>
							handlePageChange(pagination.currentPage + 1)
						}
					>
						Next
					</button>
				</div>

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<div className="delete-confirm-overlay">
						<div className="delete-confirm-dialog">
							<div className="dialog-header">
								<h3>Confirm Delete</h3>
								<p>
									Are you sure you want to delete this phone
									call?
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

export default PhoneCalls;
