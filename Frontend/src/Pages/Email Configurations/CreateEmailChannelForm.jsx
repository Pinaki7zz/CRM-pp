// Email Configurations/CreateEmailChannelForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import "./CreateEmailChannelForm.css"; // Make sure this CSS file exists

const CreateEmailChannelForm = () => {
	const [emailAddress, setEmailAddress] = useState("");
	const [emailStatus, setEmailStatus] = useState("Inactive"); // Default status
	const [isValidEmail, setIsValidEmail] = useState(false); // For email format validity
	const [validationMessage, setValidationMessage] = useState(""); // For user feedback messages
	const [isVerifying, setIsVerifying] = useState(false); // To disable button during verification
	const [doesEmailExist, setDoesEmailExist] = useState(null); // NEW: null=unknown, true=exists, false=doesn't exist

	const [channelId, setChannelId] = useState("");
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

	// Basic front-end email validation function using regex
	const validateEmailFormat = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleEmailChange = (e) => {
		const newEmail = e.target.value;
		setEmailAddress(newEmail);
		setDoesEmailExist(null); // Reset existence status when email changes

		if (newEmail.trim() === "") {
			setIsValidEmail(false);
			setValidationMessage("");
			setEmailStatus("Inactive");
		} else if (validateEmailFormat(newEmail)) {
			setIsValidEmail(true);
			setValidationMessage("Valid email format.");
			// Keep status as Inactive until verified, don't change if already verifying
			if (!isVerifying && emailStatus !== "Active") {
				setEmailStatus("Inactive");
			}
		} else {
			setIsValidEmail(false);
			setValidationMessage("Invalid email format.");
			setEmailStatus("Inactive");
		}
	};

	// Function to simulate email existence check (mock API call)
	const mockCheckEmailExistence = (email) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Simulate some emails existing and others not
				const knownEmails = [
					"existing@example.com",
					"test.france@mascot.in",
					"user@domain.com",
				];
				const exists = knownEmails.includes(email.toLowerCase());
				resolve(exists);
			}, 1500); // Simulate API delay
		});
	};

	const handleVerifyEmail = async () => {
		if (!isValidEmail) {
			setValidationMessage("Please enter a valid email format first.");
			return;
		}

		setIsVerifying(true); // Disable button
		setEmailStatus("Verifying...");
		setValidationMessage(
			"Verifying email address and checking existence..."
		);
		setDoesEmailExist(null); // Reset before check

		try {
			const exists = await mockCheckEmailExistence(emailAddress);
			setDoesEmailExist(exists);

			if (exists) {
				setEmailStatus("Active");
				setValidationMessage("Email verified and exists!");
				console.log("Email verified and exists.");
			} else {
				setEmailStatus("Inactive");
				setValidationMessage(
					"Email verified but does NOT exist in our records. Please check the address."
				);
				console.log("Email does not exist.");
			}
		} catch (error) {
			console.error("Verification failed:", error);
			setEmailStatus("Inactive");
			setValidationMessage(
				"Verification failed due to an error. Please try again."
			);
		} finally {
			setIsVerifying(false); // Re-enable button
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!isValidEmail) {
			toast.error("Please ensure the email format is valid.");
			return;
		}
		if (doesEmailExist === null) {
			toast.error(
				"Please verify the email address to check its existence."
			);
			return;
		}
		if (doesEmailExist === false) {
			toast.error(
				"The entered email does not exist. Please use an existing email address."
			);
			return;
		}
		if (emailStatus !== "Active") {
			toast.error(
				"Email verification process is not complete or failed. Status is not Active."
			);
			return;
		}

		console.log({
			emailAddress,
			emailStatus,
			channelId,
			channelName,
			senderDisplayName,
			channelDirection,
			subjectPattern,
			channelType,
			doesEmailExist, // Include this in submission data
		});
		toast.success("E-Mail channel created");
		// You might want to reset the form or navigate back after submission
	};

	return (
		<div className="create-email-channel-form-container">
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
							// Button is enabled only if email format is valid and not currently verifying
							disabled={
								!isValidEmail ||
								isVerifying ||
								emailStatus === "Active"
							}
						>
							{isVerifying
								? "Verifying..."
								: "Verify E-Mail Address"}
						</button>
					</div>
					{/* Validation Message */}
					{validationMessage && (
						<p
							className={`validation-message ${
								isValidEmail
									? doesEmailExist === true
										? "success"
										: doesEmailExist === false
										? "error"
										: ""
									: "error"
								// Refined class logic: success only if valid format AND exists
							}`}
						>
							{validationMessage}
						</p>
					)}
					<div className="form-status">
						<strong>Status:</strong>{" "}
						<span
							className={`status-badge ${emailStatus
								.toLowerCase()
								.replace(/\W/g, "")}`}
						>
							{emailStatus}
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
							value={channelId}
							onChange={(e) => setChannelId(e.target.value)}
							placeholder="e-mail channel id"
							maxLength={8}
							required
						/>
						<p className="input-hint">8 characters maximum</p>
					</div>

					<div className="form-row">
						<label htmlFor="channelName">Email Channel Name</label>
						<input
							type="text"
							id="channelName"
							value={channelName}
							onChange={(e) => setChannelName(e.target.value)}
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

				{/* Submit Button */}
				<div className="form-actions">
					<button type="submit" className="submit-button">
						Create Channel
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateEmailChannelForm;
