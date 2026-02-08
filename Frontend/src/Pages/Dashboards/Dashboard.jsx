import { useState, useEffect } from "react";
import "./Dashboard.css";
import NewDashboard from "./NewDashboard";
import axios from "axios";

const BASE_URL_ANM = import.meta.env.VITE_API_BASE_URL_ANM;
const API_BASE_URL = `${BASE_URL_ANM}`;
const USER_ID = "user123";

const Dashboard = () => {
	const [showActionMenu, setShowActionMenu] = useState(false);
	const [showNewDashboardModal, setShowNewDashboardModal] = useState(false);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);

	// API states
	const [folders, setFolders] = useState([]);
	const [dashboards, setDashboards] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeFilter, setActiveFilter] = useState("all"); // all, created-by-me, private, public, folder-{id}

	// View mode
	const [viewMode, setViewMode] = useState("list");
	const [activeDashboard, setActiveDashboard] = useState(null);

	// Form state for New Dashboard modal
	const [dashboardName, setDashboardName] = useState("");
	const [dashboardDescription, setDashboardDescription] = useState("");
	const [selectedFolderId, setSelectedFolderId] = useState("");

	// Form state for New Folder modal
	const [folderName, setFolderName] = useState("");
	const [folderDescription, setFolderDescription] = useState("");
	const [folderVisibility, setFolderVisibility] = useState("PRIVATE");

	// Load dashboards and folders on mount
	useEffect(() => {
		loadFolders();
		loadDashboards();
	}, []);

	// Reload dashboards when filter changes
	useEffect(() => {
		loadDashboards();
	}, [activeFilter]);

	const loadFolders = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/folders`, {
				headers: { "X-User-Id": USER_ID },
			});

			if (response.data.success) {
				setFolders(response.data.data || []);
			}
		} catch (err) {
			console.error("Error loading folders:", err);
			setError("Failed to load folders");
		}
	};

	const loadDashboards = async () => {
		try {
			setLoading(true);
			setError(null);

			let url = `${API_BASE_URL}/dashboards`;

			// Apply filter
			if (activeFilter === "favorites") {
				url = `${API_BASE_URL}/dashboards/favorites`;
			} else if (activeFilter === "private") {
				url = `${API_BASE_URL}/dashboards/visibility/PRIVATE`;
			} else if (activeFilter === "public") {
				url = `${API_BASE_URL}/dashboards/visibility/PUBLIC`;
			} else if (activeFilter.startsWith("folder-")) {
				const folderId = activeFilter.replace("folder-", "");
				url = `${API_BASE_URL}/dashboards/folder/${folderId}`;
			}

			const response = await axios.get(url, {
				headers: { "X-User-Id": USER_ID },
			});

			if (response.data.success) {
				setDashboards(response.data.data || []);
			}
		} catch (err) {
			console.error("Error loading dashboards:", err);
			setError("Failed to load dashboards");
		} finally {
			setLoading(false);
		}
	};

	const toggleActionMenu = () => setShowActionMenu((prev) => !prev);

	const toggleRow = (id) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const allSelected =
		dashboards.length > 0 && selectedIds.length === dashboards.length;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds([]);
		} else {
			setSelectedIds(dashboards.map((d) => d.id));
		}
	};

	const handleCreateDashboard = async () => {
		try {
			setLoading(true);
			setError(null);

			const dashboardData = {
				name: dashboardName,
				description: dashboardDescription,
				folderId: selectedFolderId ? parseInt(selectedFolderId) : null,
				tiles: [],
			};

			const response = await axios.post(
				`${API_BASE_URL}/dashboards`,
				dashboardData,
				{
					headers: {
						"X-User-Id": USER_ID,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.success) {
				const newDashboard = response.data.data;
				setActiveDashboard(newDashboard);
				setViewMode("newDashboard");
				setShowNewDashboardModal(false);

				// Reset form
				setDashboardName("");
				setDashboardDescription("");
				setSelectedFolderId("");
			}
		} catch (err) {
			console.error("Error creating dashboard:", err);
			setError(
				err.response?.data?.message || "Failed to create dashboard"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateFolder = async () => {
		try {
			setLoading(true);
			setError(null);

			const folderData = {
				name: folderName,
				description: folderDescription,
				visibility: folderVisibility,
			};

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

			if (response.data.success) {
				alert("Folder created successfully!");
				setShowNewFolderModal(false);

				// Reset form
				setFolderName("");
				setFolderDescription("");
				setFolderVisibility("PRIVATE");

				// Reload folders
				loadFolders();
			}
		} catch (err) {
			console.error("Error creating folder:", err);
			setError(err.response?.data?.message || "Failed to create folder");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedIds.length === 0) {
			alert("Please select dashboards to delete");
			return;
		}

		if (!window.confirm(`Delete ${selectedIds.length} dashboard(s)?`)) {
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Delete each selected dashboard
			await Promise.all(
				selectedIds.map((id) =>
					axios.delete(`${API_BASE_URL}/dashboards/${id}`, {
						headers: { "X-User-Id": USER_ID },
					})
				)
			);

			alert("Dashboards deleted successfully!");
			setSelectedIds([]);
			loadDashboards();
		} catch (err) {
			console.error("Error deleting dashboards:", err);
			setError("Failed to delete dashboards");
		} finally {
			setLoading(false);
		}
	};

	const handleAddToFavorite = async () => {
		if (selectedIds.length === 0) {
			alert("Please select dashboards to add to favorites");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			await Promise.all(
				selectedIds.map((id) =>
					axios.put(
						`${API_BASE_URL}/dashboards/${id}/add-favorite`,
						null,
						{
							headers: { "X-User-Id": USER_ID },
						}
					)
				)
			);

			alert("Added to favorites!");
			setSelectedIds([]);
			loadDashboards();
		} catch (err) {
			console.error("Error adding to favorites:", err);
			setError("Failed to add to favorites");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteDashboard = async (dashboardId) => {
		if (
			!window.confirm("Are you sure you want to delete this dashboard?")
		) {
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await axios.delete(
				`${API_BASE_URL}/dashboards/${dashboardId}`,
				{ headers: { "X-User-Id": USER_ID } }
			);

			if (response.data.success) {
				alert("Dashboard deleted successfully!");
				loadDashboards();
			}
		} catch (err) {
			console.error("Error deleting dashboard:", err);
			setError("Failed to delete dashboard");
		} finally {
			setLoading(false);
		}
	};

	const handleExport = () => {
		if (selectedIds.length === 0) {
			alert("Please select dashboards to export");
			return;
		}

		const selectedDashboards = dashboards.filter((d) =>
			selectedIds.includes(d.id)
		);

		// Define CSV headers
		const headers = [
			"Dashboard Name",
			"Description",
			"Folder",
			"Created By",
			"Created On",
			"Last Modified",
		];

		// Create CSV rows
		const rows = selectedDashboards.map((d) => [
			d.name || "",
			d.description || "",
			d.folderName || "",
			d.createdBy || USER_ID,
			d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
			d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : "",
		]);

		// Combine headers and rows
		const csvContent = [
			headers.join(","),
			...rows.map((row) =>
				row
					.map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
					.join(",")
			),
		].join("\n");

		// Create and download CSV file
		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `dashboards-export-${
			new Date().toISOString().split("T")[0]
		}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleToggleFolderFavorite = async (folderId) => {
		try {
			setLoading(true);
			setError(null);

			const response = await axios.put(
				`${API_BASE_URL}/folders/${folderId}/toggle-favorite`,
				null,
				{ headers: { "X-User-Id": USER_ID } }
			);

			if (response.data.success) {
				// Update folders list locally
				setFolders((prevFolders) =>
					prevFolders.map((f) =>
						f.id === folderId
							? { ...f, isFavourite: !f.isFavourite }
							: f
					)
				);
			}
		} catch (err) {
			console.error("Error toggling folder favorite:", err);
			setError("Failed to toggle folder favorite");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteFolder = async (folderId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this folder? Dashboards in this folder will not be deleted."
			)
		) {
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await axios.delete(
				`${API_BASE_URL}/folders/${folderId}`,
				{ headers: { "X-User-Id": USER_ID } }
			);

			if (response.data.success) {
				alert("Folder deleted successfully!");

				// Remove from local state
				setFolders((prevFolders) =>
					prevFolders.filter((f) => f.id !== folderId)
				);

				// Reset filter if we were viewing this folder
				if (activeFilter === `folder-${folderId}`) {
					setActiveFilter("all");
				}
			}
		} catch (err) {
			console.error("Error deleting folder:", err);
			setError(err.response?.data?.message || "Failed to delete folder");
		} finally {
			setLoading(false);
		}
	};

	const backToList = () => {
		setViewMode("list");
		setActiveDashboard(null);
		loadDashboards(); // Reload to show updates
	};

	const handleNewDashboardSave = (savedDashboard) => {
		console.log("Dashboard saved:", savedDashboard);
		backToList();
	};

	const handleEditDashboard = (dashboard) => {
		setActiveDashboard(dashboard);
		setViewMode("newDashboard");
	};

	const isCreateDisabled =
		dashboardName.trim() === "" || selectedFolderId === "";

	// Filter dashboards by search term
	const filteredDashboards = dashboards.filter(
		(d) =>
			d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			d.description?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="dashboard-middle">
			{/* Top heading */}
			<div className="dashboard-header-row">
				<h1 className="dashboard-title">
					{viewMode === "list" ? "Dashboard" : ""}
				</h1>
				{viewMode !== "list" && (
					<button className="dashboard-back-btn" onClick={backToList}>
						← Back
					</button>
				)}
			</div>

			{error && (
				<div className="dashboard-error-banner">
					{error}
					<button onClick={() => setError(null)}>×</button>
				</div>
			)}

			<div className="dashboard-top-row">
				{/* Left column only in list view */}
				{viewMode === "list" && (
					<div className="dashboard-filter-column">
						{/* Recent */}
						<div className="dashboard-filter-section">
							<div className="dashboard-filter-header">
								<span className="filter-icon">🧾</span>
								<span>Recent</span>
							</div>
							<button
								className={`filter-item ${
									activeFilter === "created-by-me"
										? "active"
										: ""
								}`}
								onClick={() => setActiveFilter("all")}
							>
								Created by Me
							</button>
							<button
								className={`filter-item ${
									activeFilter === "private" ? "active" : ""
								}`}
								onClick={() => setActiveFilter("private")}
							>
								Private Dashboards
							</button>
							<button
								className={`filter-item ${
									activeFilter === "public" ? "active" : ""
								}`}
								onClick={() => setActiveFilter("public")}
							>
								Public Dashboards
							</button>
							<button
								className={`filter-item ${
									activeFilter === "all" ? "active" : ""
								}`}
								onClick={() => setActiveFilter("all")}
							>
								All Dashboards
							</button>
						</div>

						{/* Folders */}
						<div className="dashboard-filter-section">
							<div className="dashboard-filter-header">
								<span className="filter-icon">🗂️</span>
								<span>Folders</span>
							</div>
							<button
								className="filter-item"
								onClick={() => setActiveFilter("all")}
							>
								Created by Me
							</button>
							<button
								className="filter-item"
								onClick={() => setActiveFilter("all")}
							>
								Shared With Me
							</button>
							<button
								className="filter-item"
								onClick={() => setActiveFilter("all")}
							>
								All Folders
							</button>

							{folders.map((folder) => (
								<div
									key={folder.id}
									className={`filter-item-wrapper ${
										activeFilter === `folder-${folder.id}`
											? "active"
											: ""
									}`}
								>
									<button
										className="filter-item folder-item-dynamic"
										onClick={() =>
											setActiveFilter(
												`folder-${folder.id}`
											)
										}
									>
										{folder.name}
									</button>

									<div className="folder-actions">
										<button
											className={`folder-star-btn ${
												folder.isFavourite
													? "favorite"
													: ""
											}`}
											onClick={(e) => {
												e.stopPropagation();
												handleToggleFolderFavorite(
													folder.id
												);
											}}
											title={
												folder.isFavourite
													? "Remove from favorites"
													: "Add to favorites"
											}
										>
											{folder.isFavourite ? "★" : "☆"}
										</button>

										<button
											className="folder-delete-btn"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteFolder(folder.id);
											}}
											title="Delete folder"
										>
											🗑️
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Favourites */}
						<div className="dashboard-filter-section">
							<div className="dashboard-filter-header">
								<span className="filter-icon">⭐</span>
								<span>Favourites</span>
							</div>
							<button
								className={`filter-item ${
									activeFilter === "favorites" ? "active" : ""
								}`}
								onClick={() => setActiveFilter("favorites")}
							>
								My Favorites
							</button>
						</div>
					</div>
				)}

				{/* Right side: controls + content */}
				<div className="dashboard-main-panel">
					{viewMode === "list" ? (
						<>
							{/* Controls row only in list view */}
							<div className="dashboard-controls-row">
								<input
									type="text"
									className="dashboard-search-input"
									placeholder="Search Dashboard"
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
								/>

								<div className="dashboard-action-wrapper">
									<button
										type="button"
										className="dashboard-action-btn"
										onClick={toggleActionMenu}
									>
										Action ▾
									</button>

									{showActionMenu && (
										<div className="dashboard-action-menu">
											<button
												type="button"
												className="dashboard-action-item"
												onClick={() => {
													handleExport();
													setShowActionMenu(false);
												}}
											>
												Export
											</button>
											<button
												type="button"
												className="dashboard-action-item"
												onClick={() => {
													handleDeleteSelected();
													setShowActionMenu(false);
												}}
											>
												Delete
											</button>
											<button
												type="button"
												className="dashboard-action-item"
												onClick={() => {
													handleAddToFavorite();
													setShowActionMenu(false);
												}}
											>
												Add To Favourite
											</button>
										</div>
									)}
								</div>

								<button
									type="button"
									className="dashboard-primary-btn"
									onClick={() =>
										setShowNewDashboardModal(true)
									}
									disabled={loading}
								>
									New Dashboard
								</button>
								<button
									type="button"
									className="dashboard-primary-btn"
									onClick={() => setShowNewFolderModal(true)}
									disabled={loading}
								>
									New Folder
								</button>
							</div>

							{/* Loading indicator */}
							{loading && (
								<div className="dashboard-loading">
									Loading...
								</div>
							)}

							{/* List content */}
							<div className="dashboard-table-wrapper">
								<table className="dashboard-table">
									<thead>
										<tr>
											<th className="dashboard-checkbox-col">
												<input
													type="checkbox"
													checked={allSelected}
													onChange={toggleAll}
												/>
											</th>
											<th>Dashboard Name</th>
											<th>Description</th>
											<th>Folder</th>
											<th>Created By</th>
											<th>Created On</th>
											<th>Last Modified</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredDashboards.length === 0 ? (
											<tr>
												<td
													colSpan={8}
													className="dashboard-empty-row"
												>
													{loading
														? "Loading..."
														: "No dashboards found"}
												</td>
											</tr>
										) : (
											filteredDashboards.map((d) => (
												<tr key={d.id}>
													<td className="dashboard-checkbox-col">
														<input
															type="checkbox"
															checked={selectedIds.includes(
																d.id
															)}
															onChange={() =>
																toggleRow(d.id)
															}
														/>
													</td>
													<td>{d.name}</td>
													<td>
														{d.description || "-"}
													</td>
													<td>
														{d.folderName || "-"}
													</td>
													<td>
														{d.createdBy || USER_ID}
													</td>
													<td>
														{d.createdAt
															? new Date(
																	d.createdAt
															  ).toLocaleDateString()
															: "-"}
													</td>
													<td>
														{d.updatedAt
															? new Date(
																	d.updatedAt
															  ).toLocaleDateString()
															: "-"}
													</td>
													<td>
														<div className="dashboard-action-buttons">
															<button
																className="dashboard-btn-display"
																onClick={() =>
																	handleEditDashboard(
																		d
																	)
																}
																title="Display Dashboard"
															>
																Display
															</button>
															<button
																className="dashboard-btn-delete-action"
																onClick={() =>
																	handleDeleteDashboard(
																		d.id
																	)
																}
																title="Delete Dashboard"
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
						</>
					) : (
						<NewDashboard
							dashboard={activeDashboard}
							onSave={handleNewDashboardSave}
							onCancel={backToList}
						/>
					)}
				</div>
			</div>

			{/* NEW DASHBOARD MODAL */}
			{showNewDashboardModal && (
				<div
					className="dashboard-modal-overlay"
					onClick={() => setShowNewDashboardModal(false)}
				>
					<div
						className="dashboard-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="dashboard-modal-title">New Dashboard</h2>

						<div className="dashboard-modal-field">
							<label>Dashboard Name *</label>
							<input
								type="text"
								value={dashboardName}
								onChange={(e) =>
									setDashboardName(e.target.value)
								}
								placeholder="Enter dashboard name"
							/>
						</div>

						<div className="dashboard-modal-field">
							<label>Dashboard Description</label>
							<input
								type="text"
								value={dashboardDescription}
								onChange={(e) =>
									setDashboardDescription(e.target.value)
								}
								placeholder="Enter dashboard description"
							/>
						</div>

						<div className="dashboard-modal-field">
							<label>Select Folder *</label>
							<select
								value={selectedFolderId}
								onChange={(e) =>
									setSelectedFolderId(e.target.value)
								}
							>
								<option value="">Select folder</option>
								{folders.map((folder) => (
									<option key={folder.id} value={folder.id}>
										{folder.name}
									</option>
								))}
							</select>
						</div>

						<div className="dashboard-modal-actions">
							<button
								className="dashboard-btn-secondary"
								onClick={() => setShowNewDashboardModal(false)}
							>
								Cancel
							</button>
							<button
								className="dashboard-btn-primary"
								onClick={handleCreateDashboard}
								disabled={isCreateDisabled || loading}
							>
								{loading ? "Creating..." : "Create"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* NEW FOLDER MODAL */}
			{showNewFolderModal && (
				<div
					className="dashboard-modal-overlay"
					onClick={() => setShowNewFolderModal(false)}
				>
					<div
						className="dashboard-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="dashboard-modal-title">Create Folder</h2>

						<div className="dashboard-modal-field">
							<label>Folder Name *</label>
							<input
								type="text"
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								placeholder="Enter folder name"
							/>
						</div>

						<div className="dashboard-modal-field">
							<label>Folder Description</label>
							<input
								type="text"
								value={folderDescription}
								onChange={(e) =>
									setFolderDescription(e.target.value)
								}
								placeholder="Enter folder description"
							/>
						</div>

						<div className="dashboard-modal-field">
							<label>Visibility</label>
							<div className="dashboard-visibility-options">
								<label>
									<input
										type="radio"
										name="folderVisibility"
										value="PRIVATE"
										checked={folderVisibility === "PRIVATE"}
										onChange={(e) =>
											setFolderVisibility(e.target.value)
										}
									/>
									Private
								</label>
								<label>
									<input
										type="radio"
										name="folderVisibility"
										value="SHARED"
										checked={folderVisibility === "SHARED"}
										onChange={(e) =>
											setFolderVisibility(e.target.value)
										}
									/>
									Shared
								</label>
								<label>
									<input
										type="radio"
										name="folderVisibility"
										value="PUBLIC"
										checked={folderVisibility === "PUBLIC"}
										onChange={(e) =>
											setFolderVisibility(e.target.value)
										}
									/>
									Public
								</label>
							</div>
						</div>

						<div className="dashboard-modal-actions">
							<button
								className="dashboard-btn-secondary"
								onClick={() => setShowNewFolderModal(false)}
							>
								Cancel
							</button>
							<button
								className="dashboard-btn-primary"
								onClick={handleCreateFolder}
								disabled={folderName.trim() === "" || loading}
							>
								{loading ? "Saving..." : "Save"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
