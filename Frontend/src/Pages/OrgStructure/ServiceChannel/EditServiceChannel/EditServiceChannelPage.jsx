import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function EditServiceChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { serviceChannelId } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		serviceChannelId: "",
		serviceChannelName: "",
	});

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/displayServiceChannel");
		fetchServiceChannel();
	}, [setGoBackUrl, serviceChannelId]);

	const fetchServiceChannel = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`${BASE_URL_MS}/service-channels/${serviceChannelId}`
			);
			if (!response.ok) {
				alert("Failed to fetch service channel");
				return;
			}
			const data = response.json();
			setFormData({
				serviceChannelId: data.serviceChannelId,
				serviceChannelName: data.serviceChannelName,
			});
			setOriginalData({
				serviceChannelId: data.serviceChannelId,
				serviceChannelName: data.serviceChannelName,
			});
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching service channel:", error);
			setErrorMessage("Failed to load service channel data");
			setIsLoading(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "serviceChannelId":
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Service Channel ID must be exactly 4 alphanumeric characters";
				}
				break;
			case "serviceChannelName":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Service Channel Name must be alphanumeric and up to 30 characters";
				}
				break;
			default:
				return "";
		}
		return "";
	};

	const handleChange = (e) => {
		if (!isEditing) return;

		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isEditing) return; // Prevent submission when not in edit mode

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
			alert("Please fix the errors in the form before submitting.");
			return;
		}

		try {
			const response = await fetch(
				`${BASE_URL_MS}/service-channels/${serviceChannelId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: {
						serviceChannelName: formData.serviceChannelName,
					},
				}
			);
			if (!response.ok) {
				alert("Unable to update service channel");
				return;
			}
			alert("Service Channel updated successfully!");
			setOriginalData(formData);
			setIsEditing(false);
			navigate("/displayServiceChannel");
		} catch (error) {
			console.error("Error updating service channel:", error);
			alert("Failed to update service channel. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (e) => {
		e.preventDefault(); // Prevent form submission
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setFormData(originalData);
		setErrors({});
		setIsEditing(false);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (errorMessage) {
		return <div>{errorMessage}</div>;
	}

	return (
		<>
			<div className="container">
				{/* Move edit controls outside the form */}
				<div className="edit-controls">
					{isEditing ? (
						<button
							type="submit"
							form="serviceChannelForm"
							className="save-button-edit-page"
							disabled={isSubmitting}
						>
							<FaSave /> {isSubmitting ? "Saving..." : "Save"}
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

				<form id="serviceChannelForm" onSubmit={handleSubmit}>
					{/* Service Channel Details */}
					<div className="header-box">
						<h2>Service Channel Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="serviceChannelId">
									Service Channel Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Service Channel Code must be exactly
										4 alphanumeric characters. <br />
										2- Service Channel Code must be unique.{" "}
										<br />
										3- Service Channel Code must not contain
										any special characters. <br />
										4- Service Channel Code must not contain
										any spaces. <br />
										5- Service Channel Code cannot be
										changed after creation. <br />
									</span>
								</span>
								<input
									type="text"
									id="serviceChannelId"
									name="serviceChannelId"
									value={formData.serviceChannelId}
									onChange={handleChange}
									maxLength={4}
									required
									readOnly={true}
									className="read-only"
								/>
								{errors.serviceChannelId && (
									<span className="error">
										{errors.serviceChannelId}
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
										Service Channel Name must be
										alphanumeric and up to 30 characters.
									</span>
								</span>
								<input
									type="text"
									id="serviceChannelName"
									name="serviceChannelName"
									value={formData.serviceChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.serviceChannelName && (
									<span className="error">
										{errors.serviceChannelName}
									</span>
								)}
							</div>
						</div>
					</div>
				</form>
			</div>
			<FormPageHeader onCancel={handleCancelEdit} />
		</>
	);
}
