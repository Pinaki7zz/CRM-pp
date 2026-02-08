import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Plus,
	Eye,
	Trash2,
	Search,
	Filter,
	Loader2,
	RefreshCw,
	Circle,
	MoreHorizontal,
	Edit3,
} from "lucide-react";
import "./LiveTalkList.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const LiveTalkList = () => {
	const navigate = useNavigate();
	const [chatflows, setChatflows] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedChatflows, setSelectedChatflows] = useState([]);
	const [deleteModal, setDeleteModal] = useState({
		show: false,
		chatflow: null,
	});

	const API_BASE_URL = `${BASE_URL_CM}/live-talk`;

	const apiRequest = async (endpoint, options = {}) => {
		const url = `${API_BASE_URL}${endpoint}`;

		const config = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		if (config.body && typeof config.body !== "string") {
			config.body = JSON.stringify(config.body);
		}

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || `HTTP error! status: ${response.status}`
				);
			}

			return data;
		} catch (error) {
			console.error(`API Error (${endpoint}):`, error);
			throw error;
		}
	};

	useEffect(() => {
		fetchChatflows();
	});

	// Updated fetch function with proper backend integration
	const fetchChatflows = async () => {
		try {
			setIsLoading(true);
			const response = await apiRequest("/chatflows");

			if (response.success) {
				setChatflows(response.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch chatflows:", error);
			alert("❌ Failed to load chatflows: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Updated delete function with backend integration
	const handleDelete = async (chatflow) => {
		try {
			const response = await apiRequest(`/chatflows/${chatflow.id}`, {
				method: "DELETE",
			});

			if (response.success) {
				setChatflows((prev) =>
					prev.filter((cf) => cf.id !== chatflow.id)
				);
				setDeleteModal({ show: false, chatflow: null });
				alert("✅ Chatflow deleted successfully!");
			}
		} catch (error) {
			alert("❌ Failed to delete chatflow: " + error.message);
			console.error("Delete error:", error);
		}
	};

	const handleSelectAll = () => {
		if (selectedChatflows.length === filteredChatflows.length) {
			setSelectedChatflows([]);
		} else {
			setSelectedChatflows(filteredChatflows.map((cf) => cf.id));
		}
	};

	const handleSelectChatflow = (chatflowId) => {
		setSelectedChatflows((prev) =>
			prev.includes(chatflowId)
				? prev.filter((id) => id !== chatflowId)
				: [...prev, chatflowId]
		);
	};

	const filteredChatflows = chatflows.filter((chatflow) => {
		const matchesSearch =
			chatflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			chatflow.companyName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			(chatflow.chatId &&
				chatflow.chatId
					.toLowerCase()
					.includes(searchTerm.toLowerCase())) ||
			(chatflow.websiteUrl &&
				chatflow.websiteUrl
					.toLowerCase()
					.includes(searchTerm.toLowerCase()));

		const matchesFilter =
			filterStatus === "all" ||
			(filterStatus === "active" && chatflow.isActive) ||
			(filterStatus === "inactive" && !chatflow.isActive);

		return matchesSearch && matchesFilter;
	});

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "numeric",
			day: "numeric",
			year: "numeric",
		});
	};

	if (isLoading) {
		return (
			<div className="chatflow-list-container">
				<div className="loading-container">
					<Loader2 className="spinner" />
					<p>Loading chatflows...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="chatflow-list-container">
			{/* Header */}
			<div className="list-header">
				<div className="header-left">
					<div className="dropdown-container">
						<select
							className="leads-dropdown"
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
						>
							<option value="all">All Chatflows</option>
							<option value="active">Active Chatflows</option>
							<option value="inactive">Inactive Chatflows</option>
						</select>
					</div>
				</div>

				<div className="header-right">
					<button
						className="select-all-btn"
						onClick={handleSelectAll}
					>
						Select All
					</button>
					<button className="refresh-btn" onClick={fetchChatflows}>
						<RefreshCw className="btn-icon" />
						Refresh
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="stats-container">
				<div className="stat-card">
					<div className="stat-label">TOTAL CHATFLOWS</div>
					<div className="stat-number">{chatflows.length}</div>
				</div>
				<div className="stat-card">
					<div className="stat-label">TOTAL ACTIVE</div>
					<div className="stat-number">
						{chatflows.filter((cf) => cf.isActive).length}
					</div>
				</div>
				<div className="stat-card">
					<div className="stat-label">TOTAL INACTIVE</div>
					<div className="stat-number">
						{chatflows.filter((cf) => !cf.isActive).length}
					</div>
				</div>
				<div className="stat-card">
					<div className="stat-label">TOTAL CONVERSATIONS</div>
					<div className="stat-number">
						{chatflows.reduce(
							(sum, cf) => sum + (cf.conversations?.length || 0),
							0
						)}
					</div>
				</div>
			</div>

			{/* Search and Actions */}
			<div className="actions-container-l ">
				<div className="search-container">
					<Search className="search-icon" />
					<input
						type="text"
						placeholder="Search chatflows..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
				</div>

				<div className="action-buttons">
					<button
						className="create-btn"
						onClick={() =>
							navigate("/admin/socialsetups/livetalk/create")
						}
					>
						<Plus className="btn-icon" />
						Create Chatflow
					</button>
					<button className="filter-btn">
						<Filter className="btn-icon" />
					</button>
				</div>
			</div>

			{/* Table */}
			<div className="table-container">
				<table className="chatflow-table">
					<thead>
						<tr>
							<th>
								<input
									type="checkbox"
									checked={
										selectedChatflows.length ===
											filteredChatflows.length &&
										filteredChatflows.length > 0
									}
									onChange={handleSelectAll}
								/>
							</th>
							<th>
								Chatflow Name{" "}
								<span className="sort-icon">↕</span>
							</th>
							<th>
								Chatflow ID <span className="sort-icon">↕</span>
							</th>
							<th>
								Company Name{" "}
								<span className="sort-icon">↕</span>
							</th>
							<th>
								Status <span className="sort-icon">↕</span>
							</th>
							<th>
								Website URL <span className="sort-icon">↕</span>
							</th>
							<th>
								Department <span className="sort-icon">↕</span>
							</th>
							<th>
								Language <span className="sort-icon">↕</span>
							</th>
							<th>
								Conversations{" "}
								<span className="sort-icon">↕</span>
							</th>
							<th>
								Created on <span className="sort-icon">↕</span>
							</th>
							<th>
								Actions <span className="sort-icon">↕</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredChatflows.length === 0 ? (
							<tr>
								<td colSpan="11" className="no-data">
									No chatflows found.
								</td>
							</tr>
						) : (
							filteredChatflows.map((chatflow) => (
								<tr key={chatflow.id}>
									<td>
										<input
											type="checkbox"
											checked={selectedChatflows.includes(
												chatflow.id
											)}
											onChange={() =>
												handleSelectChatflow(
													chatflow.id
												)
											}
										/>
									</td>
									<td className="chatflow-name">
										{chatflow.name}
									</td>
									<td className="chatflow-id">
										{chatflow.chatId ||
											chatflow.id.substring(0, 8) + "..."}
									</td>
									<td>{chatflow.companyName}</td>
									<td>
										<span
											className={`status-badge ${
												chatflow.isActive
													? "active"
													: "inactive"
											}`}
										>
											<Circle className="status-dot" />
											{chatflow.isActive
												? "ACTIVE"
												: "INACTIVE"}
										</span>
									</td>
									<td className="website-url">
										{chatflow.websiteUrl ? (
											<a
												href={chatflow.websiteUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												{chatflow.websiteUrl.length > 30
													? chatflow.websiteUrl.substring(
															0,
															30
													  ) + "..."
													: chatflow.websiteUrl}
											</a>
										) : (
											"-"
										)}
									</td>
									<td>{chatflow.department || "-"}</td>
									<td className="language">
										{chatflow.language || "english"}
									</td>
									<td className="conversations-count">
										{chatflow.conversations?.length || 0}
									</td>
									<td>{formatDate(chatflow.createdAt)}</td>
									<td>
										<div className="action-buttons-cell">
											<button
												className="display-btn"
												onClick={() =>
													navigate(
														`/admin/socialsetups/livetalk/create?edit=${chatflow.id}`
													)
												}
												title="Edit Chatflow"
											>
												Display
											</button>
											<button
												className="delete-btn"
												onClick={() =>
													setDeleteModal({
														show: true,
														chatflow,
													})
												}
												title="Delete Chatflow"
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

			{/* Pagination */}
			<div className="pagination-container">
				<div className="pagination">
					<button className="page-btn">Previous</button>
					<button className="page-btn active">1</button>
					<button className="page-btn">2</button>
					<button className="page-btn">3</button>
					<button className="page-btn">Next</button>
				</div>
			</div>

			{/* Delete Modal */}
			{deleteModal.show && (
				<div className="modal-overlay">
					<div className="modal-content">
						<div className="modal-header">
							<h3>Confirm Delete</h3>
						</div>

						<div className="modal-body">
							<p>
								Are you sure you want to delete the chatflow{" "}
								<strong>"{deleteModal.chatflow?.name}"</strong>?
							</p>
							<p className="warning-text">
								This action cannot be undone and will remove all
								associated conversations.
							</p>
						</div>

						<div className="modal-footer">
							<button
								className="cancel-btn"
								onClick={() =>
									setDeleteModal({
										show: false,
										chatflow: null,
									})
								}
							>
								Cancel
							</button>
							<button
								className="delete-confirm-btn"
								onClick={() =>
									handleDelete(deleteModal.chatflow)
								}
							>
								<Trash2 className="btn-icon" />
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LiveTalkList;
