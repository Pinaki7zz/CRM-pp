import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { Country, State, City } from "country-state-city";
import "./CreateMarketingOffice.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateMarketingOfficeForm() {
	const navigate = useNavigate();
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [formData, setFormData] = useState({
		marketingOfficeId: "",
		organizationName: "",
		marketingOfficeDesc: "",
		street1: "",
		street2: "",
		city: "",
		state: "",
		country: "",
		pinCode: "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setCountries(Country.getAllCountries());
	}, []);

	const validateField = (name, value) => {
		switch (name) {
			case "marketingOfficeId":
				if (!value) return "ID is required";
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "ID must be exactly 4 alphanumeric characters";
				}
				return "";
			case "organizationName":
				if (!value) return "Organization name is required";
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Organization name must be alphanumeric and up to 30 characters";
				}
				return "";
			case "marketingOfficeDesc":
				if (value.length > 50 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Description must be alphanumeric and up to 50 characters";
				}
				return "";
			case "street1":
				if (!value.trim()) return "Street 1 is required";
				if (value.length > 50) {
					return "Street 1 must be less than 50 characters";
				}
				return "";
			case "street2":
				if (value && value.length > 50) {
					return "Street 2 must be less than 50 characters";
				}
				return "";
			case "city":
				if (!value.trim()) return "City is required";
				return "";
			case "state":
				if (!value.trim()) return "State is required";
				return "";
			case "country":
				if (!value.trim()) return "Country is required";
				return "";
			case "pinCode":
				if (!value.trim()) return "Pin Code is required";
				if (!/^\d{4,6}$/.test(value)) {
					return "Pin code must be 4-6 digits";
				}
				return "";
			case "validFrom":
				if (!value.trim()) return "Valid from is required";
				return "";
			case "validTo":
				if (!value.trim()) return "Valid to is required";
				return "";
			case "company":
				if (!value) return "Company name is required";
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Company name must be alphanumeric and up to 30 characters";
				}
				return "";
			case "parentUnit":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Parent unit must be alphanumeric and up to 30 characters";
				}
				return "";
			default:
				return "";
		}
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

		const error = validateField("country", selected);
		setErrors((prev) => ({ ...prev, country: error }));
	};

	const handleStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({ ...formData, state: selectedState, city: "" });

		const countryObj = countries.find((c) => c.name === formData.country);
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

		const error = validateField("state", selectedState);
		setErrors((prev) => ({ ...prev, state: error }));
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "marketingOfficeId") {
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

	const handleCancel = () => {
		navigate("/business-structure/display-marketing-office");
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
			// Step 1: Check if ID already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/marketing-offices/${formData.marketingOfficeId}`
			);

			if (checkResponse.status === 200) {
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors(prev => ({
					//   ...prev,
					//   marketingOfficeId: `ID "${formData.marketingOfficeId}" already exists. Please use a different code.`,
					// }));
					alert(
						`ID "${formData.marketingOfficeId}" already exists. Please use a different code.`
					);
					setIsSubmitting(false);
					return;
				}
			}
			// else if (checkResponse.status !== 404) {
			//   throw new Error("Failed to check ID availability");
			// }

			// Step 2: Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/marketing-offices`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create marketing office"
				);
			}

			alert("Marketing Office created successfully!");
			navigate("/business-structure/display-marketing-office");
		} catch (error) {
			console.error("Error creating marketing office:", error);
			alert(
				error.message ||
					"An error occurred while creating the marketing office"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const validateIndianPinCode = async (pinCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${pinCode}`
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
		if (formData.country === "India" && formData.pinCode.length === 6) {
			validateIndianPinCode(formData.pinCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.state.toLowerCase();

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
	}, [formData.pinCode]);

	return (
		<div className="create-marketing-office-container">
			<form onSubmit={handleSubmit}>
				{/* <div className="submit-button">
					<button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Save"}
					</button>
				</div> */}
				<div className="create-marketing-office-header-box">
					<h2>Marketing Office Information</h2>
					<div className="data-container">
						<div className="data">
							<label htmlFor="marketingOfficeId">ID*</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									1- Must start with 'SO' followed by 2 digits
									<br />
									2- Must be unique
									<br />
									3- No special characters or spaces
									<br />
									4- Cannot be changed after creation
								</span>
							</span>
							<input
								type="text"
								id="marketingOfficeId"
								name="marketingOfficeId"
								value={formData.marketingOfficeId}
								onChange={(e) => {
									const value = e.target.value;
									// Allow only alphanumeric characters (no special characters or spaces)
									if (/^[a-zA-Z0-9]*$/.test(value)) {
										handleChange(e);
									}
								}}
								maxLength={4}
								required
								placeholder="Enter 4-character ID"
								className={
									errors.marketingOfficeId ? "error" : ""
								}
							/>
							{errors.marketingOfficeId && (
								<span className="error">
									{errors.marketingOfficeId}
								</span>
							)}
						</div>
						<div className="data">
							<label htmlFor="organizationName">
								Organization Name*
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									Organization Name must be alphanumeric and
									up to 30 characters
								</span>
							</span>
							<input
								type="text"
								id="organizationName"
								name="organizationName"
								value={formData.organizationName}
								onChange={handleChange}
								maxLength={30}
								required
								placeholder="Enter organization name"
								className={
									errors.organizationName ? "error" : ""
								}
							/>
							{errors.organizationName && (
								<span className="error">
									{errors.organizationName}
								</span>
							)}
						</div>
						<div className="data">
							<label htmlFor="marketingOfficeDesc">
								Description
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									Marketing Office Description must be
									alphanumeric and up to 50 characters
								</span>
							</span>
							<input
								type="text"
								id="marketingOfficeDesc"
								name="marketingOfficeDesc"
								value={formData.marketingOfficeDesc}
								onChange={handleChange}
								maxLength={50}
								placeholder="Enter marketing office description"
								className={
									errors.marketingOfficeDesc ? "error" : ""
								}
							/>
							{errors.marketingOfficeDesc && (
								<span className="error">
									{errors.marketingOfficeDesc}
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="create-marketing-office-item-box">
					<h2>Address Details</h2>
					<div className="data-container">
						<div className="data">
							<label htmlFor="street1">Street 1*</label>
							<div className="input-container">
								<textarea
									id="street1"
									name="street1"
									value={formData.street1}
									onChange={handleChange}
									maxLength={50}
									required
									placeholder="Enter street address"
									className={`resizable-input ${
										errors.street1 ? "error" : ""
									}`}
								/>
								{errors.street1 && (
									<span className="error">
										{errors.street1}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="street2">Street 2</label>
							<div className="input-container">
								<textarea
									id="street2"
									name="street2"
									value={formData.street2}
									onChange={handleChange}
									maxLength={50}
									placeholder="Additional address info"
									className={`resizable-input ${
										errors.street2 ? "error" : ""
									}`}
								/>
								{errors.street2 && (
									<span className="error">
										{errors.street2}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="country">Country*</label>
							<div className="input-container">
								<select
									id="country"
									name="country"
									value={formData.country}
									onChange={handleCountryChange}
									required
									className={errors.country ? "error" : ""}
								>
									<option value="">Select a country</option>
									{countries.map((country) => (
										<option
											key={country.isoCode}
											value={country.name}
										>
											{country.name}
										</option>
									))}
								</select>
								{errors.country && (
									<span className="error">
										{errors.country}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="state">State*</label>
							<div className="input-container">
								<select
									id="state"
									name="state"
									value={formData.state}
									onChange={handleStateChange}
									required
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
								{errors.state && (
									<span className="error">
										{errors.state}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="city">City*</label>
							<div className="input-container">
								<select
									id="city"
									name="city"
									value={formData.city}
									onChange={handleChange}
									required
									disabled={!cities.length}
									className={errors.city ? "error" : ""}
								>
									<option value="">Select a city</option>
									{cities.map((city) => (
										<option
											key={city.name}
											value={city.name}
										>
											{city.name}
										</option>
									))}
								</select>
								{errors.city && (
									<span className="error">{errors.city}</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="pinCode">
								Postal code /Pin Code*
							</label>
							<div className="input-container">
								<input
									type="text"
									id="pinCode"
									name="pinCode"
									value={formData.pinCode}
									onChange={handleChange}
									maxLength={6}
									required
									placeholder="Enter pin code"
									className={errors.pinCode ? "error" : ""}
								/>
								{errors.pinCode && (
									<span className="error">
										{errors.pinCode}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="create-marketing-office-item-box">
					<h2>Others</h2>
					<div className="data-container">
						<div className="data">
							<label htmlFor="validFrom">Valid from*</label>
							<div className="input-container">
								<input
									type="date"
									id="validFrom"
									name="validFrom"
									value={formData.validFrom}
									onChange={handleChange}
									placeholder="Enter street address"
									required
									className={`resizable-input ${
										errors.validFrom ? "error" : ""
									}`}
								/>
								{errors.validFrom && (
									<span className="error">
										{errors.validFrom}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="validTo">Valid to*</label>
							<div className="input-container">
								<input
									type="date"
									id="validTo"
									name="validTo"
									value={formData.validTo}
									onChange={handleChange}
									placeholder="Enter street address"
									required
									className={`resizable-input ${
										errors.validTo ? "error" : ""
									}`}
								/>
								{errors.validTo && (
									<span className="error">
										{errors.validTo}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="company">Company*</label>
							<div className="input-container">
								<input
									type="text"
									id="company"
									name="company"
									value={formData.company}
									onChange={handleChange}
									maxLength={30}
									required
									placeholder="Enter company name"
									className={errors.company ? "error" : ""}
								/>
								{errors.company && (
									<span className="error">
										{errors.company}
									</span>
								)}
							</div>
						</div>
						<div className="data">
							<label htmlFor="parentUnit">Parent Unit</label>
							<div className="input-container">
								<input
									type="text"
									id="parentUnit"
									name="parentUnit"
									value={formData.parentUnit}
									onChange={handleChange}
									maxLength={30}
									placeholder="Enter parent unit name"
									className={errors.parentUnit ? "error" : ""}
								/>
								{errors.parentUnit && (
									<span className="error">
										{errors.parentUnit}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="create-marketing-office-button-group">
					<button
						type="submit"
						disabled={isSubmitting}
						className="create-marketing-office-save-button"
					>
						{isSubmitting ? "Saving..." : "Save"}
					</button>
					<button
						type="button"
						className="create-marketing-office-cancel-button"
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
	);
}
