import { useState, useEffect } from "react";
import { Plus, RefreshCcw, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateTemplate from "./CreateTemplate.jsx";
import "./Templates.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

function Templates() {
	const [templates, setTemplates] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	const fetchCurrentUser = async () => {
		try {
			const response = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});

			if (response.ok) {
				const userData = await response.json();

				// ✅ FIXED: Access first user from array
				if (Array.isArray(userData) && userData.length > 0) {
					setUser(userData[0]); // Take the first user from the array
				} else {
					setUser(null);
				}
			} else {
				console.error("Failed to fetch user:", response.status);
				setUser(null);
			}
		} catch (error) {
			console.error("❌ Failed to fetch current user:", error);
			setUser(null);
		}
	};

	useEffect(() => {
		fetchTemplates();
		fetchCurrentUser();
	}, []);

	// 🔥 Fixed fetchTemplates with proper array handling
	const fetchTemplates = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${BASE_URL_SER}/templates`);
			const data = await response.json();

			// Debug log

			if (response.ok) {
				// ✅ Fixed: Remove redundant condition
				let templatesArray = [];

				if (Array.isArray(data)) {
					templatesArray = data;
				} else if (data && Array.isArray(data.data)) {
					templatesArray = data.data;
				}

				setTemplates(templatesArray);
			} else {
				console.error("Failed to fetch templates:", data);
				setTemplates([]);
			}
		} catch (error) {
			console.error("Error fetching templates:", error);
			setTemplates([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTemplates();
	}, []);

	const toggleRowSelection = (id) => {
		if (selectedRows.includes(id)) {
			setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
		} else {
			setSelectedRows([...selectedRows, id]);
		}
	};

	// 🔥 Fixed delete with proper error handling
	const handleDeleteConfirm = async () => {
		if (selectedRows.length === 0) return;

		try {
			setLoading(true);

			// Delete each selected template
			for (const templateId of selectedRows) {
				console.log("Deleting template:", templateId);

				const response = await fetch(
					`${BASE_URL_SER}/templates/${templateId}`,
					{
						method: "DELETE",
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					console.error(
						`Failed to delete template ${templateId}:`,
						errorData
					);
					throw new Error(`Failed to delete template ${templateId}`);
				}

				console.log(`Successfully deleted template ${templateId}`);
			}

			// Reset selection and close modal
			setSelectedRows([]);
			setShowDeleteConfirm(false);

			// Refresh the templates list
			await fetchTemplates();

			console.log("All selected templates deleted successfully");
		} catch (error) {
			console.error("Delete failed:", error);
			alert("Failed to delete templates. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const toggleFilters = () => {
		setShowFilters(!showFilters);
	};

	// 🔥 Safe filtering with array check
	const filteredTemplates = (
		Array.isArray(templates) ? templates : []
	).filter(
		(template) =>
			(template.name &&
				template.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase())) ||
			(template.subject &&
				template.subject
					.toLowerCase()
					.includes(searchTerm.toLowerCase()))
	);

	// Format enum values for display
	const formatTemplateType = (type) => {
		switch (type) {
			case "TEXT_BASED":
				return "Text Based";
			case "DOCUMENT_BASED":
				return "Document Based";
			default:
				return type;
		}
	};

	const formatUsage = (usage) => {
		switch (usage) {
			case "TEMPLATE":
				return "Template";
			case "SIGNATURE":
				return "Signature";
			default:
				return usage;
		}
	};

	const formatLanguage = (language) => {
		switch (language) {
			case "ENGLISH":
				return "English";
			case "SPANISH":
				return "Spanish";
			case "FRENCH":
				return "French";
			case "GERMAN":
				return "German";
			case "ITALIAN":
				return "Italian";
			case "PORTUGUESE":
				return "Portuguese";
			case "DUTCH":
				return "Dutch";
			case "SWEDISH":
				return "Swedish";
			case "NORWEGIAN":
				return "Norwegian";
			case "DANISH":
				return "Danish";
			case "RUSSIAN":
				return "Russian";
			case "TURKISH":
				return "Turkish";
			default:
				return language;
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString();
	};

	return (
		<>
			<div className="sales-quotes-management-container">
				<div className="sales-quotes-section">
					{/* Template Stats */}
					<div className="sales-quotes-stats">
						<div className="stat-item">
							<div className="stat-label">TOTAL TEMPLATES</div>
							<div className="stat-value">{templates.length}</div>
						</div>
					</div>

					{/* Search and Actions */}
					<div className="sales-quotes-actions">
						<div className="sales-quotes-actions-left">
							<div className="search-container">
								<input
									type="text"
									placeholder="Search templates..."
									className="search-input"
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
								/>
								<Search
									className="search-icon-small"
									size={20}
									color="#64748b"
									strokeWidth={1}
								/>
							</div>
							<div className="sales-quotes-dropdown-container">
								<select
									name=""
									id=""
									className="sales-quotes-dropdown-button"
								>
									<option value="">My Templates</option>
									<option value="">All Templates</option>
									<option value="">My Signatures</option>
									<option value="">All Signatures</option>
									<option value="">
										Corporate Templates
									</option>
								</select>
							</div>
						</div>
						<div className="action-icons">
							<button
								className="modern-button add-button"
								onClick={() => setShowCreateModal(true)}
							>
								<Plus size={20} color="#fff" strokeWidth={2} />
								<span>Create Template</span>
							</button>
							<button
								className="icon-button-modern refresh-button"
								onClick={fetchTemplates}
								disabled={loading}
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
								<Filter
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
							</button>
						</div>
					</div>

					{/* Filters Section */}
					{showFilters && (
						<div className="filters-container">
							<div className="filters-header">
								<h3>Filter Templates</h3>
								<button
									className="close-filters"
									onClick={toggleFilters}
								>
									×
								</button>
							</div>
							<div className="filter-row">
								<div className="filter-col">
									<label>Template Type</label>
									<select className="filter-select">
										<option>Select</option>
										<option>Template</option>
										<option>Signature</option>
									</select>
								</div>
								<div className="filter-col">
									<label>Object</label>
									<select className="filter-select">
										<option>Select</option>
										<option>Account</option>
										<option>Contact</option>
										<option>Ticket</option>
									</select>
								</div>
								<div className="filter-col">
									<label>Language</label>
									<select className="filter-select">
										<option>Select</option>
										<option>English</option>
										<option>Spanish</option>
										<option>French</option>
									</select>
								</div>
								<div className="filter-col">
									<label>Created By</label>
									<select className="filter-select">
										<option>Select</option>
									</select>
								</div>
							</div>
							<div className="filter-actions">
								<div className="filter-buttons">
									<button className="reset-button">
										Reset
									</button>
									<button className="apply-button">
										Apply
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Templates Table */}
					<div className="sales-quotes-table-container">
						{loading && (
							<div className="loading-indicator">
								Loading templates...
							</div>
						)}

						<table className="contact-table">
							<thead>
								<tr>
									<th className="checkbox-column">
										<input
											type="checkbox"
											className="custom-checkbox"
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedRows(
														filteredTemplates.map(
															(t) => t.id
														)
													);
												} else {
													setSelectedRows([]);
												}
											}}
											checked={
												selectedRows.length > 0 &&
												selectedRows.length ===
													filteredTemplates.length
											}
										/>
									</th>
									<th>Name</th>
									<th>Template Type</th>
									<th>Created by</th>
									<th>Created on</th>
									<th>Usage Type</th>
									<th>Language</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{filteredTemplates.length === 0 && !loading ? (
									<tr>
										<td
											colSpan="8"
											style={{
												textAlign: "center",
												padding: "20px",
											}}
										>
											{searchTerm
												? "No templates found matching your search"
												: "No templates found"}
										</td>
									</tr>
								) : (
									filteredTemplates.map((template) => (
										<tr
											key={template.id}
											className={
												selectedRows.includes(
													template.id
												)
													? "selected-row"
													: ""
											}
										>
											<td className="checkbox-column">
												<input
													type="checkbox"
													className="custom-checkbox"
													checked={selectedRows.includes(
														template.id
													)}
													onChange={() =>
														toggleRowSelection(
															template.id
														)
													}
												/>
											</td>
											<td>{template.name}</td>
											<td>
												{formatTemplateType(
													template.templateType
												)}
											</td>
											<td>
												{template.createdBy || "System"}
											</td>
											<td>
												{formatDate(template.createdAt)}
											</td>
											<td>
												{formatUsage(template.usage)}
											</td>
											<td>
												{formatLanguage(
													template.language
												)}
											</td>
											<td>
												<div className="action-buttons">
													<button
														className="display-btn"
														onClick={() =>
															navigate(
																"/service/templates/display",
																{
																	state: {
																		templateData:
																			template,
																	},
																}
															)
														}
													>
														Display
													</button>
													<button
														className="delete-btn"
														onClick={() => {
															setSelectedRows([
																template.id,
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

					{/* Pagination */}
					<div className="pagination">
						<button className="pagination-button">Previous</button>
						<div className="page-numbers">
							<button className="page-number active">1</button>
							<button className="page-number">2</button>
							<button className="page-number">3</button>
						</div>
						<button className="pagination-button">Next</button>
					</div>

					{/* Delete Confirmation Modal */}
					{showDeleteConfirm && (
						<div className="delete-confirm-overlay">
							<div className="delete-confirm-dialog">
								<div className="dialog-header">
									<h3>Confirm Delete</h3>
									<p>
										Are you sure you want to delete the
										selected template(s)?
									</p>
									<p>
										Selected: {selectedRows.length}{" "}
										template(s)
									</p>
								</div>
								<div className="dialog-buttons">
									<button
										className="confirm-cancel-button"
										onClick={() =>
											setShowDeleteConfirm(false)
										}
										disabled={loading}
									>
										Cancel
									</button>
									<button
										className="confirm-delete-button"
										onClick={handleDeleteConfirm}
										disabled={loading}
									>
										{loading ? "Deleting..." : "Delete"}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Create Template Modal */}
					{showCreateModal && (
						<div className="modal-overlay">
							<CreateTemplate
								user={user}
								onClose={() => {
									setShowCreateModal(false);
									fetchTemplates();
								}}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default Templates;
