import { useState, useContext, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { Country, State, City } from "country-state-city";

export default function EditSalesOfficeForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { salesOfficeCode } = useParams();
	const navigate = useNavigate();
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [formData, setFormData] = useState({
		salesOfficeCode: "",
		salesOfficeDesc: "",
		street1: "",
		street2: "",
		city: "",
		state: "",
		country: "",
		pinCode: "",
	});
	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		setGoBackUrl("/displaySalesOffice");

		if (!salesOfficeCode) {
			setErrorMessage("No sales office code provided in URL");
			setIsLoading(false);
			return;
		}

		fetchSalesOfficeData();
		setCountries(Country.getAllCountries());
	}, [setGoBackUrl, salesOfficeCode]);

	const fetchSalesOfficeData = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`http://localhost:3003/api/sales-offices/${salesOfficeCode}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch sales office data");
			}
			const data = await response.json();
			setFormData(data);
			setOriginalData(data);
			setIsLoading(false);

			// Set states and cities based on fetched data
			const countryObj = Country.getAllCountries().find(
				(c) => c.name === data.country
			);
			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setStates(stateList);
				const stateObj = stateList.find((s) => s.name === data.state);
				if (stateObj) {
					setCities(
						City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode
						)
					);
				}
			}
		} catch (error) {
			console.error("Error fetching sales office data:", error);
			setErrorMessage(
				`Failed to load sales office data for code: ${salesOfficeCode}`
			);
			setIsLoading(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "salesOfficeCode":
				if (!value) return "Sales Office Code is required";
				if (!/^SO[0-9]{2}$/.test(value)) {
					return "Sales Office Code must start with 'SO' followed by 2 digits (e.g., SO01)";
				}
				return "";
			case "salesOfficeDesc":
				if (!value) return "Sales Office Description is required";
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Description must be alphanumeric and up to 30 characters";
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
		if (!isEditing) return;

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
		if (!isEditing) return;

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
				} else {
					alert(result.message);
				}
			});
		}
	}, [formData.pinCode]);

	const handleChange = (e) => {
		if (!isEditing) return;

		const { name, value } = e.target;

		setFormData((prev) => ({ ...prev, [name]: value }));
		const error = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleEdit = () => {
		setTimeout(() => {
			setIsEditing(true);
		}, 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditing) return;

		let formValid = true;
		const newErrors = {};

		Object.keys(formData).forEach((key) => {
			if (key === "salesOfficeCode") return;
			const error = validateField(key, formData[key]);
			if (error) {
				newErrors[key] = error;
				formValid = false;
			}
		});

		setErrors(newErrors);

		if (!formValid) {
			alert("Please fix the errors in the form before submitting.");
			return;
		}

		try {
			const payload = {
				salesOfficeDesc: formData.salesOfficeDesc,
				street1: formData.street1,
				street2: formData.street2,
				city: formData.city,
				state: formData.state,
				country: formData.country,
				pinCode: formData.pinCode,
			};

			const response = await fetch(
				`http://localhost:3003/api/sales-offices/${salesOfficeCode}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to update sales office"
				);
			}

			const updatedData = await response.json();
			setOriginalData(updatedData);
			setIsEditing(false);
			alert("Sales Office updated successfully!");
			navigate("/displaySalesOffice");
		} catch (error) {
			console.error("Error updating sales office:", error);
			alert(error.message || "Failed to update sales office");
		}
	};

	if (!salesOfficeCode) {
		return (
			<div className="error-container">
				<h2>Error</h2>
				<p>No sales office code provided in URL.</p>
				<p>
					Please access this page through the proper navigation flow.
				</p>
				<Link to="/displaySalesOffice" className="back-link">
					Back to Sales Offices
				</Link>
			</div>
		);
	}

	if (isLoading) {
		return <div className="loading">Loading sales office data...</div>;
	}

	if (errorMessage) {
		return (
			<div className="error-container">
				<h2>Error</h2>
				<p>{errorMessage}</p>
				<Link to="/displaySalesOffice" className="back-link">
					Back to Sales Offices
				</Link>
			</div>
		);
	}

	return (
		<>
			<div className="container">
				<div className="edit-controls">
					{isEditing ? (
						<button
							type="submit"
							form="salesOfficeForm"
							className="save-button-edit-page"
						>
							<FaSave /> Save
						</button>
					) : (
						<button
							type="button"
							className="edit-button-edit-page"
							onClick={handleEdit}
						>
							<FaEdit /> Edit
						</button>
					)}
				</div>

				<form id="salesOfficeForm" onSubmit={handleSubmit}>
					<div className="header-box">
						<h2>Sales Office Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="salesOfficeCode">
									Sales Office Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Must start with 'SO' followed by 2
										digits
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
									id="salesOfficeCode"
									name="salesOfficeCode"
									value={formData.salesOfficeCode}
									readOnly
									className="read-only"
								/>
								{errors.salesOfficeCode && (
									<span className="error">
										{errors.salesOfficeCode}
									</span>
								)}
							</div>
							<div className="data">
								<label htmlFor="salesOfficeDesc">
									Sales Office Description*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Sales Office Description must be
										alphanumeric and up to 30 characters
									</span>
								</span>
								<input
									type="text"
									id="salesOfficeDesc"
									name="salesOfficeDesc"
									value={formData.salesOfficeDesc}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={`${
										!isEditing ? "read-only" : ""
									} ${errors.salesOfficeDesc ? "error" : ""}`}
								/>
								{errors.salesOfficeDesc && (
									<span className="error">
										{errors.salesOfficeDesc}
									</span>
								)}
							</div>
						</div>
					</div>
					<div className="item-box">
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
											!isEditing ? "read-only" : ""
										} ${errors.street1 ? "error" : ""}`}
										readOnly={!isEditing}
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
											!isEditing ? "read-only" : ""
										} ${errors.street2 ? "error" : ""}`}
										readOnly={!isEditing}
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
										disabled={!isEditing}
										className={`${
											!isEditing ? "read-only" : ""
										} ${errors.country ? "error" : ""}`}
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
										disabled={!isEditing || !states.length}
										className={`${
											!isEditing ? "read-only" : ""
										} ${errors.state ? "error" : ""}`}
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
										disabled={!isEditing || !cities.length}
										className={`${
											!isEditing ? "read-only" : ""
										} ${errors.city ? "error" : ""}`}
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
										<span className="error">
											{errors.city}
										</span>
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
										readOnly={!isEditing}
										className={`${
											!isEditing ? "read-only" : ""
										} ${errors.pinCode ? "error" : ""}`}
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
				</form>
			</div>
			<FormPageHeader
				onCancel={() => {
					if (isEditing) {
						setFormData(originalData);
						setErrors({});
						setIsEditing(false);
						navigate("/displaySalesOffice");
					} else {
						navigate("/displaySalesOffice");
					}
				}}
			/>
		</>
	);
}
