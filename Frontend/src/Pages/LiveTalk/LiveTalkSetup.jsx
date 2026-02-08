import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	ArrowLeft,
	Save,
	MessageSquare,
	Settings,
	Loader2,
	Copy,
	Eye,
} from "lucide-react";
import "./LiveTalkSetup.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const LiveTalkSetup = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState("build");
	const [config, setConfig] = useState({
		// Build Tab
		chatId: "",
		name: "",
		companyName: "",
		welcomeMessage: "Hi! How can we help you today?",
		enableKnowledgeBase: false,
		autoAssignConversations: false,
		keywordTeamPairs: [{ keyword: "", team: "" }],
		fallbackTeam: "",
		emailCaptureWhen: "never",
		emailCaptureMessage: "Please provide your email to continue",

		// Target Tab
		showOnAllPages: true,
		specificPages: "",
		excludePages: "",
		websiteUrl: "",

		// Display Tab
		accentColor: "#3b82f6",
		chatPlacement: "bottom-right",
		chatAvatar: "",
		showAvatar: true,

		// Options Tab
		language: "english",
		consentRequired: false,
		feedbackSurvey: false,
		autoAssignment: true,

		// Backend fields
		ownerUserId: "current-user-id", // Replace with actual user ID from auth
	});

	const [isActive, setIsActive] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [chatflowId, setChatflowId] = useState(null);
	const [showPreview, setShowPreview] = useState(false);

	// API Base URL
	const API_BASE_URL = `${BASE_URL_CM}/live-talk`;

	// Enhanced API request function with better error handling
	const apiRequest = useCallback(async (endpoint, options = {}) => {
		const url = `${API_BASE_URL}${endpoint}`;

		const config = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		if (config.body && typeof config.body !== "string") {
			config.body = JSON.stringify(config.body);
		}

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				// Better error handling for validation errors
				if (data.errors && Array.isArray(data.errors)) {
					const errorMessage = data.errors
						.map((err) => `${err.field}: ${err.message}`)
						.join("\n");
					throw new Error(`Validation Error:\n${errorMessage}`);
				}
				throw new Error(
					data.message || `HTTP error! status: ${response.status}`
				);
			}

			return data;
		} catch (error) {
			console.error(`API Error (${endpoint}):`, error);
			throw error;
		}
	}, []);

	// Fetch chatflow for editing
	const fetchChatflowById = useCallback(
		async (chatflowId) => {
			try {
				setIsLoading(true);
				const response = await apiRequest(`/chatflows/${chatflowId}`);

				if (response.success && response.data) {
					const chatflow = response.data;

					// Map backend data to frontend config with correct field names
					setConfig((prev) => ({
						...prev,
						id: chatflow.id,
						chatId: chatflow.chatId || "",
						name: chatflow.name || "",
						companyName: chatflow.companyName || "",
						welcomeMessage:
							chatflow.welcomeMessage || prev.welcomeMessage,
						enableKnowledgeBase:
							chatflow.enableKnowledgeBase || false,
						autoAssignConversations:
							chatflow.autoAssignConversations || false,
						keywordTeamPairs:
							Array.isArray(chatflow.keywordTeamPairs) &&
							chatflow.keywordTeamPairs.length > 0
								? chatflow.keywordTeamPairs
								: [{ keyword: "", team: "" }],
						fallbackTeam: chatflow.fallbackTeam || "",
						emailCaptureWhen: chatflow.emailCaptureWhen || "never",
						emailCaptureMessage:
							chatflow.emailCaptureMessage ||
							"Please provide your email to continue",
						websiteUrl: chatflow.websiteUrl || "",
						showOnAllPages:
							chatflow.showOnAllPages !== undefined
								? chatflow.showOnAllPages
								: true,
						specificPages: chatflow.specificPages || "",
						excludePages: chatflow.excludePages || "",
						accentColor: chatflow.accentColor || prev.accentColor,
						chatPlacement:
							chatflow.chatPlacement || prev.chatPlacement,
						chatAvatar: chatflow.chatAvatar || "",
						showAvatar:
							chatflow.showAvatar !== undefined
								? chatflow.showAvatar
								: true,
						consentRequired: chatflow.requireConsent || false,
						feedbackSurvey: chatflow.enableFeedback || false,
						autoAssignment: chatflow.autoAssignment || true,
						language: chatflow.language || "english",
					}));

					setIsActive(chatflow.isActive || false);
					setChatflowId(chatflow.id);
				}
			} catch (error) {
				console.error("Failed to fetch chatflow:", error);
				alert(
					"❌ Failed to load chatflow for editing: " + error.message
				);
				navigate("/admin/socialsetups/livetalk");
			} finally {
				setIsLoading(false);
			}
		},
		[apiRequest, navigate]
	);

	// Load chatflow data on component mount
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const editId = urlParams.get("edit");

		if (editId) {
			fetchChatflowById(editId);
		} else {
			setIsLoading(false);
		}
	}, [location.search, fetchChatflowById]);

	// Save chatflow with conditional keyword pairs
	const handleSave = async () => {
		// Validate required fields
		if (!config.chatId || !config.name || !config.companyName) {
			alert(
				"❌ Please fill in the Chat ID, chatflow name and company name"
			);
			return;
		}

		setIsSaving(true);
		try {
			// ✅ Prepare different payloads for create vs update
			let backendData;

			if (chatflowId) {
				// ✅ UPDATE: Exclude chatId (it cannot be changed)
				backendData = {
					name: config.name,
					companyName: config.companyName,
					ownerUserId: config.ownerUserId,
					welcomeMessage: config.welcomeMessage,
					showAvatar: config.showAvatar,
					enableKnowledgeBase: config.enableKnowledgeBase,
					autoAssignConversations: config.autoAssignConversations,
					keywordTeamPairs: config.autoAssignConversations
						? config.keywordTeamPairs.filter(
								(pair) =>
									pair.keyword.trim() !== "" &&
									pair.team.trim() !== ""
						  )
						: [],
					fallbackTeam: config.autoAssignConversations
						? config.fallbackTeam
						: "",
					emailCaptureWhen: config.emailCaptureWhen,
					emailCaptureMessage: config.emailCaptureMessage,
					websiteUrl: config.websiteUrl,
					showOnAllPages: config.showOnAllPages,
					specificPages: config.specificPages,
					excludePages: config.excludePages,
					accentColor: config.accentColor,
					chatPlacement: config.chatPlacement,
					chatAvatar: config.chatAvatar,
					requireConsent: config.consentRequired,
					enableFeedback: config.feedbackSurvey,
					autoAssignment: config.autoAssignment,
					language: config.language,
					isActive: isActive,
				};
			} else {
				// ✅ CREATE: Include chatId (required for creation)
				backendData = {
					chatId: config.chatId, // ← Only include for creation
					name: config.name,
					companyName: config.companyName,
					ownerUserId: config.ownerUserId,
					welcomeMessage: config.welcomeMessage,
					showAvatar: config.showAvatar,
					enableKnowledgeBase: config.enableKnowledgeBase,
					autoAssignConversations: config.autoAssignConversations,
					keywordTeamPairs: config.autoAssignConversations
						? config.keywordTeamPairs.filter(
								(pair) =>
									pair.keyword.trim() !== "" &&
									pair.team.trim() !== ""
						  )
						: [],
					fallbackTeam: config.autoAssignConversations
						? config.fallbackTeam
						: "",
					emailCaptureWhen: config.emailCaptureWhen,
					emailCaptureMessage: config.emailCaptureMessage,
					websiteUrl: config.websiteUrl,
					showOnAllPages: config.showOnAllPages,
					specificPages: config.specificPages,
					excludePages: config.excludePages,
					accentColor: config.accentColor,
					chatPlacement: config.chatPlacement,
					chatAvatar: config.chatAvatar,
					requireConsent: config.consentRequired,
					enableFeedback: config.feedbackSurvey,
					autoAssignment: config.autoAssignment,
					language: config.language,
					isActive: isActive,
				};
			}

			let response;
			if (chatflowId) {
				response = await apiRequest(`/chatflows/${chatflowId}`, {
					method: "PUT",
					body: backendData,
				});
			} else {
				response = await apiRequest("/chatflows", {
					method: "POST",
					body: backendData,
				});

				if (response.success && response.data) {
					setChatflowId(response.data.id);
				}
			}

			if (response.success) {
				alert("✅ Chatflow saved successfully!");
			}
		} catch (error) {
			alert("❌ Failed to save chatflow: " + error.message);
			console.error("Save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	// Toggle chatflow active status
	const handleToggleStatus = async () => {
		if (!chatflowId) {
			alert("❌ Please save the chatflow first before activating");
			return;
		}

		try {
			const newStatus = !isActive;
			const response = await apiRequest(
				`/chatflows/${chatflowId}/status`,
				{
					method: "PUT",
					body: { isActive: newStatus },
				}
			);

			if (response.success) {
				setIsActive(newStatus);
				alert(
					`✅ Chatflow ${
						newStatus ? "activated" : "deactivated"
					} successfully!`
				);
			}
		} catch (error) {
			alert("❌ Failed to toggle chatflow status: " + error.message);
			console.error("Toggle status error:", error);
		}
	};

	const tabs = [
		{ id: "build", label: "Build", icon: Settings },
		{ id: "target", label: "Target", icon: MessageSquare },
		{ id: "display", label: "Display", icon: Settings },
		{ id: "options", label: "Options", icon: Settings },
	];

	if (isLoading) {
		return (
			<div className="chatflow-setup">
				<div
					className="loading-container"
					style={{ padding: "2rem", textAlign: "center" }}
				>
					<Loader2
						className="spinner"
						style={{
							width: "2rem",
							height: "2rem",
							animation: "spin 1s linear infinite",
						}}
					/>
					<p>Loading chatflow configuration...</p>
				</div>
			</div>
		);
	}

	// Keyword pair management functions
	const handleAddKeywordPair = () => {
		setConfig({
			...config,
			keywordTeamPairs: [
				...config.keywordTeamPairs,
				{ keyword: "", team: "" },
			],
		});
	};

	const handleRemoveKeywordPair = (index) => {
		if (config.keywordTeamPairs.length > 1) {
			const newPairs = config.keywordTeamPairs.filter(
				(_, i) => i !== index
			);
			setConfig({ ...config, keywordTeamPairs: newPairs });
		}
	};

	const handleKeywordPairChange = (index, field, value) => {
		const newPairs = config.keywordTeamPairs.map((pair, i) =>
			i === index ? { ...pair, [field]: value } : pair
		);
		setConfig({ ...config, keywordTeamPairs: newPairs });
	};

	// Generate embed code
	const generateEmbedCode = () => {
		if (!chatflowId) return "";

		const embedConfig = {
			name: config.name,
			companyName: config.companyName,
			welcomeMessage: config.welcomeMessage,
			accentColor: config.accentColor,
			chatPlacement: config.chatPlacement,
			showAvatar: config.showAvatar,
			websiteUrl: config.websiteUrl,
		};

		return `<!-- LiveTalk Chat Widget -->
<script>
  (function() {
    var ltWidget = document.createElement('script');
    ltWidget.async = true;
    ltWidget.src = '${API_BASE_URL}/widget.js';
    ltWidget.setAttribute('data-chatflow-id', '${chatflowId}');
    ltWidget.setAttribute('data-chat-id', '${config.chatId}');
    ltWidget.setAttribute('data-config', '${btoa(
		JSON.stringify(embedConfig)
	)}');
    document.head.appendChild(ltWidget);
  })();
</script>
<!-- End LiveTalk Chat Widget -->`;
	};

	// Copy embed code to clipboard
	const copyEmbedCode = async () => {
		try {
			await navigator.clipboard.writeText(generateEmbedCode());
			alert("✅ Embed code copied to clipboard!");
		} catch (err) {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = generateEmbedCode();
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			alert("✅ Embed code copied to clipboard!");
			console.error("Fallback copy failed:", err);
		}
	};

	return (
		<div className="chatflow-setup">
			{/* Header */}
			<div className="setup-header">
				<button
					className="back-btn"
					onClick={() => navigate("/admin/socialsetups/livetalk")}
				>
					<ArrowLeft /> Back
				</button>
				<h1>{chatflowId ? "Edit Chatflow" : "Create Chatflow"}</h1>
				<p>Set up live chat for your website visitors</p>

				<div className="chatflow-status">
					<label className="toggle">
						<input
							type="checkbox"
							checked={isActive}
							onChange={handleToggleStatus}
							disabled={!chatflowId}
						/>
						<span>
							Chatflow Active {!chatflowId && "(Save first)"}
						</span>
					</label>
				</div>
			</div>

			{/* Tabs Navigation */}
			<div className="tabs-nav">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={`tab ${
							activeTab === tab.id ? "active" : ""
						}`}
						onClick={() => setActiveTab(tab.id)}
					>
						<tab.icon className="tab-icon" />
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="tab-content">
				{/* BUILD TAB */}
				{activeTab === "build" && (
					<div className="build-tab">
						<div className="form-group">
							<label>Chat ID *</label>
							<input
								type="text"
								value={config.chatId}
								onChange={(e) =>
									setConfig({
										...config,
										chatId: e.target.value,
									})
								}
								placeholder="e.g., live-chat-001"
							/>
							<small>
								Unique identifier for this chat widget
							</small>
						</div>

						<div className="form-group">
							<label>Chatflow Name *</label>
							<input
								type="text"
								value={config.name}
								onChange={(e) =>
									setConfig({
										...config,
										name: e.target.value,
									})
								}
								placeholder="e.g., Customer Support Chat"
							/>
							<small>Internal name for this chatflow</small>
						</div>

						<div className="form-group">
							<label>Company Name *</label>
							<input
								type="text"
								value={config.companyName}
								onChange={(e) =>
									setConfig({
										...config,
										companyName: e.target.value,
									})
								}
								placeholder="Your Company Name"
							/>
							<small>Will be displayed to visitors</small>
						</div>

						<h3>Welcome Message</h3>
						<div className="form-group">
							<label>Write your Welcome message here</label>
							<textarea
								value={config.welcomeMessage}
								onChange={(e) =>
									setConfig({
										...config,
										welcomeMessage: e.target.value,
									})
								}
								placeholder="Hi! How can we help you today?"
								rows={3}
							/>
							<small>
								This is the first message visitors will see
							</small>
						</div>

						<div className="form-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={config.enableKnowledgeBase}
									onChange={(e) =>
										setConfig({
											...config,
											enableKnowledgeBase:
												e.target.checked,
										})
									}
								/>
								Enable knowledge base search
							</label>
						</div>

						<h3>Conversation Assignment</h3>
						<div className="form-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={config.autoAssignConversations}
									onChange={(e) =>
										setConfig({
											...config,
											autoAssignConversations:
												e.target.checked,
										})
									}
								/>
								Automatically assign conversations
							</label>
						</div>

						{/* Only show keyword assignment section when auto assign is enabled */}
						{config.autoAssignConversations && (
							<div className="keyword-assignment-section">
								<h4>Keyword-Based Team Assignment</h4>
								<p>
									Route conversations to specific teams based
									on keywords in customer messages
								</p>

								{config.keywordTeamPairs.map((pair, index) => (
									<div
										key={index}
										className="keyword-team-row"
									>
										<div className="keyword-input-wrapper">
											<input
												type="text"
												placeholder="Enter keywords separated by commas, e.g., repair, not working, broken, fix"
												value={pair.keyword}
												onChange={(e) =>
													handleKeywordPairChange(
														index,
														"keyword",
														e.target.value
													)
												}
												className="keyword-field"
											/>
											<small className="help-text-below">
												Separate multiple keywords with
												commas
											</small>
										</div>

										<select
											value={pair.team}
											onChange={(e) =>
												handleKeywordPairChange(
													index,
													"team",
													e.target.value
												)
											}
											className="team-field"
										>
											<option value="">
												Select Team
											</option>
											<option value="sales">
												Sales Team
											</option>
											<option value="support">
												Support Team
											</option>
											<option value="billing">
												Billing Team
											</option>
											<option value="technical">
												Technical Team
											</option>
										</select>

										{config.keywordTeamPairs.length > 1 && (
											<button
												type="button"
												onClick={() =>
													handleRemoveKeywordPair(
														index
													)
												}
												className="remove-keyword-btn"
											>
												✕
											</button>
										)}
									</div>
								))}

								<button
									type="button"
									onClick={handleAddKeywordPair}
									className="add-keyword-btn"
								>
									+ Add Keyword-Team Pair
								</button>

								<div className="fallback-team-section">
									<label>
										Fallback Team (when no keywords match)
									</label>
									<select
										value={config.fallbackTeam}
										onChange={(e) =>
											setConfig({
												...config,
												fallbackTeam: e.target.value,
											})
										}
									>
										<option value="">
											Round Robin All Teams
										</option>
										<option value="sales">
											Sales Team
										</option>
										<option value="support">
											Support Team
										</option>
										<option value="general">
											General Team
										</option>
									</select>
									<small>
										This team will handle conversations when
										no keywords are detected
									</small>
								</div>
							</div>
						)}

						<h3>Email Capture</h3>
						<div className="form-group">
							<label>Ask visitors for their email address</label>
							<select
								value={config.emailCaptureWhen}
								onChange={(e) =>
									setConfig({
										...config,
										emailCaptureWhen: e.target.value,
									})
								}
							>
								<option value="never">Never</option>
								<option value="before-conversation">
									Before conversation
								</option>
								<option value="after-first-message">
									After first message
								</option>
							</select>
						</div>

						{config.emailCaptureWhen !== "never" && (
							<div className="form-group">
								<label>Email capture message</label>
								<input
									type="text"
									value={config.emailCaptureMessage}
									onChange={(e) =>
										setConfig({
											...config,
											emailCaptureMessage: e.target.value,
										})
									}
									placeholder="Please provide your email to continue"
								/>
							</div>
						)}
					</div>
				)}

				{/* TARGET TAB */}
				{activeTab === "target" && (
					<div className="target-tab">
						<div className="form-group">
							<label>Website URL</label>
							<input
								type="url"
								value={config.websiteUrl}
								onChange={(e) =>
									setConfig({
										...config,
										websiteUrl: e.target.value,
									})
								}
								placeholder="https://yourwebsite.com"
							/>
							<small>
								The website where this chatflow will be embedded
							</small>
						</div>

						<h3>Website Targeting</h3>
						<div className="form-group">
							<label className="radio-label">
								<input
									type="radio"
									name="targeting"
									checked={config.showOnAllPages}
									onChange={() =>
										setConfig({
											...config,
											showOnAllPages: true,
										})
									}
								/>
								Show on all pages
							</label>

							<label className="radio-label">
								<input
									type="radio"
									name="targeting"
									checked={!config.showOnAllPages}
									onChange={() =>
										setConfig({
											...config,
											showOnAllPages: false,
										})
									}
								/>
								Show on specific pages
							</label>
						</div>

						{!config.showOnAllPages && (
							<div className="form-group">
								<label>Specific pages (one URL per line)</label>
								<textarea
									value={config.specificPages}
									onChange={(e) =>
										setConfig({
											...config,
											specificPages: e.target.value,
										})
									}
									placeholder="https://yoursite.com/contact&#10;https://yoursite.com/pricing"
									rows={4}
								/>
							</div>
						)}

						<div className="form-group">
							<label>Exclude pages (optional)</label>
							<textarea
								value={config.excludePages}
								onChange={(e) =>
									setConfig({
										...config,
										excludePages: e.target.value,
									})
								}
								placeholder="https://yoursite.com/privacy&#10;https://yoursite.com/terms"
								rows={3}
							/>
						</div>
					</div>
				)}

				{/* DISPLAY TAB */}
				{activeTab === "display" && (
					<div className="display-tab">
						<h3>Chat Appearance</h3>
						<div className="form-group">
							<label>Accent color</label>
							<div className="color-picker">
								<input
									type="color"
									value={config.accentColor}
									onChange={(e) =>
										setConfig({
											...config,
											accentColor: e.target.value,
										})
									}
								/>
								<span>{config.accentColor}</span>
							</div>
						</div>

						<div className="form-group">
							<label>Chat placement</label>
							<select
								value={config.chatPlacement}
								onChange={(e) =>
									setConfig({
										...config,
										chatPlacement: e.target.value,
									})
								}
							>
								<option value="bottom-right">
									Bottom right
								</option>
								<option value="bottom-left">Bottom left</option>
								<option value="top-right">Top right</option>
								<option value="top-left">Top left</option>
							</select>
						</div>

						<div className="form-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={config.showAvatar}
									onChange={(e) =>
										setConfig({
											...config,
											showAvatar: e.target.checked,
										})
									}
								/>
								Show avatar in chat
							</label>
						</div>

						<div className="form-group">
							<label>Chat avatar (optional)</label>
							<input
								type="url"
								value={config.chatAvatar}
								onChange={(e) =>
									setConfig({
										...config,
										chatAvatar: e.target.value,
									})
								}
								placeholder="https://yoursite.com/avatar.png"
							/>
							<small>
								URL to your team member photo or company logo
							</small>
						</div>
					</div>
				)}

				{/* OPTIONS TAB */}
				{activeTab === "options" && (
					<div className="options-tab">
						<h3>Additional Options</h3>

						<div className="form-group">
							<label>Language</label>
							<select
								value={config.language}
								onChange={(e) =>
									setConfig({
										...config,
										language: e.target.value,
									})
								}
							>
								<option value="english">English</option>
								<option value="spanish">Spanish</option>
								<option value="french">French</option>
								<option value="german">German</option>
							</select>
						</div>

						<div className="form-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={config.consentRequired}
									onChange={(e) =>
										setConfig({
											...config,
											consentRequired: e.target.checked,
										})
									}
								/>
								Require consent to collect chat cookies
							</label>
						</div>

						<div className="form-group">
							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={config.feedbackSurvey}
									onChange={(e) =>
										setConfig({
											...config,
											feedbackSurvey: e.target.checked,
										})
									}
								/>
								Enable post-chat feedback survey
							</label>
						</div>
					</div>
				)}
			</div>

			{/* Save Button */}
			<div className="save-section">
				<button
					className="save-btn"
					onClick={handleSave}
					disabled={isSaving}
				>
					<Save className="save-icon" />
					{isSaving ? "Saving..." : "Save Chatflow"}
				</button>
			</div>

			{/* Embed Code Section - Only show after chatflow is saved */}
			{chatflowId && (
				<div className="embed-section">
					<h3>🔗 Embed Code</h3>
					<p>
						Copy this code and paste it into your website's HTML
						before the closing &lt;/body&gt; tag
					</p>

					<div className="embed-actions">
						<button
							className="preview-btn"
							onClick={() => setShowPreview(!showPreview)}
						>
							<Eye className="btn-icon" />
							{showPreview ? "Hide Preview" : "Preview Widget"}
						</button>
						<button
							className="copy-btn"
							onClick={() => copyEmbedCode()}
						>
							<Copy className="btn-icon" />
							Copy Code
						</button>
					</div>

					<div className="embed-code-container">
						<div className="embed-code-header">
							<h4>Embed Code</h4>
						</div>
						<pre className="embed-code">{generateEmbedCode()}</pre>

						<div className="embed-instructions">
							<p>
								<strong>Installation Instructions:</strong>
							</p>
							<ol>
								<li>Copy the code above</li>
								<li>
									Paste it into your website's HTML before the
									closing <code>&lt;/body&gt;</code> tag
								</li>
								<li>Save and publish your website</li>
								<li>
									The chat widget will appear on your site
									immediately
								</li>
							</ol>
						</div>
					</div>
				</div>
			)}

			{/* Widget Preview Modal */}
			{showPreview && (
				<div
					className="preview-modal-overlay"
					onClick={() => setShowPreview(false)}
				>
					<div
						className="preview-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="preview-header">
							<h3>Widget Preview</h3>
							<button
								className="close-preview"
								onClick={() => setShowPreview(false)}
							>
								✕
							</button>
						</div>

						<div className="preview-container">
							<div className="preview-website">
								<div className="preview-browser-bar">
									<div className="browser-dots">
										<span className="dot red"></span>
										<span className="dot yellow"></span>
										<span className="dot green"></span>
									</div>
									<div className="browser-url">
										{config.websiteUrl || "yourwebsite.com"}
									</div>
								</div>

								<div className="preview-content">
									<h1>Your Website</h1>
									<p>
										This is how your website visitors will
										see the chat widget...
									</p>

									{/* Chat Widget Preview */}
									<div
										className={`widget-preview widget-${config.chatPlacement}`}
									>
										<div
											className="chat-launcher"
											style={{
												backgroundColor:
													config.accentColor,
											}}
										>
											<MessageSquare className="chat-icon" />
										</div>

										<div
											className="chat-bubble"
											style={{
												borderColor: config.accentColor,
											}}
										>
											<div
												className="chat-header"
												style={{
													backgroundColor:
														config.accentColor,
												}}
											>
												<span>
													{config.companyName}
												</span>
												{config.showAvatar && (
													<div className="avatar">
														👤
													</div>
												)}
											</div>
											<div className="chat-message">
												{config.welcomeMessage}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LiveTalkSetup;
