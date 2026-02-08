import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AgentSupport.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

const AgentSupport = () => {
	const navigate = useNavigate();

	// Filter and view states
	const [activeFilter, setActiveFilter] = useState("my-tickets");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [ownerFilter, setOwnerFilter] = useState("all");
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
	const [tempStatusFilter, setTempStatusFilter] = useState("all");
	const [tempPriorityFilter, setTempPriorityFilter] = useState("all");
	const [tempOwnerFilter, setTempOwnerFilter] = useState("all");
	const filterPanelRef = useRef(null);

	// Data states
	const [tickets, setTickets] = useState([]);
	const [availableOwners, setAvailableOwners] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [stats, setStats] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// 🆕 NEW: Current user selection
	const [currentUserName, setCurrentUserName] = useState("");
	const [showUserSelector, setShowUserSelector] = useState(false);

	// Fetch all users for selection
	const fetchAllUsers = async () => {
		try {
			const response = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});

			if (response.ok) {
				const users = await response.json();
				const usersWithNames = users
					.map((user) => ({
						...user,
						fullName:
							`${user.firstName || ""} ${
								user.lastName || ""
							}`.trim() ||
							user.username ||
							user.email,
					}))
					.sort((a, b) => a.fullName.localeCompare(b.fullName));

				setAllUsers(usersWithNames);

				// Set default user (first user or previously selected)
				const savedUser = localStorage.getItem("selectedAgentUser");
				if (savedUser) {
					setCurrentUserName(savedUser);
				} else if (usersWithNames.length > 0) {
					setCurrentUserName(usersWithNames[0].fullName);
					localStorage.setItem(
						"selectedAgentUser",
						usersWithNames[0].fullName
					);
				}
			}
		} catch (err) {
			console.error("Error fetching users:", err);
			// Fallback user
			setCurrentUserName("John Smith");
		}
	};

	// Handle user selection
	const handleUserSelection = (userName) => {
		setCurrentUserName(userName);
		localStorage.setItem("selectedAgentUser", userName);
		setShowUserSelector(false);
		// This will trigger useEffect to refetch tickets
	};

	// Fetch tickets based on active filter and current filters
	const fetchTickets = React.useCallback(async () => {
		if (!currentUserName) return; // Don't fetch if no user selected

		setLoading(true);
		setError(null);

		try {
			let url = "";
			let queryParams = new URLSearchParams();

			// Add search term if present
			if (searchTerm.trim()) {
				queryParams.append("search", searchTerm.trim());
			}

			// Add filters if not 'all'
			if (statusFilter !== "all") {
				queryParams.append("status", statusFilter);
			}
			if (priorityFilter !== "all") {
				queryParams.append("priority", priorityFilter);
			}
			if (ownerFilter !== "all") {
				queryParams.append("owner", ownerFilter);
			}

			// Choose endpoint based on active filter
			if (activeFilter === "my-tickets") {
				url = `${BASE_URL_SER}/agent-support/tickets/view/my-tickets`;
				queryParams.append("agentName", currentUserName);
			} else if (activeFilter === "all-tickets") {
				url = `${BASE_URL_SER}/agent-support/tickets/view/all-tickets`;
			} else {
				url = `${BASE_URL_SER}/agent-support/tickets/view/${activeFilter}`;
			}

			// Append query parameters if any
			const queryString = queryParams.toString();
			if (queryString) {
				url += `?${queryString}`;
			}

			console.log("Fetching tickets from:", url);
			console.log("Current user:", currentUserName);

			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Client-side filtering for 'my-tickets' for extra security
			let filteredData = Array.isArray(data) ? data : [];

			if (activeFilter === "my-tickets" && currentUserName) {
				filteredData = filteredData.filter(
					(ticket) => ticket.ticket_owner_name === currentUserName
				);
			}

			setTickets(filteredData);
		} catch (err) {
			console.error("Error fetching tickets:", err);
			setError(err.message);
			setTickets([]);
		} finally {
			setLoading(false);
		}
	}, [
		activeFilter,
		searchTerm,
		statusFilter,
		priorityFilter,
		ownerFilter,
		currentUserName,
	]);

	// Fetch available owners for filter dropdown
	const fetchAvailableOwners = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_SER}/agent-support/owners`
			);
			if (response.ok) {
				const owners = await response.json();
				setAvailableOwners(owners);
			}
		} catch (err) {
			console.error("Error fetching owners:", err);
		}
	};

	// Fetch user-specific stats
	const fetchStats = React.useCallback(async () => {
		if (!currentUserName) return;

		try {
			const response = await fetch(
				`${BASE_URL_SER}/agent-support/stats?agentName=${encodeURIComponent(
					currentUserName
				)}`
			);
			if (response.ok) {
				const statsData = await response.json();
				setStats(statsData);
			}
		} catch (err) {
			console.error("Error fetching stats:", err);
		}
	}, [currentUserName]);

	// Other handler functions remain the same...
	const handleViewFilterChange = (viewType) => {
		setActiveFilter(viewType);
	};

	const handleApplyFilters = () => {
		setStatusFilter(tempStatusFilter);
		setPriorityFilter(tempPriorityFilter);
		setOwnerFilter(tempOwnerFilter);
		setIsFilterPanelOpen(false);
	};

	const handleResetFilters = () => {
		setTempStatusFilter("all");
		setTempPriorityFilter("all");
		setTempOwnerFilter("all");
		setStatusFilter("all");
		setPriorityFilter("all");
		setOwnerFilter("all");
		setSearchTerm("");
	};

	const handleDisplayTicket = (ticketId) => {
		navigate(`/service/tickets/details/${encodeURIComponent(ticketId)}`);
	};

	const handleDeleteTicket = async (ticketId, ticketOwner) => {
		if (ticketOwner !== currentUserName) {
			alert("You can only delete your own tickets.");
			return;
		}

		if (!window.confirm("Are you sure you want to delete this ticket?")) {
			return;
		}

		try {
			const response = await fetch(
				`${BASE_URL_SER}/tickets/${ticketId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				fetchTickets();
			} else {
				alert("Failed to delete ticket");
			}
		} catch (err) {
			console.error("Error deleting ticket:", err);
			alert("Error deleting ticket: " + err.message);
		}
	};

	// Format functions remain the same...
	const formatStatus = (status) => {
		if (!status) return "";
		return status.toLowerCase().replace("_", "-");
	};

	const formatStatusText = (status) => {
		if (!status) return "";
		return status
			.toLowerCase()
			.replace("_", " ")
			.replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const formatPriority = (priority) => {
		if (!priority) return "";
		return priority.toLowerCase();
	};

	// Initial setup
	useEffect(() => {
		fetchAllUsers();
		fetchAvailableOwners();
	}, []);

	// Fetch tickets and stats when user changes
	useEffect(() => {
		if (currentUserName) {
			fetchTickets();
			fetchStats();
		}
	}, [
		activeFilter,
		searchTerm,
		statusFilter,
		priorityFilter,
		ownerFilter,
		currentUserName,
		fetchTickets,
		fetchStats,
	]);

	// Handle click outside for filter panel
	useEffect(() => {
		const handleClickOutside = (event) => {
			const filterButton = event.target.closest(".btn-filter-toggle");
			if (
				filterPanelRef.current &&
				!filterPanelRef.current.contains(event.target) &&
				!filterButton
			) {
				setIsFilterPanelOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="agent-support-container">
			{/* 🆕 NEW: User Selection Header */}
			<div
				className="user-selection-header"
				style={{
					padding: "15px 20px",
					backgroundColor: "#f0f9ff",
					borderRadius: "8px",
					marginBottom: "20px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					border: "1px solid #e0f2fe",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}
				>
					<User size={20} color="#0369a1" />
					<div>
						<strong>Agent Desktop</strong>
						<div style={{ fontSize: "14px", color: "#6b7280" }}>
							Current Agent:{" "}
							<strong>
								{currentUserName || "No user selected"}
							</strong>
						</div>
					</div>
				</div>
				<div style={{ position: "relative" }}>
					<button
						className="user-selector-btn"
						onClick={() => setShowUserSelector(!showUserSelector)}
						style={{
							padding: "8px 16px",
							backgroundColor: "#0369a1",
							color: "white",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							fontSize: "14px",
						}}
					>
						Switch User
					</button>

					{showUserSelector && (
						<div
							className="user-selector-dropdown"
							style={{
								position: "absolute",
								top: "100%",
								right: "0",
								backgroundColor: "white",
								border: "1px solid #d1d5db",
								borderRadius: "6px",
								boxShadow:
									"0 10px 15px -3px rgba(0, 0, 0, 0.1)",
								zIndex: 1000,
								minWidth: "200px",
								maxHeight: "300px",
								overflowY: "auto",
								marginTop: "5px",
							}}
						>
							<div
								style={{
									padding: "10px",
									borderBottom: "1px solid #e5e7eb",
									fontSize: "14px",
									fontWeight: "600",
								}}
							>
								Select Agent:
							</div>
							{allUsers.map((user) => (
								<div
									key={user.id}
									className="user-option"
									onClick={() =>
										handleUserSelection(user.fullName)
									}
									style={{
										padding: "10px",
										cursor: "pointer",
										fontSize: "14px",
										borderBottom: "1px solid #f3f4f6",
										backgroundColor:
											user.fullName === currentUserName
												? "#e0f2fe"
												: "transparent",
									}}
									onMouseEnter={(e) =>
										(e.target.style.backgroundColor =
											"#f9fafb")
									}
									onMouseLeave={(e) =>
										(e.target.style.backgroundColor =
											user.fullName === currentUserName
												? "#e0f2fe"
												: "transparent")
									}
								>
									<div style={{ fontWeight: "500" }}>
										{user.fullName}
									</div>
									<div
										style={{
											fontSize: "12px",
											color: "#6b7280",
										}}
									>
										{user.email}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Rest of your existing component remains exactly the same... */}
			<div className="ticket-management-section">
				<div className="header-controls">
					<div className="search-bar">
						<Search size={16} className="search-icon" />
						<input
							type="text"
							placeholder="Search your tickets..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<button
						className="btn-filter-toggle"
						onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
					>
						<Filter size={16} />
						<span>Filter</span>
					</button>

					{isFilterPanelOpen && (
						<div className="filter-panel" ref={filterPanelRef}>
							<div className="filter-panel-header">
								<h4>Filter Your Tickets</h4>
								<button
									className="btn-close-panel"
									onClick={() => setIsFilterPanelOpen(false)}
								>
									<X size={18} />
								</button>
							</div>
							<div className="filter-panel-body">
								<div className="filter-group">
									<label>Priority</label>
									<select
										value={tempPriorityFilter}
										onChange={(e) =>
											setTempPriorityFilter(
												e.target.value
											)
										}
									>
										<option value="all">
											All Priorities
										</option>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="critical">
											Critical
										</option>
									</select>
								</div>
								<div className="filter-group">
									<label>Status</label>
									<select
										value={tempStatusFilter}
										onChange={(e) =>
											setTempStatusFilter(e.target.value)
										}
									>
										<option value="all">All Status</option>
										<option value="open">Open</option>
										<option value="to-be-processed">
											To Be Processed
										</option>
										<option value="completed">
											Completed
										</option>
										<option value="closed">Closed</option>
									</select>
								</div>
								{activeFilter === "all-tickets" && (
									<div className="filter-group">
										<label>Owner</label>
										<select
											value={tempOwnerFilter}
											onChange={(e) =>
												setTempOwnerFilter(
													e.target.value
												)
											}
										>
											<option value="all">
												All Owners
											</option>
											{availableOwners.map((owner) => (
												<option
													key={owner}
													value={owner}
												>
													{owner}
												</option>
											))}
										</select>
									</div>
								)}
							</div>
							<div className="filter-panel-footer">
								<button
									className="btn-reset"
									onClick={handleResetFilters}
								>
									Reset
								</button>
								<button
									className="btn-apply"
									onClick={handleApplyFilters}
								>
									Apply
								</button>
							</div>
						</div>
					)}
				</div>

				<div className="tickets-body">
					<div className="ticket-navigation">
						<button className="view-tab">View</button>
						<h3>
							{loading
								? "Loading..."
								: `${activeFilter
										.replace("-", " ")
										.replace(/\b\w/g, (l) =>
											l.toUpperCase()
										)} (${tickets.length})`}
						</h3>
						<div
							className={`nav-item ${
								activeFilter === "my-tickets" ? "active" : ""
							}`}
							onClick={() => handleViewFilterChange("my-tickets")}
						>
							My Tickets
						</div>
						<div
							className={`nav-item ${
								activeFilter === "all-tickets" ? "active" : ""
							}`}
							onClick={() =>
								handleViewFilterChange("all-tickets")
							}
						>
							All Tickets
						</div>
						<div
							className={`nav-item ${
								activeFilter === "open-tickets" ? "active" : ""
							}`}
							onClick={() =>
								handleViewFilterChange("open-tickets")
							}
						>
							Open Tickets
						</div>
						<div
							className={`nav-item ${
								activeFilter === "closed-tickets"
									? "active"
									: ""
							}`}
							onClick={() =>
								handleViewFilterChange("closed-tickets")
							}
						>
							Closed Tickets
						</div>
						<div
							className={`nav-item ${
								activeFilter === "last-7-days" ? "active" : ""
							}`}
							onClick={() =>
								handleViewFilterChange("last-7-days")
							}
						>
							Last 7 Days
						</div>
					</div>

					<div className="ticket-list-container">
						<button className="view-tab active">
							{activeFilter === "my-tickets"
								? `${currentUserName}'s Tickets`
								: "Active Ticket View"}
						</button>
						<div className="ticket-list-header">
							<div className="col-id">TICKET ID</div>
							<div className="col-subject">TICKET SUBJECT</div>
							<div className="col-status">STATUS</div>
							<div className="col-priority">PRIORITY</div>
							{activeFilter === "all-tickets" && (
								<div className="col-owner">OWNER</div>
							)}
							<div className="col-actions">ACTION</div>
						</div>
						<div className="ticket-list">
							{loading ? (
								<div className="loading-message">
									Loading tickets...
								</div>
							) : error ? (
								<div className="error-message">
									Error: {error}
								</div>
							) : !currentUserName ? (
								<div className="no-user-selected">
									Please select a user from the dropdown
									above.
								</div>
							) : tickets.length > 0 ? (
								tickets.map((ticket) => (
									<div
										key={ticket.ticket_id}
										className="ticket-item"
									>
										<div className="col-id">
											{ticket.ticket_id}
										</div>
										<div className="col-subject">
											{ticket.subject}
										</div>
										<div className="col-status">
											<span
												className={`status-badge status-${formatStatus(
													ticket.status
												)}`}
											>
												{formatStatusText(
													ticket.status
												)}
											</span>
										</div>
										<div className="col-priority">
											<span
												className={`priority-badge priority-${formatPriority(
													ticket.priority
												)}`}
											>
												{ticket.priority?.toLowerCase() ||
													"medium"}
											</span>
										</div>
										{activeFilter === "all-tickets" && (
											<div className="col-owner">
												{ticket.ticket_owner_name ||
													"-"}
											</div>
										)}
										<div className="col-actions">
											<div className="direct-actions">
												<button
													className="btn-action-display"
													onClick={() =>
														handleDisplayTicket(
															ticket.ticket_id
														)
													}
												>
													Display
												</button>
												<button
													className="btn-action-delete"
													onClick={() =>
														handleDeleteTicket(
															ticket.ticket_id,
															ticket.ticket_owner_name
														)
													}
													disabled={
														ticket.ticket_owner_name !==
														currentUserName
													}
													style={{
														opacity:
															ticket.ticket_owner_name !==
															currentUserName
																? 0.5
																: 1,
														cursor:
															ticket.ticket_owner_name !==
															currentUserName
																? "not-allowed"
																: "pointer",
													}}
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="no-tickets">
									{activeFilter === "my-tickets"
										? `No tickets assigned to ${currentUserName}.`
										: "No tickets found."}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Knowledge base section remains the same */}
			<div className="knowledge-base-section">
				<h3>Knowledge Base Article</h3>
				<p className="kb-intro">
					Deliver self-service options to customers through a 24/7
					knowledge repository.
				</p>
				<ul className="kb-features">
					<li>Enhance articles with an intuitive editing tool.</li>
					<li>
						Improve article visibility on search engines using meta
						descriptions.
					</li>
					<li>
						Polish content through version control for articles.
					</li>
					<li>Grant authors access to an online review panel.</li>
					<li>
						Enable customers to explore a multilingual knowledge
						hub.
					</li>
				</ul>
				<div className="kb-actions">
					<button className="btn-create">Create</button>
					<button className="btn-cancel">Cancel</button>
					<button className="btn-learn">Learn more about this</button>
				</div>
			</div>

			{/* User-specific stats */}
			{stats.totalTickets > 0 && (
				<div
					className="stats-section"
					style={{
						padding: "20px",
						marginTop: "20px",
						backgroundColor: "#f9f9f9",
						borderRadius: "8px",
					}}
				>
					<h4>{currentUserName}'s Ticket Statistics</h4>
					<div
						style={{
							display: "flex",
							gap: "20px",
							flexWrap: "wrap",
						}}
					>
						<div>
							Total Tickets: <strong>{stats.totalTickets}</strong>
						</div>
						<div>
							Recent (24h): <strong>{stats.recentTickets}</strong>
						</div>
						{stats.statusBreakdown &&
							Object.entries(stats.statusBreakdown).map(
								([status, count]) => (
									<div key={status}>
										{formatStatusText(status)}:{" "}
										<strong>{count}</strong>
									</div>
								)
							)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AgentSupport;
