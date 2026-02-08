import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailAddressGrid.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

// Simple SVG icons, no external packages
const NewIcon = () => (
	<svg
		width="17"
		height="17"
		fill="none"
		stroke="#4f46e5"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="8.5" cy="8.5" r="8" />
		<line x1="8.5" y1="5.2" x2="8.5" y2="11.8" />
		<line x1="5.2" y1="8.5" x2="11.8" y2="8.5" />
	</svg>
);

const EditIcon = () => (
	<svg
		width="17"
		height="17"
		fill="none"
		stroke="#4f46e5"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12.3 2.7l2 2a2 2 0 0 1 0 2.8l-6.28 6.29a2 2 0 0 1-.71.44l-3 1a1 1 0 0 1-1.25-1.24l1-3a2 2 0 0 1 .44-.7l6.3-6.29a2 2 0 0 1 2.8 0z" />
		<path d="M7.5 5.5l4 4" />
	</svg>
);

const RefreshIcon = () => (
	<svg
		width="17"
		height="17"
		fill="none"
		stroke="#4f46e5"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M4 4v5h5" />
		<path d="M2.78 9.22c1.5 3.74 7.12 4.02 9.01 0.45a4.5 4.5 0 1 0-6.36-6.35" />
	</svg>
);

const DeleteIcon = () => (
	<svg
		width="17"
		height="17"
		fill="none"
		stroke="#dc2626"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="3,6 5,6 21,6" />
		<path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
	</svg>
);

const EmailAddressGrid = ({ onNew }) => {
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = useState(null);
	const [emailChannels, setEmailChannels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Map backend data to frontend format
	const mapBackendToFrontend = useCallback((backendData) => {
		const channelDirectionMap = {
			INBOUND_ONLY: "Inbound Only",
			INBOUND_OUTBOUND: "Inbound and Outbound",
			OUTBOUND_ONLY: "Outbound Only",
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
			status: backendData.isActive ? "Active" : "Inactive",
			channelName: backendData.channelName || "",
			senderDisplayName: backendData.senderDisplayName || "",
			isActive: backendData.isActive,
			createdAt: backendData.createdAt,
			updatedAt: backendData.updatedAt,
		};
	}, []);

	// ✅ Fixed: Wrapped in useCallback to prevent ESLint warning
	const fetchEmailChannels = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(`${BASE_URL_CM}/email-channels`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to fetch email channels"
				);
			}

			const mappedChannels = result.data.map(mapBackendToFrontend);
			setEmailChannels(mappedChannels);
		} catch (error) {
			console.error("Failed to fetch email channels:", error);
			setError(`Failed to load email channels: ${error.message}`);
		} finally {
			setLoading(false);
		}
	}, [mapBackendToFrontend]);

	// ✅ Fixed: Added fetchEmailChannels to dependency array
	useEffect(() => {
		fetchEmailChannels();
	}, [fetchEmailChannels]);

	const handleSelect = (id) => {
		setSelectedId(selectedId === id ? null : id);
	};

	const handleEdit = () => {
		if (selectedId) {
			navigate(`/channels/emails/edit/${encodeURIComponent(selectedId)}`);
		} else {
			alert("Please select an email channel to edit.");
		}
	};

	const handleDelete = async () => {
		if (!selectedId) {
			alert("Please select an email channel to delete.");
			return;
		}

		const confirmed = window.confirm(
			"Are you sure you want to delete this email channel? This action cannot be undone."
		);
		if (!confirmed) return;

		try {
			const response = await fetch(
				`${BASE_URL_CM}/email-channels/${encodeURIComponent(
					selectedId
				)}`,
				{
					method: "DELETE",
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.message || "Failed to delete email channel"
				);
			}

			alert("Email channel deleted successfully!");
			setSelectedId(null);
			fetchEmailChannels(); // Refresh the list
		} catch (error) {
			console.error("Delete error:", error);
			alert(`Failed to delete channel: ${error.message}`);
		}
	};

	const handleRefresh = () => {
		fetchEmailChannels();
	};

	if (loading) {
		return (
			<div className="email-addresses-container">
				<div
					style={{
						textAlign: "center",
						padding: "2rem",
						fontSize: "16px",
						color: "#6b7280",
					}}
				>
					Loading email channels...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="email-addresses-container">
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
					<button
						onClick={handleRefresh}
						style={{ marginLeft: "10px" }}
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="email-addresses-container">
			{/* Email Tab Section */}
			<div className="tab-section">
				<div className="tab active">Email Addresses</div>
			</div>

			<div className="email-addresses-header">
				<div className="header-button">
					<button
						className="action-btn"
						onClick={() => navigate("/channels/emails/create")}
					>
						<NewIcon />
						New
					</button>
					<button className="action-btn" onClick={handleEdit}>
						<EditIcon />
						Edit
					</button>
					<button className="action-btn" onClick={handleRefresh}>
						<RefreshIcon />
						Refresh
					</button>
					<button
						className="action-btn"
						onClick={handleDelete}
						style={{ color: "#dc2626" }}
					>
						<DeleteIcon />
						Delete
					</button>
				</div>
			</div>

			<div className="email-addresses-table-wrapper">
				{emailChannels.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							padding: "2rem",
							fontSize: "16px",
							color: "#6b7280",
						}}
					>
						No email channels found. Click "New" to create your
						first email channel.
					</div>
				) : (
					<table className="email-addresses-table">
						<thead>
							<tr>
								<th>Select</th>
								<th>ID</th>
								<th>E-Mail</th>
								<th>Template Name</th>
								<th>Channel Direction</th>
								<th>Channel Type</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{emailChannels.map((row, idx) => (
								<tr key={row.id + idx}>
									<td>
										<input
											type="checkbox"
											checked={selectedId === row.id}
											onChange={() =>
												handleSelect(row.id)
											}
											style={{ accentColor: "#4f46e5" }}
										/>
									</td>
									<td>{row.id}</td>
									<td>{row.email}</td>
									<td>{row.template}</td>
									<td>{row.channelDirection}</td>
									<td>{row.channelType}</td>
									<td>
										<span
											className={`status-badge ${row.status.toLowerCase()}`}
										>
											{row.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default EmailAddressGrid;
