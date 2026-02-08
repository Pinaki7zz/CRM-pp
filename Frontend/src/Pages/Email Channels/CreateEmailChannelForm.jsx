import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateEmailChannelForm.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const CreateEmailChannelForm = ({ onCancel }) => {
	const navigate = useNavigate();

	const [emailAddress, setEmailAddress] = useState("");
	const [channelStatus, setChannelStatus] = useState("Inactive");
	const [isValidEmail, setIsValidEmail] = useState(false);
	const [validationMessage, setValidationMessage] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Channel state for Activate/Deactivate
	const [isActive, setIsActive] = useState(false);

	const [channelId, setChannelId] = useState(""); // Empty until created
	const [channelName, setChannelName] = useState("");
	const [senderDisplayName, setSenderDisplayName] = useState("");
	const [channelDirection, setChannelDirection] = useState(
		"Inbound and Outbound"
	);
	const [subjectPattern, setSubjectPattern] = useState(
		"[Ticket: 123456] Subject"
	);
	const [channelType, setChannelType] = useState(
		"Customer Service - Business to business (B2B)"
	);

	const validateEmailFormat = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (e) => {
		const newEmail = e.target.value;
		setEmailAddress(newEmail);
		setIsEmailVerified(false);

		if (newEmail.trim() === "") {
			setIsValidEmail(false);
			setValidationMessage("");
		} else if (validateEmailFormat(newEmail)) {
			setIsValidEmail(true);
			setValidationMessage("Valid email format.");
		} else {
			setIsValidEmail(false);
			setValidationMessage("Invalid email format.");
		}
	};

	// Real backend email verification
	const checkEmailVerification = async (email) => {
		try {
			// First check if already verified
			const statusResponse = await fetch(
				`${BASE_URL_CM}/email-channels/verification-status/${encodeURIComponent(
					email
				)}`
			);
			const statusResult = await statusResponse.json();

			if (statusResponse.ok && statusResult.data.isVerified) {
				return { exists: true, verified: true };
			}

			// Send verification email
			const verifyResponse = await fetch(
				`${BASE_URL_CM}/email-channels/verify-email`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				}
			);

			const verifyResult = await verifyResponse.json();

			if (!verifyResponse.ok) {
				throw new Error(
					verifyResult.message || "Failed to verify email"
				);
			}

			return {
				exists: verifyResult.sent || verifyResult.verified,
				verified: verifyResult.verified,
				sent: verifyResult.sent,
			};
		} catch (error) {
			console.error("Email verification error:", error);
			throw error;
		}
	};

	const handleVerifyEmail = async () => {
		if (!isValidEmail) {
			setValidationMessage("Please enter a valid email format first.");
			return;
		}

		setIsVerifying(true);
		setValidationMessage("Verifying email address...");

		try {
			const result = await checkEmailVerification(emailAddress);

			if (result.verified) {
				setValidationMessage("Email verified successfully!");
				setIsEmailVerified(true);
			} else if (result.sent) {
				setValidationMessage(
					"Verification email sent! Please check your inbox and click the verification link."
				);
				// Start polling for verification
				startVerificationPolling();
			} else {
				setValidationMessage(
					"Email verification failed. Please try again."
				);
				setIsEmailVerified(false);
			}
		} catch (error) {
			setValidationMessage(
				"Verification failed due to an error. Please try again."
			);
			setIsEmailVerified(false);
			console.error("Verification error:", error);
		} finally {
			setIsVerifying(false);
		}
	};

	const startVerificationPolling = () => {
		const pollInterval = setInterval(async () => {
			try {
				const statusResponse = await fetch(
					`${BASE_URL_CM}/email-channels/verification-status/${encodeURIComponent(
						emailAddress
					)}`
				);
				const statusResult = await statusResponse.json();

				if (statusResponse.ok && statusResult.data.isVerified) {
					setIsEmailVerified(true);
					setValidationMessage("Email successfully verified!");
					clearInterval(pollInterval);
				}
			} catch (error) {
				console.error("Polling error:", error);
				clearInterval(pollInterval);
			}
		}, 5000); // Poll every 5 seconds

		// Stop polling after 5 minutes
		setTimeout(() => clearInterval(pollInterval), 300000);
	};

	// Handle activate/deactivate buttons
	const handleActivate = () => {
		setIsActive(true);
		setChannelStatus("Active");
	};

	const handleDeactivate = () => {
		setIsActive(false);
		setChannelStatus("Inactive");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isValidEmail) {
			alert("Please ensure the email format is valid.");
			return;
		}
		if (!isEmailVerified) {
			alert("Please verify the email address first.");
			return;
		}
		if (!channelName.trim()) {
			alert(
				"Please enter a Channel Name. It is required for generating the Channel ID."
			);
			return;
		}

		setIsSubmitting(true);

		try {
			// Map frontend values to backend format
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

			const backendData = {
				email: emailAddress,
				channelName: channelName.trim(),
				senderDisplayName: senderDisplayName || undefined,
				channelDirection: channelDirectionMap[channelDirection],
				subjectPattern: subjectPatternMap[subjectPattern],
				channelType: channelTypeMap[channelType],
			};

			const response = await fetch(`${BASE_URL_CM}/email-channels`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(backendData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to create email channel"
				);
			}

			// Set the auto-generated channel ID from backend
			setChannelId(result.data.channelId);

			// If channel was set to active, activate it via API
			if (isActive) {
				try {
					await fetch(
						`${BASE_URL_CM}/email-channels/${result.data.channelId}/activate`,
						{
							method: "POST",
						}
					);
				} catch (error) {
					console.error("Failed to activate channel:", error);
					// Don't fail the whole process if activation fails
				}
			}

			alert(
				`E-Mail Channel Created Successfully! Channel ID: ${result.data.channelId}`
			);
			console.log("Channel created:", result.data);

			// Navigate to EmailAddressGrid page after alert
			navigate("/channels/emails");
		} catch (error) {
			console.error("Create channel error:", error);
			alert(`Failed to create channel: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate(-1);
		}
	};

	return (
		<div className="create-email-channel-form-container">
			{/* Activate/Deactivate Buttons Top-Right */}
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

			<h1>Create New E-Mail Channel</h1>

			<form onSubmit={handleSubmit}>
				{/* E-Mail Address Section */}
				<div className="form-section">
					<div className="form-row">
						<label htmlFor="emailAddress">*E-Mail Address</label>
						<input
							type="email"
							id="emailAddress"
							value={emailAddress}
							onChange={handleEmailChange}
							placeholder="test.france@mascot.in"
							required
						/>
						<button
							type="button"
							className="verify-email-button"
							onClick={handleVerifyEmail}
							disabled={
								!isValidEmail || isVerifying || isEmailVerified
							}
						>
							{isVerifying
								? "Verifying..."
								: isEmailVerified
								? "Verified"
								: "Verify E-Mail Address"}
						</button>
					</div>
					{validationMessage && (
						<p
							className={`validation-message ${
								isValidEmail
									? isEmailVerified
										? "success"
										: ""
									: "error"
							}`}
						>
							{validationMessage}
						</p>
					)}
					<div className="form-status">
						<strong>Status:</strong>{" "}
						<span
							className={`status-badge ${channelStatus.toLowerCase()}`}
						>
							{channelStatus}
						</span>
					</div>
				</div>

				{/* E-Mail Channel Setup */}
				<div className="form-section">
					<h2>E-Mail Channel Setup</h2>
					<div className="form-row">
						<label htmlFor="channelId">*Email Channel ID</label>
						<input
							type="text"
							id="channelId"
							value={
								channelId ||
								"Will be auto-generated after creation"
							}
							disabled
							style={{
								backgroundColor: "#f9fafb",
								color: "#6b7280",
							}}
						/>
						<p className="input-hint">
							{channelId
								? "Generated Channel ID"
								: "Auto-generated based on Channel Name and Type"}
						</p>
					</div>

					<div className="form-row">
						<label htmlFor="channelName">*Email Channel Name</label>
						<input
							type="text"
							id="channelName"
							value={channelName}
							onChange={(e) => setChannelName(e.target.value)}
							placeholder="e.g., Sales Denmark, Support Global, Marketing EMEA"
							required
						/>
					</div>

					<div className="form-row">
						<label htmlFor="senderDisplayName">
							Sender Display Name
						</label>
						<input
							type="text"
							id="senderDisplayName"
							value={senderDisplayName}
							onChange={(e) =>
								setSenderDisplayName(e.target.value)
							}
							placeholder="display name of the senders"
						/>
					</div>
					<p className="form-description">
						These are the ID and name used to represent this
						communication channel in the system.
					</p>
				</div>

				{/* Channel Direction */}
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
								checked={channelDirection === "Inbound Only"}
								onChange={(e) =>
									setChannelDirection(e.target.value)
								}
							/>
							Inbound Only
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelDirection"
								value="Inbound and Outbound"
								checked={
									channelDirection === "Inbound and Outbound"
								}
								onChange={(e) =>
									setChannelDirection(e.target.value)
								}
							/>
							Inbound and Outbound
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelDirection"
								value="Outbound Only"
								checked={channelDirection === "Outbound Only"}
								onChange={(e) =>
									setChannelDirection(e.target.value)
								}
							/>
							Outbound Only
						</label>
					</div>
				</div>

				{/* Subject Pattern */}
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
									subjectPattern ===
									"[Ticket: 123456] Subject"
								}
								onChange={(e) =>
									setSubjectPattern(e.target.value)
								}
							/>
							[Ticket: 123456] Subject
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="subjectPattern"
								value="123456 - Subject"
								checked={subjectPattern === "123456 - Subject"}
								onChange={(e) =>
									setSubjectPattern(e.target.value)
								}
							/>
							123456 - Subject
						</label>
					</div>
				</div>

				{/* Channel Type */}
				<div className="form-section">
					<label className="form-label-heading">Channel Type</label>
					<div className="radio-group">
						<label className="radio-label">
							<input
								type="radio"
								name="channelType"
								value="Customer Service - Business to business (B2B)"
								checked={
									channelType ===
									"Customer Service - Business to business (B2B)"
								}
								onChange={(e) => setChannelType(e.target.value)}
							/>
							Customer Service - Business to business (B2B)
						</label>
						<label className="radio-label">
							<input
								type="radio"
								name="channelType"
								value="Customer Service - Business to consumer (B2C)"
								checked={
									channelType ===
									"Customer Service - Business to consumer (B2C)"
								}
								onChange={(e) => setChannelType(e.target.value)}
							/>
							Customer Service - Business to consumer (B2C)
						</label>
					</div>
				</div>

				{/* Submit Button - DISABLED until email verified and channel name entered */}
				<div className="form-actions">
					<button
						type="submit"
						className="submit-button"
						disabled={
							isSubmitting ||
							!isEmailVerified ||
							!channelName.trim()
						}
						style={
							isSubmitting ||
							!isEmailVerified ||
							!channelName.trim()
								? { opacity: 0.6, cursor: "not-allowed" }
								: {}
						}
					>
						{isSubmitting
							? "Creating Channel..."
							: "Create Channel"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateEmailChannelForm;
