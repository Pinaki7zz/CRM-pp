import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import { X, RefreshCcw, Search, Filter, Save, CircleX } from "lucide-react";
import useOrgDepartments from "../../hooks/useOrgDepartments"; // adjust path
import "./CreateUserProfile.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

const CreateUserProfile = () => {
	const navigate = useNavigate();
	const actionRef = useRef();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		userId: "",
		username: "",
		email: "",
		phone: "",
		businessRole: "", 
		timeZone: "",
		status: "ACTIVE", // ✅ FIXED: Default to "ACTIVE" instead of ""
		department: "",
		job: "",
		personalCountry: "",
		personalState: "",
		personalCity: "",
		personalStreet: "",
		personalPostalCode: "",
	});
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [errors, setErrors] = useState({});
	const [businessRoles, setBusinessRoles] = useState([]);
	// const [showSelectJobModal, setShowSelectJobModal] = useState(false);

	// Department modal state & mock data (simple inline modal)
	const [showSelectDepartmentModal, setShowSelectDepartmentModal] =
		useState(false);
	const [deptSearch, setDeptSearch] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState(null);
	const [loading, setLoading] = useState(false);
	const [refreshSpin, setRefreshSpin] = useState(false);

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const handleCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			personalCountry: selected,
			personalState: "",
			personalCity: "",
		});

		const countryObj = countries.find((c) => c.name === selected);
		if (countryObj) {
			setStates(State.getStatesOfCountry(countryObj.isoCode));
			setCities([]);
		} else {
			setStates([]);
			setCities([]);
		}
	};

	const handleStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({
			...formData,
			personalState: selectedState,
			personalCity: "",
		});

		const countryObj = countries.find(
			(c) => c.name === formData.personalCountry
		);
		const stateObj = states.find((s) => s.name === selectedState);

		if (countryObj && stateObj) {
			const cityList = City.getCitiesOfState(
				countryObj.isoCode,
				stateObj.isoCode
			);
			setCities(cityList);
		} else {
			setCities([]);
		}
	};

	const validateIndianPinCode = async (postalCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${postalCode}`
			);
			const data = await res.json();

			if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
				const postOffice = data[0].PostOffice[0];
				return {
					valid: true,
					district: postOffice.District,
					state: postOffice.State,
					country: postOffice.Country,
				};
			} else {
				return {
					valid: false,
					message: "Invalid PIN Code. Please select correct State.",
				};
			}
		} catch (err) {
			return {
				valid: false,
				message: "API error while validating pincode.",
			};
		}
	};

	const {
		departments,
		loading: deptLoading,
		error: deptError,
		refresh: refreshDepartments,
	} = useOrgDepartments({
		rootUrl: `${BASE_URL_MS}`,
	});

	useEffect(() => {
		if (
			formData.personalCountry === "India" &&
			formData.personalPostalCode.length === 6
		) {
			validateIndianPinCode(formData.personalPostalCode).then(
				(result) => {
					if (result.valid) {
						const stateMatch =
							result.state.toLowerCase() ===
							formData.personalState.toLowerCase();

						if (!stateMatch) {
							console.warn(
								`PIN code doesn't match selected State. Expected State: ${result.state}`
							);
						}
					} else {
						console.error(result.message);
					}
				}
			);
		}
	}, [formData.personalPostalCode, formData.personalCountry]);

	useEffect(() => {
		const f = (formData.firstName || "").trim();
		const l = (formData.lastName || "").trim();

		if (!f && !l) {
			setFormData((prev) => ({ ...prev, username: "" }));
			return;
		}

		const base = `${l}${f}`.replace(/\s+/g, "").toLowerCase();
		const numericSuffix = extractNumericSuffix(formData.userId) ?? "1";
		const width =
			(extractNumericSuffix(formData.userId) || "001").length || 3;
		const suffix = padToWidth(numericSuffix, width);
		const generated = `${base}${suffix}`;

		// CLEAR username validation errors
		setErrors((prev) => {
			if (!prev.username) return prev;
			const updated = { ...prev };
			delete updated.username;
			return updated;
		});

		setFormData((prev) => ({ ...prev, username: generated }));
	}, [formData.firstName, formData.lastName, formData.userId]);

	const fetchNextUserId = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/next-userid`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Failed to fetch User ID");
				return;
			}
			const data = await res.json();
			setFormData((prev) => ({
				...prev,
				userId: data.userId,
			}));
		} catch (error) {
			console.error("Error fetching User ID:", error);
			toast.error("Error fetching User ID");
		}
	};

	const fetchBusinessRoles = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/business-role/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Failed to fetch business roles");
				return;
			}
			const data = await res.json();
			setBusinessRoles(data); // real backend data
		} catch (error) {
			console.error("Error fetching business roles", error);
			toast.error("Error fetching business roles");
		}
	};

	useEffect(() => {
		setCountries(Country.getAllCountries());
		fetchNextUserId();
		fetchBusinessRoles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// helper: get last continuous digits from a string (returns string padded as-is)
	const extractNumericSuffix = (s) => {
		if (!s || typeof s !== "string") return null;
		const m = s.match(/(\d+)\s*$/);
		return m ? m[1] : null;
	};

	// helper: pad numbers to width (as string)
	const padToWidth = (numStr, width = 3) => {
		if (!numStr) return "001".padStart(width, "0");
		return String(numStr).padStart(width, "0");
	};

	// ---------- handlers ----------
	const handleChange = (e) => {
		const { id, value } = e.target;

		// ❗ Clear backend validation errors for the current field
		if (errors[id]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
		}

		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const handleSave = async (type) => {
		try {
			setLoading(true);

			const res = await fetch(`${BASE_URL_UM}/users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // ✅ if you’re using cookies
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				// try parse validation errors (400)
				const payload = await res.json().catch(() => null);

				if (payload && Array.isArray(payload.errors)) {
					// Build map: { path: [msg1, msg2] }
					const map = {};
					payload.errors.forEach((err) => {
						const key = err.path || "form";
						if (!map[key]) map[key] = [];
						map[key].push(err.msg || "Invalid value");
					});
					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				// fallback generic error
				toast.error("Failed to save user details");
				return;
			}

			const createdUser = await res.json();
			setErrors({});
			toast.success(`User ${createdUser.username} created successfully`);

			if (type === "save") {
				// ✅ Navigate to Employees list instead of User Profiles
				navigate("/admin/employees");
			} else if (type === "saveAndNew") {
				// Reset form for new entry
				setFormData({
					firstName: "",
					lastName: "",
					userId: "",
					username: "",
					email: "",
					phone: "",
					businessRole: "",
					timeZone: "",
					status: "ACTIVE",
					department: "",
					job: "",
					personalCountry: "",
					personalState: "",
					personalCity: "",
					personalStreet: "",
					personalPostalCode: "",
				});

				// Fetch next userId again
				fetchNextUserId();
			}
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error("An error occurred while creating the user");
		} finally {
			setLoading(false);
		}
	};

	const closeDeptModal = () => {
		setShowSelectDepartmentModal(false);
		setSelectedDepartment(null);
	};

	const confirmDeptModal = () => {
		if (selectedDepartment) {
			setFormData((prev) => ({
				...prev,
				department: selectedDepartment.id,
			})); // or .name
		}
		closeDeptModal();
	};

	const handleClearDepartment = () => {
		setFormData((prev) => ({
			...prev,
			department: "", // or null, but keep consistent everywhere
		}));
		setSelectedDepartment(null);
		closeDeptModal();
	};

	const search = (deptSearch || "").trim().toLowerCase();

	const filteredDepartments = departments.filter((d = {}) => {
		const id = String(d.id ?? "").toLowerCase();
		const name = String(d.name ?? "").toLowerCase();
		return id.includes(search) || name.includes(search);
	});

	useEffect(() => {
		const f = (formData.firstName || "").trim();
		const l = (formData.lastName || "").trim();
		// if not enough name info, leave username empty
		if (!f && !l) {
			setFormData((prev) => ({ ...prev, username: "" }));
			return;
		}

		// base username is last+first, lowercased and without spaces
		const base = `${l}${f}`.replace(/\s+/g, "").toLowerCase();

		// extract numeric suffix from userId like 'U-002' -> '002'
		const numericSuffix = extractNumericSuffix(formData.userId) ?? "1";

		// determine width from userId suffix (if present) else default to 3
		const width =
			(extractNumericSuffix(formData.userId) || "001").length || 3;
		const suffix = padToWidth(numericSuffix, width);

		// username e.g. 'royrohan002'
		const generated = `${base}${suffix}`;

		setFormData((prev) => ({ ...prev, username: generated }));
	}, [formData.firstName, formData.lastName, formData.userId]);

	return (
		<div className="userprof-create-container">
			{/* New User Category Page Header Section */}
			<div className="userprof-create-header-container">
				{/* ✅ Updated Title */}
				<h1 className="userprof-create-heading">New Employee</h1>
				<div className="userprof-create-header-container-buttons">
					<button
						className="userprof-create-save-button"
						onClick={() => handleSave("save")}
					>
						<Save size={17} strokeWidth={1} color="#dcf2f1" />
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="userprof-create-save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						<Save size={17} strokeWidth={1} color="#0f1035" />
						{loading ? "Saving..." : "Save and New"}
					</button>
					<button
						className="userprof-create-cancel-button"
						// ✅ Updated Navigation to Employees
						onClick={() => navigate("/admin/employees")}
					>
						<CircleX size={17} strokeWidth={1} color="#0f1035" />
						Cancel
					</button>
				</div>
			</div>

			{/* User Profiles Container */}
			<div className="userprof-create-form-container">
				<h1 className="sq-create-form-heading">Employee Information</h1>
				<div className="userprof-create-form">
					<form>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group firstName">
								<label htmlFor="firstName">First Name *</label>
								<input
									type="text"
									placeholder="Enter First Name"
									id="firstName"
									value={formData.firstName}
									onChange={handleChange}
								/>
								{getError("firstName") && (
									<div className="field-error">
										{getError("firstName")}
									</div>
								)}
							</div>
							<div className="userprof-create-form-group lastName">
								<label htmlFor="lastName">Last Name *</label>
								<input
									type="text"
									placeholder="Enter Last Name"
									id="lastName"
									value={formData.lastName}
									onChange={handleChange}
								/>
								{getError("lastName") && (
									<div className="field-error">
										{getError("lastName")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group userId">
								<label htmlFor="userId">Employee ID *</label>
								<input
									type="text"
									placeholder="User ID"
									id="userId"
									value={formData.userId || ""}
									disabled
								/>
								{getError("userId") && (
									<div className="field-error">
										{getError("userId")}
									</div>
								)}
							</div>
							<div className="userprof-create-form-group username">
								<label htmlFor="username">Username *</label>
								<input
									type="text"
									placeholder="Username"
									id="username"
									value={formData.username || ""}
									disabled
								/>
								{getError("username") && (
									<div className="field-error">
										{getError("username")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group email">
								<label htmlFor="email">Email *</label>
								<input
									type="text"
									placeholder="e.g. john.doe@example.com"
									id="email"
									value={formData.email}
									onChange={handleChange}
								/>
								{getError("email") && (
									<div className="field-error">
										{getError("email")}
									</div>
								)}
							</div>
							<div className="userprof-create-form-group phone">
								<label htmlFor="phone">Phone No.</label>
								<input
									type="tel"
									placeholder="e.g. +0 12345 67890"
									id="phone"
									maxLength={13}
									value={formData.phone}
									onChange={handleChange}
								/>
								{getError("phone") && (
									<div className="field-error">
										{getError("phone")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							{/*<div className="userprof-create-form-group businessRole">
								<label htmlFor="businessRole">
									Business Role *
								</label>
								<select
									id="businessRole"
									value={formData.businessRole}
									onChange={(e) => {
										const selectedId = e.target.value;

										// CLEAR error for businessRole
										setErrors((prev) => {
											if (!prev.businessRole) return prev;
											const updated = { ...prev };
											delete updated.businessRole;
											return updated;
										});

										setFormData((prev) => ({
											...prev,
											businessRole: selectedId,
										}));
									}}
								>
									<option value="">
										Select Business Role
									</option>
									{businessRoles.map((role) => (
										<option key={role.id} value={role.id}>
											{role.businessRoleName}
										</option>
									))}
								</select>
								{getError("businessRole") && (
									<div className="field-error">
										{getError("businessRole")}
									</div>
								)}
							</div>*/}
							<div className="userprof-create-form-group timeZone">
								<label htmlFor="timeZone">Time Zone</label>
								<select
									id="timeZone"
									value={formData.timeZone}
									onChange={handleChange}
								>
									<option value="">Select Time Zone</option>
									<option value="IST">IST (UTC+5:30)</option>
									<option value="JST">JST (UTC+9:00)</option>
									<option value="CET">CET (UTC+1:00)</option>
									<option value="PST">PST (UTC-8:00)</option>
								</select>
								{getError("timeZone") && (
									<div className="field-error">
										{getError("timeZone")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group status">
								<label htmlFor="status">Status *</label>
								<select
									id="status"
									value={formData.status}
									onChange={handleChange}
								>
									<option value="">Select Status</option>
									<option value="ACTIVE">Active</option>
									<option value="INACTIVE">Inactive</option>
								</select>
							</div>
							<div
								className="userprof-create-form-group"
								style={{ visibility: "hidden" }}
							></div>
						</div>

						<span className="required-field-text">
							* Required Field
						</span>
					</form>
				</div>
			</div>

		{/*
			// Organizational Data Container 
			<div className="userprof-create-form-container">
				<h1 className="userprof-create-form-heading">
					Organizational Data
				</h1>
				<div className="userprof-create-form">
					<form>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group department">
								<label htmlFor="department">Department</label>
								<div className="input-with-button">
									<input
										id="department"
										name="department"
										value={formData.department}
										// onChange={handleNewTableEmployeeChange}
										disabled
										placeholder="Click Lookup to select Department"
									/>
									<button
										type="button"
										className="userprof-create-input-icon-btn"
										title="Lookup Department"
										onClick={() =>
											setShowSelectDepartmentModal(true)
										}
									>
										<Search
											size={15}
											strokeWidth={1}
											color="#0f1035"
										/>
									</button>
									{getError("department") && (
										<div className="field-error">
											{getError("department")}
										</div>
									)}
								</div>
							</div>
							{/* <div className="form-group job">
								<label htmlFor="job">Job</label>
								<div className="input-with-button">
									<input
										id="job"
										name="job"
										value={formData.job}
										// onChange={handleNewTableEmployeeChange}
										required
										disabled
										placeholder="Click Lookup to select Job"
									/>
									<button
										type="button"
										className="input-icon-btn"
										title="Lookup Job"
										onClick={() => setShowSelectJobModal(true)}
									>
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
							<div
								className="userprof-create-form-group"
								style={{ visibility: "hidden" }}
							></div>
						</div>
					</form>
				</div>
			</div> 
		*/}

			{/* Mailing Address Container */}
			<div className="userprof-create-form-container">
				<h1 className="userprof-create-form-heading">
					Mailing Address
				</h1>
				<div className="userprof-create-form">
					<form>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group personalCountry">
								<label htmlFor="personalCountry">Country</label>
								<select
									id="personalCountry"
									name="personalCountry"
									value={formData.personalCountry}
									onChange={handleCountryChange}
									className={
										errors.personalCountry ? "error" : ""
									}
								>
									<option value="">Select Country</option>
									{countries.map((country) => (
										<option
											key={country.isoCode}
											value={country.name}
										>
											{country.name}
										</option>
									))}
								</select>
								{getError("personalCountry") && (
									<div className="field-error">
										{getError("personalCountry")}
									</div>
								)}
							</div>
							<div className="userprof-create-form-group personalState">
								<label htmlFor="personalState">State</label>
								<select
									id="personalState"
									name="personalState"
									value={formData.personalState}
									onChange={handleStateChange}
									disabled={!states.length}
									className={
										errors.personalState ? "error" : ""
									}
								>
									<option value="">Select State</option>
									{states.map((state) => (
										<option
											key={state.isoCode}
											value={state.name}
										>
											{state.name}
										</option>
									))}
								</select>
								{getError("personalState") && (
									<div className="field-error">
										{getError("personalState")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group personalCity">
								<label htmlFor="personalCity">City</label>
								<select
									id="personalCity"
									name="personalCity"
									value={formData.personalCity}
									onChange={handleChange}
									disabled={!cities.length}
									className={
										errors.personalCity ? "error" : ""
									}
								>
									<option value="">Select City</option>
									{cities.map((city) => (
										<option
											key={city.name}
											value={city.name}
										>
											{city.name}
										</option>
									))}
								</select>
								{getError("personalCity") && (
									<div className="field-error">
										{getError("personalCity")}
									</div>
								)}
							</div>
							<div className="userprof-create-form-group personalStreet">
								<label htmlFor="personalStreet">Street</label>
								<input
									placeholder="Enter Street Address"
									id="personalStreet"
									value={formData.personalStreet}
									onChange={handleChange}
								/>
								{getError("personalStreet") && (
									<div className="field-error">
										{getError("personalStreet")}
									</div>
								)}
							</div>
						</div>
						<div className="userprof-create-form-row">
							<div className="userprof-create-form-group personalPostalCode">
								<label htmlFor="personalPostalCode">
									Zip/Postal Code
								</label>
								<input
									type="text"
									id="personalPostalCode"
									name="personalPostalCode"
									value={formData.personalPostalCode}
									onChange={handleChange}
									maxLength={6}
									required
									placeholder="Enter Zip/Postal Code"
									className={
										errors.personalPostalCode ? "error" : ""
									}
								/>
								{getError("personalPostalCode") && (
									<div className="field-error">
										{getError("personalPostalCode")}
									</div>
								)}
							</div>
							<div
								className="userprof-create-form-group"
								style={{ visibility: "hidden" }}
							></div>
						</div>
					</form>
				</div>
			</div>

			{/* Organizational Units modal (styled like screenshot) */}
			{showSelectDepartmentModal && (
				<div
					className="userprof-create-org-modal-overlay"
					onClick={closeDeptModal}
				>
					<div
						className="userprof-create-org-modal"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						{/* Header */}
						<div className="userprof-create-org-modal-header">
							<h3 className="userprof-create-org-modal-title">
								Organizational Units
							</h3>
							<button
								className="userprof-create-org-modal-close"
								onClick={closeDeptModal}
								title="Close Department Modal"
							>
								<X size={20} strokeWidth={1} />
							</button>
						</div>

						{/* Toolbar */}
						<div className="userprof-create-org-modal-toolbar">
							<div className="org-toolbar-left">
								<span className="org-filter-badge">
									All ({departments.length}) ▾
								</span>
							</div>

							<div className="userprof-create-org-toolbar-right">
								<div className="userprof-create-org-toolbar-search-container">
									<input
										className="userprof-create-org-toolbar-search"
										placeholder="Search Org Units by ID or Name"
										value={deptSearch}
										onChange={(e) =>
											setDeptSearch(e.target.value)
										}
									/>
									<Search
										className="userprof-create-org-toolbar-search-icon"
										size={20}
										color="#0f1035"
										strokeWidth={1}
									/>
								</div>
								<button
									className="userprof-create-icon-btn"
									title="Refresh Org Units"
									onClick={() => {
										refreshDepartments();
										setRefreshSpin(true);
									}}
								>
									<RefreshCcw
										className={
											refreshSpin ? "rotate-once" : ""
										}
										size={30}
										strokeWidth={1}
										color="#0f1035"
										onAnimationEnd={() =>
											setRefreshSpin(false)
										}
									/>
								</button>
								<button
									className="userprof-create-icon-btn"
									title="Filter Org Units"
								>
									<Filter
										size={30}
										strokeWidth={1}
										color="#0f1035"
									/>
								</button>
							</div>
						</div>

						{/* Table */}
						<div className="userprof-create-org-modal-body">
							{deptLoading ? (
								<div className="center">
									Loading departments...
								</div>
							) : deptError ? (
								<div className="center error">
									Failed to load departments
								</div>
							) : (
								<table
									className="userprof-create-org-table"
									cellSpacing="0"
								>
									<thead></thead>
									<tbody>
										{filteredDepartments.length === 0 ? (
											<tr className="no-results">
												<td colSpan="2">
													No organizational units
													found
												</td>
											</tr>
										) : (
											filteredDepartments.map((d) => (
												<tr
													key={d.id}
													// visual selection class
													className={
														"userprof-create-org-row " +
														(selectedDepartment?.id ===
														d.id
															? "selected"
															: "")
													}
													// mouse handlers
													onClick={() =>
														setSelectedDepartment(d)
													}
													onDoubleClick={() => {
														setSelectedDepartment(
															d
														);
														confirmDeptModal();
													}}
													// keyboard accessibility: focusable + enter/space support
													tabIndex={0}
													role="button"
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															setSelectedDepartment(
																d
															);
															confirmDeptModal();
														} else if (
															e.key === " " ||
															e.key === "Spacebar"
														) {
															// space
															e.preventDefault();
															setSelectedDepartment(
																d
															);
														}
													}}
													aria-pressed={
														selectedDepartment?.id ===
														d.id
													}
												>
													<td className="col-id">
														{d.id}
													</td>
													<td className="col-name">
														{d.name}
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							)}
						</div>

						{/* Footer */}
						<div className="userprof-create-org-modal-footer">
							<div className="userprof-create-org-modal-footer-left">
								<button
									className="userprof-create-modal-btn userprof-create-modal-clear-btn"
									onClick={handleClearDepartment}
									disabled={!formData.department} // only active if department currently has a value
								>
									Clear Selection
								</button>
							</div>
							<div className="userprof-create-org-modal-footer-right">
								<button
									className="userprof-create-modal-btn userprof-create-modal-confirm-btn"
									onClick={confirmDeptModal}
									disabled={!selectedDepartment}
								>
									Confirm
								</button>
								<button
									className="userprof-create-modal-btn userprof-create-modal-cancel-btn"
									onClick={closeDeptModal}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateUserProfile;