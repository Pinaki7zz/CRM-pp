import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import "./CreateMarketingChannel.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function CreateMarketingChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		marketingChannelCode: "",
		marketingChannelName: "",
		marketingChannelDesc: "",
	});

	const [errors, setErrors] = useState({
		marketingChannelCode: "",
		marketingChannelName: "",
		marketingChannelDesc: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/business-structure/display-marketing-channel");
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

		if (name === "marketingChannelCode") {
			const processedValue = value.toUpperCase().replace(/\s/g, "");
			setFormData((prev) => ({ ...prev, [name]: processedValue }));
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = {
			marketingChannelCode: "",
			marketingChannelName: "",
			marketingChannelDesc: "",
		};

		// Validate Marketing Channel Code
		if (!/^[a-zA-Z0-9]{4}$/.test(formData.marketingChannelCode)) {
			newErrors.marketingChannelCode =
				"Marketing Channel Code must be exactly 4 alphanumeric characters";
			isValid = false;
		}

		// Validate Marketing Channel Name
		if (!formData.marketingChannelName.trim()) {
			newErrors.marketingChannelName =
				"Marketing Channel Name is required";
			isValid = false;
		} else if (formData.marketingChannelName.length > 30) {
			newErrors.marketingChannelName = "Cannot exceed 30 characters";
			isValid = false;
		}

		// Validate Description
		if (!formData.marketingChannelDesc.trim()) {
			newErrors.marketingChannelDesc =
				"Marketing Channel Name is required";
			isValid = false;
		} else if (formData.marketingChannelDesc.length > 50) {
			newErrors.marketingChannelDesc = "Cannot exceed 50 characters";
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
			// Check if marketingChannelCode already exists
			const checkResponse = await fetch(
				`${BASE_URL_MS}/marketing-channels/${formData.marketingChannelCode}`
			);

			if (checkResponse.status === 200) {
				// Code exists
				const exists = await checkResponse.json();
				if (exists) {
					// setErrors(prev => ({
					//   ...prev,
					//   marketingChannelCode: `Marketing Channel Code ${formData.marketingChannelCode} already exists. Please choose a new one.`
					// }));
					alert(
						`Marketing Channel Code ${formData.marketingChannelCode} already exists. Please choose a new one.`
					);
					setIsSubmitting(false);
					return;
				}
			} else if (checkResponse.status !== 404) {
				// Some error occurred
				throw new Error(
					"Failed to check Marketing Channel Code availability"
				);
			}

			// Proceed with creation
			const response = await fetch(`${BASE_URL_MS}/marketing-channels`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create Marketing Channel"
				);
			}

			alert("Marketing Channel created successfully!");
			navigate("/business-structure/display-marketing-channel");
		} catch (error) {
			console.error("Error creating marketing channel:", error);

			alert(
				error.message ||
					"An error occurred while creating the marketing channel"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		navigate("/business-structure/display-marketing-channel");
	};

	return (
		<>
			<div className="create-marketing-channel-container">
				{errors.general && (
					<div className="error-message">{errors.general}</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="create-marketing-channel-header-box">
						<h2>Marketing Channel</h2>

						<div className="data-container">
							<div className="data">
								<label htmlFor="marketingChannelCode">
									Marketing Channel Code*
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
									id="marketingChannelCode"
									name="marketingChannelCode"
									placeholder="4 alphanumeric characters"
									value={formData.marketingChannelCode}
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
										errors.marketingChannelCode
											? "error-input"
											: ""
									}
								/>
								{errors.marketingChannelCode && (
									<span className="error">
										{errors.marketingChannelCode}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="marketingChannelName">
									Marketing Channel Name*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Marketing Channel Name must be up to 30
										characters
									</span>
								</span>
								<input
									type="text"
									id="marketingChannelName"
									name="marketingChannelName"
									placeholder="Enter marketing channel name"
									value={formData.marketingChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									className={
										errors.marketingChannelName
											? "error-input"
											: ""
									}
								/>
								{errors.marketingChannelName && (
									<span className="error">
										{errors.marketingChannelName}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="marketingChannelDesc">
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
									id="marketingChannelDesc"
									name="marketingChannelDesc"
									placeholder="Enter description"
									value={formData.marketingChannelDesc}
									onChange={handleChange}
									maxLength={50}
									className={
										errors.marketingChannelDesc
											? "error-input"
											: ""
									}
								/>
								{errors.marketingChannelDesc && (
									<span className="error">
										{errors.marketingChannelDesc}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Submit Button */}
					{/* <div className="submit-button">
						<button type="submit">Save</button>
					</div> */}
					<div className="create-marketing-channel-button-group">
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
