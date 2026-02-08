import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function EditMarketingChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { marketingChannelId } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		marketingChannelId: "",
		marketingChannelName: "",
	});

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/displayMarketingChannel");
		fetchMarketingChannel();
	}, [setGoBackUrl, marketingChannelId]);

	const fetchMarketingChannel = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`${BASE_URL_MS}/marketing-channels/${marketingChannelId}`
			);
			if (!response.ok) {
				alert("Failed to fetch marketing channel");
				return;
			}
			const data = response.json();
			setFormData({
				marketingChannelId: data.marketingChannelId,
				marketingChannelName: data.marketingChannelName,
			});
			setOriginalData({
				marketingChannelId: data.marketingChannelId,
				marketingChannelName: data.marketingChannelName,
			});
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching marketing channel:", error);
			setErrorMessage("Failed to load marketing channel data");
			setIsLoading(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "marketingChannelId":
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Marketing Channel ID must be exactly 4 alphanumeric characters";
				}
				break;
			case "marketingChannelName":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Marketing Channel Name must be alphanumeric and up to 30 characters";
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
				`${BASE_URL_MS}/marketing-channels/${marketingChannelId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: {
						marketingChannelName: formData.marketingChannelName,
					},
				}
			);
			if (!response.ok) {
				alert("Unable to update marketing channel");
				return;
			}
			alert("Marketing Channel updated successfully!");
			setOriginalData(formData);
			setIsEditing(false);
			navigate("/displayMarketingChannel");
		} catch (error) {
			console.error("Error updating marketing channel:", error);
			alert("Failed to update marketing channel. Please try again.");
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
							form="marketingChannelForm"
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

				<form id="marketingChannelForm" onSubmit={handleSubmit}>
					{/* Marketing Channel Details */}
					<div className="header-box">
						<h2>Marketing Channel Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="marketingChannelId">
									Marketing Channel Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Marketing Channel Code must be
										exactly 4 alphanumeric characters.{" "}
										<br />
										2- Marketing Channel Code must be
										unique. <br />
										3- Marketing Channel Code must not
										contain any special characters. <br />
										4- Marketing Channel Code must not
										contain any spaces. <br />
										5- Marketing Channel Code cannot be
										changed after creation. <br />
									</span>
								</span>
								<input
									type="text"
									id="marketingChannelId"
									name="marketingChannelId"
									value={formData.marketingChannelId}
									onChange={handleChange}
									maxLength={4}
									required
									readOnly={true}
									className="read-only"
								/>
								{errors.marketingChannelId && (
									<span className="error">
										{errors.marketingChannelId}
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
										Marketing Channel Name must be
										alphanumeric and up to 30 characters.
									</span>
								</span>
								<input
									type="text"
									id="marketingChannelName"
									name="marketingChannelName"
									value={formData.marketingChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.marketingChannelName && (
									<span className="error">
										{errors.marketingChannelName}
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
