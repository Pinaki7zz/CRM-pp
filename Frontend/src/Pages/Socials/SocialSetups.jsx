import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Mail,
	MessageSquare,
	Linkedin,
	Phone,
	FileText,
	Settings2,
	CheckCircle,
	AlertCircle,
	XCircle,
	ArrowRight,
	Plus,
} from "lucide-react";
import "./SocialSetups.css";
import TelephoneSetupModal from "../Telephone/TelephoneSetupModal"; // Import the modal
import "../Telephone/TelephoneSetupModal.css"; // Import modal CSS

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const SocialSetups = () => {
	const navigate = useNavigate();
	const [setupStatus, setSetupStatus] = useState({});
	const [chatflowCounts, setChatflowCounts] = useState({});
	const [isTelephoneModalOpen, setIsTelephoneModalOpen] = useState(false); // State for the modal

	useEffect(() => {
		fetchSetupStatus();
	}, []);

	const fetchSetupStatus = async () => {
		try {
			// Check Live Talk chatflows
			const liveTalkResponse = await fetch(
				`${BASE_URL_CM}/live-talk/chatflows`
			);
			const liveTalkData = await liveTalkResponse.json();
			const liveTalkCount = liveTalkData.success
				? liveTalkData.data.length
				: 0;

			// Store chatflow counts
			setChatflowCounts({
				livechat: liveTalkCount,
			});

			// Set status based on counts and other logic
			const status = {
				email: "configured", // Replace with your actual logic
				livechat: liveTalkCount > 0 ? "configured" : "not_configured",
				linkedin: "partial", // Replace with your actual logic
				telephone: "not_configured", // Set to 'not_configured' to trigger modal
				webforms: "not_configured", // Replace with your actual logic
			};

			setSetupStatus(status);
		} catch (error) {
			console.error("Failed to fetch setup status:", error);
			// Fallback to default mock status
			const mockStatus = {
				email: "configured",
				livechat: "not_configured",
				linkedin: "partial",
				telephone: "not_configured", // Ensure this is not 'configured' to test the modal
				webforms: "not_configured",
			};
			setSetupStatus(mockStatus);
			setChatflowCounts({ livechat: 0 });
		}
	};

	const socialChannels = [
		{
			id: "email",
			name: "Email",
			description: "Configure email channels and SMTP settings",
			icon: Mail,
			path: "/admin/socialsetups/email",
			color: "#3B82F6",
		},
		{
			id: "livechat",
			name: "Live Talk",
			description: "Set up real-time chat widget and messaging",
			icon: MessageSquare,
			// Dynamic path based on chatflow count
			path:
				chatflowCounts.livechat > 0
					? "/admin/socialsetups/livetalk"
					: "/admin/socialsetups/livetalk/create",
			color: "#10B981",
		},
		{
			id: "linkedin",
			name: "LinkedIn",
			description: "Connect LinkedIn for social engagement",
			icon: Linkedin,
			path: "/admin/socialsetups/linkedinoauth",
			color: "#0A66C2",
		},
		{
			id: "telephone",
			name: "Telephone",
			description: "Configure phone system and call routing",
			icon: Phone,
			path: "/admin/socialsetups/telephone",
			color: "#8B5CF6",
		},
		{
			id: "webforms",
			name: "Web Forms",
			description: "Create and manage lead capture forms",
			icon: FileText,
			path: "/admin/socialsetups/webforms",
			color: "#F59E0B",
		},
	];

	const getStatusIcon = (status) => {
		switch (status) {
			case "configured":
				return <CheckCircle className="status-icon configured" />;
			case "partial":
				return <AlertCircle className="status-icon partial" />;
			default:
				return <XCircle className="status-icon not-configured" />;
		}
	};

	const getStatusText = (status) => {
		switch (status) {
			case "configured":
				return "Configured";
			case "partial":
				return "Partially Set Up";
			default:
				return "Not Configured";
		}
	};

	// Dynamic button text and behavior
	const getButtonContent = (channel) => {
		if (channel.id === "livechat") {
			const haschatflows = chatflowCounts.livechat > 0;

			if (haschatflows) {
				return {
					text: "Edit Configurations",
					icon: Settings2,
					className: "edit",
				};
			} else {
				return {
					text: "Set Up Now",
					icon: Plus,
					className: "setup",
				};
			}
		}

		// Default behavior for other channels
		const status = setupStatus[channel.id] || "not_configured";
		return status === "configured"
			? { text: "Edit Configuration", icon: Settings2, className: "edit" }
			: { text: "Set Up Now", icon: Plus, className: "setup" };
	};

	// Modified handleConfigure to open modal
	const handleConfigure = (channel) => {
		const status = setupStatus[channel.id] || "not_configured";

		// Specifically for telephone, if not configured, show modal
		if (channel.id === "telephone" && status !== "configured") {
			setIsTelephoneModalOpen(true);
		} else {
			navigate(channel.path);
		}
	};

	return (
		<div className="social-setups-container">
			<div className="social-channels-grid">
				{socialChannels.map((channel) => {
					const status = setupStatus[channel.id] || "not_configured";
					const IconComponent = channel.icon;
					const buttonContent = getButtonContent(channel);

					return (
						<div key={channel.id} className="social-channel-card">
							<div className="card-header">
								<div className="channel-info">
									<div
										className="channel-icon-wrapper"
										style={{
											backgroundColor: `${channel.color}15`,
										}}
									>
										<IconComponent
											className="channel-icon"
											style={{ color: channel.color }}
										/>
									</div>
									<div className="channel-details">
										<h3 className="channel-name">
											{channel.name}
										</h3>
										<p className="channel-description">
											{channel.description}
										</p>
										{/* Show chatflow count for Live Talk */}
										{channel.id === "livechat" &&
											chatflowCounts.livechat > 0 && (
												<small className="chatflow-count">
													{chatflowCounts.livechat}{" "}
													chatflow
													{chatflowCounts.livechat !==
													1
														? "s"
														: ""}{" "}
													configured
												</small>
											)}
									</div>
								</div>
								<div className="status-badge">
									{getStatusIcon(status)}
									<span className={`status-text ${status}`}>
										{getStatusText(status)}
									</span>
								</div>
							</div>
							<div className="card-actions">
								<button
									className={`configure-btn ${buttonContent.className}`}
									onClick={() => handleConfigure(channel)}
								>
									<buttonContent.icon className="btn-icon" />
									{buttonContent.text}
									<ArrowRight className="arrow-icon" />
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<div className="setup-summary">
				<div className="summary-card">
					<h3>Setup Progress</h3>
					<div className="progress-stats">
						<div className="stat">
							<span className="stat-number">
								{
									Object.values(setupStatus).filter(
										(s) => s === "configured"
									).length
								}
							</span>
							<span className="stat-label">Configured</span>
						</div>
						<div className="stat">
							<span className="stat-number">
								{
									Object.values(setupStatus).filter(
										(s) => s === "partial"
									).length
								}
							</span>
							<span className="stat-label">Partial</span>
						</div>
						<div className="stat">
							<span className="stat-number">
								{
									Object.values(setupStatus).filter(
										(s) => s === "not_configured" || !s
									).length
								}
							</span>
							<span className="stat-label">Pending</span>
						</div>
					</div>
				</div>
			</div>

			{/* Render the modal conditionally */}
			{isTelephoneModalOpen && (
				<TelephoneSetupModal
					onClose={() => setIsTelephoneModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default SocialSetups;
