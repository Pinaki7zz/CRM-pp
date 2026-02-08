import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import "./CreateServiceChannel.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateServiceChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		serviceChannelCode: "",
		serviceChannelName: "",
		serviceChannelDesc: "",
	});

	const [errors, setErrors] = useState({
		serviceChannelCode: "",
		serviceChannelName: "",
		serviceChannelDesc: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/business-structure/display-service-channel");
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

		if (name === "serviceChannelCode") {
			const processedValue = value.toUpperCase().replace(/\s/g, "");
			setFormData((prev) => ({ ...prev, [name]: processedValue }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = {
			serviceChannelCode: "",
			serviceChannelName: "",
			serviceChannelDesc: "",
		};

		// Validate Service Channel Code
		if (!/^[a-zA-Z0-9]{4}$/.test(formData.serviceChannelCode)) {
			newErrors.serviceChannelCode =
				"Service Channel Code must be exactly 4 alphanumeric characters";
			isValid = false;
		}

		// Validate Service Channel Name
		if (!formData.serviceChannelName.trim()) {
			newErrors.serviceChannelName = "Service Channel Name is required";
			isValid = false;
		} else if (formData.serviceChannelName.length > 30) {
			newErrors.serviceChannelName = "Cannot exceed 30 characters";
			isValid = false;
		}

		// Validate Description
		if (!formData.serviceChannelDesc.trim()) {
			newErrors.serviceChannelDesc = "Service Channel Name is required";
			isValid = false;
		} else if (formData.serviceChannelDesc.length > 50) {
			newErrors.serviceChannelDesc = "Cannot exceed 50 characters";
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
			// Check if serviceChannelCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/service-channels/${formData.serviceChannelCode}`
			);

			if (checkResponse.status === 200) {
				// Code exists
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors(prev => ({
					//   ...prev,
					//   serviceChannelCode: `Service Channel Code ${formData.serviceChannelCode} already exists. Please choose a new one.`
					// }));
					alert(
						`Service Channel Code ${formData.serviceChannelCode} already exists. Please choose a new one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status !== 404) {
				// Some error occurred
				throw new Error(
					"Failed to check Service Channel Code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/service-channels`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create Service Channel"
				);
			}

			alert("Service Channel created successfully!");
			navigate("/business-structure/display-service-channel");
		} catch (error) {
			console.error("Error creating service channel:", error);

			alert(
				error.message ||
					"An error occurred while creating the service channel"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		navigate("/business-structure/display-service-channel");
	};

	return (
		<>
			<div className="create-service-channel-container">
				{errors.general && (
					<div className="error-message">{errors.general}</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="create-service-channel-header-box">
						<h2>Service Channel</h2>

						<div className="data-container">
							<div className="data">
								<label htmlFor="serviceChannelCode">
									Service Channel Code*
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
									id="serviceChannelCode"
									name="serviceChannelCode"
									placeholder="4 alphanumeric characters"
									value={formData.serviceChannelCode}
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
										errors.serviceChannelCode
											? "error-input"
											: ""
									}
								/>
								{errors.serviceChannelCode && (
									<span className="error">
										{errors.serviceChannelCode}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="serviceChannelName">
									Service Channel Name*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Service Channel Name must be up to 30
										characters
									</span>
								</span>
								<input
									type="text"
									id="serviceChannelName"
									name="serviceChannelName"
									placeholder="Enter service channel name"
									value={formData.serviceChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									className={
										errors.serviceChannelName
											? "error-input"
											: ""
									}
								/>
								{errors.serviceChannelName && (
									<span className="error">
										{errors.serviceChannelName}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="serviceChannelDesc">
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
									id="serviceChannelDesc"
									name="serviceChannelDesc"
									placeholder="Enter description"
									value={formData.serviceChannelDesc}
									onChange={handleChange}
									maxLength={50}
									className={
										errors.serviceChannelDesc
											? "error-input"
											: ""
									}
								/>
								{errors.serviceChannelDesc && (
									<span className="error">
										{errors.serviceChannelDesc}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Submit Button */}
					{/* <div className="submit-button">
						<button type="submit">Save</button>
					</div> */}
					<div className="create-service-channel-button-group">
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
