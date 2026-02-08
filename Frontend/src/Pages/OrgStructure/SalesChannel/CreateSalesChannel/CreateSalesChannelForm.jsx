import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import "./CreateSalesChannel.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateSalesChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		salesChannelCode: "",
		salesChannelName: "",
		salesChannelDesc: "",
	});

	const [errors, setErrors] = useState({
		salesChannelCode: "",
		salesChannelName: "",
		salesChannelDesc: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/business-structure/display-sales-channel");
	}, [setGoBackUrl]);

	// const handleChange = (e) => {
	//   const { name, value } = e.target;
	//   setFormData((prevData) => ({
	//     ...prevData,
	//     [name]: value,
	//   }));

	//   // Clear error when user types
	//   if (errors[name]) {
	//     setErrors((prev) => ({ ...prev, [name]: "" }));
	//   }
	// };

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "salesChannelCode") {
			const processedValue = value.toUpperCase().replace(/\s/g, "");
			setFormData((prev) => ({ ...prev, [name]: processedValue }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = {
			salesChannelCode: "",
			salesChannelName: "",
			salesChannelDesc: "",
		};

		// Validate Sales Channel Code
		if (!/^[a-zA-Z0-9]{4}$/.test(formData.salesChannelCode)) {
			newErrors.salesChannelCode =
				"Sales Channel Code must be exactly 4 alphanumeric characters";
			isValid = false;
		}

		// Validate Sales Channel Name
		if (!formData.salesChannelName.trim()) {
			newErrors.salesChannelName = "Sales Channel Name is required";
			isValid = false;
		} else if (formData.salesChannelName.length > 30) {
			newErrors.salesChannelName = "Cannot exceed 30 characters";
			isValid = false;
		}

		// Validate Description
		if (!formData.salesChannelDesc.trim()) {
			newErrors.salesChannelDesc = "Sales Channel Name is required";
			isValid = false;
		} else if (formData.salesChannelDesc.length > 50) {
			newErrors.salesChannelDesc = "Cannot exceed 50 characters";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Check if salesChannelCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/sales-channels/${formData.salesChannelCode}`
			);

			if (checkResponse.status === 200) {
				// Code exists
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors(prev => ({
					//   ...prev,
					//   salesChannelCode: `Sales Channel Code ${formData.salesChannelCode} already exists. Please choose a new one.`
					// }));
					alert(
						`Sales Channel Code ${formData.salesChannelCode} already exists. Please choose a new one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status !== 404) {
				// Some error occurred
				throw new Error(
					"Failed to check Sales Channel Code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/sales-channels`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create Sales Channel"
				);
			}

			alert("Sales Channel created successfully!");
			navigate("/business-structure/display-sales-channel");
		} catch (error) {
			console.error("Error creating sales channel:", error);

			alert(
				error.message ||
					"An error occurred while creating the sales channel"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		navigate("/business-structure/display-sales-channel");
	};

	return (
		<>
			<div className="create-sales-channel-container">
				{errors.general && (
					<div className="error-message">{errors.general}</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="create-sales-channel-header-box">
						<h2>Sales Channel</h2>

						<div className="data-container">
							<div className="data">
								<label htmlFor="salesChannelCode">
									Sales Channel Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Must be exactly 4 alphanumeric
										characters
										<br />
										2- Must be unique
										<br />
										3- No special characters or spaces
										<br />
										4- Cannot be changed after creation
										<br />
									</span>
								</span>
								<input
									type="text"
									id="salesChannelCode"
									name="salesChannelCode"
									placeholder="4 alphanumeric characters"
									value={formData.salesChannelCode}
									onChange={(e) => {
										const value = e.target.value;
										// Allow only alphanumeric characters (no special characters or spaces)
										if (/^[a-zA-Z0-9]*$/.test(value)) {
											handleChange(e);
										}
									}}
									maxLength={4}
									required
									className={
										errors.salesChannelCode
											? "error-input"
											: ""
									}
								/>
								{errors.salesChannelCode && (
									<span className="error">
										{errors.salesChannelCode}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="salesChannelName">
									Sales Channel Name*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Sales Channel Name must be up to 30
										characters
									</span>
								</span>
								<input
									type="text"
									id="salesChannelName"
									name="salesChannelName"
									placeholder="Enter sales channel name"
									value={formData.salesChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									className={
										errors.salesChannelName
											? "error-input"
											: ""
									}
								/>
								{errors.salesChannelName && (
									<span className="error">
										{errors.salesChannelName}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="salesChannelDesc">
									Description
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Description must be up to 50 characters
									</span>
								</span>
								<input
									type="text"
									id="salesChannelDesc"
									name="salesChannelDesc"
									placeholder="Enter description"
									value={formData.salesChannelDesc}
									onChange={handleChange}
									maxLength={50}
									className={
										errors.salesChannelDesc
											? "error-input"
											: ""
									}
								/>
								{errors.salesChannelDesc && (
									<span className="error">
										{errors.salesChannelDesc}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Submit Button */}
					{/* <div className="submit-button">
						<button type="submit">Save</button>
					</div> */}
					<div className="create-sales-channel-button-group">
						<button
							type="submit"
							disabled={isSubmitting}
							className="business-entity-button"
						>
							{isSubmitting ? "Saving..." : "Save"}
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
				{/* <button className="cancel-button-header" onClick={handleCancel}>
					Cancel
				</button> */}
			</div>
			{/* <FormPageHeader /> */}
		</>
	);
}
