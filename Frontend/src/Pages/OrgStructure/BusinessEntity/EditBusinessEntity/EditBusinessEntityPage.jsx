import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function EditBusinessEntity() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { businessEntityCode } = useParams();
	const navigate = useNavigate();
	const [countries, setCountries] = useState([]);
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

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setGoBackUrl("/business-structure/display-business-entity");
		fetchBusinessEntity();
		setCountries(Country.getAllCountries());
	}, [setGoBackUrl, businessEntityCode]);

	const fetchBusinessEntity = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_MS}/business-entities/${businessEntityCode}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch business entity");
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
			console.error("Error fetching business entity:", error);
			alert("Error loading business entity data");
			navigate("/business-structure/display-business-entity");
		}
	};

	const validateField = (name, value) => {
		switch (name) {
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

	const handleChange = (e) => {
		if (!isEditing) return;

		const { name, value } = e.target;

		setFormData((prev) => ({ ...prev, [name]: value }));
		const error = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditing) return;

		let formValid = true;
		const newErrors = {};

		Object.keys(formData).forEach((key) => {
			if (key === "businessEntityCode") return;
			const error = validateField(key, formData[key]);
			if (error) {
				newErrors[key] = error;
				formValid = false;
			}
		});

		setErrors(newErrors);

		if (!formValid) {
			return;
		}

		try {
			const updatePayload = {
				businessEntityName: formData.businessEntityName,
				street1: formData.street1,
				street2: formData.street2,
				city: formData.city,
				state: formData.state,
				country: formData.country,
				pinCode: formData.pinCode,
			};

			const response = await fetch(
				`http://localhost:3003/api/business-entities/${businessEntityCode}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatePayload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to update business entity"
				);
			}

			const updatedData = await response.json();
			setOriginalData(updatedData);
			setIsEditing(false);
			alert("Business Entity updated successfully!");
			navigate("/displayBusinessEntity");
		} catch (error) {
			console.error("Error updating business entity:", error);
			alert(
				error.message ||
					"An error occurred while updating the business entity"
			);
		}
	};

	const handleEdit = () => {
		setTimeout(() => {
			setIsEditing(true);
		}, 0);
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

	if (isLoading) {
		return <div className="container">Loading...</div>;
	}

	return (
		<>
			<div className="container">
				<div className="edit-controls">
					{isEditing ? (
						<button
							type="submit"
							form="businessEntityForm"
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

				<form id="businessEntityForm" onSubmit={handleSubmit}>
					<div className="header-box">
						<h2>Business Entity Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="businessEntityCode">
									Business Entity Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Business Entity Code cannot be modified
										after creation
									</span>
								</span>
								<input
									type="text"
									id="businessEntityCode"
									name="businessEntityCode"
									value={formData.businessEntityCode}
									readOnly
									className="read-only"
								/>
							</div>
							<div className="data">
								<label htmlFor="businessEntityName">
									Business Entity Name*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Business Entity Must be alphanumeric and
										up to 30 characters
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
									readOnly={!isEditing}
									className={`${
										!isEditing ? "read-only" : ""
									} ${
										errors.businessEntityName ? "error" : ""
									}`}
								/>
								{errors.businessEntityName && (
									<span className="error">
										{errors.businessEntityName}
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
										readOnly={!isEditing}
										className={`resizable-input ${
											!isEditing ? "read-only" : ""
										} ${errors.street1 ? "error" : ""}`}
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
										readOnly={!isEditing}
										className={`resizable-input ${
											!isEditing ? "read-only" : ""
										} ${errors.street2 ? "error" : ""}`}
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
					}
				}}
			/>
		</>
	);
}
