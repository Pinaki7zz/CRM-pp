import { useState, useEffect } from "react";
// import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import countries from "../../../../utils/countries.js";
import "./CreateBusinessEntity.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateBusinessEntityForm() {
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCheckingCode, setIsCheckingCode] = useState(false);
	const navigate = useNavigate();
	// const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [formData, setFormData] = useState({
		businessEntityCode: "",
		businessEntityName: "",
		street1: "",
		street2: "",
		city: "",
		state: "",
		country: "",
		pinCode: "",
	});

	// useEffect(() => {
	//   setCountries(Country.getAllCountries());
	// }, []);

	const checkBusinessEntityCodeExists = async (code) => {
		try {
			setIsCheckingCode(true);
			const response = await fetch(
				`${BASE_URL_MS}/business-entities/check-code?code=${code}`
			);
			if (!response.ok) {
				throw new Error("Failed to check business entity code");
			}
			const data = await response.json();
			return data.exists;
		} catch (error) {
			console.error("Error checking business entity code:", error);
			// setErrors(prev => ({ ...prev, businessEntityCode: "Error checking if Business Entity Code exists. Please try again." }));
			return false;
		} finally {
			setIsCheckingCode(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "businessEntityCode":
				if (!value) return "Business Entity Code is required";
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Business Entity Code must be exactly 4 alphanumeric characters (no special characters)";
				}
				return "";
			case "businessEntityName":
				if (!value) return "Business Entity Name is required";
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Business Entity Name must be alphanumeric and up to 30 characters";
				}
				return "";
			case "street1":
				if (!value) return "Street 1 is required";
				if (value.length > 50) {
					return "Street address must be up to 50 characters";
				}
				return "";
			case "street2":
				if (value && value.length > 50) {
					return "Street address must be up to 50 characters";
				}
				return "";
			case "city":
				if (!value) return "City is required";
				return "";
			case "state":
				if (!value) return "State is required";
				return "";
			case "country":
				if (!value) return "Country is required";
				return "";
			case "pinCode":
				if (!value) return "Pin Code is required";
				if (!/^\d{4,6}$/.test(value)) {
					return "Pin code must be 4-6 digits";
				}
				return "";
			default:
				return "";
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "businessEntityCode") {
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
		navigate("/business-structure/display-business-entity");
	};

	const validateForm = () => {
		const newErrors = {};
		Object.keys(formData).forEach((key) => {
			const error = validateField(key, formData[key]);
			if (error) {
				newErrors[key] = error;
			}
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Check if businessEntityCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/business-entities/${formData.businessEntityCode}`
			);

			if (checkResponse.status === 200) {
				// ID exists
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors(prev => ({
					//   ...prev,
					//   businessEntityCode: `Business Entity Code "${formData.businessEntityCode}" already exists. Please choose a different one.`
					// }));
					alert(
						`Business Entity Code "${formData.businessEntityCode}" already exists. Please choose a different one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status !== 404) {
				// Some other error occurred
				throw new Error(
					"Failed to check Business Entity Code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/business-entities`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create Business Entity"
				);
			}

			alert("Business Entity created successfully!");
			navigate("/business-structure/display-business-entity");
		} catch (error) {
			console.error("Error creating business entity:", error);

			alert(
				error.message ||
					"An error occurred while creating the Business Entity"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const validateGlobalPostalCode = async (postalCode, countryName) => {
		const countryObj = countries.find((c) => c.name === countryName);
		if (!countryObj)
			return { valid: false, message: "Invalid country selected" };

		const countryISO = countryObj.isoCode;

		try {
			const res = await fetch(
				`http://api.geonames.org/postalCodeSearchJSON?postalcode=${postalCode}&country=${countryISO}&maxRows=1&username=abhishek_83568`
			);
			const data = await res.json();

			if (data.postalCodes && data.postalCodes.length > 0) {
				const location = data.postalCodes[0];

				return {
					valid: true,
					city: location.placeName,
					state: location.adminName1,
					country: location.countryCode,
				};
			} else {
				return {
					valid: false,
					message: "Postal code not found in GeoNames",
				};
			}
		} catch (error) {
			return {
				valid: false,
				message: "Error connecting to GeoNames API",
			};
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
	};

	useEffect(() => {
		if (formData.pinCode.length >= 4 && formData.country) {
			validateGlobalPostalCode(formData.pinCode, formData.country).then(
				(result) => {
					if (result.valid) {
						console.log(
							"City:",
							result.city,
							"State:",
							result.state
						);

						// Update city and state in formData
						setFormData((prev) => ({
							...prev,
							city: result.city,
							state: result.state,
						}));

						// Optional: Warn if selected state doesn't match API state
						if (
							formData.state &&
							result.state.toLowerCase() !==
								formData.state.toLowerCase()
						) {
							alert(
								`PIN code doesn't match selected state. Expected: ${result.state}`
							);
						}
					} else {
						alert(result.message);
					}
				}
			);
		}
	}, [formData.pinCode, formData.country]);

	return (
		<div className="business-entity-container-1234">
			<form onSubmit={handleSubmit}>
				{/* <div className="submit-button">
          <button type="submit" disabled={isSubmitting || isCheckingCode}>
            {isSubmitting
              ? "Saving..."
              : isCheckingCode
              ? "Checking Code..."
              : "Save"}
          </button>
          <button
            type="button"
            className="business-entity-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div> */}

				<div className="business-entity-header-box">
					<h2>Business Entity Details</h2>
					<div className="data-container">
						<div className="data">
							<label htmlFor="businessEntityCode">
								Business Entity Code*
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									1- Business Entity Code must be exactly 4
									alphanumeric characters
									<br />
									2- Business Entity must be unique
									<br />
									3- No special characters or spaces
									<br />
									4- Cannot be changed after creation
								</span>
							</span>
							<input
								type="text"
								id="businessEntityCode"
								name="businessEntityCode"
								value={formData.businessEntityCode}
								onChange={(e) => {
									const value = e.target.value;
									// Allow only alphanumeric characters (no special characters or spaces)
									if (/^[a-zA-Z0-9]*$/.test(value)) {
										handleChange(e);
									}
								}}
								maxLength={4}
								required
								placeholder="Enter 4-character code"
								className={
									errors.businessEntityCode ? "error" : ""
								}
							/>
							{errors.businessEntityCode && (
								<span className="error">
									{errors.businessEntityCode}
								</span>
							)}
						</div>

						<div className="data">
							<label htmlFor="businessEntityName">
								Business Entity Name*
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									Business Entity Must be alphanumeric and up
									to 30 characters
								</span>
							</span>
							<input
								type="text"
								id="businessEntityName"
								name="businessEntityName"
								value={formData.businessEntityName}
								onChange={handleChange}
								maxLength={30}
								required
								placeholder="Enter business name"
								className={
									errors.businessEntityName ? "error" : ""
								}
							/>
							{errors.businessEntityName && (
								<span className="error">
									{errors.businessEntityName}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="business-entity-item-box">
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
								{/* <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select> */}

								<select
									name="country"
									value={formData.country}
									onChange={handleCountryChange}
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
									disabled={!states.length}
									required
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
									disabled={!cities.length}
									required
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
								Postal Code / Pin Code*
							</label>
							<div className="input-container">
								<input
									type="text"
									id="pinCode"
									name="pinCode"
									value={formData.pinCode}
									onChange={handleChange}
									maxLength={6}
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
				<div className="business-entity-button-group">
					{/* <button
						type="submit"
						disabled={isSubmitting}
						className="business-entity-button"
					>
						{isSubmitting ? "Saving..." : "Save"}
					</button> */}
					<button
						type="submit"
						disabled={isSubmitting || isCheckingCode}
						className="business-entity-submit-button"
					>
						{isSubmitting
							? "Saving..."
							: isCheckingCode
							? "Checking Code..."
							: "Save"}
					</button>
					<button
						type="button"
						className="business-entity-cancel-button"
						onClick={handleCancel}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
