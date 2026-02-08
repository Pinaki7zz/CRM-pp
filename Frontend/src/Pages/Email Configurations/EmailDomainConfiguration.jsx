import React, { useState, useEffect } from "react";
import "./EmailDomainConfiguration.css"; // Assuming your CSS is correctly linked

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;
const API_BASE_URL = `${BASE_URL_CM}/domain-auth`; // IMPORTANT: Match your backend URL and port

const EmailDomainConfiguration = () => {
	// State for the domain input
	const [domainInput, setDomainInput] = useState("");

	// States for generated records
	const [spfRecord, setSpfRecord] = useState("");
	const [dkimRecord, setDkimRecord] = useState("");
	const [dmarcRecord, setDmarcRecord] = useState("");
	const [dkimSelector, setDkimSelector] = useState(""); // Store the selector for verification

	// States for UI feedback
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(""); // General success/info messages

	// States for verification status
	const [verificationStatus, setVerificationStatus] = useState({
		spf: "pending", // 'pending', 'valid', 'not_found', 'invalid_include'
		dkim: "pending", // 'pending', 'valid', 'not_found'
		dmarc: "pending", // 'pending', 'valid', 'not_found'
	});

	// States for copy feedback
	const [copiedMessage, setCopiedMessage] = useState("");
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);
	const [highlightedRecordType, setHighlightedRecordType] = useState(null); // 'spf', 'dkim', 'dmarc'

	// --- NEW: State to trigger text blink on copy buttons ---
	const [blinkingButton, setBlinkingButton] = useState(null); // 'spf', 'dkim', or 'dmarc'

	// Effect to hide copied message and remove highlight after a delay
	useEffect(() => {
		let timer;
		if (showCopiedMessage) {
			timer = setTimeout(() => {
				setShowCopiedMessage(false);
				setCopiedMessage("");
				setHighlightedRecordType(null); // Remove highlight
			}, 2000); // Message visible for 2 seconds
		}
		return () => clearTimeout(timer); // Cleanup timer on unmount or if message hides
	}, [showCopiedMessage]);

	// --- Handler for Generate Records Button ---
	const handleGenerateRecords = async () => {
		setError(null);
		setMessage("");
		setLoading(true);
		setSpfRecord("");
		setDkimRecord("");
		setDmarcRecord("");
		setDkimSelector("");
		setVerificationStatus({
			spf: "pending",
			dkim: "pending",
			dmarc: "pending",
		}); // Reset verification status
		setShowCopiedMessage(false); // Hide any previous copy message
		setHighlightedRecordType(null); // Clear highlight

		if (!domainInput.trim()) {
			setError("Please enter a domain name.");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/generate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ domain: domainInput }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to generate records."
				);
			}

			const data = await response.json();
			setSpfRecord(data.spf);
			setDkimRecord(data.dkim);
			setDmarcRecord(data.dmarc);
			setDkimSelector(data.dkimSelector); // Store the selector
			setMessage(
				"Records generated successfully! Please add them to your DNS settings."
			);
		} catch (err) {
			console.error("Generation Error:", err);
			setError(
				err.message || "An unexpected error occurred during generation."
			);
		} finally {
			setLoading(false);
		}
	};

	// --- Handler for Verify DNS Records Button ---
	const handleVerifyRecords = async () => {
		setError(null);
		setMessage("");
		setLoading(true);
		setVerificationStatus({
			spf: "pending",
			dkim: "pending",
			dmarc: "pending",
		}); // Reset status for new verification
		setShowCopiedMessage(false); // Hide any previous copy message
		setHighlightedRecordType(null); // Clear highlight

		if (!domainInput.trim()) {
			setError("Please enter a domain name to verify.");
			setLoading(false);
			return;
		}

		// Attempt to extract DKIM selector if not in state (e.g., page refresh)
		let currentDkimSelector = dkimSelector;
		if (!currentDkimSelector && dkimRecord) {
			const match = dkimRecord.match(/^([a-zA-Z0-9_-]+)\._domainkey/);
			if (match && match[1]) {
				currentDkimSelector = match[1];
				setDkimSelector(match[1]); // Update state
			}
		}

		try {
			const response = await fetch(`${API_BASE_URL}/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					domain: domainInput,
					dkimSelector: currentDkimSelector,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to verify records.");
			}

			const data = await response.json();
			setVerificationStatus(data); // Update with the verification results
			setMessage(
				"DNS records verification complete. Check statuses below."
			);
		} catch (err) {
			console.error("Verification Error:", err);
			setError(
				err.message ||
					"An unexpected error occurred during verification."
			);
		} finally {
			setLoading(false);
		}
	};

	// --- Handler for Copy Button with quick text blink effect ---
	const handleCopy = (recordType, recordValue) => {
		if (recordValue) {
			navigator.clipboard
				.writeText(recordValue)
				.then(() => {
					setCopiedMessage(
						`Copied ${recordType.toUpperCase()} record to clipboard!`
					);
					setShowCopiedMessage(true);
					setHighlightedRecordType(recordType);

					// Trigger text blinking on button
					setBlinkingButton(recordType);
					setTimeout(() => setBlinkingButton(null), 300); // 300ms blink
				})
				.catch((err) => {
					console.error("Failed to copy:", err);
					setError("Failed to copy text. Please try manually.");
				});
		}
	};

	// Helper to determine status icon/color
	const getStatusIndicator = (status) => {
		switch (status) {
			case "valid":
				return (
					<span style={{ color: "green", fontWeight: "bold" }}>
						✅ Valid
					</span>
				);
			case "not_found":
				return (
					<span style={{ color: "red", fontWeight: "bold" }}>
						❌ Not Found
					</span>
				);
			case "invalid_include":
				return (
					<span style={{ color: "orange", fontWeight: "bold" }}>
						⚠️ Invalid (Missing Include)
					</span>
				);
			case "pending":
				return <span style={{ color: "gray" }}>... Pending Check</span>;
			default:
				return <span style={{ color: "gray" }}>... Unknown</span>;
		}
	};

	return (
		<div className="email-domain-config-container">
			<h1>Email Domain Configuration</h1>

			{/* Section 1: Generate Records */}
			<div className="section">
				<h2>1. Email Authentication</h2>
				<div className="input-group">
					<label htmlFor="your-domain">Your Domain</label>
					<input
						type="text"
						id="your-domain"
						placeholder="e.g., yourcompany.com"
						value={domainInput}
						onChange={(e) => setDomainInput(e.target.value)}
						disabled={loading}
					/>
					<button
						className="generate-button"
						onClick={handleGenerateRecords}
						disabled={loading}
					>
						{loading && !spfRecord
							? "Generating..."
							: "Generate SPF, DKIM, DMARC Records"}
					</button>
				</div>
			</div>

			{/* Section 2: Display Generated Records */}
			{(spfRecord || dkimRecord || dmarcRecord) && (
				<div className="section generated-records-display">
					<h3>Add these to your DNS settings:</h3>
					<p className="info-text">
						Copy these records and paste them into your domain's DNS
						TXT records. DNS changes can take time to propagate.
					</p>

					<div className="record-item">
						<strong>SPF:</strong>
						<pre
							className={`record-value ${
								highlightedRecordType === "spf"
									? "highlight-copy"
									: ""
							}`}
						>
							{spfRecord || "Not yet generated"}
						</pre>
						{spfRecord && (
							<button
								className="copy-button"
								onClick={() => handleCopy("spf", spfRecord)}
							>
								<span
									className={
										blinkingButton === "spf"
											? "text-blink"
											: ""
									}
								>
									Copy
								</span>
							</button>
						)}
					</div>

					<div className="record-item">
						<strong>DKIM:</strong>
						<pre
							className={`record-value ${
								highlightedRecordType === "dkim"
									? "highlight-copy"
									: ""
							}`}
						>
							{dkimRecord || "Not yet generated"}
						</pre>
						{dkimRecord && (
							<button
								className="copy-button"
								onClick={() => handleCopy("dkim", dkimRecord)}
							>
								<span
									className={
										blinkingButton === "dkim"
											? "text-blink"
											: ""
									}
								>
									Copy
								</span>
							</button>
						)}
					</div>

					<div className="record-item">
						<strong>DMARC:</strong>
						<pre
							className={`record-value ${
								highlightedRecordType === "dmarc"
									? "highlight-copy"
									: ""
							}`}
						>
							{dmarcRecord || "Not yet generated"}
						</pre>
						{dmarcRecord && (
							<button
								className="copy-button"
								onClick={() => handleCopy("dmarc", dmarcRecord)}
							>
								<span
									className={
										blinkingButton === "dmarc"
											? "text-blink"
											: ""
									}
								>
									Copy
								</span>
							</button>
						)}
					</div>
				</div>
			)}

			{/* Section 3: Verify Records */}
			<div className="section">
				<button
					className="verify-button"
					onClick={handleVerifyRecords}
					disabled={loading || !domainInput.trim()}
				>
					{loading && !spfRecord
						? "Verifying..."
						: "Verify DNS Records"}
				</button>

				{/* Display Verification Status */}
				{domainInput.trim() && (
					<div className="verification-status-display">
						<h4>Verification Status:</h4>
						<p>
							SPF Status:{" "}
							{getStatusIndicator(verificationStatus.spf)}
						</p>
						<p>
							DKIM Status:{" "}
							{getStatusIndicator(verificationStatus.dkim)}
						</p>
						<p>
							DMARC Status:{" "}
							{getStatusIndicator(verificationStatus.dmarc)}
						</p>
					</div>
				)}
			</div>

			{/* Feedback Messages */}
			{loading && (
				<p className="info-message">Processing your request...</p>
			)}
			{error && <p className="error-message">Error: {error}</p>}
			{message && <p className="success-message">{message}</p>}

			{/* Copied to Clipboard Toast Message */}
			{showCopiedMessage && (
				<div className="copied-toast">{copiedMessage}</div>
			)}
		</div>
	);
};

export default EmailDomainConfiguration;
