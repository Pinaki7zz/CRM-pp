import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditEmailChannelForm.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const EditEmailChannelForm = ({ onCancel }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [formState, setFormState] = useState(null);
	const [isActive, setIsActive] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Map backend data to frontend format
	const mapBackendToFrontend = (backendData) => {
		const channelDirectionMap = {
			INBOUND_ONLY: "Inbound Only",
			INBOUND_OUTBOUND: "Inbound and Outbound",
			OUTBOUND_ONLY: "Outbound Only",
		};

		const subjectPatternMap = {
			TICKET_SUBJECT: "[Ticket: 123456] Subject",
			TICKET_DASH: "123456 - Subject",
		};

		const channelTypeMap = {
			B2B: "Customer Service - Business to business (B2B)",
			B2C: "Customer Service - Business to consumer (B2C)",
		};

		return {
			id: backendData.channelId,
			email: backendData.email,
			template: backendData.template || "",
			channelDirection:
				channelDirectionMap[backendData.channelDirection] ||
				backendData.channelDirection,
			channelType:
				channelTypeMap[backendData.channelType] ||
				backendData.channelType,
			subjectPattern:
				subjectPatternMap[backendData.subjectPattern] ||
				backendData.subjectPattern,
			status: backendData.isActive ? "Active" : "Inactive",
			channelName: backendData.channelName || "",
			senderDisplayName: backendData.senderDisplayName || "",
			isActive: backendData.isActive,
		};
	};

	// Map frontend data to backend format
	const mapToBackendFormat = (frontendData) => {
		const channelDirectionMap = {
			"Inbound Only": "INBOUND_ONLY",
			"Inbound and Outbound": "INBOUND_OUTBOUND",
			"Outbound Only": "OUTBOUND_ONLY",
		};

		const subjectPatternMap = {
			"[Ticket: 123456] Subject": "TICKET_SUBJECT",
			"123456 - Subject": "TICKET_DASH",
		};

		const channelTypeMap = {
			"Customer Service - Business to business (B2B)": "B2B",
			"Customer Service - Business to consumer (B2C)": "B2C",
		};

		return {
			channelName: frontendData.channelName,
			senderDisplayName: frontendData.senderDisplayName,
			template: frontendData.template,
			channelDirection:
				channelDirectionMap[frontendData.channelDirection],
			subjectPattern: subjectPatternMap[frontendData.subjectPattern],
			channelType: channelTypeMap[frontendData.channelType],
		};
	};

	useEffect(() => {
		const fetchChannel = async () => {
			try {
				setLoading(true);
				setError(null);
				const decodedId = decodeURIComponent(id);

				const response = await fetch(
					`${BASE_URL_CM}/email-channels/${encodeURIComponent(
						decodedId
					)}`
				);
				const result = await response.json();

				if (!response.ok) {
					throw new Error(
						result.message || "Failed to fetch email channel"
					);
				}

				const mappedChannel = mapBackendToFrontend(result.data);
				setFormState(mappedChannel);
				setIsActive(mappedChannel.status === "Active");
			} catch (error) {
				console.error("Failed to fetch email channel:", error);
				setError(`Failed to load email channel: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchChannel();
		}
	}, [id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleActivate = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_CM}/email-channels/${encodeURIComponent(
					formState.id
				)}/activate`,
				{
					method: "POST",
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to activate email channel"
				);
			}

			setIsActive(true);
			setFormState((prev) => ({
				...prev,
				status: "Active",
				isActive: true,
			}));
			alert("Channel activated successfully!");
		} catch (error) {
			console.error("Activate error:", error);
			alert(`Failed to activate channel: ${error.message}`);
		}
	};

	const handleDeactivate = async () => {
		try {
			const response = await fetch(
				`${BASE_URL_CM}/email-channels/${encodeURIComponent(
					formState.id
				)}/deactivate`,
				{
					method: "POST",
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to deactivate email channel"
				);
			}

			setIsActive(false);
			setFormState((prev) => ({
				...prev,
				status: "Inactive",
				isActive: false,
			}));
			alert("Channel deactivated successfully!");
		} catch (error) {
			console.error("Deactivate error:", error);
			alert(`Failed to deactivate channel: ${error.message}`);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setIsSubmitting(true);

		try {
			const backendData = mapToBackendFormat(formState);

			const response = await fetch(
				`${BASE_URL_CM}/email-channels/${encodeURIComponent(
					formState.id
				)}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(backendData),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to update email channel"
				);
			}

			alert("Channel updated successfully!");
			navigate("/channels/emails");
		} catch (error) {
			console.error("Update error:", error);
			alert(`Failed to update channel: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => (onCancel ? onCancel() : navigate(-1));

	if (loading) {
		return (
			<div className="create-email-channel-form-container">
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						fontSize: "16px",
						color: "#6b7280",
					}}
				>
					Loading email channel...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="create-email-channel-form-container">
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						fontSize: "16px",
						color: "#dc2626",
						backgroundColor: "#fef2f2",
						border: "1px solid #fecaca",
						borderRadius: "8px",
						margin: "1rem",
					}}
				>
					{error}
					<button onClick={handleBack} style={{ marginLeft: "10px" }}>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	if (!formState) {
		return (
			<div className="create-email-channel-form-container">
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						fontSize: "16px",
						color: "#dc2626",
					}}
				>
					Email channel not found
				</div>
			</div>
		);
	}

	return (
		<div className="create-email-channel-form-container">
			{/* Activate/Deactivate */}
			<div className="channel-status-bar">
				<button
					className="activate-btn"
					onClick={handleActivate}
					disabled={isActive}
				>
					Activate
				</button>
				<button
					className="deactivate-btn"
					onClick={handleDeactivate}
					disabled={!isActive}
				>
					Deactivate
				</button>
			</div>

			{/* Back Button */}
			<button
				type="button"
				onClick={handleBack}
				style={{
					marginBottom: "1.5rem",
					padding: "8px 20px",
					background: "#f3f4f6",
					border: "1px solid #d1d5db",
					borderRadius: "4px",
					cursor: "pointer",
					fontSize: "14px",
					color: "#374151",
				}}
			>
				← Back
			</button>

			<h1>Edit E-Mail Channel</h1>
			<form onSubmit={handleSubmit}>
				{/* ------- Email Section -------- */}
				<div className="form-section">
					<div className="form-row">
						<label htmlFor="emailAddress">*E-Mail Address </label>
						<input
							type="email"
							id="emailAddress"
							value={formState.email}
							disabled
							style={{
								backgroundColor: "#f9fafb",
								color: "#6b7280",
							}}
						/>
					</div>
					<div className="form-status">
						<strong>Status:</strong>{" "}
						<span
							className={`status-badge ${
								isActive ? "active" : "inactive"
							}`}
						>
							{isActive ? "ACTIVE" : "INACTIVE"}
						</span>
					</div>
				</div>

				{/* ------- Channel Setup -------- */}
				<div className="form-section">
					<h2>E-Mail Channel Setup</h2>
					<div className="form-row">
						<label htmlFor="channelId">*Email Channel ID </label>
						<input
							type="text"
							id="channelId"
							value={formState.id}
							disabled
							style={{
								backgroundColor: "#f9fafb",
								color: "#6b7280",
							}}
						/>
						<p className="input-hint">System generated ID</p>
					</div>

					<div className="form-row">
						<label htmlFor="channelName">Email Channel Name</label>
						<input
							type="text"
							id="channelName"
							name="channelName"
							value={formState.channelName || ""}
							onChange={handleChange}
							placeholder="e-mail channel name"
						/>
					</div>

					<div className="form-row">
						<label htmlFor="senderDisplayName">
							Sender Display Name
						</label>
						<input
							type="text"
							id="senderDisplayName"
							name="senderDisplayName"
							value={formState.senderDisplayName || ""}
							onChange={handleChange}
							placeholder="display name of the senders"
						/>
					</div>

					<div className="form-row">
						<label htmlFor="template">Template Name</label>
						<input
							type="text"
							id="template"
							name="template"
							value={formState.template || ""}
							onChange={handleChange}
							placeholder="template name"
						/>
					</div>
					<p className="form-description">
						These are the ID and name used to represent this
						communication channel in the system.
					</p>
				</div>

				{/* ------- Channel Direction -------- */}
				<div className="form-section">
					<label className="form-label-heading">
						Channel Direction
					</label>
					<div className="radio-group">
						<label className="radio-label">
							<input
								type="radio"
								name="channelDirection"
								value="Inbound Only"
								checked={
									formState.channelDirection ===
									"Inbound Only"
								}
								onChange={handleChange}
							/>
							Inbound Only
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelDirection"
								value="Inbound and Outbound"
								checked={
									formState.channelDirection ===
									"Inbound and Outbound"
								}
								onChange={handleChange}
							/>
							Inbound and Outbound
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelDirection"
								value="Outbound Only"
								checked={
									formState.channelDirection ===
									"Outbound Only"
								}
								onChange={handleChange}
							/>
							Outbound Only
						</label>
					</div>
				</div>

				{/* ------- Subject Pattern -------- */}
				<div className="form-section">
					<label className="form-label-heading">
						Subject Pattern
					</label>
					<div className="radio-group">
						<label className="radio-label">
							<input
								type="radio"
								name="subjectPattern"
								value="[Ticket: 123456] Subject"
								checked={
									formState.subjectPattern ===
									"[Ticket: 123456] Subject"
								}
								onChange={handleChange}
							/>
							[Ticket: 123456] Subject
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="subjectPattern"
								value="123456 - Subject"
								checked={
									formState.subjectPattern ===
									"123456 - Subject"
								}
								onChange={handleChange}
							/>
							123456 - Subject
						</label>
					</div>
				</div>

				{/* ------- Channel Type -------- */}
				<div className="form-section">
					<label className="form-label-heading">Channel Type</label>
					<div className="radio-group">
						<label className="radio-label">
							<input
								type="radio"
								name="channelType"
								value="Customer Service - Business to business (B2B)"
								checked={
									formState.channelType ===
									"Customer Service - Business to business (B2B)"
								}
								onChange={handleChange}
							/>
							Customer Service - Business to business (B2B)
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelType"
								value="Customer Service - Business to consumer (B2C)"
								checked={
									formState.channelType ===
									"Customer Service - Business to consumer (B2C)"
								}
								onChange={handleChange}
							/>
							Customer Service - Business to consumer (B2C)
						</label>
					</div>
				</div>

				{/* Submit Button */}
				<div className="form-actions">
					<button
						type="submit"
						className="submit-button"
						disabled={isSubmitting}
						style={
							isSubmitting
								? { opacity: 0.6, cursor: "not-allowed" }
								: {}
						}
					>
						{isSubmitting
							? "Updating Channel..."
							: "Update Channel"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditEmailChannelForm;
