import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import "./Settings.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const Settings = () => {
	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		id: "",
		userId: "",
		username: "",
		language: "",
		businessRoleName: "",
		timeZone: "",
		timeFormat: "",
		dateFormat: "",
		businessName: "",
		legalEntityType: "",
		personalCountry: "",
		personalState: "",
		personalCity: "",
		personalStreet: "",
		personalPostalCode: "",
		companyCountry: "",
		companyState: "",
		companyCity: "",
		companyPostalCode: "",
		companyAddressLine1: "",
		companyAddressLine2: "",
	});

	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		setFormData((prev) => ({
			...prev,
			id: user.id ?? prev.id ?? "",
			userId: user.userId ?? prev.userId ?? user.id ?? "",
			username: user.username ?? prev.username ?? "",
			language: user.language ?? prev.language ?? "",
			businessRoleName:
				user.businessRole?.businessRoleName ??
				prev.businessRoleName ??
				"",
			timeZone: user.timeZone ?? prev.timeZone ?? "",
			timeFormat: user.timeFormat ?? prev.timeFormat ?? "",
			dateFormat: user.dateFormat ?? prev.dateFormat ?? "",
			businessName: user.businessName ?? prev.businessName ?? "",
			legalEntityType: user.legalEntityType ?? prev.legalEntityType ?? "",
			personalCountry: user.personalCountry ?? prev.personalCountry ?? "",
			personalState: user.personalState ?? prev.personalState ?? "",
			personalCity: user.personalCity ?? prev.personalCity ?? "",
			personalStreet: user.personalStreet ?? prev.personalStreet ?? "",
			personalPostalCode:
				user.personalPostalCode ?? prev.personalPostalCode ?? "",
			companyCountry: user.companyCountry ?? prev.companyCountry ?? "",
			companyState: user.companyState ?? prev.companyState ?? "",
			companyCity: user.companyCity ?? prev.companyCity ?? "",
			companyPostalCode:
				user.companyPostalCode ?? prev.companyPostalCode ?? "",
			companyAddressLine1:
				user.companyAddressLine1 ?? prev.companyAddressLine1 ?? "",
			companyAddressLine2:
				user.companyAddressLine2 ?? prev.companyAddressLine2 ?? "",
		}));
	}, [user]);

	const validateField = (name, value) => {
		switch (name) {
			case "companyAddressLine1":
				if (!value.trim()) return "Address Line 1 is required";
				if (value.length > 50) {
					return "Address Line 1 must be less than 50 characters";
				}
				return "";
			case "companyAddressLine2":
				if (!value.trim()) return "Address Line 2 is required";
				if (value.length > 50) {
					return "Address Line 2 must be less than 50 characters";
				}
				return "";
			case "companyCity":
				if (!value.trim()) return "City is required";
				return "";
			case "companyState":
				if (!value.trim()) return "State is required";
				return "";
			case "companyCountry":
				if (!value.trim()) return "Country is required";
				return "";
			case "personalCity":
				if (!value.trim()) return "City is required";
				return "";
			case "personalState":
				if (!value.trim()) return "State is required";
				return "";
			case "personalCountry":
				if (!value.trim()) return "Country is required";
				return "";
			case "personalStreet":
				if (!value.trim()) return "Street is required";
				if (value.length > 50) {
					return "Street must be less than 50 characters";
				}
				return "";
			default:
				return "";
		}
	};

	const handlePersonalCountryChange = (e) => {
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

		const error = validateField("personalCountry", selected);
		setErrors((prev) => ({ ...prev, personalCountry: error }));
	};

	const handleCompanyCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			companyCountry: selected,
			companyState: "",
			companyCity: "",
		});

		const countryObj = countries.find((c) => c.name === selected);
		if (countryObj) {
			setStates(State.getStatesOfCountry(countryObj.isoCode));
			setCities([]);
		} else {
			setStates([]);
			setCities([]);
		}

		const error = validateField("companyCountry", selected);
		setErrors((prev) => ({ ...prev, companyCountry: error }));
	};

	const handlePersonalStateChange = (e) => {
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

		const error = validateField("personalState", selectedState);
		setErrors((prev) => ({ ...prev, personalState: error }));
	};

	const handleCompanyStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({
			...formData,
			companyState: selectedState,
			companyCity: "",
		});

		const countryObj = countries.find(
			(c) => c.name === formData.companyCountry
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

		const error = validateField("companyState", selectedState);
		setErrors((prev) => ({ ...prev, companyState: error }));
	};

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

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
			alert("Please fix the errors in the form before submitting.");
			setIsSubmitting(false);
			return;
		}

		try {
			const res = await fetch(
				`${BASE_URL_UM}/users/settings/${formData.id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(formData),
				}
			);
			if (!res.ok) {
				toast.error("Unable to edit settings");
				return;
			}
			toast.success("Settings updated successfully");
			setIsReadOnly(true);
		} catch (err) {
			toast.error("Error updating settings");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (
			formData.companyCountry === "India" &&
			formData.companyPostalCode.length === 6
		) {
			validateIndianPinCode(formData.companyPostalCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.companyState.toLowerCase();

					if (!stateMatch) {
						alert(
							`PIN code doesn't match selected State. Expected State: ${result.state}`
						);
					}

					// Optional: Inform about district (but don't validate it)
					console.log(
						`PIN code belongs to District: ${result.district}`
					);
				} else {
					alert(result.message);
				}
			});
		}
	}, [formData.companyPostalCode, formData.companyCountry]);

	useEffect(() => {
		// Preload states when country is already set
		if (formData.companyCountry) {
			const countryObj = countries.find(
				(c) => c.name === formData.companyCountry
			);

			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setStates(stateList);

				// Preload cities if state is already set
				if (formData.companyState) {
					const stateObj = stateList.find(
						(s) => s.name === formData.companyState
					);
					if (stateObj) {
						const cityList = City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode
						);
						setCities(cityList);
					}
				}
			}
		}
	}, [formData.companyCountry, formData.companyState, countries]);

	useEffect(() => {
		// Preload states when country is already set
		if (formData.personalCountry) {
			const countryObj = countries.find(
				(c) => c.name === formData.personalCountry
			);

			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setStates(stateList);

				// Preload cities if state is already set
				if (formData.personalState) {
					const stateObj = stateList.find(
						(s) => s.name === formData.personalState
					);
					if (stateObj) {
						const cityList = City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode
						);
						setCities(cityList);
					}
				}
			}
		}
	}, [formData.personalCountry, formData.personalState, countries]);

	useEffect(() => {
		setCountries(Country.getAllCountries());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!user || !user.id) {
		return <div>Loading settings…</div>;
	} else {
		return (
			<>
				{/* Settings Section */}
				<div className="header-container">
					<div className="header-container-heading">
						<h1 className="settings-heading">Settings</h1>
					</div>
					<div className="header-container-buttons">
						{isReadOnly ? (
							<button
								className="edit-button"
								onClick={() => setIsReadOnly(false)}
							>
								Edit
							</button>
						) : (
							<>
								<button
									className="save-button"
									onClick={handleSubmit}
								>
									{isSubmitting ? "Saving..." : "Save"}
								</button>
								<button
									className="cancel-button"
									onClick={() => setIsReadOnly(true)}
								>
									Cancel
								</button>
							</>
						)}
						<div className="more-options-container">
							<button
								className="more-options-button"
								onClick={() =>
									setMenuModal((prevState) => !prevState)
								}
							>
								⁞
							</button>
							{/* Menu Modal */}
							{menuModal && (
								<div className="menu-modal-container">
									<div className="menu-modal">
										<ul className="menu-modal-list">
											<li>Clone</li>
											<li>Delete</li>
											<li>Find and Merge Duplicates</li>
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Product Information Container */}
				<div className="personal-information-container">
					<div className="personal-information-heading">
						<h1>Personal Information</h1>
					</div>
					<div className="personal-information-form">
						<form>
							<div className="form-group username">
								<label htmlFor="username">Username</label>
								<input
									type="text"
									placeholder="Username"
									id="username"
									value={formData.username}
									readOnly
								/>
							</div>
							<div className="form-group language">
								<label htmlFor="language">Language</label>
								<select
									id="language"
									value={formData.language}
									onChange={handleChange}
									disabled={isReadOnly}
								>
									<option value="">Select Language</option>
									<option value="ENGLISH">English</option>
									<option value="GERMAN">German</option>
									<option value="FRENCH">French</option>
								</select>
							</div>
							<div className="form-group businessRole">
								<label htmlFor="businessRole">
									Business Role
								</label>
								<input
									id="businessRole"
									value={formData.businessRoleName}
									onChange={handleChange}
									readOnly
								/>
							</div>
							<div className="form-group dateFormat">
								<label htmlFor="dateFormat">Date Format</label>
								<select
									id="timeZone"
									value={formData.dateFormat}
									onChange={handleChange}
									disabled={isReadOnly}
								>
									<option value="">Select Date Format</option>
									<option value="DD_MM_YYYY">
										DD/MM/YYYY
									</option>
									<option value="MM_DD_YYYY">
										MM/DD/YYYY
									</option>
									<option value="YYYY_MM_DD">
										YYYY/MM/DD
									</option>
								</select>
							</div>
							<div className="form-group timeFormat">
								<label htmlFor="timeFormat">Time Format</label>
								<select
									id="timeFormat"
									value={formData.timeFormat}
									onChange={handleChange}
									disabled={isReadOnly}
								>
									<option value="">Select Time Format</option>
									<option value="TWELVE_HOUR">12-Hour</option>
									<option value="TWENTY_FOUR_HOUR">
										24-Hour
									</option>
								</select>
							</div>
							<div className="form-group timeZone">
								<label htmlFor="timeZone">Time Zone</label>
								<select
									id="timeZone"
									value={formData.timeZone}
									onChange={handleChange}
									disabled={isReadOnly}
								>
									<option value="">Select Time Zone</option>
									<option value="IST">IST (UTC+5:30)</option>
									<option value="JST">JST (UTC+9:00)</option>
									<option value="CET">CET (UTC+1:00)</option>
									<option value="PST">PST (UTC-8:00)</option>
								</select>
							</div>
							<div className="form-group personalCountry">
								<label htmlFor="personalCountry">Country</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="Country"
										id="personalCountry"
										value={formData.personalCountry}
										readOnly
									/>
								) : (
									<>
										<select
											id="personalCountry"
											name="personalCountry"
											value={formData.personalCountry}
											onChange={
												handlePersonalCountryChange
											}
											required
											className={
												errors.personalCountry
													? "error"
													: ""
											}
										>
											<option value="">
												Select a country
											</option>
											{countries.map((country) => (
												<option
													key={country.isoCode}
													value={country.name}
												>
													{country.name}
												</option>
											))}
										</select>
										{errors.personalCountry && (
											<span className="error">
												{errors.personalCountry}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group personalState">
								<label htmlFor="personalState">State</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="State"
										id="personalState"
										value={formData.personalState}
										readOnly
									/>
								) : (
									<>
										<select
											id="personalState"
											name="personalState"
											value={formData.personalState}
											onChange={handlePersonalStateChange}
											required
											disabled={!states.length}
											className={
												errors.personalState
													? "error"
													: ""
											}
										>
											<option value="">
												Select State
											</option>
											{states.map((state) => (
												<option
													key={state.isoCode}
													value={state.name}
												>
													{state.name}
												</option>
											))}
										</select>
										{errors.personalState && (
											<span className="error">
												{errors.personalState}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group personalCity">
								<label htmlFor="personalCity">City</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="City"
										id="personalCity"
										value={formData.personalCity}
										readOnly
									/>
								) : (
									<>
										<select
											id="personalCity"
											name="personalCity"
											value={formData.personalCity}
											onChange={handleChange}
											required
											disabled={!cities.length}
											className={
												errors.personalCity
													? "error"
													: ""
											}
										>
											<option value="">
												Select a city
											</option>
											{cities.map((city) => (
												<option
													key={city.name}
													value={city.name}
												>
													{city.name}
												</option>
											))}
										</select>
										{errors.personalCity && (
											<span className="error">
												{errors.personalCity}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group personalStreet">
								<label htmlFor="personalStreet">Street</label>
								<input
									type="text"
									placeholder="Street"
									id="personalStreet"
									value={formData.personalStreet}
									onChange={handleChange}
									readOnly={isReadOnly}
								/>
							</div>
							<div className="form-group personalPostalCode">
								<label htmlFor="personalPostalCode">
									Postal Code
								</label>
								<>
									<input
										type="text"
										id="personalPostalCode"
										name="personalPostalCode"
										value={formData.personalPostalCode}
										onChange={handleChange}
										maxLength={6}
										required
										placeholder="Zip/Postal Code"
										className={
											errors.personalPostalCode
												? "error"
												: ""
										}
										readOnly={isReadOnly}
									/>
									{errors.personalPostalCode && (
										<span className="error">
											{errors.personalPostalCode}
										</span>
									)}
								</>
							</div>
							<div className="icon-container">
								<div className="brand-logo">
									<div className="brand-logo-dots">
										<div className="dot"></div>
										<div className="dot"></div>
										<div className="dot"></div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>

				{/* Company Information Container */}
				<div className="company-information-container">
					<div className="company-information-heading">
						<h1>Company Information</h1>
					</div>
					<div className="company-information-form">
						<form>
							<div className="form-group businessName">
								<label htmlFor="businessName">
									Business Name
								</label>
								<input
									type="text"
									placeholder="Business Name"
									id="businessName"
									value={formData.businessName}
									onChange={handleChange}
									readOnly={isReadOnly}
								/>
							</div>
							<div className="form-group legalEntityType">
								<label htmlFor="legalEntityType">
									Legal Entity Type
								</label>
								<input
									type="text"
									placeholder="Legal Entity Type"
									id="legalEntityType"
									value={formData.legalEntityType}
									onChange={handleChange}
									readOnly={isReadOnly}
								/>
							</div>
							<div className="form-group companyCountry">
								<label htmlFor="companyCountry">Country</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="Country"
										id="companyCountry"
										value={formData.companyCountry}
										readOnly
									/>
								) : (
									<>
										<select
											id="companyCountry"
											name="companyCountry"
											value={formData.companyCountry}
											onChange={
												handleCompanyCountryChange
											}
											required
											className={
												errors.companyCountry
													? "error"
													: ""
											}
										>
											<option value="">
												Select a country
											</option>
											{countries.map((country) => (
												<option
													key={country.isoCode}
													value={country.name}
												>
													{country.name}
												</option>
											))}
										</select>
										{errors.companyCountry && (
											<span className="error">
												{errors.companyCountry}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group companyState">
								<label htmlFor="companyState">State</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="State"
										id="companyState"
										value={formData.companyState}
										readOnly
									/>
								) : (
									<>
										<select
											id="companyState"
											name="companyState"
											value={formData.companyState}
											onChange={handleCompanyStateChange}
											required
											disabled={!states.length}
											className={
												errors.companyState
													? "error"
													: ""
											}
										>
											<option value="">
												Select State
											</option>
											{states.map((state) => (
												<option
													key={state.isoCode}
													value={state.name}
												>
													{state.name}
												</option>
											))}
										</select>
										{errors.companyState && (
											<span className="error">
												{errors.companyState}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group companyCity">
								<label htmlFor="companyCity">City</label>
								{isReadOnly ? (
									<input
										type="text"
										placeholder="City"
										id="companyCity"
										value={formData.companyCity}
										readOnly
									/>
								) : (
									<>
										<select
											id="companyCity"
											name="companyCity"
											value={formData.companyCity}
											onChange={handleChange}
											required
											disabled={!cities.length}
											className={
												errors.companyCity
													? "error"
													: ""
											}
										>
											<option value="">
												Select a city
											</option>
											{cities.map((city) => (
												<option
													key={city.name}
													value={city.name}
												>
													{city.name}
												</option>
											))}
										</select>
										{errors.companyCity && (
											<span className="error">
												{errors.companyCity}
											</span>
										)}
									</>
								)}
							</div>
							<div className="form-group companyAddressLine1">
								<label htmlFor="companyAddressLine1">
									Address Line 1
								</label>
								<input
									type="text"
									placeholder="Address Line 1"
									id="companyAddressLine1"
									value={formData.companyAddressLine1}
									onChange={handleChange}
									readOnly={isReadOnly}
								/>
							</div>
							<div className="form-group companyAddressLine2">
								<label htmlFor="companyAddressLine2">
									Address Line 2
								</label>
								<input
									type="text"
									placeholder="Address Line 2"
									id="companyAddressLine2"
									value={formData.companyAddressLine2}
									onChange={handleChange}
									readOnly={isReadOnly}
								/>
							</div>
							<div className="form-group companyPostalCode">
								<label htmlFor="companyPostalCode">
									Postal Code
								</label>
								<>
									<input
										type="text"
										id="companyPostalCode"
										name="companyPostalCode"
										value={formData.companyPostalCode}
										onChange={handleChange}
										maxLength={6}
										required
										placeholder="Zip/Postal Code"
										className={
											errors.companyPostalCode
												? "error"
												: ""
										}
										readOnly={isReadOnly}
									/>
									{errors.companyPostalCode && (
										<span className="error">
											{errors.companyPostalCode}
										</span>
									)}
								</>
							</div>
							<div className="icon-container">
								<div className="brand-logo">
									<div className="brand-logo-dots">
										<div className="dot"></div>
										<div className="dot"></div>
										<div className="dot"></div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</>
		);
	}
};

export default Settings;
