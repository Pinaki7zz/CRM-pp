import React, { useState } from "react";
import {
	Plus,
	RefreshCcw,
	Filter,
	Search,
	User,
	ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./OrganizationalStructure.css";

const OrganizationalStructure = () => {
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showcontactDropdown, setShowcontactDropdown] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [showActionsModal, setShowActionsModal] = useState(false);
	const navigate = useNavigate();

	const contactData = [
		{
			id: 1,
			name: "Rick",
			manager: "L-001",
			location: "Company A",
			createOn: "New",
			parentUnitName: "Hello",
			owner: "123-456-7890",
		},
		{
			id: 2,
			name: "contact 2",
			manager: "L-002",
			location: "Company B",
			createOn: "Open",
			parentUnitName: "contact2@example.com",
			owner: "234-567-8901",
		},
		{
			id: 3,
			name: "contact 3",
			manager: "L-003",
			location: "Company C",
			createOn: "Converted",
			parentUnitName: "contact3@example.com",
			owner: "345-678-9012",
		},
	];

	const contactCategories = [
		{ id: "all", name: "ALL ORG", count: "121" },
		{ id: "orgHeirarcies", name: "ORG HEIRARCIES", count: "12" },
	];

	const toggleRowSelection = (id) => {
		if (selectedRows.includes(id)) {
			setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
		} else {
			setSelectedRows([...selectedRows, id]);
		}
	};

	const handleDeleteConfirm = () => {
		// Handle delete logic
		setShowDeleteConfirm(false);
		setSelectedRows([]);
	};

	const toggleContactsDropdown = () => {
		setShowcontactDropdown(!showcontactDropdown);
	};

	const toggleFilters = () => {
		setShowFilters(!showFilters);
	};

	return (
		<div className="sales-quotes-management-container">
			<div className="sales-quotes-section">
				{/* Product Stats */}
				<div className="sales-quotes-stats">
					<div className="stat-item">
						<div className="stat-label">TOTAL ORG</div>
						<div className="stat-value">121</div>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="sales-quotes-actions">
					<div className="sales-quotes-actions-left">
						<div className="search-container">
							<input
								type="text"
								placeholder="Search ..."
								className="search-input"
							/>
							<Search
								className="search-icon-small"
								size={20}
								color="#64748b"
								strokeWidth={1}
							/>
						</div>
						<div className="sales-quotes-dropdown-container">
							<button
								className="sales-quotes-dropdown-button"
								onClick={toggleContactsDropdown}
							>
								<User
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
								<span>All ORG</span>
								<ChevronDown
									size={20}
									color="#64748b"
									strokeWidth={2}
								/>
							</button>
							{showcontactDropdown && (
								<div className="sales-quotes-dropdown-menu">
									{contactCategories.map((category) => (
										<div
											key={category.id}
											className="sales-quotes-dropdown-item"
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
						<button className="modern-button add-button">
							<Plus size={20} color="#fff" strokeWidth={2} />
							<span
								onClick={() =>
									navigate(
										"/business-structure/org-hub/create"
									)
								}
							>
								Create Organization
							</span>
						</button>
						<button className="icon-button-modern refresh-button">
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
						<div className="action-select-container">
							<select
								className="modern-select action-select"
								onChange={(e) =>
									handleActionChange(e.target.value)
								}
								defaultValue=""
							>
								<option value="" disabled>
									Actions
									<ChevronDown
										size={20}
										color="#000"
										strokeWidth={2}
										className="select-chevron"
									/>
								</option>
								<option value="export">Export</option>
								<option value="view-all">View All</option>
								<option value="delete">Delete</option>
							</select>
						</div>
					</div>
				</div>

				{/* Filters Section */}
				{showFilters && (
					<div className="filters-container">
						<div className="filters-header">
							<h3>Filter Sales Quotes</h3>
							<button
								className="close-filters"
								onClick={toggleFilters}
							>
								×
							</button>
						</div>
						<div className="filter-row">
							<div className="filter-col">
								<label>Org Name</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Manager</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>location</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Owner</label>
								<select className="filter-select">
									<option>Select</option>
								</select>
							</div>
							<div className="filter-col">
								<label>Parent Unit Name</label>
								<select className="filter-select">
									<option>Select</option>
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

				{/* Sales Quotes Table */}
				<div className="sales-quotes-table-container">
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
									Org Name{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Manager<span className="sort-icon">↓</span>
								</th>
								<th>
									Location{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Created on{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Parent Unit Name{" "}
									<span className="sort-icon">↓</span>
								</th>
								<th>
									Owner <span className="sort-icon">↓</span>
								</th>

								<th>
									Action <span className="sort-icon">↓</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{contactData.map((contact) => (
								<tr
									key={contact.id}
									className={
										selectedRows.includes(contact.id)
											? "selected-row"
											: ""
									}
								>
									<td className="checkbox-column">
										<input
											type="checkbox"
											className="custom-checkbox"
											checked={selectedRows.includes(
												contact.id
											)}
											onChange={() =>
												toggleRowSelection(contact.id)
											}
										/>
									</td>
									<td>{contact.name}</td>
									<td>{contact.manager}</td>
									<td>{contact.location}</td>
									<td>{contact.createOn}</td>
									<td>{contact.parentUnitName}</td>
									<td>{contact.owner}</td>

									<td>
										<div className="action-buttons">
											<button
												className="display-btn"
												onClick={() =>
													navigate(
														"/products/productcategories/details"
													)
												}
											>
												Display
											</button>
											<button
												className="delete-btn"
												onClick={setShowDeleteConfirm}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
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

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<div className="delete-confirm-overlay">
						<div className="delete-confirm-dialog">
							<div className="dialog-header">
								<h3>Confirm Delete</h3>
								<p>
									Are you sure you want to delete this quote?
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

export default OrganizationalStructure;
