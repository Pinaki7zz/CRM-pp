import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

export default function EditServiceOfficeForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { ServiceOfficeId } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		ServiceOfficeId: "",
		ServiceOfficeDesc: "",
	});

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setGoBackUrl("/business-structure/display-service-office");
		fetchServiceOffice();
	}, [setGoBackUrl, ServiceOfficeId]);

	const fetchServiceOffice = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_MS}/service-office/${ServiceOfficeId}`
			);
			if (!response.ok) {
				alert("Unable to fetch service office");
				return;
			}
			setFormData({
				ServiceOfficeId: response.data.ServiceOfficeId,
				ServiceOfficeDesc: response.data.ServiceOfficeDesc,
			});
			setOriginalData({
				ServiceOfficeId: response.data.ServiceOfficeId,
				ServiceOfficeDesc: response.data.ServiceOfficeDesc,
			});
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching service office:", error);
			alert("Failed to load service office data");
			navigate("/business-structure/display-service-office");
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "ServiceOfficeId":
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Service Office ID must be exactly 4 alphanumeric characters";
				}
				break;
			case "ServiceOfficeDesc":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Description must be alphanumeric and up to 30 characters";
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

		// Validate the field
		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditing) return; // Prevent submission when not in edit mode

		setIsSubmitting(true);

		// Validate all fields before submission
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
				`${BASE_URL_MS}/service-office/${ServiceOfficeId}`,
				{
					method: "PUT",
					headers: { "Content-type": "application/json" },
					body: {
						ServiceOfficeDesc: formData.ServiceOfficeDesc,
					},
				}
			);
			if (!response.ok) {
				alert("Unable to update service office");
				return;
			}
			alert("Service Office updated successfully!");
			setOriginalData(formData);
			setIsEditing(false);
			await fetchServiceOffice();
		} catch (error) {
			console.error("Error updating service office:", error);
			if (error.response) {
				alert(
					`Error: ${
						error.response.data.message ||
						"Failed to update service office"
					}`
				);
			} else {
				alert("Network error. Please try again.");
			}
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
		return <div className="container">Loading...</div>;
	}

	return (
		<>
			<div className="container">
				<form id="serviceOfficeForm" onSubmit={handleSubmit}>
					<div className="edit-controls">
						{isEditing ? (
							<button
								type="submit"
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

					{/* Service Office Details */}
					<div className="edit-service-office-header-box">
						<h2>Service Office Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="ServiceOfficeId">
									Service Office Code*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										1- Sourcing Unit Code must be exactly 4
										digits. <br />
										2- Sourcing Unit Code must be unique.{" "}
										<br />
										3- Sourcing Unit Code must not contain
										any special characters. <br />
										4- Sourcing Unit Code must not contain
										any spaces. <br />
										5- Sourcing Unit Code once created then
										it can be not delete. <br />
									</span>
								</span>
								<input
									type="text"
									id="SourcingUnitId"
									name="SourcingUnitId"
									value={formData.SourcingUnitId}
									onChange={handleChange}
									maxLength={4}
									required
									readOnly={true}
									className="read-only"
								/>
								{errors.SourcingUnitId && (
									<span className="error">
										{errors.SourcingUnitId}
									</span>
								)}
							</div>
							<div className="data">
								<label htmlFor="SourcingUnitDesc">
									Sourcing Unit Description*
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Sourcing Unit Description must be
										alphanumeric and up to 30 characters.
									</span>
								</span>
								<input
									type="text"
									id="SourcingUnitDesc"
									name="SourcingUnitDesc"
									value={formData.SourcingUnitDesc}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.SourcingUnitDesc && (
									<span className="error">
										{errors.SourcingUnitDesc}
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
