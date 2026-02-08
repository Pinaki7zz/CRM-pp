import { useState, useEffect } from "react";
// import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import "./CreateBusinessUnit.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateBusinessUnitForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [formData, setFormData] = useState({
		businessUnitCode: "",
		businessUnitDesc: "",
		street1: "",
		street2: "",
		city: "",
		state: "",
		country: "",
		pinCode: "",
	});
	const [errors, setErrors] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		setCountries(Country.getAllCountries());
	}, []);

	const validateField = (name, value) => {
		switch (name) {
			case "businessUnitCode":
				if (!value) return "Business Unit Code is required";
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Business Unit Code must be exactly 4 alphanumeric characters (no special characters)";
				}
				return "";
			case "businessUnitDesc":
				if (!value) return "Business Unit Description is required";
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Business Unit Description must be alphanumeric and up to 30 characters";
				}
				return "";
			case "street1":
				if (!value.trim()) return "Street 1 is required";
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

		if (name === "businessUnitCode") {
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
		navigate("/business-structure/display-business-unit");
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
			setIsSubmitting(false);
			return;
		}

		try {
			// Check if businessUnitCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/business-units/${formData.businessUnitCode}`
			);

			if (checkResponse.ok && checkResponse.status === 200) {
				// Code exists
				const exists = await checkResponse.json();
				if (exists) {
					alert(
						`BusinessUnitCode ${formData.businessUnitCode} already exists. Please choose a new one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status === 404) {
				// Code does not exist, proceed with creation
			} else {
				// Other errors (e.g., 500)
				throw new Error(
					"Failed to check business unit code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/business-units`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create business unit"
				);
			}

			alert("Business Unit created successfully!");
			navigate("/business-structure/display-business-unit");
		} catch (error) {
			console.error("Error creating business unit:", error);
			alert(
				error.message ||
					"An error occurred while creating the business unit"
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
		<div className="business-unit-container-2345">
			<form onSubmit={handleSubmit}>
				<div className="business-unit-header-box">
					<h2>Business Unit Details</h2>
					<div className="data-container">
						<div className="data">
							<label htmlFor="businessUnitCode">
								Business Unit Code*
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									1- Must start with 'BU' followed by 2 digits
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
								id="businessUnitCode"
								name="businessUnitCode"
								value={formData.businessUnitCode}
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
									errors.businessUnitCode ? "error" : ""
								}
							/>
							{errors.businessUnitCode && (
								<span className="error">
									{errors.businessUnitCode}
								</span>
							)}
						</div>
						<div className="data">
							<label htmlFor="businessUnitDesc">
								Business Unit Description*
							</label>
							<span className="info-icon-tooltip">
								<i className="fas fa-info-circle" />
								<span className="tooltip-text">
									Business Unit Description must be
									alphanumeric and up to 30 characters
								</span>
							</span>
							<input
								type="text"
								id="businessUnitDesc"
								name="businessUnitDesc"
								value={formData.businessUnitDesc}
								onChange={handleChange}
								maxLength={30}
								required
								placeholder="Enter business unit description"
								className={
									errors.businessUnitDesc ? "error" : ""
								}
							/>
							{errors.businessUnitDesc && (
								<span className="error">
									{errors.businessUnitDesc}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="business-unit-item-box">
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
				<div className="business-unit-button-group">
					<button
						type="submit"
						disabled={isSubmitting}
						className="business-unit-save-button"
					>
						{isSubmitting ? "Saving..." : "Save"}
					</button>
					<button
						type="button"
						className="business-unit-cancel-button"
						onClick={handleCancel}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
