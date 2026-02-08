import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTemplate.css";

const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

const CreateTemplate = ({ onClose, user }) => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: "",
		object: "",
		language: "English", // Keep simple for now
		templateType: "Text Based",
		usage: "Template",
		subject: "",
		content: "", // For future template content
		templateFile: null,
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	// File handler for template file upload
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setForm((prev) => ({ ...prev, templateFile: file }));
		console.log("Selected file:", file);
	};

	// Function to trigger file input click
	const triggerFileInput = () => {
		document.getElementById("templateFile").click();
	};

	const validate = () => {
		const err = {};
		if (!form.name.trim()) err.name = "Name is required";
		if (!form.object) err.object = "Object is required";

		// Subject is only required for Template usage
		if (form.usage === "Template" && !form.subject.trim()) {
			err.subject = "Subject is required";
		}

		setErrors(err);
		return Object.keys(err).length === 0;
	};

	// 🔥 Backend Integration - Save Template
	const handleSave = async () => {
		if (!validate()) return;

		setLoading(true);

		try {
			// Create FormData for file upload support
			const formData = new FormData();
			formData.append("name", form.name);
			formData.append("object", form.object);
			formData.append("language", form.language); // Static English for now
			formData.append("templateType", form.templateType);
			formData.append("usage", form.usage);
			formData.append("subject", form.subject || "");
			formData.append("content", form.content || "");
			formData.append("createdBy", user ? user.name : "System");
			// Add file if exists (for Document Based templates)
			if (form.templateFile) {
				formData.append("file", form.templateFile);
			}

			// API call to backend
			const response = await fetch(`${BASE_URL_SER}/templates`, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle validation errors from backend
				if (data.errors) {
					const backendErrors = {};
					data.errors.forEach((error) => {
						backendErrors[error.field] = error.message;
					});
					setErrors(backendErrors);
				} else {
					alert(data.message || "Failed to save template");
				}
			} else {
				// Success
				console.log("Template saved successfully:", data);
				if (onClose) onClose();
				navigate("/service/templates");
			}
		} catch (error) {
			console.error("Save failed:", error);
			alert("Failed to save template. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	// 🔥 Backend Integration - Save and Open Template
	const handleSaveAndOpen = async () => {
		if (!validate()) return;

		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("name", form.name);
			formData.append("object", form.object);
			formData.append("language", form.language);
			formData.append("templateType", form.templateType);
			formData.append("usage", form.usage);
			formData.append("subject", form.subject || "");
			formData.append("content", form.content || "");
			formData.append("createdBy", user ? user.name : "System");

			if (form.templateFile) {
				formData.append("file", form.templateFile);
			}

			const response = await fetch(`${BASE_URL_SER}/templates`, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					const backendErrors = {};
					data.errors.forEach((error) => {
						backendErrors[error.field] = error.message;
					});
					setErrors(backendErrors);
				} else {
					alert(data.message || "Failed to save template");
				}
			} else {
				// Success - Navigate to display page
				console.log("Template saved successfully:", data);
				if (onClose) onClose();
				navigate("/service/templates/display", {
					state: { templateData: data.data },
				});
			}
		} catch (error) {
			console.error("Save and open failed:", error);
			alert("Failed to save template. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (onClose) {
			onClose();
		} else {
			navigate("/service/templates");
		}
	};

	const containerClass = onClose
		? "create-template-modal-container"
		: "create-template-main-container";

	return (
		<div className={containerClass}>
			<div className="create-template-header">
				<div className="create-template-title">New Template</div>
				{onClose && (
					<button className="modal-close-btn" onClick={handleCancel}>
						×
					</button>
				)}
			</div>
			<form className="create-template-form">
				<div className="row">
					<div className="form-group">
						<label htmlFor="name">*Name</label>
						<input
							id="name"
							name="name"
							type="text"
							value={form.name}
							onChange={handleChange}
							className={errors.name ? "error" : ""}
							placeholder="Enter template name"
							required
						/>
						{errors.name && (
							<span className="error-message">{errors.name}</span>
						)}
					</div>
					<div className="form-group">
						<label htmlFor="language">Language</label>
						<select
							id="language"
							name="language"
							value={form.language}
							onChange={handleChange}
						>
							<option value="English">English 🇺🇸</option>
							{/* 🔮 Future: Add more languages here when ready */}
						</select>
					</div>
				</div>

				<div className="row">
					<div className="form-group">
						<label htmlFor="object">*Object</label>
						<select
							id="object"
							name="object"
							value={form.object}
							onChange={handleChange}
							className={errors.object ? "error" : ""}
							required
						>
							<option value="">Select</option>
							<option value="Account">Account</option>
							<option value="Contact">Contact</option>
							<option value="Ticket">Ticket</option>
						</select>
						{errors.object && (
							<span className="error-message">
								{errors.object}
							</span>
						)}
					</div>
					<div className="form-group">
						<label htmlFor="templateType">Template Type</label>
						<select
							id="templateType"
							name="templateType"
							value={form.templateType}
							onChange={handleChange}
						>
							<option value="Text Based">Text Based</option>
							<option value="Document Based">
								Document Based
							</option>
						</select>
					</div>
				</div>

				{/* Usage field row */}
				<div className="row">
					<div className="form-group">
						<label htmlFor="usage">Usage</label>
						<select
							id="usage"
							name="usage"
							value={form.usage}
							onChange={handleChange}
						>
							<option value="Template">Template</option>
							<option value="Signature">Signature</option>
						</select>
					</div>
					<div className="form-group">
						{/* Empty div to maintain layout */}
					</div>
				</div>

				{/* Subject field - ONLY for Template usage */}
				{form.usage === "Template" && (
					<div className="row">
						<div className="form-group full-width">
							<label htmlFor="subject">*Subject</label>
							<input
								id="subject"
								name="subject"
								type="text"
								value={form.subject}
								onChange={handleChange}
								className={errors.subject ? "error" : ""}
								placeholder="Enter subject"
								required
							/>
							{errors.subject && (
								<span className="error-message">
									{errors.subject}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Upload Template File - ONLY for Document Based */}
				{form.templateType === "Document Based" && (
					<div className="row">
						<div className="form-group full-width">
							<label htmlFor="templateFile">
								Upload Template File
							</label>
							<div className="custom-file-input-container">
								<input
									type="text"
									className="file-display-input"
									value={
										form.templateFile
											? form.templateFile.name
											: ""
									}
									placeholder="No file selected"
									readOnly
								/>
								<button
									type="button"
									className="browse-button"
									onClick={triggerFileInput}
								>
									Browse
								</button>
								<input
									id="templateFile"
									name="templateFile"
									type="file"
									onChange={handleFileChange}
									accept=".html,.htm,text/html"
									style={{ display: "none" }}
								/>
							</div>
						</div>
					</div>
				)}

				<div className="actions-row">
					<button
						type="button"
						className="cancel-button"
						onClick={handleCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						className="save-button"
						onClick={handleSave}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						type="button"
						className="save-and-new-button"
						onClick={handleSaveAndOpen}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save and Open"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateTemplate;
