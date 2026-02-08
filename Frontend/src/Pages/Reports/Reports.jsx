import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Reports.css";

const BASE_URL_ANM = import.meta.env.VITE_API_BASE_URL_ANM;
const API_BASE_URL = `${BASE_URL_ANM}`;
const USER_ID = "user123";

const Reports = () => {
	const [activeFilter, setActiveFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	// Folders state
	const [folders, setFolders] = useState([]);
	const [foldersLoading, setFoldersLoading] = useState(false);
	const [foldersError, setFoldersError] = useState(null);

	// Reports state (now loaded from backend)
	const [reports, setReports] = useState([]);
	const [reportsLoading, setReportsLoading] = useState(false);
	const [reportsError, setReportsError] = useState(null);

	const [selectedReports, setSelectedReports] = useState([]);
	const [selectAll, setSelectAll] = useState(false);

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedModule, setSelectedModule] = useState("");
	const [isReportTypeModalOpen, setIsReportTypeModalOpen] = useState(false);
	const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [folderDescription, setFolderDescription] = useState("");
	const [folderCreating, setFolderCreating] = useState(false);
	const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

	const navigate = useNavigate();

	// ==================== FOLDER API FUNCTIONS ====================

	const getAllFolders = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/folders`, {
				headers: { "X-User-Id": USER_ID },
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching folders:", error);
			throw error;
		}
	};

	const getFavoriteFolders = async () => {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/folders/favorites`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching favorite folders:", error);
			throw error;
		}
	};

	const createFolder = async (folderData) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/folders`,
				folderData,
				{
					headers: {
						"X-User-Id": USER_ID,
						"Content-Type": "application/json",
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error creating folder:", error);
			throw error;
		}
	};

	const toggleFavorite = async (folderId) => {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/folders/${folderId}/toggle-favorite`,
				{},
				{ headers: { "X-User-Id": USER_ID } }
			);
			return response.data;
		} catch (error) {
			console.error("Error toggling favorite:", error);
			throw error;
		}
	};

	const deleteFolder = async (folderId) => {
		try {
			const response = await axios.delete(
				`${API_BASE_URL}/folders/${folderId}`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting folder:", error);
			throw error;
		}
	};

	// ==================== END FOLDER API FUNCTIONS ====================

	// ==================== REPORT API FUNCTIONS ====================

	const getAllReports = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/reports`, {
				headers: { "X-User-Id": USER_ID },
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching reports:", error);
			throw error;
		}
	};

	const deleteReport = async (reportId) => {
		try {
			const response = await axios.delete(
				`${API_BASE_URL}/reports/${reportId}`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting report:", error);
			throw error;
		}
	};

	// ==================== END REPORT API FUNCTIONS ====================

	useEffect(() => {
		fetchFolders();
	}, [activeFilter]);

	useEffect(() => {
		fetchReports();
	}, []);

	const fetchFolders = async () => {
		try {
			setFoldersLoading(true);
			setFoldersError(null);

			let response;

			if (activeFilter === "all-folders") {
				response = await getAllFolders();
			} else if (activeFilter === "favourite") {
				response = await getFavoriteFolders();
			} else {
				response = await getAllFolders();
			}

			if (response.success) {
				setFolders(response.data);
			}
		} catch (error) {
			console.error("Error fetching folders:", error);
			setFoldersError("Failed to load folders");
			setFolders([]);
		} finally {
			setFoldersLoading(false);
		}
	};

	const fetchReports = async () => {
		try {
			setReportsLoading(true);
			setReportsError(null);
			const response = await getAllReports();

			if (response && response.success && Array.isArray(response.data)) {
				const mapped = response.data.map((r) => ({
					id: r.id,
					name: r.reportName,
					description: r.description,
					folder: r.folderName || r.folder || "",
					createdBy: r.createdBy || "",
					createdDate: r.createdAt ? r.createdAt.slice(0, 10) : "",
				}));
				setReports(mapped);
			} else {
				setReports([]);
			}
		} catch (error) {
			console.error("Error loading reports:", error);
			setReportsError("Failed to load reports");
			setReports([]);
		} finally {
			setReportsLoading(false);
		}
	};

	const handleFilterClick = (filterId) => {
		setActiveFilter(filterId);
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleAction = () => {
		setIsActionDropdownOpen(!isActionDropdownOpen);
	};

	// UPDATED: Export CSV functionality
	const handleExportReports = () => {
		if (selectedReports.length === 0) {
			alert("Please select at least one report to export");
			setIsActionDropdownOpen(false);
			return;
		}

		try {
			const reportsToExport = reports.filter((report) =>
				selectedReports.includes(report.id)
			);

			const headers = [
				"Report Name",
				"Description",
				"Folder",
				"Created By",
				"Created Date",
			];
			const csvContent = [
				headers.join(","),
				...reportsToExport.map((report) =>
					[
						`"${report.name || ""}"`,
						`"${report.description || ""}"`,
						`"${report.folder || ""}"`,
						`"${report.createdBy || ""}"`,
						`"${report.createdDate || ""}"`,
					].join(",")
				),
			].join("\n");

			const blob = new Blob([csvContent], {
				type: "text/csv;charset=utf-8;",
			});
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);

			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`reports_export_${new Date().getTime()}.csv`
			);
			link.style.visibility = "hidden";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			alert(`Successfully exported ${selectedReports.length} report(s)`);
			setIsActionDropdownOpen(false);
		} catch (error) {
			console.error("Error exporting reports:", error);
			alert("Failed to export reports");
			setIsActionDropdownOpen(false);
		}
	};

	// UPDATED: Bulk delete functionality
	const handleBulkDeleteReports = async () => {
		if (selectedReports.length === 0) {
			alert("Please select at least one report to delete");
			setIsActionDropdownOpen(false);
			return;
		}

		const confirmMessage =
			selectedReports.length === 1
				? "Are you sure you want to delete this report?"
				: `Are you sure you want to delete ${selectedReports.length} reports?`;

		if (window.confirm(confirmMessage)) {
			try {
				const deletePromises = selectedReports.map((reportId) =>
					deleteReport(reportId)
				);

				const results = await Promise.all(deletePromises);

				const successCount = results.filter((r) => r.success).length;
				const failCount = results.length - successCount;

				if (failCount === 0) {
					alert(`Successfully deleted ${successCount} report(s)`);
				} else {
					alert(
						`Deleted ${successCount} report(s). Failed to delete ${failCount} report(s)`
					);
				}

				setSelectedReports([]);
				setSelectAll(false);
				fetchReports();
			} catch (error) {
				console.error("Error deleting reports:", error);
				alert("Failed to delete reports");
			}
		}

		setIsActionDropdownOpen(false);
	};

	// UPDATED: Bulk toggle favorite functionality
	const handleBulkToggleFavorite = async () => {
		if (selectedReports.length === 0) {
			alert("Please select at least one report to add to favorites");
			setIsActionDropdownOpen(false);
			return;
		}

		try {
			const togglePromises = selectedReports.map(async (reportId) => {
				try {
					const response = await axios.put(
						`${API_BASE_URL}/reports/${reportId}/toggle-favorite`,
						{},
						{
							headers: { "X-User-Id": USER_ID },
						}
					);
					return response.data;
				} catch (error) {
					console.error(
						`Error toggling favorite for report ${reportId}:`,
						error
					);
					return { success: false };
				}
			});

			const results = await Promise.all(togglePromises);

			const successCount = results.filter((r) => r.success).length;
			const failCount = results.length - successCount;

			if (failCount === 0) {
				alert(`Successfully updated ${successCount} report(s)`);
			} else {
				alert(
					`Updated ${successCount} report(s). Failed to update ${failCount} report(s)`
				);
			}

			setSelectedReports([]);
			setSelectAll(false);
			fetchReports();
		} catch (error) {
			console.error("Error toggling favorites:", error);
			alert("Failed to update favorites");
		}

		setIsActionDropdownOpen(false);
	};

	// UPDATED: Handle dropdown item clicks
	const handleDropdownItemClick = (action) => {
		console.log(`${action} clicked`);

		switch (action) {
			case "export":
				handleExportReports();
				break;
			case "delete":
				handleBulkDeleteReports();
				break;
			case "add to favourite":
				handleBulkToggleFavorite();
				break;
			default:
				setIsActionDropdownOpen(false);
		}
	};

	const handleNewReport = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedModule("");
	};

	const handleSaveCategory = () => {
		if (selectedModule) {
			setIsModalOpen(false);
			setIsReportTypeModalOpen(true);
		}
	};

	const handleCloseReportTypeModal = () => {
		setIsReportTypeModalOpen(false);
		setSelectedModule("");
	};

	const handleStartReport = () => {
		let moduleName = "";

		switch (selectedModule) {
			case "leads":
				moduleName = "Lead";
				break;
			case "accounts":
				moduleName = "Account";
				break;
			case "opportunities":
				moduleName = "Opportunity";
				break;
			case "contacts":
				moduleName = "Contact";
				break;
			case "sales-quotes":
				moduleName = "Sales Quotes";
				break;
			case "sales-order":
				moduleName = "Sales Order";
				break;
			default:
				moduleName = "Lead";
		}

		setIsReportTypeModalOpen(false);
		navigate("/analytics/reports/new-report", {
			state: { module: moduleName },
		});
	};

	const handleNewFolder = () => {
		setIsFolderModalOpen(true);
	};

	const handleCloseFolderModal = () => {
		setIsFolderModalOpen(false);
		setFolderName("");
		setFolderDescription("");
	};

	const handleSaveFolder = async () => {
		if (!folderName.trim()) {
			alert("Folder name is required");
			return;
		}

		try {
			setFolderCreating(true);
			const response = await createFolder({
				name: folderName,
				description: folderDescription,
			});

			if (response && response.success) {
				console.log("Folder created:", response.data);
				handleCloseFolderModal();
				fetchFolders();
				alert("Folder created successfully!");
			} else {
				alert(
					"Failed to create folder: " +
						(response?.message || "Unknown error")
				);
			}
		} catch (error) {
			console.error("Error creating folder:", error);
			alert(
				"Error creating folder: " +
					(error.response?.data?.message || error.message)
			);
		} finally {
			setFolderCreating(false);
		}
	};

	const handleSelectAll = (e) => {
		const isChecked = e.target.checked;
		setSelectAll(isChecked);
		if (isChecked) {
			setSelectedReports(filteredReports.map((report) => report.id));
		} else {
			setSelectedReports([]);
		}
	};

	const handleSelectReport = (reportId) => {
		const updatedSelection = selectedReports.includes(reportId)
			? selectedReports.filter((id) => id !== reportId)
			: [...selectedReports, reportId];

		setSelectedReports(updatedSelection);
		setSelectAll(updatedSelection.length === filteredReports.length);
	};

	const handleDisplayReport = (reportId) => {
		console.log("Display report:", reportId);
		navigate(`/analytics/reports/${reportId}/view`);
	};

	const handleDeleteReport = async (reportId) => {
		if (window.confirm("Are you sure you want to delete this report?")) {
			try {
				const response = await deleteReport(reportId);
				if (response.success) {
					alert("Report deleted successfully!");
					fetchReports();
				} else {
					alert(
						"Failed to delete report: " +
							(response?.message || "Unknown error")
					);
				}
			} catch (error) {
				console.error("Error deleting report:", error);
				alert(
					"Error deleting report: " +
						(error.response?.data?.message || error.message)
				);
			}
		}
	};

	const getModuleDisplayName = () => {
		switch (selectedModule) {
			case "leads":
				return "Lead";
			case "accounts":
				return "Account";
			case "opportunities":
				return "Opportunity";
			case "contacts":
				return "Contact";
			case "sales-quotes":
				return "Sales Quotes";
			case "sales-order":
				return "Sales Order";
			default:
				return "";
		}
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				isActionDropdownOpen &&
				event.target.closest(".action-button-container") === null
			) {
				setIsActionDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isActionDropdownOpen]);

	const handleToggleFolderFavorite = async (folderId) => {
		try {
			const response = await toggleFavorite(folderId);
			if (response.success) {
				fetchFolders();
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const handleDeleteFolder = async (folderId) => {
		if (window.confirm("Are you sure you want to delete this folder?")) {
			try {
				const response = await deleteFolder(folderId);
				if (response.success) {
					fetchFolders();
					alert("Folder deleted successfully!");
				}
			} catch (error) {
				console.error("Error deleting folder:", error);
				alert("Failed to delete folder");
			}
		}
	};

	const filteredReports = reports.filter((report) => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return true;
		return (
			report.name.toLowerCase().includes(term) ||
			(report.description || "").toLowerCase().includes(term)
		);
	});

	return (
		<div className="report-container">
			{/* Sidebar */}
			<div className="report-sidebar">
				<div className="sidebar-section">
					<div className="page-title">
						<h1>Reports</h1>
					</div>
					<div className="sidebar-header">
						<span className="section-icon">📊</span>
						<span className="section-title">Recent</span>
					</div>
					<div
						onClick={() => handleFilterClick("created-by-me")}
						className={`sidebar-item12345 ${
							activeFilter === "created-by-me" ? "active" : ""
						}`}
					>
						Created by Me
					</div>
					<div
						onClick={() => handleFilterClick("private")}
						className={`sidebar-item12345 ${
							activeFilter === "private" ? "active" : ""
						}`}
					>
						Private Reports
					</div>
					<div
						onClick={() => handleFilterClick("public")}
						className={`sidebar-item12345 ${
							activeFilter === "public" ? "active" : ""
						}`}
					>
						Public Reports
					</div>
					<div
						onClick={() => handleFilterClick("all")}
						className={`sidebar-item12345 ${
							activeFilter === "all" ? "active" : ""
						}`}
					>
						All Reports
					</div>
				</div>

				<div className="sidebar-section">
					<div className="sidebar-header">
						<span className="section-icon">📁</span>
						<span className="section-title">Folders</span>
					</div>
					<div
						onClick={() =>
							handleFilterClick("created-by-me-folder")
						}
						className={`sidebar-item12345 ${
							activeFilter === "created-by-me-folder"
								? "active"
								: ""
						}`}
					>
						Created by Me
					</div>
					<div
						onClick={() => handleFilterClick("shared")}
						className={`sidebar-item12345 ${
							activeFilter === "shared" ? "active" : ""
						}`}
					>
						Shared With Me
					</div>
					<div
						onClick={() => handleFilterClick("all-folders")}
						className={`sidebar-item12345 ${
							activeFilter === "all-folders" ? "active" : ""
						}`}
					>
						All Folders
					</div>

					<div className="folders-list">
						{foldersLoading ? (
							<div className="folders-loading">Loading...</div>
						) : foldersError ? (
							<div className="folders-error">{foldersError}</div>
						) : folders && folders.length > 0 ? (
							folders.slice(0, 5).map((folder) => (
								<div
									key={folder.id}
									className={`sidebar-item12345 folder-item ${
										folder.isFavourite ? "favourite" : ""
									}`}
									title={folder.name}
								>
									<span className="folder-name">
										{folder.name}
									</span>
									<div className="folder-actions">
										<button
											className="folder-action-btn"
											onClick={() =>
												handleToggleFolderFavorite(
													folder.id
												)
											}
										>
											{folder.isFavourite ? "⭐" : "☆"}
										</button>
										<button
											className="folder-action-btn delete"
											onClick={() =>
												handleDeleteFolder(folder.id)
											}
										>
											🗑️
										</button>
									</div>
								</div>
							))
						) : (
							<div className="no-folders">No folders yet</div>
						)}
					</div>
				</div>

				<div className="sidebar-section">
					<div className="sidebar-header">
						<span className="section-icon">⭐</span>
						<span className="section-title">Favourites</span>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="report-main">
				<div className="report-header">
					<div className="search-container">
						<input
							type="text"
							placeholder="Search Reports"
							value={searchTerm}
							onChange={handleSearch}
							className="search-input"
						/>
					</div>
					<div className="header-buttons">
						<div className="action-button-container">
							<button
								className="btn-secondary"
								onClick={handleAction}
								disabled={selectedReports.length === 0}
							>
								Action ▼
							</button>
							{isActionDropdownOpen && (
								<div className="action-dropdown">
									<div
										className="dropdown-item"
										onClick={() =>
											handleDropdownItemClick("export")
										}
									>
										Export
									</div>
									<div
										className="dropdown-item"
										onClick={() =>
											handleDropdownItemClick("delete")
										}
									>
										Delete
									</div>
									<div
										className="dropdown-item"
										onClick={() =>
											handleDropdownItemClick(
												"add to favourite"
											)
										}
									>
										Add to Favourite
									</div>
								</div>
							)}
						</div>
						<button
							className="btn-primary"
							onClick={handleNewReport}
						>
							New Report
						</button>
						<button
							className="btn-primary"
							onClick={handleNewFolder}
						>
							New Folder
						</button>
					</div>
				</div>

				<div className="reports-table-container">
					<table className="reports-table">
						<thead>
							<tr>
								<th>
									<input
										type="checkbox"
										checked={selectAll}
										onChange={handleSelectAll}
										className="report-checkbox"
									/>
								</th>
								<th>Report Name</th>
								<th>Description</th>
								<th>Folder</th>
								<th>Created By</th>
								<th>Created Date</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{reportsLoading ? (
								<tr>
									<td colSpan="7" className="empty-state">
										Loading reports...
									</td>
								</tr>
							) : reportsError ? (
								<tr>
									<td colSpan="7" className="empty-state">
										{reportsError}
									</td>
								</tr>
							) : filteredReports.length === 0 ? (
								<tr>
									<td colSpan="7" className="empty-state">
										No reports found. Create your first
										report to get started.
									</td>
								</tr>
							) : (
								filteredReports.map((report) => (
									<tr key={report.id}>
										<td>
											<input
												type="checkbox"
												checked={selectedReports.includes(
													report.id
												)}
												onChange={() =>
													handleSelectReport(
														report.id
													)
												}
												className="report-checkbox"
											/>
										</td>
										<td>{report.name}</td>
										<td>{report.description}</td>
										<td>{report.folder}</td>
										<td>{report.createdBy}</td>
										<td>{report.createdDate}</td>
										<td>
											<div className="action-buttons">
												<button
													className="btn-action btn-display"
													onClick={() =>
														handleDisplayReport(
															report.id
														)
													}
													title="Display Report"
												>
													Display
												</button>
												<button
													className="btn-action btn-delete"
													onClick={() =>
														handleDeleteReport(
															report.id
														)
													}
													title="Delete Report"
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
			</div>

			{/* Modal: Select Module */}
			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content">
						<h2>Create New Report</h2>
						<select
							value={selectedModule}
							onChange={(e) => setSelectedModule(e.target.value)}
							className="modal-select"
						>
							<option value="">Select Category</option>
							<option value="leads">Lead</option>
							<option value="accounts">Account</option>
							<option value="opportunities">Opportunity</option>
							<option value="contacts">Contact</option>
							<option value="sales-quotes">Sales Quotes</option>
							<option value="sales-order">Sales Order</option>
						</select>
						<div className="modal-actions">
							<button
								className="btn-primary"
								onClick={handleSaveCategory}
								disabled={!selectedModule}
							>
								Save
							</button>
							<button
								className="btn-secondary"
								onClick={handleCloseModal}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: Report Type */}
			{isReportTypeModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content lead-modal">
						<h2>Create Report</h2>
						<div className="lead-details-simple">
							<h3>{getModuleDisplayName()}</h3>
							<p>Standard Report Type</p>
							<button
								className="btn-primary"
								onClick={handleStartReport}
							>
								Start report
							</button>
						</div>
						<div className="modal-actions">
							<button
								className="btn-secondary"
								onClick={handleCloseReportTypeModal}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: Create Folder */}
			{isFolderModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content folder-modal">
						<h2 className="modal-title">Create Folder</h2>

						<div className="form-group1234">
							<label>Folder Name *</label>
							<input
								type="text"
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								className="modal-input"
								placeholder="Enter folder name"
								disabled={folderCreating}
							/>
						</div>

						<div className="form-group1234">
							<label>Folder Description (optional)</label>
							<textarea
								value={folderDescription}
								onChange={(e) =>
									setFolderDescription(e.target.value)
								}
								className="modal-input modal-textarea"
								placeholder="Enter folder description"
								disabled={folderCreating}
								rows="3"
							/>
						</div>

						<div className="modal-actions">
							<button
								className="btn-primary"
								onClick={handleSaveFolder}
								disabled={folderCreating}
							>
								{folderCreating ? "Creating..." : "Save"}
							</button>
							<button
								className="btn-secondary"
								onClick={handleCloseFolderModal}
								disabled={folderCreating}
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

export default Reports;
