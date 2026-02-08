import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function EditSalesChannelForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { salesChannelId } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		salesChannelId: "",
		salesChannelName: "",
	});

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/displaySalesChannel");
		fetchSalesChannel();
	}, [setGoBackUrl, salesChannelId]);

	const fetchSalesChannel = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`${BASE_URL_MS}/sales-channels/${salesChannelId}`
			);
			if (!response.ok) {
				alert("Failed to fetch sales channel");
				return;
			}
			const data = response.json();
			setFormData({
				salesChannelId: data.salesChannelId,
				salesChannelName: data.salesChannelName,
			});
			setOriginalData({
				salesChannelId: data.salesChannelId,
				salesChannelName: data.salesChannelName,
			});
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching sales channel:", error);
			setErrorMessage("Failed to load sales channel data");
			setIsLoading(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "salesChannelId":
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Sales Channel ID must be exactly 4 alphanumeric characters";
				}
				break;
			case "salesChannelName":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Sales Channel Name must be alphanumeric and up to 30 characters";
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
				`${BASE_URL_MS}/sales-channels/${salesChannelId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: {
						salesChannelName: formData.salesChannelName,
					},
				}
			);
			if (!response.ok) {
				alert("Unable to update sales channel");
				return;
			}
			alert("Sales Channel updated successfully!");
			setOriginalData(formData);
			setIsEditing(false);
			navigate("/displaySalesChannel");
		} catch (error) {
			console.error("Error updating sales channel:", error);
			alert("Failed to update sales channel. Please try again.");
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
							form="salesChannelForm"
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

				<form id="salesChannelForm" onSubmit={handleSubmit}>
					{/* Sales Channel Details */}
					<div className="header-box">
						<h2>Sales Channel Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="salesChannelId">
									Sales Channel Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Sales Channel Code must be exactly 4
										alphanumeric characters. <br />
										2- Sales Channel Code must be unique.{" "}
										<br />
										3- Sales Channel Code must not contain
										any special characters. <br />
										4- Sales Channel Code must not contain
										any spaces. <br />
										5- Sales Channel Code cannot be changed
										after creation. <br />
									</span>
								</span>
								<input
									type="text"
									id="salesChannelId"
									name="salesChannelId"
									value={formData.salesChannelId}
									onChange={handleChange}
									maxLength={4}
									required
									readOnly={true}
									className="read-only"
								/>
								{errors.salesChannelId && (
									<span className="error">
										{errors.salesChannelId}
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
										Sales Channel Name must be alphanumeric
										and up to 30 characters.
									</span>
								</span>
								<input
									type="text"
									id="salesChannelName"
									name="salesChannelName"
									value={formData.salesChannelName}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.salesChannelName && (
									<span className="error">
										{errors.salesChannelName}
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
