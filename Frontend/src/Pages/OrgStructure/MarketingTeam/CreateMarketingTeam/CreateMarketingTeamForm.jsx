import { useState, useEffect, useRef } from "react";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import "./CreateMarketingTeam.css";
import { toast } from "react-toastify";
import { ChevronDown, RefreshCcw, Filter, Trash2 } from "lucide-react";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateMarketingTeamForm() {
	const [formData, setFormData] = useState({
		marketingTeamCode: "",
		marketingTeamName: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Managers state
	const [managers, setManagers] = useState([]);
	const [showAddManager, setShowAddManager] = useState(false);

	// Employees state
	const [tableEmployees, setTableEmployees] = useState([]);
	const [showAddTableEmployee, setShowAddTableEmployee] = useState(false);

	// Employee selector modal
	const [showManagerModal, setShowManagerModal] = useState(false);
	const [showTableEmployeeModal, setShowTableEmployeeModal] = useState(false);
	const [employees, setEmployees] = useState([]);
	const [allEmployees, setAllEmployees] = useState([]); // raw data, never modified
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);

	const [newManager, setNewManager] = useState({
		validFrom: "",
		validTo: "",
		manager: "", // display name
		userId: "", // <-- add this
		primary: false,
		unlimited: true, // NEW: default to Unlimited (change as you like)
	});

	const [newTableEmployee, setNewTableEmployee] = useState({
		validFrom: "",
		validTo: "",
		employee: "", // display name
		userId: "", // <-- add this
		primary: false,
		unlimited: true, // NEW: default to Unlimited (change as you like)
	});

	// Add these near other useState in your component
	const [empIdFilter, setEmpIdFilter] = useState("");
	const [firstNameFilter, setFirstNameFilter] = useState("");
	const [deptFilter, setDeptFilter] = useState("");
	const [internalOnly, setInternalOnly] = useState(false);
	const [showFilters, setShowFilters] = useState(false); // default not visible

	// Apply filters (for demo using `mock`); replace with backend query as needed.
	const applyEmployeeFilters = () => {
		const q = (s) => (s || "").toLowerCase();
		const filtered = mock.filter((e) => {
			if (empIdFilter && !e.id.toLowerCase().includes(q(empIdFilter)))
				return false;
			if (
				firstNameFilter &&
				!e.name.toLowerCase().includes(q(firstNameFilter))
			)
				return false;
			if (deptFilter && !e.dept.toLowerCase().includes(q(deptFilter)))
				return false;
			if (internalOnly) {
				// demo: interpret dept "STD_USER_CS" as internal; adjust logic to match your data
				if (!e.dept.toLowerCase().includes("std")) return false;
			}
			return true;
		});
		setEmployees(filtered);
	};

	// Focus search input when employee modal opens
	const searchRef = useRef(null);
	useEffect(() => {
		if (
			(showManagerModal && searchRef.current) ||
			(showTableEmployeeModal && searchRef.current)
		) {
			searchRef.current.focus();
		}
	}, [showManagerModal, showTableEmployeeModal]);

	const handleCancel = () => {
		window.location.href = "/business-structure/display-marketing-team";
	};

	const validateField = (name, value) => {
		switch (name) {
			case "marketingTeamCode":
				if (!value) return "Marketing Team Code is required";
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Marketing Team Code must be exactly 4 alphanumeric characters";
				}
				break;

			case "marketingTeamName":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Marketing Team Name must be alphanumeric and up to 30 characters";
				}
				break;
			default:
				return "";
		}
		return "";
	};

	// When user selects employee from the lookup modal:
	const handleManagerSelect = (emp) => {
		setNewManager((prev) => ({
			...prev,
			manager: emp.name,
			userId: emp.userId || emp.id,
		}));
		setShowManagerModal(false);
	};

	const handleTableEmployeeSelect = (emp) => {
		setNewTableEmployee((prev) => ({
			...prev,
			employee: emp.name,
			userId: emp.userId || emp.id,
		}));
		setShowTableEmployeeModal(false);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "marketingTeamCode") {
			const processedValue = value.toUpperCase().replace(/\s/g, "");
			setFormData((prev) => ({ ...prev, [name]: processedValue }));
			const error = validateField(name, processedValue);
			setErrors((prev) => ({ ...prev, [name]: error }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
		const error = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setIsSubmitting(true);

		// Validate all fields before submission
		let formValid = true;
		const newErrors = {};

		Object.keys(formData).forEach((key) => {
			const error = validateField(key, formData[key]);
			if (error) {
				newErrors[key] = error;
				formValid = false;
			}
		});

		setErrors(newErrors);

		if (!formValid) {
			setIsSubmitting(false);
			toast.error("Please fix the errors in the form before submitting.");
			return;
		}

		try {
			// Check if marketingTeamCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/marketing-teams/${formData.marketingTeamCode}`
			);

			if (checkResponse.status === 200) {
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors((prev) => ({
					//   ...prev,
					//   marketingTeamCode: `Marketing Team Code "${formData.marketingTeamCode}" already exists. Please choose a new one.`,
					// }));
					toast.info(
						`Marketing Team Code "${formData.marketingTeamCode}" already exists. Please choose a new one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status !== 404) {
				throw new Error(
					"Failed to check Marketing Team Code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/marketing-teams`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create marketing team"
				);
			}

			toast.success("Marketing Team created successfully!");
			// Reset form after successful submission
			setFormData({
				marketingTeamCode: "",
				marketingTeamName: "",
			});
			// Optionally redirect
			window.location.href = "/business-structure/display-marketing-team";
		} catch (error) {
			console.error("Error creating marketing team:", error);
			toast.error(
				error.message ||
					"An error occurred while creating the marketing team"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Manager functions
	const handleAddManager = () => {
		setShowAddManager(true);
		setNewManager({
			validFrom: new Date().toISOString().split("T")[0],
			validTo: "",
			manager: "",
			primary: managers.length === 0, // First manager is primary by default
			unlimited: true,
		});
	};

	// Employee functions
	const handleAddTableEmployee = () => {
		setShowAddTableEmployee(true);
		setNewTableEmployee({
			validFrom: new Date().toISOString().split("T")[0],
			validTo: "",
			employee: "",
			primary: tableEmployees.length === 0, // First employee is primary by default
			unlimited: true,
		});
	};

	const handleNewManagerChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name === "unlimited") {
			// toggle unlimited: when true -> clear validTo; when false -> prefill today's date
			setNewManager((prev) => ({
				...prev,
				unlimited: checked,
				validTo: checked ? "" : new Date().toISOString().split("T")[0],
			}));
			return;
		}

		setNewManager((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleNewTableEmployeeChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name === "unlimited") {
			// toggle unlimited: when true -> clear validTo; when false -> prefill today's date
			setNewTableEmployee((prev) => ({
				...prev,
				unlimited: checked,
				validTo: checked ? "" : new Date().toISOString().split("T")[0],
			}));
			return;
		}

		setNewTableEmployee((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	// Update handleSaveManager to POST to backend and on success update local managers list
	const handleSaveManager = async () => {
		if (!newManager.manager || !newManager.validFrom) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!newManager.userId) {
			toast.error("Please select an employee from the lookup");
			return;
		}

		const payload = {
			// marketingTeamCode: formData.marketingTeamCode, // ensure this is set
			userId: newManager.userId,
			validFrom: newManager.validFrom,
			validTo: newManager.unlimited ? null : newManager.validTo,
			primary: !!newManager.primary,
		};

		try {
			const resp = await fetch(`${BASE_URL_MS}/marketing-team-managers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!resp.ok) {
				const err = await resp
					.json()
					.catch(() => ({ message: resp.statusText }));
				throw new Error(
					err.error || err.message || "Failed to save manager"
				);
			}

			const saved = await resp.json();

			// // Ensure primary uniqueness locally
			// let updatedManagers = managers;
			// if (saved.primary) {
			// 	updatedManagers = managers.map((m) => ({
			// 		...m,
			// 		primary: false,
			// 	}));
			// }

			// setManagers([
			// 	...updatedManagers,
			// 	{
			// 		id: saved.id,
			// 		userId: saved.userId,
			// 		manager: newManager.manager,
			// 		validFrom: saved.validFrom,
			// 		validTo:
			// 			saved.validTo === null ? "Unlimited" : saved.validTo,
			// 		primary: saved.primary,
			// 	},
			// ]);

			toast.success("Manager saved successfully");

			setShowAddManager(false);
			setNewManager({
				validFrom: "",
				validTo: "",
				manager: "",
				userId: "",
				primary: false,
				unlimited: true,
			});

			fetchManagers();
		} catch (err) {
			console.error(err);
			toast.error(err.message || "Could not save manager");
		}
	};

	// Update handleSaveTableEmployee to POST to backend and on success update local employees list
	const handleSaveTableEmployee = async () => {
		if (!newTableEmployee.employee || !newTableEmployee.validFrom) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!newTableEmployee.userId) {
			toast.error("Please select an employee from the lookup");
			return;
		}

		const payload = {
			// marketingTeamCode: formData.marketingTeamCode, // ensure this is set
			userId: newTableEmployee.userId,
			validFrom: newTableEmployee.validFrom,
			validTo: newTableEmployee.unlimited
				? null
				: newTableEmployee.validTo,
			primary: !!newTableEmployee.primary,
		};

		try {
			const resp = await fetch(
				`${BASE_URL_MS}/marketing-team-employees`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			);

			if (!resp.ok) {
				const err = await resp
					.json()
					.catch(() => ({ message: resp.statusText }));
				throw new Error(
					err.error || err.message || "Failed to save employee"
				);
			}

			const saved = await resp.json();

			// // Ensure primary uniqueness locally
			// let updatedTableEmployees = tableEmployees;
			// if (saved.primary) {
			// 	updatedTableEmployees = tableEmployees.map((m) => ({
			// 		...m,
			// 		primary: false,
			// 	}));
			// }

			// setTableEmployees([
			// 	...updatedTableEmployees,
			// 	{
			// 		id: saved.id,
			// 		userId: saved.userId,
			// 		employee: newTableEmployee.employee,
			// 		validFrom: saved.validFrom,
			// 		validTo:
			// 			saved.validTo === null ? "Unlimited" : saved.validTo,
			// 		primary: saved.primary,
			// 	},
			// ]);

			toast.success("Employee saved successfully");

			setShowAddTableEmployee(false);
			setNewTableEmployee({
				validFrom: "",
				validTo: "",
				employee: "",
				userId: "",
				primary: false,
				unlimited: true,
			});

			fetchTableEmployees();
		} catch (err) {
			console.error(err);
			toast.error(err.message || "Could not save employee");
		}
	};

	const handleCancelAddManager = () => {
		setShowAddManager(false);
		setNewManager({
			validFrom: "",
			validTo: "",
			manager: "",
			primary: false,
		});
	};

	const handleCancelAddTableEmployee = () => {
		setShowAddTableEmployee(false);
		setNewTableEmployee({
			validFrom: "",
			validTo: "",
			employee: "",
			primary: false,
		});
	};

	const handleDeleteManager = (id) => {
		setManagers(managers.filter((m) => m.id !== id));
	};

	const handleDeleteTableEmployee = (id) => {
		setTableEmployees(tableEmployees.filter((te) => te.id !== id));
	};

	const handleTogglePrimaryManager = (id) => {
		setManagers(
			managers.map((m) => ({
				...m,
				primary: m.id === id ? !m.primary : false,
			}))
		);
	};

	const handleTogglePrimaryTableEmployee = (id) => {
		setTableEmployees(
			tableEmployees.map((te) => ({
				...te,
				primary: te.id === id ? !te.primary : false,
			}))
		);
	};

	const handleSelectAll = (checked) => {
		// Implementation for select all functionality
		console.log("Select all:", checked);
	};

	const fetchEmployees = async () => {
		try {
			const response = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!response.ok) {
				toast.error("Unable to fetch employees");
				return;
			}
			const data = await response.json();
			setEmployees(data);
			setAllEmployees(data);
		} catch (err) {
			console.error(err);
			toast.error("Unable to fetch employees");
		}
	};

	const fetchManagers = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_MS}/marketing-team-managers`
			);
			if (!response.ok) {
				toast.error("Unable to fetch managers");
				return;
			}
			const data = await response.json();
			setManagers(
				data.map((d) => ({
					id: d.id,
					validFrom: d.validFrom,
					validTo: d.validTo,
					manager:
						allEmployees.find((e) => e.userId === d.userId)?.name ||
						"",
					userId: d.userId,
					primary: d.primary,
					unlimited: d.unlimited,
				}))
			);
		} catch (err) {
			console.error(err);
			toast.error("Unable to fetch managers");
		}
	};

	const fetchTableEmployees = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_MS}/marketing-team-employees`
			);
			if (!response.ok) {
				toast.error("Unable to fetch employees");
				return;
			}
			const data = await response.json();
			setTableEmployees(
				data.map((d) => ({
					id: d.id,
					validFrom: d.validFrom,
					validTo: d.validTo,
					employee:
						allEmployees.find((e) => e.userId === d.userId)?.name ||
						"",
					userId: d.userId,
					primary: d.primary,
					unlimited: d.unlimited,
				}))
			);
		} catch (err) {
			console.error(err);
			toast.error("Unable to fetch employees");
		}
	};

	useEffect(() => {
		fetchEmployees();
	}, []);

	useEffect(() => {
		if (allEmployees.length > 0) {
			fetchManagers();
			fetchTableEmployees();
		}
	}, [allEmployees]);

	useEffect(() => {
		const q = (query || "").trim().toLowerCase();

		if (!q) {
			setEmployees(allEmployees);
			return;
		}

		setEmployees(
			allEmployees.filter((e) => {
				const name = (e.name || "").toLowerCase();
				const id = (e.userId || e.id || "").toLowerCase(); // handle different id fields
				return name.includes(q) || id.includes(q);
			})
		);
	}, [query, allEmployees]);

	return (
		<>
			<div className="create-marketing-team-container">
				<form onSubmit={handleSubmit}>
					{/* Marketing Team Details */}
					<div className="create-marketing-team-header-box">
						<h2>Marketing Team Information</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="marketingTeamCode">
									Marketing Team Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Marketing Team Code must be exactly 4
										digits. <br />
										2- Marketing Team Code must be unique.{" "}
										<br />
										3- Marketing Team Code must not contain
										any special characters. <br />
										4- Marketing Team Code must not contain
										any spaces. <br />
										5- Marketing Team Code once created then
										it can be not delete. <br />
									</span>
								</span>
								<input
									type="text"
									id="marketingTeamCode"
									name="marketingTeamCode"
									value={formData.marketingTeamCode}
									onChange={(e) => {
										const value = e.target.value;
										// Allow only alphanumeric characters (no special characters or spaces)
										if (/^[a-zA-Z0-9]*$/.test(value)) {
											handleChange(e);
										}
									}}
									placeholder="Enter Marketing Team Code"
									maxLength={4}
									required
								/>
								{errors.marketingTeamCode && (
									<span className="error">
										{errors.marketingTeamCode}
									</span>
								)}
							</div>
							<div className="data">
								<label htmlFor="marketingTeamName">
									Marketing Team Name*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Marketing Team Name must be alphanumeric
										and up to 30 characters.
									</span>
								</span>
								<input
									type="text"
									id="marketingTeamName"
									name="marketingTeamName"
									value={formData.marketingTeamName}
									onChange={handleChange}
									placeholder="Enter Marketing Team Name"
									maxLength={30}
									required
								/>
								{errors.marketingTeamName && (
									<span className="error">
										{errors.marketingTeamName}
									</span>
								)}
							</div>
						</div>

						<h2>Employees</h2>
						<div className="manager-table-container">
							<div className="table-header123">
								<h3>Managers ({managers.length})</h3>
								<button
									type="button"
									className="add-button"
									onClick={handleAddManager}
								>
									Add
								</button>
							</div>
							<div className="table-body">
								{managers.length > 0 ? (
									<table className="managers-table">
										<thead>
											<tr>
												<th>
													<input
														type="checkbox"
														onChange={(e) =>
															handleSelectAll(
																e.target.checked
															)
														}
													/>
												</th>
												<th>
													Valid From{" "}
													<i className="fas fa-sort"></i>
												</th>
												<th>Valid To</th>
												<th>Manager</th>
												<th>Primary</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{managers.map((manager) => (
												<tr key={manager.id}>
													<td>
														<input type="checkbox" />
													</td>
													<td>
														{new Date(
															manager.validFrom
														).toLocaleDateString(
															"en-GB"
														)}
													</td>
													<td>
														{manager.validTo ===
														null
															? "Unlimited"
															: new Date(
																	manager.validTo
															  ).toLocaleDateString(
																	"en-GB"
															  )}
													</td>
													<td>
														<span className="manager-name">
															{manager.manager}
														</span>
													</td>
													<td>
														<input
															type="checkbox"
															checked={
																manager.primary
															}
															onChange={() =>
																handleTogglePrimaryManager(
																	manager.id
																)
															}
														/>
													</td>
													<td>
														<button
															type="button"
															className="delete-btn"
															onClick={() =>
																handleDeleteManager(
																	manager.id
																)
															}
														>
															<Trash2 size={15} />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<div className="empty-table">
										<p>
											No managers added yet. Click "Add"
											to add a manager.
										</p>
									</div>
								)}
							</div>
						</div>

						<div className="employee-table-container">
							<div className="table-header123">
								<h3>Employees ({tableEmployees.length})</h3>
								<button
									type="button"
									className="add-button"
									onClick={handleAddTableEmployee}
								>
									Add
								</button>
							</div>
							<div className="table-body">
								{tableEmployees.length > 0 ? (
									<table className="employees-table">
										<thead>
											<tr>
												<th>
													<input
														type="checkbox"
														onChange={(e) =>
															handleSelectAll(
																e.target.checked
															)
														}
													/>
												</th>
												<th>
													Valid From{" "}
													<i className="fas fa-sort"></i>
												</th>
												<th>Valid To</th>
												<th>Employee</th>
												<th>Primary</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{tableEmployees.map((employee) => (
												<tr key={employee.id}>
													<td>
														<input type="checkbox" />
													</td>
													<td>
														{new Date(
															employee.validFrom
														).toLocaleDateString(
															"en-GB"
														)}
													</td>
													<td>
														{employee.validTo ===
														null
															? "Unlimited"
															: new Date(
																	employee.validTo
															  ).toLocaleDateString(
																	"en-GB"
															  )}
													</td>
													<td>
														<span className="employee-name">
															{employee.employee}
														</span>
													</td>
													<td>
														<input
															type="checkbox"
															checked={
																employee.primary
															}
															onChange={() =>
																handleTogglePrimaryTableEmployee(
																	employee.id
																)
															}
														/>
													</td>
													<td>
														<button
															type="button"
															className="delete-btn"
															onClick={() =>
																handleDeleteTableEmployee(
																	employee.id
																)
															}
														>
															<Trash2 size={15} />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<div className="empty-table">
										<p>
											No employees added yet. Click "Add"
											to add an employee.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Submit Button */}
					{/* <div className="submit-button">
						<button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save"}
						</button>
					</div> */}
					<div className="create-marketing-team-button-group">
						<button
							type="submit"
							disabled={isSubmitting}
							className="create-marketing-team-save-button"
						>
							{isSubmitting ? "Saving..." : "Save"}
						</button>
						<button
							type="button"
							className="create-marketing-team-cancel-button"
							onClick={handleCancel}
						>
							Cancel
						</button>
					</div>
				</form>
				{/* <button className="cancel-button-header" onClick={handleCancel}>
					Cancel
				</button> */}
			</div>

			{showAddManager && (
				<div
					className="modal-overlay"
					onClick={handleCancelAddManager} // close when clicking outside
					role="dialog"
					aria-modal="true"
					aria-label="Add manager"
				>
					<div
						className="add-manager-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="modal-header">Manager</h3>
						<div className="add-manager-form">
							<div className="form-col">
								<div className="form-group">
									<label htmlFor="validTo">Valid From*</label>
									<input
										type="date"
										id="validTo"
										name="validFrom"
										value={newManager.validFrom}
										onChange={handleNewManagerChange}
										required
									/>
								</div>
								<div className="form-group">
									<label htmlFor="validTo">Valid To</label>

									<div className="valid-to-row">
										<input
											type="date"
											id="validTo"
											name="validTo"
											value={newManager.validTo}
											onChange={handleNewManagerChange}
											disabled={newManager.unlimited}
										/>

										<label className="valid-to-unlimited-checkbox-container">
											<input
												type="checkbox"
												name="unlimited"
												className="valid-to-unlimited-checkbox"
												checked={newManager.unlimited}
												onChange={
													handleNewManagerChange
												}
											/>
											<span>Unlimited</span>
										</label>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="manager">Manager*</label>
									<div className="input-with-button">
										<input
											id="manager"
											name="manager"
											value={newManager.manager}
											onChange={handleNewManagerChange}
											required
											readOnly
											placeholder="Click Lookup to select Manager"
										/>
										{/* small icon button that opens the employee selector */}
										<button
											type="button"
											className="input-icon-btn"
											title="Lookup Employee"
											onClick={() =>
												setShowManagerModal(true)
											}
										>
											{/* simple icon (use svg) */}
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												aria-hidden
											>
												<path
													d="M15 15l6 6"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<circle
													cx="11"
													cy="11"
													r="6"
													stroke="currentColor"
													strokeWidth="2"
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="form-actions">
								<button
									type="button"
									className="save-btn"
									onClick={handleSaveManager}
								>
									Save
								</button>
								<button
									type="button"
									className="cancel-btn"
									onClick={handleCancelAddManager}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showAddTableEmployee && (
				<div
					className="modal-overlay"
					onClick={handleCancelAddTableEmployee} // close when clicking outside
					role="dialog"
					aria-modal="true"
					aria-label="Add employee"
				>
					<div
						className="add-employee-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="modal-header">Employee</h3>
						<div className="add-employee-form">
							<div className="form-col">
								<div className="form-group">
									<label htmlFor="validTo">Valid From*</label>
									<input
										type="date"
										id="validTo"
										name="validFrom"
										value={newTableEmployee.validFrom}
										onChange={handleNewTableEmployeeChange}
										required
									/>
								</div>
								<div className="form-group">
									<label htmlFor="validTo">Valid To</label>

									<div className="valid-to-row">
										<input
											type="date"
											id="validTo"
											name="validTo"
											value={newTableEmployee.validTo}
											onChange={
												handleNewTableEmployeeChange
											}
											disabled={
												newTableEmployee.unlimited
											}
										/>

										<label className="valid-to-unlimited-checkbox-container">
											<input
												type="checkbox"
												name="unlimited"
												className="valid-to-unlimited-checkbox"
												checked={
													newTableEmployee.unlimited
												}
												onChange={
													handleNewTableEmployeeChange
												}
											/>
											<span>Unlimited</span>
										</label>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="employee">Employee*</label>
									<div className="input-with-button">
										<input
											id="employee"
											name="employee"
											value={newTableEmployee.employee}
											onChange={
												handleNewTableEmployeeChange
											}
											required
											readOnly
											placeholder="Click Lookup to select Employee"
										/>
										{/* small icon button that opens the employee selector */}
										<button
											type="button"
											className="input-icon-btn"
											title="Lookup Employee"
											onClick={() =>
												setShowTableEmployeeModal(true)
											}
										>
											{/* simple icon (use svg) */}
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												aria-hidden
											>
												<path
													d="M15 15l6 6"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<circle
													cx="11"
													cy="11"
													r="6"
													stroke="currentColor"
													strokeWidth="2"
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="form-actions">
								<button
									type="button"
									className="save-btn"
									onClick={handleSaveTableEmployee}
								>
									Save
								</button>
								<button
									type="button"
									className="cancel-btn"
									onClick={handleCancelAddTableEmployee}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Employee selector modal - new design */}
			{showManagerModal && (
				<div
					className="modal-overlay"
					onClick={() => setShowManagerModal(false)}
					role="dialog"
					aria-modal="true"
					aria-label="Select Manager"
				>
					<div
						className="show-manager-modal modal--large"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Top bar with dataset + toolbar icons */}
						<div className="employee-modal-topbar">
							<div className="dataset-left">
								<strong className="dataset-name">
									STD_USER_CS (55)
								</strong>
								<button
									className="dataset-dropdown"
									aria-label="Open dataset options"
								>
									<ChevronDown size={20} />
								</button>
							</div>

							<div className="modal-title">Select Employee</div>

							<div className="toolbar-right">
								<div className="employee-search-wrapper">
									<input
										ref={searchRef}
										className="employee-search-input"
										placeholder="Search by name or id..."
										value={query}
										onChange={(e) =>
											setQuery(e.target.value)
										}
										aria-label="Search employees"
									/>
								</div>
								<button
									className="tool-btn"
									title="Refresh"
									onClick={fetchEmployees}
								>
									<RefreshCcw size={20} />
								</button>
								<button
									className="tool-btn"
									title="Filters"
									onClick={() =>
										setShowFilters((prev) => !prev)
									}
								>
									<Filter size={20} />
								</button>
							</div>
						</div>

						{/* Filter row (Employee ID, First Name, Department) */}
						{showFilters && (
							<div className="employee-filter-panel">
								<div className="filter-row">
									<div className="filter-col">
										<label>Employee ID</label>
										<input
											value={empIdFilter}
											onChange={(e) =>
												setEmpIdFilter(e.target.value)
											}
											placeholder="Employee ID"
										/>
									</div>

									<div className="filter-col">
										<label>First Name</label>
										<input
											value={firstNameFilter}
											onChange={(e) =>
												setFirstNameFilter(
													e.target.value
												)
											}
											placeholder="First name"
										/>
									</div>

									<div className="filter-col">
										<label>Department</label>
										<input
											value={deptFilter}
											onChange={(e) =>
												setDeptFilter(e.target.value)
											}
											placeholder="Department"
										/>
									</div>
								</div>

								{/* Restore / Go row */}
								<div className="filter-actions">
									<button
										type="button"
										className="link-like"
										onClick={() => {
											setEmpIdFilter("");
											setFirstNameFilter("");
											setDeptFilter("");
											setInternalOnly(false);
											setEmployees(mock); // reset
										}}
									>
										Restore
									</button>

									<button
										type="button"
										className="go-btn"
										onClick={applyEmployeeFilters}
									>
										Go
									</button>

									<div className="query-links">
										<button className="link-like">
											Save Query
										</button>
										<button className="link-like">
											Save Query As
										</button>
										<button className="link-like">
											Organize Queries
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Employee list / table */}
						<div className="employee-list">
							{loading ? (
								<div className="loading">Loading…</div>
							) : employees.length === 0 ? (
								<div className="empty">No employees found</div>
							) : (
								<table className="employee-table">
									<thead>
										<tr>
											<th>Name</th>
											<th>Employee ID</th>
											<th>Department</th>
											<th
												style={{ textAlign: "right" }}
											></th>
										</tr>
									</thead>
									<tbody>
										{employees.map((emp) => (
											<tr key={emp.userId}>
												<td>{emp.name}</td>
												<td>{emp.userId}</td>
												<td>{emp.dept}</td>
												<td
													style={{
														textAlign: "right",
													}}
												>
													<button
														className="select-btn"
														onClick={() =>
															handleManagerSelect(
																emp
															)
														}
													>
														Select
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						{/* Footer actions */}
						<div
							className="modal .form-actions"
							style={{
								padding: "10px 18px",
								borderTop: "1px solid #eee",
								display: "flex",
								justifyContent: "flex-end",
							}}
						>
							<button
								className="cancel-btn"
								onClick={() => setShowManagerModal(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{showTableEmployeeModal && (
				<div
					className="modal-overlay"
					onClick={() => setShowTableEmployeeModal(false)}
					role="dialog"
					aria-modal="true"
					aria-label="Select Employee"
				>
					<div
						className="show-employee-modal modal--large"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Top bar with dataset + toolbar icons */}
						<div className="employee-modal-topbar">
							<div className="dataset-left">
								<strong className="dataset-name">
									STD_USER_CS (55)
								</strong>
								<button
									className="dataset-dropdown"
									aria-label="Open dataset options"
								>
									<ChevronDown size={20} />
								</button>
							</div>

							<div className="modal-title">Select Employee</div>

							<div className="toolbar-right">
								<div className="employee-search-wrapper">
									<input
										ref={searchRef}
										className="employee-search-input"
										placeholder="Search by name or id..."
										value={query}
										onChange={(e) =>
											setQuery(e.target.value)
										}
										aria-label="Search employees"
									/>
								</div>
								<button
									className="tool-btn"
									title="Refresh"
									onClick={fetchEmployees}
								>
									<RefreshCcw size={20} />
								</button>
								<button
									className="tool-btn"
									title="Filters"
									onClick={() =>
										setShowFilters((prev) => !prev)
									}
								>
									<Filter size={20} />
								</button>
							</div>
						</div>

						{/* Filter row (Employee ID, First Name, Department) */}
						{showFilters && (
							<div className="employee-filter-panel">
								<div className="filter-row">
									<div className="filter-col">
										<label>Employee ID</label>
										<input
											value={empIdFilter}
											onChange={(e) =>
												setEmpIdFilter(e.target.value)
											}
											placeholder="Employee ID"
										/>
									</div>

									<div className="filter-col">
										<label>First Name</label>
										<input
											value={firstNameFilter}
											onChange={(e) =>
												setFirstNameFilter(
													e.target.value
												)
											}
											placeholder="First name"
										/>
									</div>

									<div className="filter-col">
										<label>Department</label>
										<input
											value={deptFilter}
											onChange={(e) =>
												setDeptFilter(e.target.value)
											}
											placeholder="Department"
										/>
									</div>
								</div>

								{/* Restore / Go row */}
								<div className="filter-actions">
									<button
										type="button"
										className="link-like"
										onClick={() => {
											setEmpIdFilter("");
											setFirstNameFilter("");
											setDeptFilter("");
											setInternalOnly(false);
											setEmployees(mock); // reset
										}}
									>
										Restore
									</button>

									<button
										type="button"
										className="go-btn"
										onClick={applyEmployeeFilters}
									>
										Go
									</button>

									<div className="query-links">
										<button className="link-like">
											Save Query
										</button>
										<button className="link-like">
											Save Query As
										</button>
										<button className="link-like">
											Organize Queries
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Employee list / table */}
						<div className="employee-list">
							{loading ? (
								<div className="loading">Loading…</div>
							) : employees.length === 0 ? (
								<div className="empty">No employees found</div>
							) : (
								<table className="employee-table">
									<thead>
										<tr>
											<th>Name</th>
											<th>Employee ID</th>
											<th>Department</th>
											<th
												style={{ textAlign: "right" }}
											></th>
										</tr>
									</thead>
									<tbody>
										{employees.map((emp) => (
											<tr key={emp.userId}>
												<td>{emp.name}</td>
												<td>{emp.userId}</td>
												<td>{emp.dept}</td>
												<td
													style={{
														textAlign: "right",
													}}
												>
													<button
														className="select-btn"
														onClick={() =>
															handleTableEmployeeSelect(
																emp
															)
														}
													>
														Select
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						{/* Footer actions */}
						<div
							className="modal .form-actions"
							style={{
								padding: "10px 18px",
								borderTop: "1px solid #eee",
								display: "flex",
								justifyContent: "flex-end",
							}}
						>
							<button
								className="cancel-btn"
								onClick={() => setShowTableEmployeeModal(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
