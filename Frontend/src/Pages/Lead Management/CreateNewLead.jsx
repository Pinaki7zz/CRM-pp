import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import "./CreateNewLead.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Save, CircleX, UserRound, Upload } from "lucide-react";

// Centralized API Configuration
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;

// Image size limits
const MIN_IMAGE_SIZE = 250 * 1024; // 250 KB
const MAX_IMAGE_SIZE = 600 * 1024; // 600 KB

const CreateNewLead = () => {
	const [formData, setFormData] = useState({
		leadId: "",
		leadOwnerId: "",
		firstName: "",
		lastName: "",
		company: "",
		title: "",
		dateOfBirth: "",
		notes: "",
		email: "",
		secondaryEmail: "",
		phoneNumber: "",
		fax: "",
		website: "",
		addressLine1: "",
		addressLine2: "",
		postalCode: "",
		budget: "",
		potentialRevenue: "",
		leadSource: "",
		leadStatus: "OPEN",
		interestLevel: "",
		country: "",
		state: "",
		city: "",
	});
	const [loading, setLoading] = useState(false);
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [leadImage, setLeadImage] = useState(null);
	const [leadImageName, setLeadImageName] = useState("");
	const [leadImageFile, setLeadImageFile] = useState(null);
	const [errors, setErrors] = useState({});

	const navigate = useNavigate();
	const { user } = useAuth(); // if provider exposes loading

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const fetchNextLeadId = async () => {
		try {
			const res = await fetch(`${BASE_URL_LM}/leads/next-leadid`);
			if (!res.ok) {
				toast.error("Failed to fetch Lead ID");
				return;
			}
			const data = await res.json();
			setFormData((prev) => ({
				...prev,
				leadId: data.leadId,
			}));
		} catch (error) {
			console.error("Error fetching Lead ID:", error);
			toast.error("Error fetching Lead ID");
		}
	};

	useEffect(() => {
		setCountries(Country.getAllCountries());
		fetchNextLeadId();
	}, []);

	const handleSave = async (type) => {
		try {
			setLoading(true);

			if (errors.leadImage) {
				toast.error("Please fix image upload errors");
				return;
			}

			if (!formData.leadId) {
				toast.error("Lead ID is not assigned");
				return;
			}

			const payload = new FormData();

			// 🔹 Required
			payload.append("leadOwnerId", user.id);
			payload.append("leadId", formData.leadId);
			payload.append("firstName", formData.firstName);
			payload.append("lastName", formData.lastName);
			payload.append("company", formData.company);
			payload.append("email", formData.email);

			// 🔹 Optional strings
			if (formData.secondaryEmail)
				payload.append("secondaryEmail", formData.secondaryEmail);
			if (formData.phoneNumber)
				payload.append("phoneNumber", formData.phoneNumber);
			if (formData.fax) payload.append("fax", formData.fax);
			if (formData.website) payload.append("website", formData.website);
			if (formData.notes) payload.append("notes", formData.notes);

			// 🔹 Numbers
			if (formData.budget) payload.append("budget", formData.budget);
			if (formData.potentialRevenue)
				payload.append("potentialRevenue", formData.potentialRevenue);

			// 🔹 Enums
			if (formData.leadSource)
				payload.append("leadSource", formData.leadSource);
			if (formData.leadStatus)
				payload.append("leadStatus", formData.leadStatus ?? "OPEN");
			if (formData.interestLevel)
				payload.append("interestLevel", formData.interestLevel);

			// 🔹 Location (names — ✅ correct)
			if (formData.country) payload.append("country", formData.country);
			if (formData.state) payload.append("state", formData.state);
			if (formData.city) payload.append("city", formData.city);
			if (formData.addressLine1)
				payload.append("addressLine1", formData.addressLine1);
			if (formData.addressLine2)
				payload.append("addressLine2", formData.addressLine2);
			if (formData.postalCode)
				payload.append("postalCode", formData.postalCode);

			// 🔹 Date
			if (formData.dateOfBirth) {
				payload.append(
					"dateOfBirth",
					new Date(formData.dateOfBirth).toISOString(),
				);
			}

			// 🔹 Image
			if (leadImageFile) {
				payload.append("leadImage", leadImageFile);
			}

			// Single request containing both parent and children
			const response = await fetch(`${BASE_URL_LM}/leads`, {
				method: "POST",
				body: payload, // ✅ FormData
			});

			if (!response.ok) {
				// try parse validation errors (400)
				const errorPayload = await response.json().catch(() => null);

				if (errorPayload && Array.isArray(errorPayload.errors)) {
					// Build map: { path: [msg1, msg2] }
					const map = {};
					errorPayload.errors.forEach((err) => {
						const key = err.path || "form";
						if (!map[key]) map[key] = [];
						map[key].push(err.msg || "Invalid value");
					});
					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				// fallback generic error
				toast.error("Failed to save lead");
				return;
			}

			// Success
			toast.success("Lead created successfully!");

			if (type === "save") {
				navigate("/sales/leads");
			} else if (type === "saveAndNew") {
				navigate("/sales/leads/create");
			}
		} catch (error) {
			console.error("Failed to save lead:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	// --- File Handling (Preview Only) ---
	const handleFileChange = (event) => {
		const file = event.target.files[0];

		// Clear previous image error
		setErrors((prev) => {
			const updated = { ...prev };
			delete updated.leadImage;
			return updated;
		});

		if (!file) return;

		// 1️⃣ Validate type
		const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
		if (!validImageTypes.includes(file.type)) {
			setErrors((prev) => ({
				...prev,
				leadImage: "Only JPG and PNG images are allowed",
			}));
			return;
		}

		// 2️⃣ Validate size range
		if (file.size < MIN_IMAGE_SIZE || file.size > MAX_IMAGE_SIZE) {
			setErrors((prev) => ({
				...prev,
				leadImage: "Image size must be between 250 KB and 600 KB",
			}));
			return;
		}

		// 3️⃣ Valid image → set preview
		setLeadImage(URL.createObjectURL(file));
		setLeadImageName(file.name);
		setLeadImageFile(file); // ✅ this is what we send
	};

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

		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			country: selected,
			state: "",
			city: "",
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
			state: selectedState,
			city: "",
		});

		const countryObj = countries.find((c) => c.name === formData.country);
		const stateObj = states.find((s) => s.name === selectedState);

		if (countryObj && stateObj) {
			const cityList = City.getCitiesOfState(
				countryObj.isoCode,
				stateObj.isoCode,
			);
			setCities(cityList);
		} else {
			setCities([]);
		}
	};

	const validateIndianPinCode = async (postalCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${postalCode}`,
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

	useEffect(() => {
		if (
			formData.country === "India" &&
			(formData.postalCode || "").length === 6
		) {
			validateIndianPinCode(formData.postalCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.state.toLowerCase();

					if (!stateMatch) {
						console.warn(
							`PIN code doesn't match selected State. Expected State: ${result.state}`,
						);
					}
				} else {
					console.error(result.message);
				}
			});
		}
	}, [formData.postalCode, formData.country]);

	return (
		<div className="lead-create-container">
			{/* Create Lead Page Header Section */}
			<div className="lead-create-header-container">
				<h1 className="lead-create-heading">New Lead</h1>
				<div className="lead-create-header-container-buttons">
					<button
						className="lead-create-save-button"
						onClick={() => handleSave("save")}
					>
						<Save size={17} strokeWidth={1} color="#dcf2f1" />
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="lead-create-save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						<Save size={17} strokeWidth={1} color="#0f1035" />
						{loading ? "Saving..." : "Save and New"}
					</button>
					<button
						className="lead-create-cancel-button"
						onClick={() => navigate("/sales/leads")}
					>
						<CircleX size={17} strokeWidth={1} color="#0f1035" />
						Cancel
					</button>
				</div>
			</div>

			{/* Lead Information Container */}
			<div className="lead-create-form-container">
				<h1 className="lead-create-form-heading">Lead Information</h1>
				<div className="lead-create-form">
					<form>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group leadOwnerId">
								<label htmlFor="leadOwnerId">
									Lead Owner *
								</label>
								<input
									type="text"
									id="leadOwnerId"
									placeholder="Enter Lead Owner"
									value={`${user.firstName} ${user.lastName} (You)`}
									disabled
								/>
								{getError("leadOwnerId") && (
									<div className="field-error">
										{getError("leadOwnerId")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group leadId">
								<label htmlFor="leadid">Lead ID *</label>
								<input
									type="text"
									id="leadId"
									value={formData.leadId}
									disabled
								/>
								{getError("leadId") && (
									<div className="field-error">
										{getError("leadId")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group title">
								<label htmlFor="title">Title</label>
								<select
									id="title"
									value={formData.title}
									onChange={handleChange}
								>
									<option value="">Select Title</option>
									<option value="MR">Mr.</option>
									<option value="MRS">Mrs.</option>
									<option value="MS">Ms.</option>
									<option value="OTHERS">Others</option>
								</select>
								{getError("title") && (
									<div className="field-error">
										{getError("title")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group firstName">
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
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group lastName">
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
							<div className="lead-create-form-group company">
								<label htmlFor="company">Company *</label>
								<input
									type="text"
									placeholder="Enter Company Name"
									id="company"
									value={formData.company}
									onChange={handleChange}
								/>
								{getError("company") && (
									<div className="field-error">
										{getError("company")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group dateOfBirth">
								<label htmlFor="dateOfBirth">
									Date Of Birth
								</label>
								<input
									type="date"
									id="dateOfBirth"
									value={formData.dateOfBirth}
									onChange={handleChange}
								/>
								{getError("dateOfBirth") && (
									<div className="field-error">
										{getError("dateOfBirth")}
									</div>
								)}
							</div>
							<div
								className="lead-create-form-group status"
								style={{ visibility: "hidden" }}
							></div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group notes">
								<label htmlFor="notes">Notes</label>
								<textarea
									placeholder="Add notes here..."
									id="notes"
									value={formData.notes}
									onChange={handleChange}
								/>
								{getError("notes") && (
									<div className="field-error">
										{getError("notes")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-upload-image-outer-container">
								<div className="lead-create-upload-image-inner-container">
									<div className="lead-create-image-container">
										{leadImage ? (
											<img
												src={leadImage}
												alt="Lead"
												className="lead-create-image-preview"
											/>
										) : (
											<UserRound
												size={50}
												strokeWidth={1}
												color="#365486"
											/>
										)}
									</div>
									<label
										htmlFor="lead-image-input"
										className="lead-create-upload-btn"
									>
										{leadImageName || "Upload Image"}
										<Upload
											size={16}
											strokeWidth={2}
											color="#365486"
										/>
									</label>
									<input
										type="file"
										id="lead-image-input"
										accept="image/*"
										hidden
										onChange={handleFileChange}
									/>
								</div>
								{getError("leadImage") && (
									<div className="field-error">
										{getError("leadImage")}
									</div>
								)}
							</div>
						</div>

						<span className="required-field-text">
							* Required Field
						</span>
					</form>
				</div>
			</div>

			{/* Contact Information Container */}
			<div className="lead-create-form-container">
				<h1 className="lead-create-form-heading">
					Contact Information
				</h1>
				<div className="lead-create-form">
					<form>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group email">
								<label htmlFor="email">Email ID *</label>
								<input
									type="text"
									placeholder="e.g. example@example.com"
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
							<div className="lead-create-form-group secondaryEmail">
								<label htmlFor="secondaryEmail">
									Secondary Email
								</label>
								<input
									type="text"
									placeholder="e.g. example2@example2.com"
									id="secondaryEmail"
									value={formData.secondaryEmail}
									onChange={handleChange}
								/>
								{getError("secondaryEmail") && (
									<div className="field-error">
										{getError("secondaryEmail")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group phoneNumber">
								<label htmlFor="phoneNumber">Phone No.</label>
								<input
									type="tel"
									placeholder="e.g. +12345 67890"
									id="phoneNumber"
									max={13}
									value={formData.phoneNumber}
									onChange={handleChange}
								/>
								{getError("phoneNumber") && (
									<div className="field-error">
										{getError("phoneNumber")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group fax">
								<label htmlFor="fax">Fax</label>
								<input
									type="text"
									placeholder="Enter Fax Number"
									id="fax"
									value={formData.fax}
									onChange={handleChange}
								/>
								{getError("fax") && (
									<div className="field-error">
										{getError("fax")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group website">
								<label htmlFor="website">Website</label>
								<input
									type="text"
									placeholder="e.g. www.example.com"
									id="website"
									value={formData.website}
									onChange={handleChange}
								/>
								{getError("website") && (
									<div className="field-error">
										{getError("website")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group country">
								<label htmlFor="country">Country</label>
								<select
									id="country"
									name="country"
									value={formData.country}
									onChange={handleCountryChange}
									className={errors.country ? "error" : ""}
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
								{getError("country") && (
									<div className="field-error">
										{getError("country")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group state">
								<label htmlFor="state">State</label>
								<select
									id="state"
									name="state"
									value={formData.state}
									onChange={handleStateChange}
									disabled={!states.length}
									className={errors.state ? "error" : ""}
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
								{getError("state") && (
									<div className="field-error">
										{getError("state")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group city">
								<label htmlFor="city">City</label>
								<select
									id="city"
									name="city"
									value={formData.city}
									onChange={handleChange}
									disabled={!cities.length}
									className={errors.city ? "error" : ""}
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
								{getError("city") && (
									<div className="field-error">
										{getError("city")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group addressLine1">
								<label htmlFor="addressLine1">
									Address Line 1
								</label>
								<input
									type="text"
									placeholder="Enter Address Line 1"
									id="addressLine1"
									value={formData.addressLine1}
									onChange={handleChange}
								/>
								{getError("addressLine1") && (
									<div className="field-error">
										{getError("addressLine1")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group addressLine2">
								<label htmlFor="addressLine2">
									Address Line 2
								</label>
								<input
									type="text"
									placeholder="Enter Address Line 2"
									id="addressLine2"
									value={formData.addressLine2}
									onChange={handleChange}
								/>
								{getError("addressLine2") && (
									<div className="field-error">
										{getError("addressLine2")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group postalCode">
								<label htmlFor="postalCode">
									Zip/Postal Code
								</label>
								<input
									type="text"
									id="postalCode"
									value={formData.postalCode}
									onChange={handleChange}
									maxLength={6}
									placeholder="Enter Zip/Postal Code"
									className={errors.postalCode ? "error" : ""}
								/>
								{getError("postalCode") && (
									<div className="field-error">
										{getError("postalCode")}
									</div>
								)}
							</div>
							<div
								className="lead-create-form-group status"
								style={{ visibility: "hidden" }}
							></div>
						</div>

						<span className="required-field-text">
							* Required Field
						</span>
					</form>
				</div>
			</div>

			{/* Lead Qualification Information Container */}
			<div className="lead-create-form-container">
				<h1 className="lead-create-form-heading">Lead Qualification</h1>
				<div className="lead-create-form">
					<form>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group leadSource">
								<label htmlFor="leadSource">Lead Source</label>
								<select
									id="leadSource"
									value={formData.leadSource}
									onChange={handleChange}
								>
									<option value="">Select Lead Source</option>
									<option value="MANUAL">Manual</option>
									<option value="EMAIL">Email</option>
									<option value="COLD_CALL">Cold Call</option>
									<option value="EMPLOYEE_REFERRAL">
										Employee Referral
									</option>
									<option value="EXTERNAL_REFERRAL">
										External Referral
									</option>
									<option value="SOCIAL_MEDIA">
										Social Media
									</option>
									<option value="WHATSAPP">Whatsapp</option>
								</select>
								{getError("leadSource") && (
									<div className="field-error">
										{getError("leadSource")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group leadStatus">
								<label htmlFor="leadStatus">Lead Status</label>
								<select
									id="leadStatus"
									value={formData.leadStatus}
									onChange={handleChange}
								>
									<option value="">Select Lead Status</option>
									<option value="OPEN">Open</option>
									<option value="QUALIFIED">Qualified</option>
									<option value="IN_PROGRESS">
										In Progress
									</option>
									<option value="CONVERTED">Converted</option>
									<option value="LOST">Lost</option>
								</select>
								{getError("leadStatus") && (
									<div className="field-error">
										{getError("leadStatus")}
									</div>
								)}
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group interestLevel">
								<label htmlFor="interestLevel">
									Interest Level
								</label>
								<select
									id="interestLevel"
									value={formData.interestLevel}
									onChange={handleChange}
								>
									<option value="">
										Select Interest Level
									</option>
									<option value="COLD">Cold</option>
									<option value="WARM">Warm</option>
									<option value="HOT">Hot</option>
								</select>
								{getError("interestLevel") && (
									<div className="field-error">
										{getError("interestLevel")}
									</div>
								)}
							</div>
							<div className="lead-create-form-group budget">
								<label htmlFor="budget">Budget</label>
								<input
									type="text"
									placeholder="Enter Budget"
									id="budget"
									value={formData.budget}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className="lead-create-form-row">
							<div className="lead-create-form-group potentialRevenue">
								<label htmlFor="potentialRevenue">
									Potential Revenue
								</label>
								<input
									type="text"
									placeholder="Enter Potential Revenue"
									id="potentialRevenue"
									value={formData.potentialRevenue}
									onChange={handleChange}
								/>
							</div>
							<div
								className="lead-create-form-group status"
								style={{ visibility: "hidden" }}
							></div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateNewLead;
